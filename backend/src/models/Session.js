const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Number, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
