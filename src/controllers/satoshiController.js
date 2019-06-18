const auth = require('../authentication/authentication');
const satoshi = require('../satoshi/satoshi')
const ApiError = require('../models/ApiError');
const User = require('../models/user');
const assert = require('assert');

module.exports = {
    startSatoshi(req, res){
        console.log('count has started.')

        User.findOne({username: req.body.username})
        .then(result => {
            if (result){
                satoshi.start();
            }else {
                res.status().send(new ApiError('Username does not exisit', 409)).end();
            }
        })
    },

    stopSatoshi(req, res){
        try {
            const newSatoshiAmount = user.satoshiAmount + satoshi.getAmount;
        User.findOne({username: req.body.username})
        .then(result => {
            if (result){
                User.updateOne({satoshiAmount: satoshiAmount}, {satoshiAmount: newSatoshiAmount})
                    .then(() => res.status(200).json('satoshi amount updated').end())
                    .catch((error) => next(new ApiError(error.toString(), 500)));
                satoshi.stop();
            }else {
                res.status().send(new ApiError('Username does not exisit', 409)).end();
            }
        })
        }
        catch(error){
            next(new ApiError(error.message, 422))
        }

    }
}