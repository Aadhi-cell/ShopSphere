const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopsphere';
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
