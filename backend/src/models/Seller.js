const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sellerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    businessName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: Object },
    bankDetails: {
        accountHolder: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
        bankName: { type: String }
    },
    gstNumber: { type: String },
    panNumber: { type: String },
    idProofUrl: { type: String },
    aadhaarUrl: { type: String },
    panCardUrl: { type: String },
    onboardingStep: { type: Number, default: 1 },
    onboardingStatus: {
        type: String,
        enum: ['draft', 'pending_verification', 'verified', 'rejected'],
        default: 'draft'
    },
    rejectionReason: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 }
}, { timestamps: true });

// Hash password before saving
sellerSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
sellerSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};

sellerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

sellerSchema.set('toJSON', { virtuals: true });
sellerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Seller', sellerSchema);
