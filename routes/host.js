const express = require('express');
const router = express.Router();
const hostController = require('../controllers/hostController');
const utility = require('../services/utilityService');

router.post('/dish', utility.splitHeader, hostController.dishSave);

router.post('/host', utility.splitHeader, hostController.eventHosting);

router.post('/host/cancel', utility.splitHeader, hostController.mealCancellation);

module.exports = router;