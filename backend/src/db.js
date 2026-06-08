const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopsphere';
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected Successfully');

        // Seed default admin if it doesn't exist
        const Admin = require('./models/Admin');
        const adminExists = await Admin.findOne({ email: 'admin@site.com' });
        if (!adminExists) {
            await Admin.create({
                name: 'System Admin',
                email: 'admin@site.com',
                password: 'demo123',
                role: 'admin'
            });
            console.log('👤 Default Admin account auto-seeded successfully');
        }
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
