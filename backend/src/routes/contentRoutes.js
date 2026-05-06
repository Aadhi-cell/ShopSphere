const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public routes for frontend display
router.get('/banners/active', contentController.getActiveBanners);
router.post('/banners/track/:id', contentController.trackBanner);
router.get('/pages/:slug', contentController.getPageBySlug);
router.get('/announcements/active', contentController.getActiveAnnouncements);

// Admin-only management routes
router.use(authenticate, requireAdmin);

// Banners
router.get('/banners', contentController.getBanners);
const { uploadBanner } = require('../middleware/uploadMiddleware');
router.post('/banners', uploadBanner.single('imageFile'), contentController.createBanner);
router.put('/banners/:id', uploadBanner.single('imageFile'), contentController.updateBanner);
router.delete('/banners/:id', contentController.deleteBanner);

// Pages
router.get('/pages', contentController.getPages);
router.post('/pages', contentController.createPage);
router.put('/pages/:id', contentController.updatePage);
router.delete('/pages/:id', contentController.deletePage);

// Announcements
router.get('/announcements', contentController.getAnnouncements);
router.post('/announcements', contentController.createAnnouncement);
router.put('/announcements/:id', contentController.updateAnnouncement);
router.delete('/announcements/:id', contentController.deleteAnnouncement);

module.exports = router;
