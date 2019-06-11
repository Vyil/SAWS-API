const express = require('express');
const routes = express.Router();

//Route paths
let auth_routes = require('./auth_routes');
let user_routes = require('./user_routes');

routes.get('/', function (req, res) {
    res.send('Start (end)point')
});

routes.use('/',auth_routes);
routes.use('/',user_routes);

//Catch 404's 
routes.get('*', function (req, res) {
    res.status('404').json("Page not found").end()
})


module.exports = routes;