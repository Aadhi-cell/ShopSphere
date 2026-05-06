const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const { sendOrderConfirmation } = require('../services/emailService');

class OrderController {
    constructor() {
        this.io = null;
    }

    attachIo(io) {
        this.io = io;
    }

    // Internal utility function
    createOrderFromPayment = async (paymentIntent) => {
        try {
            const { userId, items: itemsJson } = paymentIntent.metadata;
            const { shipping } = paymentIntent;

            if (!userId || !itemsJson) return;

            const simpleItems = JSON.parse(itemsJson);
            const leanItems = [];
            let totalSubtotal = 0;

            for (const item of simpleItems) {
                const product = await Product.findById(item.id);
                if (product && product.isApproved && product.status === 'active') {
                    const itemQty = Number(item.qty || item.quantity || 1);

                    // Atomic stock decrement
                    const updatedProduct = await Product.findOneAndUpdate(
                        { _id: item.id, stock: { $gte: itemQty } },
                        { $inc: { stock: -itemQty } },
                        { new: true }
                    );

                    if (updatedProduct) {
                        const price = Number(product.price || 0);
                        const lineTotal = price * itemQty;
                        totalSubtotal += lineTotal;

                        // Production standard: Store only essential snapshot
                        leanItems.push({
                            productId: product._id,
                            seller_id: product.seller_id,
                            name: product.name,
                            imageUrl: product.imageUrl,
                            priceAtPurchase: price,
                            quantity: itemQty,
                            lineTotal: lineTotal
                        });

                        if (updatedProduct.stock === 0) {
                            await Product.findByIdAndUpdate(item.id, { status: 'out-of-stock' });
                        }
                    }
                }
            }

            if (leanItems.length === 0) return;

            const address = {
                fullName: shipping?.name || 'Unknown',
                line1: shipping?.address?.line1 || 'No address',
                line2: shipping?.address?.line2 || '',
                city: shipping?.address?.city || '',
                state: shipping?.address?.state || '',
                postalCode: shipping?.address?.postal_code || '',
                country: shipping?.address?.country || 'IN'
            };

            const existingOrder = await Order.findOne({ 'payment.payment_id': paymentIntent.id });
            if (existingOrder) return { success: true, orderId: existingOrder._id.toString(), alreadyExisted: true };

            const user = await User.findById(userId);
            const nameFromUser = user?.name || shipping?.name || 'Unknown';
            const emailFromUser = user?.email || 'Unknown';
            const phoneFromUser = user?.phone || shipping?.phone || '';

            // Standard shipping fee logic
            const shippingFee = 0;
            const tax = 0;
            const discount = 0;
            const grandTotal = totalSubtotal + tax + shippingFee - discount;

            const newOrder = new Order({
                user_id: userId,
                customer: {
                    name: nameFromUser,
                    email: emailFromUser,
                    phone: phoneFromUser
                },
                items: leanItems,
                pricing: {
                    subtotal: totalSubtotal,
                    tax: tax,
                    shippingFee: shippingFee,
                    discount: discount,
                    grandTotal: grandTotal
                },
                payment: {
                    provider: 'Stripe',
                    payment_id: paymentIntent.id,
                    method: 'Card',
                    status: 'Paid',
                    paidAt: new Date()
                },
                status: 'Pending',
                address: address,
                timeline: {
                    placedAt: new Date()
                }
            });

            const savedOrder = await newOrder.save();

            // Populate OrderItems for sellers dashboard
            for (const item of leanItems) {
                await OrderItem.create({
                    order_id: savedOrder._id,
                    product_id: item.productId,
                    seller_id: item.seller_id,
                    quantity: item.quantity,
                    price: item.priceAtPurchase
                });

                // Emit real-time notification to the seller
                if (this.io) {
                    this.io.to(item.seller_id.toString()).emit('newOrder', {
                        orderId: savedOrder._id,
                        message: 'You have a new order!'
                    });
                }
            }

            if (user && user.email) {
                await sendOrderConfirmation(user.email, { id: savedOrder._id.toString(), total: grandTotal }, leanItems);
            }

            return { success: true, orderId: savedOrder._id.toString() };

        } catch (err) {
            console.error('Error creating order from webhook:', err);
        }
    };

