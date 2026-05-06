const Product = require('../models/Product');
const Seller = require('../models/Seller');
const Order = require('../models/Order');
const User = require('../models/User');
const Admin = require('../models/Admin');
const OrderItem = require('../models/OrderItem');
const Payout = require('../models/Payout');
const Setting = require('../models/Setting');
const Notification = require('../models/Notification');
const AdminNotification = require('../models/AdminNotification');
const emailService = require('../services/emailService');

class AdminController {
    attachIo = (io) => {
        this.io = io;
    };

    getProducts = async (req, res) => {
        try {
            const products = await Product.find({ seller_id: { $exists: true, $ne: null } })
                .populate('seller_id', 'businessName name')
                .sort({ createdAt: -1 });
            res.json(products);
        } catch (err) {
            console.error('getProducts error:', err);
            res.status(500).json({ message: 'Failed to fetch admin products' });
        }
    };

    getPendingProducts = async (req, res) => {
        try {
            const products = await Product.find({ isApproved: false, seller_id: { $exists: true, $ne: null } })
                .sort({ createdAt: -1 })
                .populate('seller_id', 'businessName name');
            res.json(products);
        } catch (err) {
            console.error('getPendingProducts error:', err);
            res.status(500).json({ message: 'Failed to fetch pending products' });
        }
    };

