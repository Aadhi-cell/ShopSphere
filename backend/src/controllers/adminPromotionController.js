const PromotionRequest = require('../models/PromotionRequest');
const Banner = require('../models/Banner');
const Notification = require('../models/Notification');
const { getUploadedUrl } = require('../utils/fileHelper');

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await PromotionRequest.find()
            .populate('sellerId', 'businessName email')
            .populate('productId', 'name price stock status')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching promotion requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyRequest = async (req, res) => {
    try {
        const { isVerified, verificationNotes } = req.body;
        const request = await PromotionRequest.findById(req.params.id).populate('productId');
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (isVerified && request.productId) {
            if (request.productId.status !== 'active') {
                return res.status(400).json({ message: 'Cannot verify: Product is not active' });
            }
            if (request.productId.stock <= 0) {
                return res.status(400).json({ message: 'Cannot verify: Product is out of stock' });
            }
        }

        request.isVerified = isVerified;
        request.verificationNotes = verificationNotes;

        if (!isVerified) {
            request.status = 'Rejected';
            if (request.sellerId) {
                await Notification.create({
                    sellerId: request.sellerId,
                    title: 'Promotion Request Rejected',
                    message: `Your promotion request has been rejected. Notes: ${verificationNotes || 'None'}`,
                    type: 'promotion'
                });
            }
        } else {
            // Step 3 Completion: Check if final activation criteria (payment + creative) are met
            if (request.status === 'Payment Pending' && request.paymentStatus === 'Paid') {
                request.status = 'Active';
                // Automatically activate linked visual assets
                const updatedBanner = await Banner.findOneAndUpdate(
                    { promotionRequestId: request._id },
                    {
                        status: 'Active',
                        // If we are Going Live, ensure the start date is no later than now
                        $min: { startDate: new Date() }
                    },
                    { new: true }
                );
                console.log('Banner activated:', updatedBanner?._id);
            } else {
                request.status = 'Verified';
                if (request.sellerId) {
                    await Notification.create({
                        sellerId: request.sellerId,
                        title: 'Promotion Request Verified',
                        message: `Your promotion request has been verified.`,
                        type: 'promotion'
                    });
                }
            }
        }

        await request.save();
        res.json({ message: `Request ${isVerified ? 'verified' : 'rejected'} successfully`, request });
    } catch (error) {
        console.error('Verify Request Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createBannerFromRequest = async (req, res) => {
    try {
        const {
            title, subtitle, tagline, label, offer, bankOffer, color, bg,
            buttonText, redirectLink, status, startDate, endDate, priority, bannerType, promotionRequestId, sellerId
        } = req.body;
        const imageUrl = req.file ? getUploadedUrl(req.file, '/uploads/banners') : req.body.imageUrl;

        if (!imageUrl) {
            return res.status(400).json({ message: 'Banner image is required' });
        }

        const banner = new Banner({
            title,
            subtitle,
            tagline,
            label,
            offer,
            bankOffer,
            color,
            bg,
            imageUrl,
            buttonText,
            redirectLink,
            status: (status && status !== 'undefined' && status !== 'null') ? status : 'Inactive',
            startDate: (startDate && startDate !== 'undefined' && startDate !== 'null') ? new Date(new Date(startDate).setUTCHours(0, 0, 0, 0)) : undefined,
            endDate: (endDate && endDate !== 'undefined' && endDate !== 'null') ? new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)) : undefined,
            priority: Number(priority) || 0,
            bannerType,
            sellerId: (sellerId && sellerId !== 'undefined' && sellerId !== 'null') ? sellerId : undefined,
            promotionRequestId: (promotionRequestId && promotionRequestId !== 'undefined' && promotionRequestId !== 'null') ? promotionRequestId : undefined
        });

        await banner.save();

        if (promotionRequestId) {
            await PromotionRequest.findByIdAndUpdate(promotionRequestId, {
                status: 'Payment Pending',
                bannerUrl: imageUrl
            });
        }

        res.status(201).json({ message: 'Banner created. Promotion moved to Payment Pending.', banner });
    } catch (error) {
        console.error('Create Banner Error:', error);
        res.status(500).json({ message: error.message || 'Server error', stack: error.stack });
    }
};

exports.deleteRequest = async (req, res) => {
    try {
        const request = await PromotionRequest.findByIdAndDelete(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        await Banner.deleteMany({ promotionRequestId: req.params.id });
        res.json({ message: 'Promotion request deleted successfully' });
    } catch (error) {
        console.error('Delete Request Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
