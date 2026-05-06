const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', async (req, res, next) => {
    try {
        await authController.login(req, res, next);
    } catch (err) {
        console.error('Auth Route Error [login]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.post('/admin/login', async (req, res, next) => {
    try {
        await authController.adminLogin(req, res, next);
    } catch (err) {
        console.error('Auth Route Error [adminLogin]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.post('/register', async (req, res, next) => {
    try {
        await authController.register(req, res, next);
    } catch (err) {
        console.error('Auth Route Error [register]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/me', authenticate, async (req, res, next) => {
    try {
        await authController.getMe(req, res, next);
    } catch (err) {
        console.error('Auth Route Error [getMe]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.post('/refresh-token', authenticate, async (req, res, next) => {
    try {
        await authController.refreshToken(req, res, next);
    } catch (err) {
        console.error('Auth Route Error [refreshToken]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.post('/change-password', authenticate, async (req, res, next) => {
    try {
        await authController.changePassword(req, res, next);
    } catch (err) {
        console.error('Auth Route Error [changePassword]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.post('/logout', authenticate, async (req, res, next) => {
    try {
        await authController.logout(req, res, next);
    } catch (err) {
        console.error('Auth Route Error [logout]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

module.exports = router;
