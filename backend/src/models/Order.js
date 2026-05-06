const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String }
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
        name: { type: String, required: true },
        imageUrl: { type: String },
        priceAtPurchase: { type: Number, required: true },
        quantity: { type: Number, required: true },
        lineTotal: { type: Number, required: true }
    }],
    pricing: {
        subtotal: { type: Number, required: true },
        tax: { type: Number, default: 0 },
        shippingFee: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true }
    },
    payment: {
        provider: { type: String, required: true }, // Stripe, COD
        payment_id: { type: String }, // Transaction ID or Intent ID
        method: { type: String, required: true }, // Card, UPI, Cash
        status: { type: String, default: 'Pending' }, // Paid, Pending, Failed
        paidAt: { type: Date }
    },
    tracking: {
        courierName: { type: String, default: '' },
        trackingNumber: { type: String, default: '' }
    },
    address: {
        fullName: { type: String },
        line1: { type: String },
        line2: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String, default: 'IN' },
        mobile: { type: String }
    },
    status: { type: String, default: 'Pending' },
    sourcePromotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PromotionRequest' },
    sourceBannerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Banner' },
    timeline: {
        placedAt: { type: Date, default: Date.now },
        confirmedAt: { type: Date },
        shippedAt: { type: Date },
        deliveredAt: { type: Date },
        cancelledAt: { type: Date }
    },
    return: {
        status: { type: String, enum: ['None', 'Requested', 'Approved', 'Pickup Scheduled', 'Picked Up', 'Quality Check Failed', 'Completed', 'Rejected'], default: 'None' },
        refundStatus: { type: String, enum: ['None', 'Pending', 'Initiated', 'Refunded', 'Failed'], default: 'None' },
        reason: { type: String },
        rejectionReason: { type: String },
        proofImages: [{ type: String }],
        refundMethod: { type: String }, // 'Original Payment Method', 'Bank Transfer', 'UPI'
        refundDetails: { type: mongoose.Schema.Types.Mixed },
        requestedAt: { type: Date },
        refundedAt: { type: Date }
    },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
