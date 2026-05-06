const express = require('express');
const router = express.Router();
const adminPromotionController = require('../controllers/adminPromotionController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadBanner } = require('../middleware/uploadMiddleware');

router.use(authenticate, requireAdmin);

router.get('/requests', adminPromotionController.getAllRequests);
router.put('/requests/:id/verify', adminPromotionController.verifyRequest);
router.delete('/requests/:id', adminPromotionController.deleteRequest);
router.post('/create-banner', uploadBanner.single('imageFile'), adminPromotionController.createBannerFromRequest);

module.exports = router;
