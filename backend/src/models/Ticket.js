const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    sender: { type: String, enum: ['admin', 'user', 'seller'], required: true },
    senderName: { type: String, default: 'Admin' },
    message: { type: String, required: true },
    isInternal: { type: Boolean, default: false }, // true = admin-seller only, hidden from user
}, { timestamps: true });

const ticketSchema = new mongoose.Schema({
    ticketId: { type: String, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    senderType: { type: String, enum: ['user', 'seller'], default: 'user' },
    senderName: { type: String },
    senderEmail: { type: String },
    orderId: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: {
        type: String,
        enum: ['Order Issue', 'Payment Problem', 'Refund Request', 'Damaged Product', 'Account Issue', 'Other'],
        default: 'Other'
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },

    // Resolution action taken by admin
    resolution: {
        type: String,
        enum: ['Approve Refund', 'Approve Replacement', 'Rejected', 'Need More Info', null],
        default: null
    },
    resolutionNote: { type: String, default: '' }, // reason for rejection / note to user

    // Public replies (visible to user)
    replies: [replySchema],

    // Internal notes — admin ↔ seller communication, NOT visible to user
    internalNotes: [replySchema],

    resolvedAt: { type: Date },
}, { timestamps: true });

// Auto-generate ticketId before save
ticketSchema.pre('save', async function () {
    if (!this.ticketId) {
        const count = await mongoose.model('Ticket').countDocuments();
        this.ticketId = `TCK-${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Ticket', ticketSchema);
