const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const utility = require('../services/utilityService');

router.post('/login', authController.login);

router.post('/changepassword', utility.splitHeader, authController.changePassword);

router.post('/logout', utility.splitHeader, authController.logout);

module.exports = router;