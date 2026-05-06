const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const supportController = require('../controllers/supportController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

// --- Admin Notifications --- //
router.get('/notifications', async (req, res, next) => {
    try {
        await adminController.getNotifications(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [getNotifications]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.put('/notifications/mark-read', async (req, res, next) => {
    try {
        await adminController.markNotificationsRead(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [markNotificationsRead]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/products', async (req, res, next) => {
    try {
        await adminController.getProducts(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [getProducts]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/pending-products', async (req, res, next) => {
    try {
        await adminController.getPendingProducts(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [getPendingProducts]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.put('/products/:id/status', async (req, res, next) => {
    try {
        await adminController.updateProductStatus(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [updateProductStatus]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.put('/products/:id/approve', async (req, res, next) => {
    try {
        await adminController.approveProduct(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [approveProduct]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.post('/products/:id/reject', async (req, res, next) => {
    try {
        await adminController.rejectProduct(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [rejectProduct]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/sellers', async (req, res, next) => {
    try {
        await adminController.getSellers(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [getSellers]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.put('/sellers/:id/approve', async (req, res, next) => {
    try {
        await adminController.updateSellerStatus(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [updateSellerStatus]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.patch('/products/:id/block', async (req, res, next) => {
    try {
        await adminController.blockProduct(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [blockProduct]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.patch('/products/:id/unblock', async (req, res, next) => {
    try {
        await adminController.unblockProduct(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [unblockProduct]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/orders', async (req, res, next) => {
    try {
        await adminController.getOrders(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [getOrders]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.put('/orders/:id/status', async (req, res, next) => {
    try {
        await adminController.updateOrderStatus(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [updateOrderStatus]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.put('/orders/:id/return', async (req, res, next) => {
    try {
        await adminController.handleOrderReturn(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [handleOrderReturn]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/users', async (req, res, next) => {
    try {
        await adminController.getUsers(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [getUsers]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.put('/users/:id/status', async (req, res, next) => {
    try {
        await adminController.updateUserStatus(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [updateUserStatus]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.put('/sellers/:id/active', async (req, res, next) => {
    try {
        await adminController.updateSellerActiveStatus(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [updateSellerActiveStatus]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/stats', async (req, res, next) => {
    try {
        await adminController.getStats(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [getStats]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/finance', async (req, res, next) => {
    try {
        await adminController.getFinanceData(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [getFinanceData]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/payouts', async (req, res, next) => {
    try {
        await adminController.getPayouts(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [getPayouts]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.post('/payouts/:id/approve', async (req, res, next) => {
    try {
        await adminController.approvePayout(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [approvePayout]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

// --- Admin Accounts Management --- //
router.get('/admins', async (req, res, next) => {
    try {
        await adminController.getAdmins(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [getAdmins]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.post('/admins', async (req, res, next) => {
    try {
        await adminController.createAdmin(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [createAdmin]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.delete('/admins/:id', async (req, res, next) => {
    try {
        await adminController.deleteAdmin(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [deleteAdmin]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

// --- System Settings --- //
router.get('/settings', async (req, res, next) => {
    try {
        await adminController.getSettings(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [getSettings]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.put('/settings', async (req, res, next) => {
    try {
        await adminController.updateSettings(req, res, next);
    } catch (err) {
        console.error('Admin Route Error [updateSettings]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});
// --- Support: Tickets --- //
router.get('/support/stats', async (req, res) => { try { await supportController.getSupportStats(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });
router.get('/support/tickets', async (req, res) => { try { await supportController.getTickets(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });
router.get('/support/tickets/:id', async (req, res) => { try { await supportController.getTicketById(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });
router.post('/support/tickets/:id/reply', async (req, res) => { try { await supportController.replyToTicket(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });
router.put('/support/tickets/:id/status', async (req, res) => { try { await supportController.updateTicketStatus(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });
router.post('/support/tickets/:id/internal-note', async (req, res) => { try { await supportController.addInternalNote(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });
router.post('/support/tickets/:id/resolve', async (req, res) => { try { await supportController.resolveTicket(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });
router.delete('/support/tickets/:id', async (req, res) => { try { await supportController.deleteTicket(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });

// --- Support: Messages --- //
router.get('/support/messages', async (req, res) => { try { await supportController.getMessages(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });
router.get('/support/messages/:id', async (req, res) => { try { await supportController.getMessageById(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });
router.post('/support/messages/:id/reply', async (req, res) => { try { await supportController.replyToMessage(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });
router.patch('/support/messages/:id/read', async (req, res) => { try { await supportController.markMessageRead(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });
router.delete('/support/messages/:id', async (req, res) => { try { await supportController.deleteMessage(req, res); } catch (err) { res.status(500).json({ message: 'Route Error' }); } });

module.exports = router;

