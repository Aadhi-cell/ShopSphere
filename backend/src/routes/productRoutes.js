const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { uploadReviewPhotos } = require('../middleware/uploadMiddleware');

router.get('/', async (req, res, next) => {
    try {
        await productController.getProducts(req, res, next);
    } catch (err) {
        console.error('Product Route Error [getProducts]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        await productController.getProductById(req, res, next);
    } catch (err) {
        console.error('Product Route Error [getProductById]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/:id/reviews', async (req, res, next) => {
    try {
        await productController.getReviews(req, res, next);
    } catch (err) {
        console.error('Product Route Error [getReviews]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.post('/:id/reviews', authenticate, uploadReviewPhotos.array('images', 3), async (req, res, next) => {
    try {
        await productController.postReview(req, res, next);
    } catch (err) {
        console.error('Product Route Error [postReview]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});


module.exports = router;
