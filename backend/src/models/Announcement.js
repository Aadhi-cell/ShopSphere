const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    startDate: { type: Date },
    endDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
