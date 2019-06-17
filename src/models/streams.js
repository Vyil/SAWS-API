const mongoose = require('../database/mongodb')

const streamSchema = new mongoose.Schema({
    Date: {
        type: Date,
        required: true,
        minlength: 1
    },
    Length:{
        type: Date,
        required:true,
        minlength: 1
    },
    Viewers: {
        type: Number,
        required: true,
        minlength: 1
    },
    Live: {
        type: Boolean,
        required: false,
        minlength: 1,
        default: false
    },
    Port: {
        type: Number,
        required: false,
        minLength: 1,
    },
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Users",
        required: true,
    }
});

const Streams = mongoose.model('Streams', streamSchema);

module.exports = Streams;