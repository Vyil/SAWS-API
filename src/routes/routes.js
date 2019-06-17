const express = require('express');
const ApiError = require('../models/ApiError');
const router = express.Router();

//Route paths
let auth_routes = require('./auth_routes');
let user_routes = require('./user_routes');
let chat_routes = require('./chat_routes');
let stream_routes = require('./stream_routes');

router.get('/', function (req, res) {
    res.send('Start (end)point')
});

router.use('/',auth_routes);
router.use('/',user_routes);
router.use('/',chat_routes);
router.use('/',stream_routes);

//Catch 404's 
// Postprocessing; catch all non-existing endpoint requests
router.use('*', function (req, res, next) {
    const error = new ApiError('Non-existing endpoint', 404);
    next(error);
});


module.exports = router;