const mongoose = require('mongoose');

const sellerSessionSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    created_at: { type: Number, default: Date.now }
});

module.exports = mongoose.model('SellerSession', sellerSessionSchema);
