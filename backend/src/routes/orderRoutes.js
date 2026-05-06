const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { uploadReturnProof } = require('../middleware/uploadMiddleware');

module.exports = (io) => {
    router.post('/create-checkout-session', authenticate, async (req, res, next) => {
        try {
            await orderController.createCheckoutSession(req, res, next);
        } catch (err) {
            console.error('Order Route Error [createCheckoutSession]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.post('/confirm-session', authenticate, async (req, res, next) => {
        try {
            await orderController.confirmSession(req, res, next);
        } catch (err) {
            console.error('Order Route Error [confirmSession]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.get('/', authenticate, async (req, res, next) => {
        try {
            await orderController.getOrders(req, res, next);
        } catch (err) {
            console.error('Order Route Error [getOrders]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.get('/:id', authenticate, async (req, res, next) => {
        try {
            await orderController.getOrderById(req, res, next);
        } catch (err) {
            console.error('Order Route Error [getOrderById]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.post('/', authenticate, async (req, res, next) => {
        try {
            await orderController.createOrderDirect(req, res, next, io);
        } catch (err) {
            console.error('Order Route Error [createOrderDirect]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.patch('/:id/cancel', authenticate, async (req, res, next) => {
        try {
            await orderController.cancelOrder(req, res, next, io);
        } catch (err) {
            console.error('Order Route Error [cancelOrder]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.patch('/:id/return', authenticate, uploadReturnProof.array('proofImages', 3), async (req, res, next) => {
        try {
            await orderController.returnOrder(req, res, next);
        } catch (err) {
            console.error('Order Route Error [returnOrder]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    return router;
};
