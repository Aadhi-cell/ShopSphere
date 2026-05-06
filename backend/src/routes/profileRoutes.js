const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
    try {
        await profileController.getProfile(req, res, next);
    } catch (err) {
        console.error('Profile Route Error [getProfile]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

router.put('/', authenticate, async (req, res, next) => {
    try {
        await profileController.updateProfile(req, res, next);
    } catch (err) {
        console.error('Profile Route Error [updateProfile]:', err);
        res.status(500).json({ success: false, message: 'Route Error' });
    }
});

module.exports = router;
