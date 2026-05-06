const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticate } = require('../middleware/auth');

// Public endpoints — anyone (logged in or not) can submit a ticket or message

// Submit a ticket (optional auth — if logged in, user_id is stored)
router.post('/tickets', async (req, res) => {
    // Try to authenticate if token present, but don't require it
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        try {
            const jwt = require('jsonwebtoken');
            const User = require('../models/User');
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (user) req.user = user;
        } catch (_) { }
    }
    try {
        await supportController.createTicket(req, res);
    } catch (err) {
        res.status(500).json({ message: 'Failed to submit ticket' });
    }
});

// Send a message to admin (handles both user and seller tokens)
router.post('/messages', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
            if (decoded.sellerId) {
                // Seller token
                const Seller = require('../models/Seller');
                const seller = await Seller.findById(decoded.sellerId);
                if (seller) req.seller = seller;
            } else if (decoded.userId) {
                // User token
                const User = require('../models/User');
                const user = await User.findById(decoded.userId);
                if (user) req.user = user;
            }
        } catch (_) { }
    }
    try {
        await supportController.sendMessage(req, res);
    } catch (err) {
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// Get MY tickets by email or ticketId — public, no auth needed
router.get('/tickets/my', async (req, res) => {
    try {
        await supportController.getMyTickets(req, res);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch your tickets' });
    }
});

// Get MY messages (seller fetches messages they sent, using seller token)
router.get('/messages/my', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        if (decoded.sellerId) {
            const Message = require('../models/Message');
            const messages = await Message.find({ seller_id: decoded.sellerId }).sort({ createdAt: -1 });
            return res.json(messages);
        }
        return res.status(403).json({ message: 'Not a seller token' });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
