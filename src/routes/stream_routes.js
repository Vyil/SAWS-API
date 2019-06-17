const express = require('express')
const router = express.Router()

const streamController = require('../controllers/streamController')

router.get('/streamers', streamController.getStreams)
router.get('/viewers', streamController.getViewerCount)
router.post('/stream',streamController.setupInitialStream)
router.get('/getlivestreams', getLiveStreams)

module.exports = router;
