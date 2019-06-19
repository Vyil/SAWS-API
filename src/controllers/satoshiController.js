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

    stopSatoshi(req, res,next){
        try {
            
        User.findOne({username: req.body.username})
        .then(result => {
            if (result){
                const newSatoshiAmount = result.satoshiAmount + satoshi.getAmount;
                //User.updateOne({satoshiAmount: satoshiAmount}, {satoshiAmount: newSatoshiAmount})
                result.satoshiAmount = newSatoshiAmount;
                result.save()
                    .then(() => 
                    res.status(200).json('satoshi amount updated').end())
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