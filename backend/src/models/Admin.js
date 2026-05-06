const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }
}, { timestamps: true });

// Hash password before saving
adminSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};

adminSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Admin', adminSchema);
