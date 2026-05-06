const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    tagline: { type: String }, // [NEW] e.g. "SUMMER 2026"
    label: { type: String },   // [NEW] e.g. "BESTSELLER"
    offer: { type: String },   // [NEW] e.g. "FLAT 50% OFF"
    bankOffer: { type: String }, // [NEW] e.g. "10% off on HDFC"
    color: { type: String },    // [NEW] Brand color hex
    bg: { type: String },       // [NEW] Background gradient/color
    imageUrl: { type: String, required: true },
    buttonText: { type: String, default: 'Shop Now' },
    redirectLink: { type: String, default: '/' },
    status: { type: String, enum: ['Active', 'Inactive', 'Scheduled', 'Expired'], default: 'Active' },
    startDate: { type: Date },
    endDate: { type: Date },
    order: { type: Number, default: 0 },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    promotionRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'PromotionRequest' },
    bannerType: { type: String, enum: ['Homepage', 'Category', 'Sidebar', 'Fullscreen'], default: 'Homepage' },
    priority: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
