const express = require('express')
const routes = express.Router()

const streamController = require('../controllers/streamController')

router.get('/streamers', streamController.getStreams)

module.exports = router;