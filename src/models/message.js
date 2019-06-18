const mongoose = require('../database/mongodb')
const Schema = mongoose.Schema

const messageSchema = new Schema({
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
        type:  Schema.Types.ObjectId,
        ref: 'Streams',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref:'Users',
        required: true,
    }

})
const Message = mongoose.model('Message',messageSchema);
module.exports = Message; 