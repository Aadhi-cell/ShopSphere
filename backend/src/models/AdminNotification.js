const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['new_seller', 'product_submission', 'promotion_request', 'system'],
        default: 'system'
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        // Optional reference depending on the type (e.g. Seller id, Product id, PromotionRequest id)
        required: false
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
