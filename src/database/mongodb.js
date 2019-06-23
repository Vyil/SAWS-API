const mongoose = require('mongoose');
const chalk = require('chalk');
mongoose.Promise = global.Promise;


//mongoose.connect('mongodb://localhost/sawsDB');
mongoose.connect('mongodb+srv://sawsboss:saws@saws-ynno3.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true
});
let connection = mongoose.connection
    .once('open',()=>{
        console.log(chalk.green('[MONGO] Database connected successfully'))})
    .on('error',(error)=>{
        console.log('test');
            console.log(chalk.red('[MONGO] Database error: ' + error));
    });

module.exports = connection;