    updateProductStatus = async (req, res) => {
        try {
            const { status } = req.body;
            if (!['active', 'disabled', 'blocked'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }
            const product = await Product.findByIdAndUpdate(req.params.id, { status }, { new: true });
            if (!product) return res.status(404).json({ message: 'Product not found' });

            if (product.seller_id) {
                await Notification.create({
                    sellerId: product.seller_id,
                    title: 'Product Status Updated',
                    message: `Your product "${product.name}" status has been changed to ${status}.`,
                    type: 'product'
                });
            }

            res.json({ success: true, status, product });
        } catch (err) {
            console.error('updateProductStatus error:', err);
            res.status(400).json({ message: 'Failed to update product status' });
        }
    };

    approveProduct = async (req, res) => {
        try {
            const product = await Product.findByIdAndUpdate(req.params.id, {
                isApproved: true,
                status: 'active',
                rejectionReason: null
            }, { new: true });
            if (!product) return res.status(404).json({ message: 'Product not found' });

            if (product.seller_id) {
                await Notification.create({
                    sellerId: product.seller_id,
                    title: 'Product Approved',
                    message: `Your product "${product.name}" has been approved and is now active.`,
                    type: 'product'
                });
            }

            res.json(product);
        } catch (err) {
            console.error('approveProduct error:', err);
            res.status(400).json({ message: 'Failed to approve product' });
        }
    };

    getSellers = async (req, res) => {
        try {
            const sellers = await Seller.find().sort({ createdAt: -1 }).select('-password');
            res.json(sellers);
        } catch (err) {
            console.error('getSellers error:', err);
            res.status(500).json({ message: 'Failed to fetch sellers' });
        }
    };

    updateSellerStatus = async (req, res) => {
        try {
            const { status, reason } = req.body;
            if (!['approved', 'rejected', 'pending'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }

            const updateData = { status };
            if (status === 'rejected') {
                updateData.rejectionReason = reason || 'Your application did not meet our platform requirements.';
                updateData.onboardingStatus = 'rejected';
            } else if (status === 'approved') {
                updateData.rejectionReason = null;
                updateData.onboardingStatus = 'verified';
            }

            const seller = await Seller.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
            if (!seller) return res.status(404).json({ message: 'Seller not found' });

            await Notification.create({
                sellerId: seller._id,
                title: `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: status === 'rejected' ? `Your account has been rejected. Reason: ${updateData.rejectionReason}` : 'Your account has been approved and is now active.',
                type: 'account'
            });

            // Send Email Notification
            if (status === 'approved') {
                await emailService.sendSellerApprovalEmail(seller.email, seller.name);
            } else if (status === 'rejected') {
                await emailService.sendSellerRejectionEmail(seller.email, seller.name, updateData.rejectionReason);
            }

            // Real-time notification via Socket.io
            if (this.io) {
                this.io.to(seller._id.toString()).emit('sellerStatusUpdate', {
                    status: seller.status,
                    rejectionReason: seller.rejectionReason
                });
            }

            res.json({ success: true, status, seller });
        } catch (err) {
            console.error('updateSellerStatus error:', err);
            res.status(500).json({ message: 'Failed to update seller status' });
        }
    };

    rejectProduct = async (req, res) => {
        try {
            const { reason } = req.body;
            const product = await Product.findByIdAndUpdate(req.params.id, {
                status: 'rejected',
                isApproved: false,
                rejectionReason: reason || 'Violation of platform guidelines'
            }, { new: true });
            if (!product) return res.status(404).json({ message: 'Product not found' });

            if (product.seller_id) {
                await Notification.create({
                    sellerId: product.seller_id,
                    title: 'Product Rejected',
                    message: `Your product "${product.name}" has been rejected. Reason: ${reason || 'Violation of platform guidelines'}`,
                    type: 'product'
                });
            }

            res.json({ success: true, message: 'Product rejected', product });
        } catch (err) {
            console.error('rejectProduct error:', err);
            res.status(500).json({ message: 'Failed to reject product' });
        }
    };

    blockProduct = async (req, res) => {
        try {
            const product = await Product.findByIdAndUpdate(req.params.id, { status: 'blocked' }, { new: true });
            if (!product) return res.status(404).json({ message: 'Product not found' });

            if (product.seller_id) {
                await Notification.create({
                    sellerId: product.seller_id,
                    title: 'Product Blocked',
                    message: `Your product "${product.name}" has been blocked by admin.`,
                    type: 'product'
                });
            }

            res.json({ success: true, message: 'Product blocked', product });
        } catch (err) {
            console.error('blockProduct error:', err);
            res.status(500).json({ message: 'Failed to block product' });
        }
    };

    unblockProduct = async (req, res) => {
        try {
            const product = await Product.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
            if (!product) return res.status(404).json({ message: 'Product not found' });

            if (product.seller_id) {
                await Notification.create({
                    sellerId: product.seller_id,
                    title: 'Product Unblocked',
                    message: `Your product "${product.name}" has been unblocked by admin.`,
                    type: 'product'
                });
            }

            res.json({ success: true, message: 'Product unblocked', product });
        } catch (err) {
            console.error('unblockProduct error:', err);
            res.status(500).json({ message: 'Failed to unblock product' });
        }
    };

    getOrders = async (req, res) => {
        try {
            const orders = await Order.find().populate('user_id', 'name email').sort({ date: -1 });
            const formattedOrders = orders.map(order => {
                const obj = order.toObject();
                return {
                    ...obj,
                    customerName: obj.customer?.name || obj.user_id?.name || 'Guest User',
                    customerEmail: obj.customer?.email || obj.user_id?.email || 'No Email',
                    totalAmount: obj.pricing?.grandTotal || obj.total
                };
            });
            res.json(formattedOrders);
        } catch (err) {
            console.error('getOrders error:', err);
            res.status(500).json({ message: 'Failed to fetch admin orders' });
        }
    };

    updateOrderStatus = async (req, res) => {
        try {
            const { status, tracking } = req.body;
            const updateData = { status };

            const now = new Date();
            if (status === 'Processing') updateData['timeline.confirmedAt'] = now;
            if (status === 'Shipped') {
                updateData['timeline.shippedAt'] = now;
                if (tracking) {
                    updateData['tracking.courierName'] = tracking.courierName;
                    updateData['tracking.trackingNumber'] = tracking.trackingNumber;
                }
            }
            if (status === 'Delivered') {
                updateData['timeline.deliveredAt'] = now;
                updateData['payment.status'] = 'Paid';
                updateData['payment.paidAt'] = now;

                // Generate Payouts for Sellers
                const orderForPayout = await Order.findById(req.params.id);
                const items = await OrderItem.find({ order_id: req.params.id });

                if (items.length > 0) {
                    const sellerEarnings = {};
                    items.forEach(item => {
                        const sid = item.seller_id.toString();
                        if (!sellerEarnings[sid]) sellerEarnings[sid] = 0;
                        sellerEarnings[sid] += (item.price * item.quantity);
                    });

                    for (const [sellerId, totalAmount] of Object.entries(sellerEarnings)) {
                        const platformCommission = totalAmount * 0.10;
                        const sellerEarning = totalAmount - platformCommission;

                        // Check if Payout already exists for this order+seller to avoid duplicates
                        const existing = await Payout.findOne({ orderId: req.params.id, sellerId });
                        if (!existing) {
                            await Payout.create({
                                sellerId,
                                orderId: req.params.id,
                                totalAmount,
                                platformCommission,
                                sellerEarning,
                                payoutStatus: 'Pending'
                            });
                        }
                    }
                } else if (orderForPayout && orderForPayout.items && orderForPayout.items.length > 0) {
                    const sellerEarnings = {};
                    orderForPayout.items.forEach(item => {
                        if (item.seller_id) {
                            const sid = item.seller_id.toString();
                            if (!sellerEarnings[sid]) sellerEarnings[sid] = 0;
                            sellerEarnings[sid] += (item.lineTotal || (item.priceAtPurchase * item.quantity));
                        }
                    });

                    for (const [sellerId, totalAmount] of Object.entries(sellerEarnings)) {
                        const platformCommission = totalAmount * 0.10;
                        const sellerEarning = totalAmount - platformCommission;

                        const existing = await Payout.findOne({ orderId: req.params.id, sellerId });
                        if (!existing) {
                            await Payout.create({
                                sellerId,
                                orderId: req.params.id,
                                totalAmount,
                                platformCommission,
                                sellerEarning,
                                payoutStatus: 'Pending'
                            });
                        }
                    }
                }
            }
            if (status === 'Cancelled') updateData['timeline.cancelledAt'] = now;

            const order = await Order.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
            res.json({ success: true, order });
        } catch (err) {
            console.error('updateOrderStatus error:', err);
            res.status(500).json({ message: 'Failed to update order status' });
        }
    };

    handleOrderReturn = async (req, res) => {
        try {
            const { returnStatus, refundStatus, rejectionReason } = req.body;
            const updateData = {};

            if (returnStatus) {
                updateData['return.status'] = returnStatus;
                if (returnStatus === 'Completed') {
                    updateData['status'] = 'Returned'; // Sync main status for stats
                    updateData['return.refundStatus'] = 'Refunded';
                    updateData['return.refundedAt'] = new Date();
                } else if (returnStatus === 'Rejected') {
                    if (rejectionReason) updateData['return.rejectionReason'] = rejectionReason;
                    updateData['return.refundStatus'] = 'Failed';
                }
            }
            if (refundStatus) updateData['return.refundStatus'] = refundStatus;

            const order = await Order.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });

            // If a Payout exists for this returned order, we might need to reverse it or mark it cancelled
            if (returnStatus === 'Completed') {
                const Payout = require('../models/Payout');
                const existingPayouts = await Payout.find({ orderId: req.params.id });

                for (const payout of existingPayouts) {
                    if (payout.payoutStatus === 'Pending') {
                        // Simple case: Mark as cancelled so it's not paid
                        payout.payoutStatus = 'Cancelled';
                        await payout.save();
                    } else if (payout.payoutStatus === 'Paid') {
                        // Advanced case: Already paid, create a balancing negative record
                        // Check if we already created an adjustment for this to avoid duplicates
                        const adjustmentExists = await Payout.findOne({
                            orderId: req.params.id,
                            sellerId: payout.sellerId,
                            totalAmount: { $lt: 0 }
                        });

                        if (!adjustmentExists) {
                            await Payout.create({
                                sellerId: payout.sellerId,
                                orderId: req.params.id,
                                totalAmount: -payout.totalAmount,
                                platformCommission: -payout.platformCommission,
                                sellerEarning: -payout.sellerEarning,
                                payoutStatus: 'Paid', // Mark as paid adjustment so it reflects in 'Paid Amount' correctly
                                notes: `Refund Adjustment for Order #${order.id || req.params.id}`
                            });
                        }
                    }
                }
            }

