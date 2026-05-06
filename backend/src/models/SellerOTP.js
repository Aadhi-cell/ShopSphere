const mongoose = require('mongoose');

const sellerOTPSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // 10 minutes auto-delete
});

module.exports = mongoose.model('SellerOTP', sellerOTPSchema);
