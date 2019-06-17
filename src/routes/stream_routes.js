const express = require('express');
const router = express.Router();

const streamController = require('../controllers/streamController')

router.get('/viewers', streamController.getViewerCount)

module.exports = router