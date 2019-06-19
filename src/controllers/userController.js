const auth = require('../authentication/authentication');
const ApiError = require('../models/ApiError');
const User = require('../models/user');
const config = require('../authentication/config');

const privateKey = config.privateKey;

module.exports = {

    createNewUser(req, res) {
        console.log('CreateNewUser called ');
        //Create user with hashed password isntead.
        User.findOne({
            username: req.body.username
        })
            .then(result => {
                if (result) {
                    res.status(409).send(new ApiError('Username already exists', 409)).end();
                } else {
                    const newUser = new User(req.body, {});
                    newUser.save()
                        .then(result => {
                            res.status(200).json({
                                message: "Created user: " + result
                            }).end();
                            return;
                        })
                        .catch(err => {
                            res.status(400).send(new ApiError('Error occurred: ' + err, 400)).end();
                            return;
                        });
                }
            })
            .catch(err => {
                res.status(409).send(new ApiError('Username already exists: ' + err, 409)).end();
            })

    },

    getUserByUUID(req, res, next) {
        console.log('GetUserByUUID called')

        User.findOne({
            uuid: req.body.uuid
        })
            .then((user) => {
                res.status(200).json(user).end()
            })
            .catch(error => next(new ApiError(error, 500)))
    },

    getUser(req, res) {
        var queryParam = req.query.username;

        //No queryParam = find all
        if (!queryParam) {
            User.find({})
                .then(rslt => {
                    res.status(200).json(rslt).end()
                    return;
                })
                .catch(err => {
                    res.status(500).json(new ApiError(err, 500)).end()
                    return;
                })
        } else {
            //Query param is find specific
            User.findOne({ username: queryParam })
                .then((user) => {
                    res.status(200).json(user).end()
                    return;
                })
                .catch(err => {
                    res.status(500).json(new ApiError(err, 500)).end()
                });
        }
    }
};
