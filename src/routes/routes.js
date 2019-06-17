const express = require('express');
const ApiError = require('../models/ApiError');
const routes = express.Router();

//Route paths
let auth_routes = require('./auth_routes');
let user_routes = require('./user_routes');
let chat_routes = require('./chat_routes');
let stream_routes = require('./stream_routes');

routes.get('/', function (req, res) {
    res.send('Start (end)point')
});

routes.use('/',auth_routes);
routes.use('/',user_routes);
routes.use('/',chat_routes);
routes.use('/',stream_routes);

//Catch 404's 
// Postprocessing; catch all non-existing endpoint requests
routes.use('*', function (req, res, next) {
    const error = new ApiError('Non-existing endpoint', 404);
    next(error);
});


module.exports = routes;