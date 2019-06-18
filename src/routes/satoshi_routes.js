const express = require('express');
const router = express.Router();

const satoshiController = require('../controllers/satoshiController');

//public routes
router.get('/start', satoshiController.startSatoshi);
router.get('/stop', satoshiController.stopSatoshi);

module.exports = router;