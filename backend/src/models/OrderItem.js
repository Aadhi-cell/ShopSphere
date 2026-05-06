const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
}, { timestamps: true });

orderItemSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderItemSchema.set('toJSON', { virtuals: true });
orderItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('OrderItem', orderItemSchema);
