const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Session = require('../models/Session');

class AuthController {
    constructor() {
        this.loginAttempts = {};
    }

    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password required' });
            }
            const normalizedEmail = email.trim().toLowerCase();

            const now = Date.now();
            if (!this.loginAttempts[normalizedEmail]) {
                this.loginAttempts[normalizedEmail] = { fails: 0, blockedUntil: 0 };
            }

            const record = this.loginAttempts[normalizedEmail];
            if (record.blockedUntil && now < record.blockedUntil) {
                return res.status(429).json({ message: 'Too many failed attempts. Try again in 1 minute.' });
            }

            const user = await User.findOne({ email: normalizedEmail });
            if (!user) {
                record.fails++;
                if (record.fails >= 5) record.blockedUntil = now + 60000;
                return res.status(404).json({ message: 'Email not found' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                record.fails++;
                if (record.fails >= 5) record.blockedUntil = now + 60000;
                return res.status(401).json({ message: 'Incorrect password' });
            }

            this.loginAttempts[normalizedEmail] = { fails: 0, blockedUntil: 0 };

            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            // Save session in DB
            await Session.create({ token, user_id: user._id });

            res.json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ message: 'Login error' });
        }
    };

    adminLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password required' });
            }

            const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
            if (!admin) {
                return res.status(404).json({ message: 'Admin not found' });
            }

            const isMatch = await admin.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect password' });
            }

            const token = jwt.sign(
                { userId: admin._id, email: admin.email, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            // Save session in DB
            await Session.create({ token, user_id: admin._id });

            res.json({
                token,
                user: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: 'admin',
                },
            });
        } catch (err) {
            console.error('Admin login error:', err);
            res.status(500).json({ message: 'Admin login error' });
        }
    };

    register = async (req, res) => {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'All fields required' });
            }
            const trimmedEmail = email.trim().toLowerCase();

            const exists = await User.findOne({ email: trimmedEmail });
            if (exists) {
                return res.status(409).json({ message: 'Email already registered' });
            }
            await User.create({
                name: name.trim(),
                email: trimmedEmail,
                password: password,
                role: 'customer'
            });
            res.json({ success: true });
        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ message: 'Registration error' });
        }
    };

    getMe = async (req, res) => {
        try {
            res.json({
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            });
        } catch (err) {
            console.error('Get profile error:', err);
            res.status(500).json({ message: 'Error fetching profile' });
        }
    };

    refreshToken = async (req, res) => {
        try {
            const newToken = jwt.sign(
                { userId: req.user._id, email: req.user.email, role: req.user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );
            res.json({ token: newToken });
        } catch (err) {
            console.error('Refresh token error:', err);
            res.status(500).json({ message: 'Error refreshing token' });
        }
    };

    changePassword = async (req, res) => {
        try {
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ message: 'Old and new passwords are required' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters' });
            }

            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const isMatch = await user.comparePassword(oldPassword);
            if (!isMatch) {
                return res.status(401).json({ message: 'Old password is incorrect' });
            }
            user.password = newPassword; // pre-save hook will hash it
            await user.save();
            res.json({ success: true, message: 'Password changed successfully' });
        } catch (err) {
            console.error('Change password error:', err);
            res.status(500).json({ message: 'Failed to change password' });
        }
    };

    logout = async (req, res) => {
        try {
            if (req.token) {
                await Session.findOneAndDelete({ token: req.token });
            }
            res.json({ success: true, message: 'Logged out successfully' });
        } catch (err) {
            console.error('Logout error:', err);
            res.status(500).json({ message: 'Logout error' });
        }
    };
}

module.exports = new AuthController();
