const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    siteTitle: { type: String, default: 'ShopSphere' },
    logoUrl: { type: String, default: 'https://example.com/logo.png' },
    supportEmail: { type: String, default: 'support@shopsphere.com' },
    phone: { type: String, default: '+91 12345 67890' },
    address: { type: String, default: '123 Tech Park, Bangalore, India' }
}, { timestamps: true });

settingSchema.set('toJSON', { virtuals: true });
settingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Setting', settingSchema);