    handleWebhook = async (req, res) => {
        try {
            const sig = req.headers['stripe-signature'];
            let event;

            try {
                event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
            } catch (err) {
                console.error(`Webhook Error: ${err.message}`);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }

            if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object;
                await this.createOrderFromPayment(paymentIntent);
            }

            res.json({ received: true });
        } catch (err) {
            console.error('Webhook processing error:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    createCheckoutSession = async (req, res) => {
        try {
            const { items, address, domainUrl } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ message: 'No items in order' });
            }

            const line_items = [];
            for (const item of items) {
                const product = await Product.findById(item.id);
                if (!product) throw new Error(`Product not found`);
                if (!product.isApproved || product.status !== 'active') {
                    throw new Error(`Product ${product.name} is not available for purchase`);
                }
                const availableStock = Number(product.stock ?? 0);
                if (availableStock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                line_items.push({
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: product.name,
                        },
                        unit_amount: Math.round(product.price * 100),
                    },
                    quantity: item.quantity,
                });
            }

            // Platform fee
            line_items.push({
                price_data: {
                    currency: 'inr',
                    product_data: { name: 'Platform Fee' },
                    unit_amount: 700,
                },
                quantity: 1,
            });

            const fallbackUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const finalDomainUrl = domainUrl || fallbackUrl;

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items,
                mode: 'payment',
                success_url: `${finalDomainUrl}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${finalDomainUrl}/checkout`,
                payment_intent_data: {
                    metadata: {
                        userId: req.user._id.toString(),
                        items: JSON.stringify(items.map(i => ({ id: i.id, qty: Number(i.qty || i.quantity || 1) }))),
                    },
                    shipping: address && address.fullName ? {
                        name: address.fullName,
                        address: {
                            line1: address.line1,
                            line2: address.line2 || '',
                            city: address.city,
                            state: address.state,
                            postal_code: address.postalCode,
                            country: 'IN',
                        }
                    } : undefined
                }
            });

            res.json({ url: session.url });
        } catch (err) {
            console.error('createCheckoutSession error:', err);
            res.status(400).json({ message: err.message });
        }
    };

    confirmSession = async (req, res) => {
        try {
            const { sessionId } = req.body;
            if (!sessionId) return res.status(400).json({ message: 'Session ID is required' });

            const session = await stripe.checkout.sessions.retrieve(sessionId);
            if (session.payment_status !== 'paid') {
                return res.status(400).json({ message: 'Payment has not succeeded yet' });
            }

            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
            const result = await this.createOrderFromPayment(paymentIntent);

            res.json({ success: true, orderId: result ? result.orderId : null });
        } catch (err) {
            console.error('confirmSession error:', err);
            res.status(500).json({ message: err.message });
        }
    };

    getOrders = async (req, res) => {
        try {
            const orders = await Order.find({ user_id: req.user._id }).sort({ createdAt: -1 });
            res.json(orders);
        } catch (err) {
            console.error('getOrders error:', err);
            res.status(500).json({ message: 'Failed to fetch orders' });
        }
    };

    getOrderById = async (req, res) => {
        try {
            const order = await Order.findOne({ _id: req.params.id, user_id: req.user._id });
            if (!order) return res.status(404).json({ message: 'Order not found' });
            res.json(order);
        } catch (err) {
            console.error('getOrderById error:', err);
            res.status(500).json({ message: 'Failed to fetch order' });
        }
    };

    createOrderDirect = async (req, res) => {
        try {
            const { items, address, shippingFee = 0 } = req.body;
            if (!items || !address) return res.status(400).json({ message: 'Missing order details' });

            const user = await User.findById(req.user._id);
            const leanItems = [];
            let totalSubtotal = 0;

            for (const item of items) {
                const product = await Product.findById(item.id || item.productId);
                if (product && product.status === 'active') {
                    const itemQty = Number(item.qty || item.quantity || 1);

                    // Final stock level check
                    if (product.stock < itemQty) {
                        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
                    }

                    // Decrement stock
                    await Product.findByIdAndUpdate(product._id, { $inc: { stock: -itemQty } });

                    const price = Number(product.price || 0);
                    const lineTotal = price * itemQty;
                    totalSubtotal += lineTotal;

                    leanItems.push({
                        productId: product._id,
                        seller_id: product.seller_id,
                        name: product.name,
                        imageUrl: product.imageUrl,
                        priceAtPurchase: price,
                        quantity: itemQty,
                        lineTotal: lineTotal
                    });
                }
            }

            const tax = 0;
            const discount = 0;
            const grandTotal = totalSubtotal + tax + Number(shippingFee) - discount;

            const order = new Order({
                user_id: req.user._id,
                customer: {
                    name: user?.name || 'Guest User',
                    email: user?.email || 'N/A',
                    phone: user?.phone || address?.mobile || ''
                },
                items: leanItems,
                pricing: {
                    subtotal: totalSubtotal,
                    tax: tax,
                    shippingFee: Number(shippingFee),
                    discount: discount,
                    grandTotal: grandTotal
                },
                payment: {
                    provider: 'COD',
                    method: 'Cash',
                    status: 'Pending'
                },
                status: 'Pending',
                address: address,
                timeline: {
                    placedAt: new Date()
                }
            });


            await order.save();

            // Create OrderItems for seller visibility
            for (const item of leanItems) {
                await OrderItem.create({
                    order_id: order._id,
                    product_id: item.productId,
                    seller_id: item.seller_id,
                    quantity: item.quantity,
                    price: item.priceAtPurchase
                });
            }

            res.status(201).json({ success: true, orderId: order._id });
        } catch (err) {
            console.error('Direct order error:', err);
            res.status(500).json({ message: 'Failed to create order' });
        }
    };

    cancelOrder = async (req, res) => {
        try {
            const order = await Order.findOne({ _id: req.params.id, user_id: req.user._id });
            if (!order) return res.status(404).json({ message: 'Order not found' });

            const cancellableStatuses = ['Pending', 'Ordered', 'Confirmed', 'Processing'];
            if (!cancellableStatuses.includes(order.status)) {
                return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status}` });
            }

            // Restore stock
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.quantity },
                    status: 'active'
                });
            }

            order.status = 'Cancelled';
            order.timeline.cancelledAt = new Date();
            await order.save();

            res.json({ success: true, message: 'Order cancelled successfully', order });
        } catch (err) {
            console.error('cancelOrder error:', err);
            res.status(500).json({ message: 'Failed to cancel order' });
        }
    };

    returnOrder = async (req, res) => {
        try {
            const { reason, refundMethod, refundDetails } = req.body;
            const order = await Order.findOne({ _id: req.params.id, user_id: req.user._id });

            if (!order) return res.status(404).json({ message: 'Order not found' });
            if (order.status !== 'Delivered') {
                return res.status(400).json({ message: 'Only delivered orders can be returned' });
            }

            // Enforce 7-day return window
            if (order.timeline && order.timeline.deliveredAt) {
                const deliveredDate = new Date(order.timeline.deliveredAt);
                const now = new Date();
                const diffTime = Math.abs(now - deliveredDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 7) {
                    return res.status(400).json({ message: 'Return window of 7 days has expired' });
                }
            }

            // Extract proof images from multer
            const proofImages = req.files ? req.files.map(file => `/uploads/returns/${file.filename}`) : [];

            // Parse refund details if sent as stringified JSON
            let parsedRefundDetails = {};
            try {
                if (refundDetails) {
                    parsedRefundDetails = typeof refundDetails === 'string' ? JSON.parse(refundDetails) : refundDetails;
                }
            } catch (e) {
                // If it fails to parse, store it as raw string
                parsedRefundDetails = { raw: refundDetails };
            }

            order.return = {
                status: 'Requested',
                refundStatus: 'Pending',
                reason: reason || 'Not specified',
                proofImages: proofImages,
                refundMethod: refundMethod || 'Original Method',
                refundDetails: parsedRefundDetails,
                requestedAt: new Date()
            };

            await order.save();
            res.json({ success: true, message: 'Return requested successfully', order });
        } catch (err) {
            console.error('returnOrder error:', err);
            res.status(500).json({ message: 'Failed to process return request' });
        }
    };
}

module.exports = new OrderController();
