const auth = require('../authentication/authentication');
const apiError = require('../models/apiError');
const User = require('../models/user');

module.exports = {

    createNewUser(req,res){
        console.log('CreateNewUser called')

        User.findOne({
            username: req.body.username
        })
        .then(result => {
            if (result) {
                res.status(409).send(new apiError(409, 'Username already exists')).end();
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
                        res.status(400).send(new apiError(400, 'Error occured: ' + err)).end();
                        return;
                    });
            }
        })
        .catch(err => {
            res.status(409).send(new apiError(409, 'Username already exists: ' + err)).end();
        })

    }
}