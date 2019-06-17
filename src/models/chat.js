const mongoose = require('../database/mongodb')
const Schema = mongoose.Schema

const chatSchema = new Schema({
    fristname: {
        type: String,
        required: [true, 'firstname is needed']
    },
    message: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    }

})
const Chat = mongoose.model('Message',chatSchema);
module.exports = Chat; 