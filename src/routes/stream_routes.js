const express = require('express')
const router = express.Router()

const streamController = require('../controllers/streamController');

router.get('/streamers', streamController.getStreams);
router.get('/viewers', streamController.getViewerCount);
router.get('/stream/live',streamController.getLiveStreams);
router.get('/stream/live/:username', streamController.getUserLive);
router.post('/stream',streamController.setupInitialStream);
router.put('/stream',streamController.closeStream);


module.exports = router;
