const mongoose = require('../database/mongodb')
const Schema = mongoose.Schema

const chatSchema = new Schema({
    content: {
        type: String,
        required: true,
        minlength: 1
    },
    date: {
        type: Date,
        default: Date.now
    },
    stream: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Streams',
        required: true,
    },
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required: true,
    }

})
const Chat = mongoose.model('Message',chatSchema);
module.exports = Chat; 