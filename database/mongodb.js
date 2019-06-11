const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


//mongoose.connect('mongodb://localhost/sawsDB');
mongoose.connect('mongodb+srv://sawsboss:saws@saws-ynno3.mongodb.net/test?retryWrites=true&w=majority');
mongoose.connection
    .once('open',()=>{
        console.log('open')})
    .on('error',(error)=>{
        console.warn('Warning: ',error);
    });

module.exports = mongoose;