const auth = require('../authentication/authentication');
const ApiError = require('../models/ApiError');
const User = require('../models/user');
const config = require('../authentication/config');
const crypto = require('crypto');

const privateKey = config.privateKey;

module.exports = {

    createNewUser(req, res) {
        console.log('CreateNewUser called ');

        var sha256 = function(password){
            var hash = crypto.createHash('sha256');
            hash.update(password);
            var value = hash.digest('hex');
            return {
                passwordHash:value
            };
        };

        function hashPassword(userpassword) {
            const passwordData = sha256(userpassword).passwordHash;
            passwordData.toString();
            return passwordData;
        }

        User.findOne({
            username: req.body.username
        })
        .then(result => {
            if (result) {
                res.status(409).send(new ApiError('Username already exists', 409)).end();
            } else {
                const username = req.body.username;
                const password = hashPassword(req.body.password); 
                const firstname = req.body.firstname;
                const lastname = req.body.lastname;
                const newUser = new User({
                    username: username,
                    password: password,
                    firstname: firstname,
                    lastname: lastname
                });
                newUser.save()
                    .then(result => {
                        res.status(200).json(auth.buildResponse({
                            message: "Created user: " + result
                        })).end();
                        return;
                    })
                    .catch(err => {
                        res.status(400).send(new ApiError('Error occurred: ' + err, 400)).end();
                        return;
                    });
            }
        })
        .catch(err => {
            res.status(400).send(new ApiError('Error occured: ' + err, 400)).end();
        })

    },

    getUserByUUID(req, res, next) {
        console.log('GetUserByUUID called');

        User.findOne({
            uuid: req.body.uuid
        })
            .then((user) => {
                res.status(200).json(auth.buildResponse(user)).end()
            })
            .catch(error => next(new ApiError(error, 500)))
    },

    getUser(req, res) {
        var queryParam = req.query.username;

        //No queryParam = find all
        if (!queryParam) {
            User.find({})
                .then(rslt => {
                    res.status(200).json(auth.buildResponse(rslt)).end();
                    return;
                })
                .catch(err => {
                    res.status(500).json(new ApiError(err, 500)).end();
                    return;
                })
        } else {
            //Query param is find specific
            User.findOne({ username: queryParam })
                .then((user) => {
                    res.status(200).json(auth.buildResponse(user)).end();
                    return;
                })
                .catch(err => {
                    res.status(500).json(new ApiError(err, 500)).end()
                });
        }
    },

    removeUUID(req,res, next){
        let uuid = req.body.payload.uuid;

        User.findOneAndUpdate({uuid:uuid}, {uuid: ''})
        .then(() => {
            res.status(200).json(auth.buildResponse({message:'UUID removed from user'})).end();
        })
        .catch(err=>{
            next(new ApiError('Something went wrong: '+err, 500));
        })
    }
};
