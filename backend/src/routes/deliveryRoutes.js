const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

router.post('/check', deliveryController.checkDelivery);

module.exports = router;
