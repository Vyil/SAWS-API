// Importing all modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const morgan = require('morgan');
const cors = require('cors');
const chalk = require('chalk');

// Importing routes
const routes = require('./routes/routes');

// Importing config
const { port } = require('./config/config');

// Instance session middleware
let app = express();
app.use(session({
    secret: "C06429E74D0E5ABDB5"
}));

// bodyParser parses the body from a request
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));

// parse application/vnd.api+json as json
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));
app.use(morgan('dev'));
app.use(cors());

app.use('/api',routes);

// Catch-all error handlers
app.use((err, req, res, next) => {
    //console.log(chalk.red(err));
    res.status((err.code || 404)).json(err).end();
});

app.listen(port, () => console.log(chalk.green('[SERVER] Server running on port ' + port)));

module.exports = app;