const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String },
    brand: { type: String },
    imageUrl: { type: String },
    description: { type: String },
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
    shippingInfo: {
        weight: { type: Number },
        dimensions: { type: String },
        shippingCost: { type: Number }
    },
    color: { type: String },
    size: { type: String },
    variant: { type: String },
    model: { type: String },
    highlights: [{ type: String }],
    isApproved: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['active', 'disabled', 'out-of-stock', 'blocked', 'rejected'],
        default: 'active'
    },
    rejectionReason: { type: String },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' }
}, { timestamps: true });

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
