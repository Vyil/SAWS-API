const auth = require('../authentication/authentication');
const apiError = require('../models/apiError');
const User = require('../models/user');
const crypto = require('crypto')

module.exports = {

    getUser(req,res,next){
        console.log('GetUser called')

        User.find({})
            .then((user) => {
                console.log(res)
                res.status(200).json(user).end()
            })
            .catch(error => next(new ApiError(error, 500)))
    },

    createNewUser(req,res){
        console.log('CreateNewUser called ')

        var sha256 = function(password){
            var hash = crypto.createHash('sha256');
            hash.update(password);
            var value = hash.digest('hex');
            return {
                passwordHash:value
            };
        };

        function saltHashPassword(userpassword) {
            const passwordData = sha256(userpassword).passwordHash;
            passwordData.toString();
            return passwordData;
            
        }

        User.findOne({
            username: req.body.username
        })
        .then(result => {
            if (result) {
                res.status(409).send(new apiError(409, 'Username already exists')).end();
            } else {
                const username = req.body.username;
                const password = saltHashPassword(req.body.password); 
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
                        res.status(200).json({
                            message: "Created user: " + result
                        }).end();
                        return;
                    })
                    .catch(err => {
                        res.status(400).send(new apiError(400, 'Error occured: ' + err)).end();
                        return;
                    });
            }
        })
        .catch(err => {
            res.status(409).send(new apiError(409, 'Error occured: ' + err)).end();
        })

    }
}