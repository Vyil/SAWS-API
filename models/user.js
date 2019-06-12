const mongoose = require('../database/mongodb');
const Schema = mongoose.Schema;
const image = require('../img/Icon')

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
        tpye: String,
        required: [true, 'Firstname is required']
    },
    lastname: {
        type: String,
        required: [true, 'Lastname is required']
    },
    iconurl: {
        type: String,
        required: [true, 'Icon is required'],
        default: image
    }
})

const User = mongoose.model('user',UserSchema);
module.exports = User;