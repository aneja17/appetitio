const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const utility = require('../services/utilityService');

router.post('/checkPromo', utility.splitHeader, customerController.checkPromo);

router.post('/book', utility.splitHeader, customerController.bookMeal);

router.post('/booking/payment', utility.splitHeader, customerController.bookingPayment);

router.post('/booking/checkin', utility.splitHeader, customerController.bookingCheckin);

router.post('/booking/cancel', utility.splitHeader, customerController.cancelBooking);

router.post('/dish/ratings', utility.splitHeader, customerController.rateDish);

module.exports = router;