            res.json({ success: true, order });
        } catch (err) {
            console.error('handleOrderReturn error:', err);
            res.status(500).json({ message: 'Failed to handle order return' });
        }
    };

    getUsers = async (req, res) => {
        try {
            const users = await User.find({ role: { $ne: 'admin' } }, 'id name email role status createdAt');

            const usersWithDetails = await Promise.all(users.map(async (user) => {
                const totalOrders = await Order.countDocuments({ user_id: user._id });
                return {
                    ...user.toObject(),
                    id: user._id,
                    totalOrders,
                    joinedDate: user.createdAt
                };
            }));

            res.json(usersWithDetails);
        } catch (err) {
            console.error('getUsers error:', err);
            res.status(500).json({ message: 'Failed to fetch users' });
        }
    };

    updateUserStatus = async (req, res) => {
        try {
            const { status } = req.body;
            const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json({ success: true, user });
        } catch (err) {
            console.error('updateUserStatus error:', err);
            res.status(500).json({ message: 'Failed to update user status' });
        }
    };

    updateSellerActiveStatus = async (req, res) => {
        try {
            const { isActive } = req.body;
            const seller = await Seller.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
            if (!seller) return res.status(404).json({ message: 'Seller not found' });

            await Notification.create({
                sellerId: seller._id,
                title: `Account ${isActive ? 'Unblocked' : 'Blocked'}`,
                message: `Your seller account has been ${isActive ? 'unblocked. You can now access your dashboard' : 'blocked by admin'}.`,
                type: 'account'
            });

            res.json({ success: true, seller });
        } catch (err) {
            console.error('updateSellerActiveStatus error:', err);
            res.status(500).json({ message: 'Failed to update seller active status' });
        }
    };

    getStats = async (req, res) => {
        try {
            const { range } = req.query;
            let dateFilter = {};

            const now = new Date();
            if (range === 'Today') {
                const startOfDay = new Date(now.setHours(0, 0, 0, 0));
                dateFilter = { $gte: startOfDay };
            } else if (range === 'Last 7 Days') {
                const last7 = new Date();
                last7.setDate(last7.getDate() - 7);
                dateFilter = { $gte: last7 };
            } else if (range === 'This Month') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                dateFilter = { $gte: startOfMonth };
            } else if (range === 'Last Month') {
                const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                dateFilter = { $gte: startOfLastMonth, $lte: endOfLastMonth };
            }

            const userQuery = { role: { $ne: 'admin' } };
            const sellerQuery = {};
            const productQuery = { seller_id: { $exists: true, $ne: null } };
            const orderQuery = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};
            const refundQuery = Object.keys(dateFilter).length > 0 ? { 'return.requestedAt': dateFilter, 'return.status': 'Completed' } : { 'return.status': 'Completed' };

            const [totalUsers, totalSellers, totalProducts, allOrders, deliveredOrders, refundedOrders] = await Promise.all([
                User.countDocuments(Object.keys(dateFilter).length > 0 ? { ...userQuery, createdAt: dateFilter } : userQuery),
                Seller.countDocuments(Object.keys(dateFilter).length > 0 ? { ...sellerQuery, createdAt: dateFilter } : sellerQuery),
                Product.countDocuments(Object.keys(dateFilter).length > 0 ? { ...productQuery, createdAt: dateFilter } : productQuery),
                Order.find(orderQuery, 'pricing status date payment total'),
                Order.find({ ...orderQuery, status: { $in: ['Processing', 'Shipped', 'Delivered'] } }, 'pricing total date'),
                Order.find(refundQuery, 'pricing total')
            ]);

            const totalOrders = allOrders.length;

            const orderStatusCounts = { Delivered: 0, Processing: 0, Shipped: 0, Cancelled: 0, Returned: 0, Pending: 0 };
            const paymentMethodCounts = { 'UPI/Wallets': 0, 'Cards (Cr/Dr)': 0, 'COD': 0 };

            allOrders.forEach(o => {
                if (o.status === 'Delivered') orderStatusCounts.Delivered++;
                else if (o.status === 'Processing') orderStatusCounts.Processing++;
                else if (o.status === 'Shipped') orderStatusCounts.Shipped++;
                else if (o.status === 'Cancelled') orderStatusCounts.Cancelled++;
                else if (o.status === 'Returned') orderStatusCounts.Returned++;
                else orderStatusCounts.Pending++;

                const pm = o.payment?.method || o.paymentMethod || 'COD';
                if (pm.toLowerCase().includes('card') || pm.toLowerCase().includes('stripe')) paymentMethodCounts['Cards (Cr/Dr)']++;
                else if (pm.toLowerCase().includes('cod') || pm.toLowerCase().includes('cash')) paymentMethodCounts['COD']++;
                else paymentMethodCounts['UPI/Wallets']++;
            });

            const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.pricing?.grandTotal || o.total || 0), 0);
            const refundAmount = refundedOrders.reduce((sum, o) => sum + (o.pricing?.grandTotal || o.total || 0), 0);
            const netRevenue = totalRevenue - refundAmount;
            const platformEarnings = netRevenue * 0.10;
            const validOrderCount = deliveredOrders.length || 1;
            const aov = totalRevenue / validOrderCount;

            const monthlyRevenueMap = {};
            const dailyRevenue = {};
            
            // Get last 12 months history
            const histStart = new Date();
            histStart.setMonth(histStart.getMonth() - 11);
            histStart.setHours(0, 0, 0, 0);

            const histOrders = await Order.find({
                status: { $in: ['Processing', 'Shipped', 'Delivered'] },
                'timeline.placedAt': { $gte: histStart }
            }, 'pricing total timeline.placedAt date').lean();

            const months = [];
            for (let i = 0; i < 12; i++) {
                const d = new Date();
                d.setMonth(d.getMonth() - (11 - i));
                const monthYear = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
                months.push(monthYear);
                monthlyRevenueMap[monthYear] = 0;
            }

            histOrders.forEach(order => {
                const date = new Date(order.timeline?.placedAt || order.date);
                const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
                if (monthlyRevenueMap.hasOwnProperty(monthYear)) {
                    monthlyRevenueMap[monthYear] += (order.pricing?.grandTotal || order.total || 0);
                }
            });

            const monthlyRevenue = months.map(name => ({
                name: name.split(' ')[0],
                fullName: name,
                revenue: monthlyRevenueMap[name]
            }));

            deliveredOrders.forEach(order => {
                const date = new Date(order.date);
                const dayMonth = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
                const amt = order.pricing?.grandTotal || order.total || 0;

                if (!dailyRevenue[dayMonth]) dailyRevenue[dayMonth] = { sales: 0, orders: 0 };
                dailyRevenue[dayMonth].sales += amt;
                dailyRevenue[dayMonth].orders += 1;
            });

            const orderItemQuery = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
            const orderItems = await OrderItem.find(orderItemQuery).populate('product_id', 'name category stock').populate('seller_id', 'businessName name');

            const sellerRevenue = {};
            const sellerSales = {};
            const productRevenue = {};
            const productQuantity = {};
            const productCategory = {};
            const categoryRevenue = {};

            orderItems.forEach(item => {
                const qty = Number(item.quantity) || 0;
                const itemTotal = (Number(item.price) || 0) * qty;

                const sellerName = item.seller_id?.businessName || item.seller_id?.name || 'Unknown Seller';
                sellerRevenue[sellerName] = (sellerRevenue[sellerName] || 0) + itemTotal;
                sellerSales[sellerName] = (sellerSales[sellerName] || 0) + 1;

                const productName = item.product_id?.name || 'Unknown Product';
                const catName = item.product_id?.category || 'Uncategorized';
                productRevenue[productName] = (productRevenue[productName] || 0) + itemTotal;
                productQuantity[productName] = (productQuantity[productName] || 0) + qty;
                productCategory[productName] = catName;

                categoryRevenue[catName] = (categoryRevenue[catName] || 0) + itemTotal;
            });

            const topSellers = Object.entries(sellerRevenue).map(([name, revenue]) => ({ name, revenue, sales: sellerSales[name] })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
            const topProductsRev = Object.entries(productRevenue).map(([name, revenue]) => ({ name, revenue, category: productCategory[name] })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
            const topProductsQty = Object.entries(productQuantity).map(([name, qty]) => ({ name, qty, category: productCategory[name] })).sort((a, b) => b.qty - a.qty).slice(0, 10);
            const categoryBreakdown = Object.entries(categoryRevenue).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue);

            const salesTrend = Object.entries(dailyRevenue).map(([name, data]) => ({ name, sales: data.sales, orders: data.orders })).sort((a, b) => new Date(a.name) - new Date(b.name));

            const lowStockProductsRaw = await Product.find({ stock: { $lte: 10 } }).populate('seller_id', 'businessName').limit(20);
            const lowStockProducts = lowStockProductsRaw.map(p => ({
                id: p._id,
                name: p.name,
                seller: p.seller_id?.businessName || 'Unknown',
                stock: p.stock,
                status: p.stock === 0 ? 'Out of Stock' : 'Low Stock'
            }));

            res.json({
                overview: {
                    totalUsers, totalSellers, totalProducts, totalOrders,
                    totalRevenue, netRevenue, platformEarnings, aov,
                    orderStatusCounts, paymentMethodCounts,
                    deliveredOrders: orderStatusCounts.Delivered,
                    processingOrders: orderStatusCounts.Processing,
                    cancelledOrders: orderStatusCounts.Cancelled + orderStatusCounts.Returned
                },
                charts: {
                    salesTrend: salesTrend.length > 0 ? salesTrend : [{ name: 'Today', sales: 0, orders: 0 }],
                    monthlyRevenue,
                    categoryBreakdown
                },
                leaderboards: {
                    topSellers,
                    topProductsRev,
                    topProductsQty,
                    lowStockProducts
                }
            });
        } catch (err) {
            console.error("Stats Error:", err);
            res.status(500).json({ message: 'Failed to fetch admin stats' });
        }
    };

    getFinanceData = async (req, res) => {
        try {
            const [orders, sellers, orderItems] = await Promise.all([
                Order.find().populate('user_id', 'name email').sort({ date: -1 }),
                Seller.find().select('-password'),
                OrderItem.find().populate('seller_id', 'businessName name')
            ]);

            const transactions = orders.map(order => {
                const orderIdShort = order._id.toString().slice(-6).toUpperCase();
                const itemsForOrder = orderItems.filter(item => item.order_id && item.order_id.toString() === order._id.toString());
                const sellerNames = [...new Set(itemsForOrder.map(item => item.seller_id?.businessName || item.seller_id?.name || 'Unknown'))].join(', ');

                return {
                    id: order._id,
                    orderId: orderIdShort,
                    paymentId: order.payment?.payment_id || order.payment_id || 'N/A',
                    user: order.customer?.name || order.user_id?.name || 'Guest',
                    seller: sellerNames || 'Platform',
                    amount: order.pricing?.grandTotal || order.total,
                    method: order.payment?.method || (order.payment_id?.startsWith('pay_') ? 'Stripe/Card' : 'COD'),
                    status: order.status,
                    date: order.date
                };
            });

            const refunds = orders.filter(o => o.return && o.return.status !== 'None').map(o => ({
                id: o._id,
                orderId: o._id.toString().slice(-6).toUpperCase(),
                amount: o.pricing?.grandTotal || o.total,
                reason: o.return.reason || 'Not Specified',
                status: o.return.refundStatus || 'Pending',
                date: o.return.requestedAt || o.updatedAt
            }));

            const sellerPayouts = sellers.map(seller => {
                const items = orderItems.filter(item => item.seller_id && item.seller_id._id.toString() === seller._id.toString());
                const totalEarnings = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const commission = totalEarnings * 0.10;
                const payable = totalEarnings - commission;

                return {
                    id: seller._id,
                    name: seller.businessName || seller.name,
                    totalEarnings,
                    commission,
                    payable,
                    paid: 0,
                    pending: payable
                };
            });

            const settlements = [];

            const deliveredOrdersRaw = orders.filter(o => o.status === 'Delivered');
            const totalSales = deliveredOrdersRaw.reduce((sum, o) => sum + (o.pricing?.grandTotal || o.total || 0), 0);
            const totalCommission = totalSales * 0.10;

            const commissionLedger = {
                totalSales,
                sellerShare: totalSales - totalCommission,
                platformCommission: totalCommission,
                commissionRate: '10%'
            };

            const paymentLogs = {
                successful: orders.filter(o => ['Delivered', 'Paid', 'Shipped', 'Processing'].includes(o.status)).length,
                failedOrCancelled: orders.filter(o => o.status === 'Cancelled').length,
                codPending: orders.filter(o => (o.payment?.method === 'Cash' || o.payment_method === 'COD') && o.status !== 'Delivered').length,
                codCollected: orders.filter(o => (o.payment?.method === 'Cash' || o.payment_method === 'COD') && o.status === 'Delivered').length,
                totalProcessed: orders.length
            };

            res.json({
                transactions,
                refunds,
                sellerPayouts,
                settlements,
                commissionLedger,
                paymentLogs
            });
        } catch (err) {
            console.error("Finance Data Error:", err);
            res.status(500).json({ message: 'Failed to fetch finance data' });
        }
    };

    getPayouts = async (req, res) => {
        try {
            // --- AUTO-SYNC LOGIC ---
            const deliveredOrders = await Order.find({ status: 'Delivered' });

            for (const order of deliveredOrders) {
                const existingPayouts = await Payout.find({ orderId: order._id });

                if (existingPayouts.length === 0) {
                    const sellerEarnings = {};
                    const items = await OrderItem.find({ order_id: order._id });
                    const dataSource = items.length > 0 ? items : (order.items || []);

                    dataSource.forEach(item => {
                        const sid = (item.seller_id)?.toString();
                        if (sid) {
                            if (!sellerEarnings[sid]) sellerEarnings[sid] = 0;
                            sellerEarnings[sid] += (item.lineTotal || (item.price * item.quantity) || (item.priceAtPurchase * item.quantity));
                        }
                    });

                    for (const [sellerId, totalAmount] of Object.entries(sellerEarnings)) {
                        if (totalAmount > 0) {
                            const platformCommission = totalAmount * 0.10;
                            const sellerEarning = totalAmount - platformCommission;

                            await Payout.create({
                                sellerId,
                                orderId: order._id,
                                totalAmount,
                                platformCommission,
                                sellerEarning,
                                payoutStatus: 'Pending'
                            });
                        }
                    }
                }
            }
            // --- END AUTO-SYNC ---

            const payouts = await Payout.find()
                .populate('sellerId', 'businessName name email')
                .populate('orderId', '_id date customer user_id status')
                .sort({ createdAt: -1 });
            res.json(payouts);
        } catch (err) {
            console.error("[getPayouts error]", err);
            res.status(500).json({ message: 'Failed to fetch payouts' });
        }
    };

    approvePayout = async (req, res) => {
        try {
            const { reference } = req.body;
            const payout = await Payout.findByIdAndUpdate(req.params.id, {
                payoutStatus: 'Paid',
                paidAt: new Date(),
                approvedAt: new Date(),
                reference: reference || 'Admin Approved'
            }, { new: true });
            if (!payout) return res.status(404).json({ message: 'Payout not found' });
            res.json({ success: true, payout });
        } catch (err) {
            console.error('approvePayout error:', err);
            res.status(500).json({ message: 'Failed to approve payout' });
        }
    };

    // --- Admin Accounts Management --- //

    getAdmins = async (req, res) => {
        try {
            const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
            res.json(admins);
        } catch (err) {
            console.error('getAdmins error:', err);
            res.status(500).json({ message: 'Failed to fetch admin accounts' });
        }
    };

    createAdmin = async (req, res) => {
        try {
            const { name, email, password, role } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'All fields required for new admin' });
            }

            const exists = await Admin.findOne({ email: email.toLowerCase().trim() });
            if (exists) return res.status(409).json({ message: 'Admin email already exists' });

            const newAdmin = await Admin.create({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password,
                role: role || 'admin'
            });

            const adminWithoutPassword = newAdmin.toObject();
            delete adminWithoutPassword.password;

            res.json({ success: true, admin: adminWithoutPassword });
        } catch (err) {
            console.error('createAdmin error:', err);
            res.status(500).json({ message: 'Failed to create admin account' });
        }
    };

    deleteAdmin = async (req, res) => {
        try {
            if (req.user && req.user._id.toString() === req.params.id) {
                return res.status(400).json({ message: 'Cannot delete yourself' });
            }
            const admin = await Admin.findByIdAndDelete(req.params.id);
            if (!admin) return res.status(404).json({ message: 'Admin not found' });
            res.json({ success: true, message: 'Admin removed successfully' });
        } catch (err) {
            console.error('deleteAdmin error:', err);
            res.status(500).json({ message: 'Failed to delete admin account' });
        }
    };

    // --- System Settings --- //

    getSettings = async (req, res) => {
        try {
            let setting = await Setting.findOne();
            if (!setting) {
                setting = await Setting.create({});
            }
            res.json(setting);
        } catch (err) {
            console.error('getSettings error:', err);
            res.status(500).json({ message: 'Failed to fetch settings' });
        }
    };

    updateSettings = async (req, res) => {
        try {
            const updateData = req.body;
            let setting = await Setting.findOne();
            if (setting) {
                setting = await Setting.findByIdAndUpdate(setting._id, updateData, { new: true });
            } else {
                setting = await Setting.create(updateData);
            }
            res.json({ success: true, setting });
        } catch (err) {
            console.error('updateSettings error:', err);
            res.status(500).json({ message: 'Failed to update settings' });
        }
    };

    // --- Admin Notifications --- //
    getNotifications = async (req, res) => {
        try {
            const notifications = await AdminNotification.find().sort({ createdAt: -1 }).limit(50);
            res.json(notifications);
        } catch (err) {
            console.error('getNotifications error:', err);
            res.status(500).json({ message: 'Failed to fetch admin notifications' });
        }
    };

    markNotificationsRead = async (req, res) => {
        try {
            await AdminNotification.updateMany({ isRead: false }, { isRead: true });
            res.json({ success: true, message: 'Notifications marked as read' });
        } catch (err) {
            console.error('markNotificationsRead error:', err);
            res.status(500).json({ message: 'Failed to mark notifications as read' });
        }
    };
}

module.exports = new AdminController();
