const auth = require('../authentication/authentication');
const ApiError = require('../models/ApiError');
const User = require('../models/user');

const crypto = require('crypto');
const filestream = require('fs');

//const publicKey = filestream.readFileSync(__dirname + '../../cert/public.key');
const privateKey = filestream.readFileSync(__dirname + '/cert/private.key');

module.exports = {

    createNewUser(req,res){
        console.log('CreateNewUser called ');

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

    login(req,res){
        console.log('Login called');

        let username = req.body.username;
        let password = req.body.password;

        if (!username || !password) {
            res.status(412).json(new ApiError('Missing login parameters', 412)).end();
            return
        }

        User.findOne({username:username})
            .then(result=>{
                if(result.password === password){
                    let token = auth.encodeToken(result._id);
                    let resultObject = {
                        "token":token,
                        "message:":"Successful login for user: "+result.username
                    };
                    res.status(200).json(resultObject).end();
                }else {
                    res.status(401).json({message:'Rejected'}).end();
                }
            })
            .catch(err=>{
                res.status(500).send(new ApiError('Error occurred: '+err, 500)).end();
            })
    }
};
