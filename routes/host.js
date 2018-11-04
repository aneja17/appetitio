const express = require('express');
const router = express.Router();
const hostController = require('../controllers/hostController');

router.post('/dish', hostController.saveDish);

router.post('/host', hostController.hostDishes);

module.exports = router;