const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { authenticateSeller } = require('../middleware/auth');
const { uploadProduct, uploadSellerDoc } = require('../middleware/uploadMiddleware');

module.exports = (io) => {
    router.post('/send-otp', async (req, res, next) => {
        try {
            await sellerController.sendOTP(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [sendOTP]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.post('/verify-otp', async (req, res, next) => {
        try {
            await sellerController.verifyOTP(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [verifyOTP]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.post('/register', uploadSellerDoc.single('idProof'), async (req, res, next) => {
        try {
            await sellerController.register(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [register]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.post('/login', async (req, res, next) => {
        try {
            await sellerController.login(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [login]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.get('/profile', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.getProfile(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [getProfile]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.put('/profile', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.updateProfile(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [updateProfile]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.post('/logout', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.logout(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [logout]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.get('/products', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.getProducts(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [getProducts]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.post('/products', authenticateSeller, uploadProduct.fields([{ name: 'image', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), async (req, res, next) => {
        try {
            await sellerController.addProduct(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [addProduct]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.put('/products/:id', authenticateSeller, uploadProduct.fields([{ name: 'image', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), async (req, res, next) => {
        try {
            await sellerController.updateProduct(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [updateProduct]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.patch('/products/:id/toggle-pause', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.togglePause(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [togglePause]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.get('/dashboard/stats', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.getDashboardStats(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [getDashboardStats]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.get('/orders', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.getOrders(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [getOrders]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.put('/orders/:id/tracking', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.updateTracking(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [updateTracking]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    // Status update needs io
    router.put('/orders/:id/status', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.updateOrderStatus(req, res, io);
        } catch (err) {
            console.error('Seller Route Error [updateOrderStatus]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.get('/notifications', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.getNotifications(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [getNotifications]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.put('/notifications/mark-read', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.markNotificationsRead(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [markNotificationsRead]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    // Onboarding Steps
    router.post('/onboarding/step-1', async (req, res, next) => {
        try {
            await sellerController.saveOnboardingStep1(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [saveOnboardingStep1]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.post('/onboarding/step-2', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.saveOnboardingStep2(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [saveOnboardingStep2]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.post('/onboarding/step-3', authenticateSeller, uploadSellerDoc.fields([{ name: 'aadhaar', maxCount: 1 }, { name: 'panCard', maxCount: 1 }]), async (req, res, next) => {
        try {
            await sellerController.saveOnboardingStep3(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [saveOnboardingStep3]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.post('/onboarding/step-4', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.saveOnboardingStep4(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [saveOnboardingStep4]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    router.get('/onboarding/status', authenticateSeller, async (req, res, next) => {
        try {
            await sellerController.getOnboardingStatus(req, res, next);
        } catch (err) {
            console.error('Seller Route Error [getOnboardingStatus]:', err);
            res.status(500).json({ success: false, message: 'Route Error' });
        }
    });

    return router;
};

