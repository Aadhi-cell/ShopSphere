const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String },
    phone: { type: String },
    gender: { type: String },
    address: { type: Object }
}, { timestamps: true });

profileSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

profileSchema.set('toJSON', { virtuals: true });
profileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Profile', profileSchema);
