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
        minlength: 1,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Users",
        required: true,
    }
});

const Streams = mongoose.model('Streams', streamSchema);

module.exports = Streams;