const mongoose = require('../database/mongodb');
const Schema = mongoose.Schema;

const UserSchema = new Schema ({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true

    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    firstname: {
        type: String,
        required: [true, 'Firstname is required']
    },
    lastname: {
        type: String,
        required: [true, 'Lastname is required']
    },
    uuid: {
        type: String
    },
    iconurl: {
        type: String,
        required: [true, 'Icon is required'],
        default: 'https://cdn1.iconfinder.com/data/icons/ninja-things-1/1772/ninja-simple-512.png'
    },
    satoshiAmount: {
        type: Number,
    }
})

const User = mongoose.model('user',UserSchema);
module.exports = User;