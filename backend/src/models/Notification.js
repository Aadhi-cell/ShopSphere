const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
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
        enum: ['product', 'promotion', 'account', 'system'],
        default: 'system'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
