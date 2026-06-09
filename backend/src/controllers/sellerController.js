const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const SellerSession = require('../models/SellerSession');
const Payout = require('../models/Payout');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { getUploadedUrl, getUploadedUrls } = require('../utils/fileHelper');


const SellerOTP = require('../models/SellerOTP');
const { sendSellerOTPEmail } = require('../services/emailService');


class SellerController {
    sendOTP = async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ message: 'Email is required' });

            const trimmedEmail = email.trim().toLowerCase();
            const exists = await Seller.findOne({ email: trimmedEmail });
            if (exists) return res.status(409).json({ message: 'Seller with this email already exists' });

            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            await SellerOTP.findOneAndUpdate(
                { email: trimmedEmail },
                { otp, createdAt: new Date() },
                { upsert: true, new: true }
            );

            await sendSellerOTPEmail(trimmedEmail, otp);

            res.json({ success: true, message: 'OTP sent successfully' });
        } catch (err) {
            console.error('sendOTP error:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    verifyOTP = async (req, res) => {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

            const trimmedEmail = email.trim().toLowerCase();
            const record = await SellerOTP.findOne({ email: trimmedEmail });

            if (!record) return res.status(404).json({ message: 'OTP expired or not requested' });
            if (record.otp !== otp.trim()) return res.status(400).json({ message: 'Invalid OTP code' });

            await SellerOTP.deleteOne({ _id: record._id });

            res.json({ success: true, message: 'Email verified successfully' });
        } catch (err) {
            console.error('verifyOTP error:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    register = async (req, res) => {
        try {
            const { name, email, password, businessName, phone, gstNumber, panNumber } = req.body;
            let { address, bankDetails } = req.body;

            // FormData sends objects as strings, need to parse if they come as strings
            if (typeof address === 'string') {
                try { address = JSON.parse(address); } catch (e) { console.error('Address parse error'); }
            }
            if (typeof bankDetails === 'string') {
                try { bankDetails = JSON.parse(bankDetails); } catch (e) { console.error('BankDetails parse error'); }
            }

            if (!name || !email || !password || !businessName || !phone) {
                return res.status(400).json({ message: 'All required fields must be provided' });
            }

            let idProofUrl = req.body.idProofUrl || '';
            if (req.file) {
                idProofUrl = getUploadedUrl(req.file, '/uploads/seller_docs');
            }

            const trimmedEmail = email.trim().toLowerCase();
            const exists = await Seller.findOne({ email: trimmedEmail });
            if (exists) return res.status(409).json({ message: 'Seller with this email already exists' });

            const newSeller = new Seller({
                name: name.trim(), email: trimmedEmail, password: password.trim(),
                businessName: businessName.trim(), phone: phone.trim(),
                address, bankDetails, gstNumber, panNumber, idProofUrl
            });
            const savedSeller = await newSeller.save();

            try {
                const AdminNotification = require('../models/AdminNotification');
                await AdminNotification.create({
                    title: 'New Seller Registration',
                    message: `${savedSeller.businessName} has registered and is waiting for approval.`,
                    type: 'new_seller',
                    relatedId: savedSeller._id
                });
            } catch (e) { console.error('AdminNotification error', e); }

            res.status(201).json({
                success: true,
                message: 'Registration successful. Your account is waiting for admin approval.',
                seller: { id: savedSeller._id, name: savedSeller.name, email: savedSeller.email, status: savedSeller.status }
            });
        } catch (err) {
            console.error('Seller register error:', err);
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
            const trimmedEmail = email.trim().toLowerCase();

            const seller = await Seller.findOne({ email: trimmedEmail });
            if (!seller) return res.status(404).json({ message: 'Seller not found' });
            const isMatch = await seller.comparePassword(password.trim());
            if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

            if (seller.status === 'pending') return res.status(403).json({ message: 'Your account is waiting for admin approval', status: 'pending' });
            if (seller.status === 'rejected') return res.status(403).json({ message: 'Your account has been rejected', status: 'rejected' });
            if (!seller.isActive) return res.status(403).json({ message: 'Your account has been deactivated' });

            const token = jwt.sign({ sellerId: seller._id, email: seller.email, role: 'seller' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

            // Save seller session in DB
            await SellerSession.create({ token, seller_id: seller._id });

            res.json({ success: true, message: 'Login successful', token, seller });
        } catch (err) {
            console.error('Seller login error:', err);
            res.status(500).json({ message: 'Internal Server Error during login' });
        }
    };

    getProfile = async (req, res) => {
        try {
            const seller = await Seller.findById(req.seller._id).select('-password');
            if (!seller) return res.status(404).json({ message: 'Seller not found' });
            res.json({ success: true, seller });
        } catch (err) {
            console.error('getProfile error:', err);
            res.status(500).json({ message: 'Failed to fetch seller profile' });
        }
    };

    updateProfile = async (req, res) => {
        try {
            const updatedSeller = await Seller.findByIdAndUpdate(req.seller._id, { ...req.body, updatedAt: new Date() }, { new: true }).select('-password');
            res.json({ success: true, message: 'Profile updated successfully', seller: updatedSeller });
        } catch (err) {
            console.error('updateProfile error:', err);
            res.status(500).json({ message: 'Failed to update profile' });
        }
    };

    logout = async (req, res) => {
        try {
            if (req.sellerToken) {
                await SellerSession.findOneAndDelete({ token: req.sellerToken });
            }
            res.json({ success: true, message: 'Logged out successfully' });
        } catch (err) {
            console.error('Seller logout error:', err);
            res.status(500).json({ message: 'Logout error' });
        }
    };

    getProducts = async (req, res) => {
        try {
            const products = await Product.find({ seller_id: req.seller._id }).sort({ createdAt: -1 });
            res.json(products);
        } catch (err) {
            console.error('Seller getProducts error:', err);
            res.status(500).json({ message: 'Failed to fetch seller products' });
        }
    };

    addProduct = async (req, res) => {
        try {
            if (req.seller.status !== 'approved') {
                return res.status(403).json({
                    message: 'Administrative approval required to add products.',
                    status: req.seller.status
                });
            }

            // 1. Extract and Clean basic fields
            const {
                name = '',
                price = 0,
                category = '',
                brand = '',
                description = '',
                stock = 0,
                color = '',
                size = '',
                variant = '',
                model = ''
            } = req.body;

            let shippingInfo = req.body.shippingInfo || {};
            if (typeof shippingInfo === 'string') {
                try { shippingInfo = JSON.parse(shippingInfo); } catch (e) { shippingInfo = {}; }
            }

            // 2. Handle Highlights (Merge highlights and highlights[])
            let rawHighlights = [];
            if (req.body.highlights) {
                if (Array.isArray(req.body.highlights)) rawHighlights = req.body.highlights;
                else if (typeof req.body.highlights === 'string') rawHighlights = req.body.highlights.includes(',') ? req.body.highlights.split(',') : [req.body.highlights];
            }
            if (req.body['highlights[]']) {
                const hArr = Array.isArray(req.body['highlights[]']) ? req.body['highlights[]'] : [req.body['highlights[]']];
                rawHighlights = [...rawHighlights, ...hArr];
            }
            const processedHighlights = [...new Set(rawHighlights.map(h => (h || '').toString().trim()).filter(Boolean))];

            // 3. Handle Images from Multer
            let finalImageUrl = req.body.imageUrl || '';
            let finalImages = [];

            if (req.files) {
                if (req.files['image'] && req.files['image'][0]) {
                    finalImageUrl = getUploadedUrl(req.files['image'][0], '/uploads/products');
                }
                if (req.files['additionalImages']) {
                    finalImages = getUploadedUrls(req.files['additionalImages'], '/uploads/products');
                }
            }

            // 4. Duplicate Check
            const existingProduct = await Product.findOne({
                seller_id: req.seller._id,
                name: name.trim(),
                color: color?.trim() || { $exists: false },
                size: size?.trim() || { $exists: false },
                variant: variant?.trim() || { $exists: false },
                model: model?.trim() || { $exists: false }
            });

            if (existingProduct) return res.status(409).json({ message: 'Product already exists', productId: existingProduct._id });

            // 5. Create Product
            const product = new Product({
                name: name.trim(),
                price: Number(price || 0),
                description: description || '',
                category: category || '',
                brand: brand || '',
                stock: Number(stock || 0),
                color: (color || '').trim(),
                size: (size || '').trim(),
                variant: (variant || '').trim(),
                model: (model || '').trim(),
                imageUrl: finalImageUrl,
                images: finalImages,
                highlights: processedHighlights,
                shippingInfo,
                seller_id: req.seller._id,
                isApproved: false,
                status: 'active'
            });

            await product.save();
            await Seller.findByIdAndUpdate(req.seller._id, { $inc: { totalProducts: 1 } });

            try {
                const AdminNotification = require('../models/AdminNotification');
                await AdminNotification.create({
                    title: 'New Product Submission',
                    message: `Seller has submitted a new product "${product.name}" for approval.`,
                    type: 'product_submission',
                    relatedId: product._id
                });
            } catch (e) { console.error('AdminNotification error', e); }

            res.status(201).json(product);
        } catch (err) {
            console.error('addProduct error:', err);
            res.status(500).json({ message: `Backend Error: ${err.message}` });
        }
    };

    updateProduct = async (req, res) => {
        try {
            if (req.seller.status !== 'approved') {
                return res.status(403).json({
                    message: 'Administrative approval required to manage products.',
                    status: req.seller.status
                });
            }
            const product = await Product.findOne({ _id: req.params.id, seller_id: req.seller._id });
            if (!product) return res.status(404).json({ message: 'Product not found' });

            // 1. Prepare Update Data
            let updateData = { ...req.body };

            // 2. Handle Images from Multer
            if (req.files) {
                if (req.files['image'] && req.files['image'][0]) {
                    updateData.imageUrl = getUploadedUrl(req.files['image'][0], '/uploads/products');
                }
                if (req.files['additionalImages']) {
                    const additionalPaths = getUploadedUrls(req.files['additionalImages'], '/uploads/products');
                    let currentImages = [];
                    if (typeof updateData.images === 'string' && updateData.images.trim()) {
                        currentImages = updateData.images.split(',').map(s => s.trim()).filter(Boolean);
                    } else if (Array.isArray(updateData.images)) {
                        currentImages = updateData.images;
                    }
                    updateData.images = [...currentImages, ...additionalPaths];
                }
            }

            // 3. Handle Highlights (Merge highlights and highlights[])
            let rawHighlights = [];
            if (req.body.highlights) {
                if (Array.isArray(req.body.highlights)) rawHighlights = req.body.highlights;
                else if (typeof req.body.highlights === 'string') rawHighlights = req.body.highlights.includes(',') ? req.body.highlights.split(',') : [req.body.highlights];
            }
            if (req.body['highlights[]']) {
                const hArr = Array.isArray(req.body['highlights[]']) ? req.body['highlights[]'] : [req.body['highlights[]']];
                rawHighlights = [...rawHighlights, ...hArr];
            }
            updateData.highlights = [...new Set(rawHighlights.map(h => (h || '').toString().trim()).filter(Boolean))];

            // 4. Parse Objects
            if (typeof updateData.shippingInfo === 'string') {
                try { updateData.shippingInfo = JSON.parse(updateData.shippingInfo); } catch (e) { }
            }

            // 5. Save and Return
            Object.assign(product, updateData);
            product.isApproved = false;
            product.rejectionReason = null;

            if (product.status !== 'blocked' && product.status !== 'disabled') {
                const newStock = Number(req.body.stock !== undefined ? req.body.stock : product.stock);
                product.status = newStock > 0 ? 'active' : 'out-of-stock';
            }

            await product.save();
            res.json(product);
        } catch (err) {
            console.error('updateProduct error:', err);
            res.status(500).json({ message: `Backend Error: ${err.message}` });
        }
    };

    togglePause = async (req, res) => {
        try {
            const product = await Product.findOne({ _id: req.params.id, seller_id: req.seller._id });
            if (!product) return res.status(404).json({ message: 'Product not found' });
            if (product.status === 'blocked') return res.status(403).json({ message: 'Product is blocked' });
            const newStatus = product.status === 'active' ? 'disabled' : 'active';
            product.status = newStatus;
            await product.save();
            res.json({ success: true, status: newStatus, message: `Product ${newStatus}` });
        } catch (err) {
            console.error('togglePause error:', err);
            res.status(500).json({ message: 'Failed to toggle status' });
        }
    };

    getDashboardStats = async (req, res) => {
        try {
            const productCount = await Product.countDocuments({ seller_id: req.seller._id });
            const lowStockCount = await Product.countDocuments({ seller_id: req.seller._id, stock: { $lt: 10 } });
            const rejectedCount = await Product.countDocuments({ seller_id: req.seller._id, status: 'rejected' });

            // Get all order items for this seller
            const orderItems = await OrderItem.find({ seller_id: req.seller._id })
                .populate('order_id')
                .populate('product_id')
                .sort({ createdAt: -1 });

            // Calculate Gross Sales from OrderItems directly (Real-time)
            // Filtering out cancelled/returned orders for accurate revenue
            const validOrderItems = orderItems.filter(item =>
                item.order_id &&
                item.order_id.status !== 'Cancelled' &&
                item.order_id.status !== 'Returned' &&
                item.order_id.return?.status !== 'Completed'
            );

            const totalSales = validOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Assuming 90% goes to seller (10% platform fee) as per Payout model intention
            const totalEarnings = totalSales * 0.9;

            const totalOrdersCount = new Set(orderItems.filter(i => i.order_id).map(item => item.order_id._id.toString())).size;

            const recentOrders = orderItems.slice(0, 5).map(item => ({
                id: item.order_id?._id,
                quantity: item.quantity,
                total_price: item.price * item.quantity,
                status: item.order_id?.status,
                created_at: item.order_id?.createdAt || item.order_id?.date,
                product_name: item.product_id?.name || 'Unknown Product',
                imageUrl: item.product_id?.imageUrl
            }));

            // We still fetch payouts for the "Paid" vs "Pending" split if needed
            const payouts = await Payout.find({ sellerId: req.seller._id });
            const paidAmount = payouts.filter(p => p.payoutStatus === 'Paid').reduce((sum, p) => sum + p.sellerEarning, 0);
            const pendingPayout = totalEarnings - paidAmount;

            // Calculate real-time rating from product reviews
            const products = await Product.find({ seller_id: req.seller._id }, '_id');
            const productIds = products.map(p => p._id);
            const reviews = await Review.find({ product_id: { $in: productIds } });
            const dynamicRating = reviews.length > 0
                ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
                : 0;

            res.json({
                totalProducts: productCount,
                totalSales,
                totalEarnings,
                pendingPayout,
                paidAmount,
                totalOrders: totalOrdersCount,
                balance: pendingPayout,
                rating: dynamicRating,
                lowStockProducts: lowStockCount,
                rejectedProducts: rejectedCount,
                recentOrders
            });
        } catch (err) {
            console.error('getDashboardStats error:', err);
            res.status(500).json({ message: 'Failed to fetch dashboard stats' });
        }
    };

    getOrders = async (req, res) => {
        try {
            const orderItems = await OrderItem.find({ seller_id: req.seller._id }).sort({ createdAt: -1 });
            const orderIds = orderItems.map(item => item.order_id);
            const orders = await Order.find({ _id: { $in: orderIds } }).populate('user_id', 'name email phone').sort({ createdAt: -1 });
            const sellerOrders = orders.map(order => {
                const orderObj = order.toObject();
                // Add a root total field for frontend compatibility and calculate seller-specific total
                orderObj.sellerTotal = orderObj.items
                    .filter(item => item.seller_id?.toString() === req.seller._id.toString())
                    .reduce((sum, item) => sum + (item.lineTotal || 0), 0);

                orderObj.items = orderObj.items.filter(item => item.seller_id?.toString() === req.seller._id.toString());
                return orderObj;
            });
            res.json(sellerOrders);
        } catch (err) {
            console.error('Seller getOrders error:', err);
            res.status(500).json({ message: 'Failed to fetch seller orders' });
        }
    };

    updateOrderStatus = async (req, res, io) => {
        try {
            if (req.seller.status !== 'approved') {
                return res.status(403).json({ message: 'Approved seller status required to manage orders' });
            }
            const { status } = req.body;
            const sellerId = req.seller._id;

            // 1. Security Check: Does this seller own any items in this order?
            const orderInstance = await Order.findById(req.params.id);
            if (!orderInstance) return res.status(404).json({ message: 'Order not found' });

            const hasOwnership = orderInstance.items.some(item =>
                item.seller_id?.toString() === sellerId.toString()
            );

            if (!hasOwnership) {
                return res.status(403).json({ message: 'Unauthorized: You do not own any products in this order' });
            }

            // 2. Controlled Status Flow
            const statusFlow = {
                'Pending': ['Confirmed', 'Cancelled'],
                'Confirmed': ['Packed', 'Cancelled'],
                'Packed': ['Shipped'],
                'Shipped': ['Delivered'],
                'Delivered': [],
                'Cancelled': []
            };

            const currentStatus = orderInstance.status;
            if (!statusFlow[currentStatus]?.includes(status)) {
                return res.status(400).json({
                    message: `Invalid status transition from ${currentStatus} to ${status}`
                });
            }

            const update = { status };
            const timestampField = `timeline.${status.charAt(0).toLowerCase() + status.slice(1).replace(/ /g, '')}At`;
            update[timestampField] = new Date();

            const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });

            // 3. Selective Real-time Update
            if (io) {
                // Notify the specific seller room and the user room
                io.to(sellerId.toString()).emit('orderStatusUpdate', {
                    orderId: updatedOrder._id,
                    status: updatedOrder.status,
                    timeline: updatedOrder.timeline
                });

                // Also notify the customer if they are online
                io.to(updatedOrder.user_id.toString()).emit('userOrderStatusUpdate', {
                    orderId: updatedOrder._id,
                    status: updatedOrder.status
                });
            }

            res.json({ success: true, status: updatedOrder.status, timeline: updatedOrder.timeline });
        } catch (err) {
            console.error('updateOrderStatus error:', err);
            res.status(500).json({ message: 'Failed to update status' });
        }
    };

    updateTracking = async (req, res) => {
        try {
            const { tracking_id } = req.body;
            const sellerId = req.seller._id;

            // Security Check
            const orderInstance = await Order.findById(req.params.id);
            if (!orderInstance) return res.status(404).json({ message: 'Order not found' });

            const hasOwnership = orderInstance.items.some(item =>
                item.seller_id?.toString() === sellerId.toString()
            );

            if (!hasOwnership) {
                return res.status(403).json({ message: 'Unauthorized: You do not own any products in this order' });
            }

            const updatedOrder = await Order.findByIdAndUpdate(
                req.params.id,
                {
                    $set: {
                        'tracking.trackingNumber': tracking_id,
                        'tracking.courierName': 'Standard Shipping'
                    }
                },
                { new: true }
            );

            res.json({ success: true, tracking_id: updatedOrder.tracking?.trackingNumber });
        } catch (err) {
            console.error('updateTracking error:', err);
            res.status(500).json({ message: 'Failed to update tracking' });
        }
    };

    getNotifications = async (req, res) => {
        try {
            const notifications = await Notification.find({ sellerId: req.seller._id }).sort({ createdAt: -1 }).limit(50);
            res.json(notifications);
        } catch (err) {
            console.error('getNotifications error:', err);
            res.status(500).json({ message: 'Failed to fetch notifications' });
        }
    };

    markNotificationsRead = async (req, res) => {
        try {
            await Notification.updateMany({ sellerId: req.seller._id, isRead: false }, { isRead: true });
            res.json({ success: true, message: 'Notifications marked as read' });
        } catch (err) {
            console.error('markNotificationsRead error:', err);
            res.status(500).json({ message: 'Failed to mark notifications as read' });
        }
    };

    saveOnboardingStep1 = async (req, res) => {
        try {
            const { name, email, phone, password } = req.body;
            if (!name || !email || !password || !phone) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const trimmedEmail = email.trim().toLowerCase();
            let seller = await Seller.findOne({ email: trimmedEmail });
            
            if (seller && seller.onboardingStatus !== 'draft') {
                return res.status(409).json({ message: 'Seller already exists with this email' });
            }

            if (!seller) {
                seller = new Seller({
                    name: name.trim(),
                    email: trimmedEmail,
                    password: password.trim(),
                    phone: phone.trim(),
                    businessName: `${name.trim()}'s Shop`, // Temporary
                    onboardingStep: 2,
                    onboardingStatus: 'draft'
                });
            } else {
                seller.name = name.trim();
                seller.phone = phone.trim();
                seller.password = password.trim();
                seller.onboardingStep = 2;
            }

            const savedSeller = await seller.save();
            
            // Create session
            const token = jwt.sign(
                { sellerId: savedSeller._id, email: savedSeller.email, role: 'seller' }, 
                process.env.JWT_SECRET, 
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );
            await SellerSession.create({ token, seller_id: savedSeller._id });

            res.json({ success: true, token, seller: { id: savedSeller._id, step: savedSeller.onboardingStep } });
        } catch (err) {
            console.error('saveOnboardingStep1 error:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    saveOnboardingStep2 = async (req, res) => {
        try {
            const { businessName, address, gstNumber, panNumber } = req.body;
            if (!businessName || !address) {
                return res.status(400).json({ message: 'Business name and address are required' });
            }

            const seller = await Seller.findById(req.seller._id);
            if (!seller) return res.status(404).json({ message: 'Seller not found' });

            seller.businessName = businessName.trim();
            seller.address = address;
            seller.gstNumber = gstNumber;
            seller.panNumber = panNumber;
            seller.onboardingStep = 3;

            await seller.save();
            res.json({ success: true, step: seller.onboardingStep });
        } catch (err) {
            console.error('saveOnboardingStep2 error:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    saveOnboardingStep3 = async (req, res) => {
        try {
            if (!req.files || (!req.files.aadhaar && !req.files.panCard)) {
                return res.status(400).json({ message: 'Both Aadhaar and PAN Card images are required' });
            }

            const seller = await Seller.findById(req.seller._id);
            if (!seller) return res.status(404).json({ message: 'Seller not found' });

            if (req.files.aadhaar) {
                seller.aadhaarUrl = getUploadedUrl(req.files.aadhaar[0], '/uploads/seller_docs');
                seller.idProofUrl = seller.aadhaarUrl; // For compatibility
            }
            if (req.files.panCard) {
                seller.panCardUrl = getUploadedUrl(req.files.panCard[0], '/uploads/seller_docs');
            }

            seller.onboardingStep = 4;
            await seller.save();

            res.json({ success: true, step: seller.onboardingStep });
        } catch (err) {
            console.error('saveOnboardingStep3 error:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    saveOnboardingStep4 = async (req, res) => {
        try {
            const { accountNumber, ifscCode, accountHolderName, bankName } = req.body;
            if (!accountNumber || !ifscCode || !accountHolderName || !bankName) {
                return res.status(400).json({ message: 'Full bank details are required' });
            }

            const seller = await Seller.findById(req.seller._id);
            if (!seller) return res.status(404).json({ message: 'Seller not found' });

            seller.bankDetails = {
                accountHolder: accountHolderName,
                accountNumber,
                ifscCode,
                bankName
            };
            seller.onboardingStatus = 'pending_verification';
            seller.status = 'pending'; // For compatibility

            await seller.save();

            // Create admin notification
            try {
                const AdminNotification = require('../models/AdminNotification');
                await AdminNotification.create({
                    title: 'New Onboarding Submission',
                    message: `${seller.businessName} has completed onboarding and is waiting for verification.`,
                    type: 'new_seller',
                    relatedId: seller._id
                });
            } catch (e) { console.error('AdminNotification error', e); }

            res.json({ success: true, message: 'Onboarding completed and submitted for verification!' });
        } catch (err) {
            console.error('saveOnboardingStep4 error:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    getOnboardingStatus = async (req, res) => {
        try {
            const seller = await Seller.findById(req.seller._id).select('-password');
            if (!seller) return res.status(404).json({ message: 'Seller not found' });

            res.json({
                success: true,
                step: seller.onboardingStep,
                status: seller.onboardingStatus,
                seller
            });
        } catch (err) {
            console.error('getOnboardingStatus error:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

}

module.exports = new SellerController();
