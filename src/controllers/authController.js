const auth = require('../authentication/authentication');
const ApiError = require('../models/ApiError');
const User = require('../models/user');

module.exports = {
    //Authentication controller only login authentication

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
    },

    loginUUID(req,res, next){
        console.log('Login called');

        let username = req.body.username;
        let password = req.body.password;
        let UUID = req.body.UUID;

        if (!username || !password || !UUID) {
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
                result.set('UUID', UUID)
                result.save()
                    .then(result => res.status(200).json(result).end())
                    .catch(error => next(new ApiError(error,500)))
            }else {
                res.status(401).json({message:'Rejected'}).end();
            }
        })
        .catch(err=>{
            res.status(500).send(new ApiError('Error occurred: '+err, 500)).end();
        })
    }
}