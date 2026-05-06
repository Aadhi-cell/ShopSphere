const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Session = require('../models/Session');
const SellerSession = require('../models/SellerSession');

class AuthMiddleware {
    authenticate = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization || '';
            if (!authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Authentication required' });
            }
            const token = authHeader.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            let user;
            if (decoded.role === 'admin') {
                user = await Admin.findById(decoded.userId);
            } else {
                user = await User.findById(decoded.userId);
            }

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Verify session in DB
            const session = await Session.findOne({ token, user_id: user._id });
            if (!session) {
                return res.status(401).json({ message: 'Session expired or invalidated' });
            }
            req.user = user;
            req.token = token;
            // Mark as admin if authenticated via Admin collection
            req.isAdmin = decoded.role === 'admin';
            next();
        } catch (err) {
            console.error('Auth Middleware Error [authenticate]:', err);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    };

    requireAdmin = (req, res, next) => {
        try {
            // Allow anyone who authenticated via the Admin collection
            // (req.isAdmin is set in authenticate() when decoded.role === 'admin')
            if (!req.user || !req.isAdmin) {
                return res.status(403).json({ message: 'Admin access required' });
            }
            next();
        } catch (err) {
            console.error('Auth Middleware Error [requireAdmin]:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    authenticateSeller = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization || '';
            if (!authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Seller authentication required' });
            }
            const token = authHeader.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const seller = await Seller.findById(decoded.sellerId);
            if (!seller) {
                return res.status(401).json({ message: 'Seller not found' });
            }

            // Verify seller session in DB
            const session = await SellerSession.findOne({ token, seller_id: seller._id });
            if (!session) {
                return res.status(401).json({ message: 'Seller session expired or invalidated' });
            }

            if (!seller.isActive) {
                return res.status(403).json({ message: 'Your seller account has been deactivated' });
            }

            req.seller = seller;
            req.sellerToken = token;
            next();
        } catch (err) {
            console.error('Auth Middleware Error [authenticateSeller]:', err);
            return res.status(401).json({ message: 'Invalid or expired seller token' });
        }
    };
}

module.exports = new AuthMiddleware();
