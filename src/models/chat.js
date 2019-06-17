const mongoose = require('../database/mongodb')
const Schema = mongoose.Schema

const chatSchema = new Schema({
    Content: {
        type: String,
        required: true,
        minlength: 1
    },
    Date: {
        type: Date,
        default: Date.now
    },
    Stream: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Streams',
        required: true,
    },
    User: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required: true,
    }

})
const Chat = mongoose.model('Message',chatSchema);
module.exports = Chat; 