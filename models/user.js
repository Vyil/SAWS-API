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
})

const User = mongoose.model('user',UserSchema);
module.exports = User;