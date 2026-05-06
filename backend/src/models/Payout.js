const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    totalAmount: { type: Number, required: true }, // Gross sales for this seller in this order
    platformCommission: { type: Number, required: true }, // 10%
    sellerEarning: { type: Number, required: true }, // 90%
    payoutStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    },
    approvedAt: { type: Date },
    paidAt: { type: Date },
    reference: { type: String }, // Transaction reference
    notes: { type: String } // For adjustment descriptions or admin logs
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
