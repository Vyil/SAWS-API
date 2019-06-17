const express = require('express')
const router = express.Router()

const streamController = require('../controllers/streamController')

router.get('/streamers', streamController.getStreams)
router.get('/viewers', streamController.getViewerCount)
router.get('/getlivestreams', getLiveStreams)

module.exports = router;
