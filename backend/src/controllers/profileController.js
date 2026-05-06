const Profile = require('../models/Profile');

class ProfileController {
    getProfile = async (req, res) => {
        try {
            const row = await Profile.findOne({ user_id: req.user._id });
            if (!row) {
                return res.json({
                    fullName: req.user.name,
                    email: req.user.email,
                    phone: '',
                    gender: '',
                    address: { line1: '', city: '', state: '', zip: '' }
                });
            }
            res.json({
                fullName: row.fullName || req.user.name,
                email: req.user.email,
                phone: row.phone || '',
                gender: row.gender || '',
                address: row.address || { line1: '', city: '', state: '', zip: '' }
            });
        } catch (err) {
            console.error('getProfile error:', err);
            res.status(500).json({ message: 'Failed to fetch profile' });
        }
    };

    updateProfile = async (req, res) => {
        try {
            const { fullName, phone, gender, address } = req.body;
            await Profile.findOneAndUpdate(
                { user_id: req.user._id },
                { fullName, phone, gender, address },
                { upsert: true, new: true }
            );
            res.json({ success: true });
        } catch (err) {
            console.error('updateProfile error:', err);
            res.status(500).json({ message: 'Failed to update profile' });
        }
    };
}

module.exports = new ProfileController();
