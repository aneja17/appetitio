const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.post('/book', customerController.bookMeal);

router.post('/booking/payment', customerController.bookingPayment);

router.post('/checkin', customerController.bookingCheckin);

router.post('/booking/cancel', customerController.cancelBooking);

router.post('/dish/ratings', customerController.rateDish);

module.exports = router;