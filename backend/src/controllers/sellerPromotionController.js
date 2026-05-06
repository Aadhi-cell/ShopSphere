const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PromotionRequest = require('../models/PromotionRequest');
const Banner = require('../models/Banner');

exports.createPromotionRequest = async (req, res) => {
    try {


        const {
            productId,
            categoryId,
            bannerTitle,
            bannerSubtitle,
            offerDetails,
            preferredStartDate,
            preferredEndDate,
            bannerType,
            paymentAmount,
            budget,
            campaignType,
            notes
        } = req.body;

        // Validation: Pre-check dates to avoid casting errors
        if (!preferredStartDate || !preferredEndDate) {
            return res.status(400).json({ message: 'Campaign start and end dates are required' });
        }

        const startDate = new Date(preferredStartDate);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(preferredEndDate);
        endDate.setUTCHours(23, 59, 59, 999);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ message: 'Invalid campaign dates provided' });
        }

        if (startDate > endDate) {
            return res.status(400).json({ message: 'Campaign start date cannot be after the end date' });
        }

        let bannerUrl = req.body.bannerUrl;
        if (req.file) {
            bannerUrl = `/uploads/banners/${req.file.filename}`;
        }

        const requestData = {
            sellerId: req.seller._id,
            // Only pass productId if it is a valid, non-empty string that looks like an ObjectId
            productId: productId && productId !== 'undefined' && productId !== '' && productId.length === 24 ? productId : undefined,
            categoryId: categoryId && categoryId !== 'undefined' && categoryId !== '' ? categoryId : undefined,
            bannerTitle,
            bannerSubtitle,
            offerDetails,
            preferredStartDate: startDate,
            preferredEndDate: endDate,
            bannerType,
            paymentAmount: Number(paymentAmount) || 0,
            budget: Number(budget) || 0,
            campaignType: campaignType || 'Fixed',
            notes: Array.isArray(notes) ? notes.join(' ') : notes,
            bannerUrl,
            status: 'Requested',
            paymentStatus: 'Pending'
        };

        const request = new PromotionRequest(requestData);

        await request.save();

        try {
            const AdminNotification = require('../models/AdminNotification');
            await AdminNotification.create({
                title: 'New Promotion Request',
                message: `A seller requested a new promotion campaign.`,
                type: 'promotion_request',
                relatedId: request._id
            });
        } catch(e) { console.error('AdminNotification error', e); }

        res.status(201).json({ message: 'Promotion request submitted successfully', request });
    } catch (error) {
        console.error('Error creating promotion request:', error);

        // Handle Mongoose Validation Errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation Error', errors: messages });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getSellerRequests = async (req, res) => {
    try {
        const sellerId = req.seller._id || req.seller.id;
        const requests = await PromotionRequest.find({ sellerId })
            .populate('productId', 'name images price stock')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching promotion requests:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createPromotionSession = async (req, res) => {
    try {
        const sellerId = req.seller._id || req.seller.id;
        const request = await PromotionRequest.findOne({ _id: req.params.id, sellerId });

        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.status !== 'Payment Pending') return res.status(400).json({ message: 'Promotion must be ready (Payment Pending) before payment' });
        if (request.paymentStatus === 'Paid') return res.status(400).json({ message: 'Promotion already paid' });

        const domainUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: `Promotion: ${request.bannerTitle}`,
                        description: `Type: ${request.bannerType} | Duration: ${new Date(request.preferredStartDate).toLocaleDateString()} to ${new Date(request.preferredEndDate).toLocaleDateString()}`,
                    },
                    unit_amount: Math.round(request.paymentAmount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${domainUrl}/seller?tab=promotions&success=true&session_id={CHECKOUT_SESSION_ID}&request_id=${request._id}`,
            cancel_url: `${domainUrl}/seller?tab=promotions&cancelled=true`,
            metadata: {
                promotionRequestId: request._id.toString(),
                sellerId: sellerId.toString(),
                type: 'promotion_payment'
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Promotion Session error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.confirmPromotionPayment = async (req, res) => {
    try {
        const { sessionId, requestId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid' && session.metadata.promotionRequestId === requestId) {
            const request = await PromotionRequest.findById(requestId);
            if (request) {
                request.paymentStatus = 'Paid';
                request.paymentId = session.payment_intent;
                await request.save();

                // Automatically activate banner if approved and paid
                // This could also be handled by a service or just here
                const banner = await Banner.findOne({ promotionRequestId: requestId });
                if (banner) {
                    banner.isActive = true;
                    // If start date is now/past, set status to Active
                    const now = new Date();
                    if (new Date(banner.startDate) <= now) {
                        banner.status = 'Active';
                    } else {
                        banner.status = 'Scheduled';
                    }
                    await banner.save();
                }

                return res.json({ success: true, message: 'Promotion payment confirmed and activated' });
            }
        }
        res.status(400).json({ message: 'Payment verification failed' });
    } catch (error) {
        console.error('Confirm Promotion Payment error:', error);
        res.status(500).json({ message: error.message });
    }
};


