// Importing required modules
const express = require('express');
const ApiError = require('../models/ApiError');
const routes = express.Router();

// Importing Route paths
let auth_routes = require('./auth_routes');
let user_routes = require('./user_routes');

// Importing specific controller methods
const AuthController = require('../controllers/authController');

routes.get('/', function (req, res) {
    res.send('Start (end)point')
});

// Define authentication routes
routes.use('/',auth_routes);
// Force passage through verification routes
routes.all('*', AuthController.verifySecret);
routes.all('*', AuthController.verifyToken);
// Define user routes
routes.use('/',user_routes);

//Catch 404's 
// Postprocessing; catch all non-existing endpoint requests
routes.use('*', function (req, res, next) {
    const error = new ApiError('Non-existing endpoint', 404);
    next(error);
});

module.exports = routes;