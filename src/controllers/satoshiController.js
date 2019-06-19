const auth = require('../authentication/authentication');
const satoshi = require('../satoshi/satoshi')
const ApiError = require('../models/ApiError');
const User = require('../models/user');
const assert = require('assert');

module.exports = {
    startSatoshi(user){
        console.log('count has started.')

        User.findOne({username: user})
        .then(result => {
            if (result){
                satoshi.start();
            }else {
                console.log('No user found')
            }
        })
    },

    stopSatoshi(user){
        try {
            
        User.findOne({username: user})
        .then(result => {
            if (result){
                const newSatoshiAmount = result.satoshiAmount + satoshi.getAmount;
                //User.updateOne({satoshiAmount: satoshiAmount}, {satoshiAmount: newSatoshiAmount})
                result.satoshiAmount = newSatoshiAmount;
                result.save()
                    .then(() => 
                    console.log('Satoshi updated')
                    .catch((error) => next(new ApiError(error.toString(), 500))));
                    satoshi.stop();
            }else {
                console.log('No User found')
            }
        })
        }
        catch(error){
            console.log('Error: '+error)
        }

    }
}