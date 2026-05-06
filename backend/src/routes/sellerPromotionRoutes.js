const express = require('express');
const router = express.Router();
const sellerPromotionController = require('../controllers/sellerPromotionController');
const { authenticateSeller } = require('../middleware/auth');
const { uploadBanner } = require('../middleware/uploadMiddleware');

router.post('/request', authenticateSeller, uploadBanner.single('image'), sellerPromotionController.createPromotionRequest);
router.get('/requests', authenticateSeller, sellerPromotionController.getSellerRequests);
router.post('/checkout-session/:id', authenticateSeller, sellerPromotionController.createPromotionSession);
router.post('/verify-payment', authenticateSeller, sellerPromotionController.confirmPromotionPayment);
// Legacy mock payment route removed (Stripe is now the standard)
// router.post('/pay/:id', authenticateSeller, sellerPromotionController.payForRequest);

module.exports = router;
