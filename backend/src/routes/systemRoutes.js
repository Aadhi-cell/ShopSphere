const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

router.get('/', async (req, res, next) => {
    try {
        await systemController.getRoot(req, res, next);
    } catch (err) {
        console.error('System Route Error [getRoot]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/health', async (req, res, next) => {
    try {
        await systemController.getHealth(req, res, next);
    } catch (err) {
        console.error('System Route Error [getHealth]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.get('/api/version', async (req, res, next) => {
    try {
        await systemController.getVersion(req, res, next);
    } catch (err) {
        console.error('System Route Error [getVersion]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

module.exports = router;
