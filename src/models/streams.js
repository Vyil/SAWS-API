const mongoose = require('../database/mongodb')

const streamSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        minlength: 1
    },
    length:{
        type: Date,
        required:false,
        minlength: 1
    },
    viewers: {
        type: Number,
        required: false,
        minlength: 1
    },
    live: {
        type: Boolean,
        required: false,
    },
    uuid: {
        type: String,
        required: true,
    },
    username:{
        type: String
    }
});

const Streams = mongoose.model('Streams', streamSchema);

module.exports = Streams;