const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const cors = require('cors');
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use('/api',routes);



app.listen(PORT,()=>{
    console.log('Server running on: '+PORT)
});

module.exports = app;