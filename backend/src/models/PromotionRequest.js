const mongoose = require('mongoose');

const promotionRequestSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    categoryId: { type: String }, // Using String for category name/ID to avoid ref casting errors if model is missing
    bannerTitle: { type: String, required: true },
    bannerSubtitle: { type: String },
    offerDetails: { type: String },
    preferredStartDate: { type: Date, required: true },
    preferredEndDate: { type: Date, required: true },
    bannerType: { type: String, enum: ['Homepage', 'Category', 'Sidebar', 'Fullscreen'], default: 'Homepage' },
    status: {
        type: String,
        enum: ['Requested', 'Under Review', 'Verified', 'Banner Ready', 'Payment Pending', 'Approved', 'Rejected', 'Active', 'Expired'],
        default: 'Requested'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    paymentAmount: { type: Number, required: true },
    budget: { type: Number, default: 0 },
    campaignType: { type: String, enum: ['CPC', 'CPA', 'Fixed'], default: 'Fixed' },
    notes: { type: String }, // Admin notes or seller special requests
    paymentId: { type: String }, // Transaction ID from Stripe
    bannerUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationNotes: { type: String },
    performance: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('PromotionRequest', promotionRequestSchema);
