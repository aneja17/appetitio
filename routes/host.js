const express = require('express');
const router = express.Router();
const hostController = require('../controllers/hostController');
const utility = require('../services/utilityService');

router.post('/dish', utility.splitHeader, hostController.saveDish);

router.post('/host', utility.splitHeader, hostController.hostDishes);

module.exports = router;