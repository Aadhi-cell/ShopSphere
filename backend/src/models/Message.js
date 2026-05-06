const mongoose = require('mongoose');

const messageReplySchema = new mongoose.Schema({
    sender: { type: String, enum: ['admin', 'user', 'seller'], required: true },
    senderName: { type: String, default: 'Admin' },
    content: { type: String, required: true },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    senderType: { type: String, enum: ['user', 'seller'], default: 'user' },
    senderName: { type: String },
    senderEmail: { type: String },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    replies: [messageReplySchema],
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
