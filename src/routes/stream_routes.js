<<<<<<< HEAD
const express = require('express');
const router = express.Router();

const streamController = require('../controllers/streamController')

router.get('/viewers', streamController.getViewerCount)

module.exports = router
=======
const express = require('express')
const routes = express.Router()

const streamController = require('../controllers/streamController')

router.get('/streamers', streamController.getStreams)

module.exports = router;
>>>>>>> develop
