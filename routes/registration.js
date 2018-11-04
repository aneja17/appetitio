const express = require('express');
const router = express.Router();
const regUserController = require('../controllers/RegUserController');

router.post('/register', regUserController.register);

router.get('/emailverfication', regUserController.emailVerify);

router.post('/otpverfication', regUserController.otpVerify);

router.post('/emailauthentication', regUserController.emailAuth);

router.post('/otpauthentication', regUserController.otpAuth);

module.exports = router;