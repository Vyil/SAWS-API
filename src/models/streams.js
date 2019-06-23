const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        minlength: 1,
        default:0
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
    },
    messages:[{
        type: Schema.Types.ObjectId,
        ref:'Message'
    }]
});

const Streams = mongoose.model('Streams', streamSchema);

module.exports = Streams;
