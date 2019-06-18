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
                res.status(409).send(new ApiError('Username already exists', 409)).end();
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
                        res.status(400).send(new ApiError('Error occurred: ' + err, 400)).end();
                        return;
                    });
            }
        })
        .catch(err => {
            res.status(400).send(new ApiError('Error occured: ' + err, 400)).end();
        })

    },

    getUserByUUID(request, response, next){
        console.log('GetUserByUUID called')

        User.findOne({
            UUID: request.body.UUID
        })
        .then((user)=>{
            response.status(200).json(user).end()
        })
        .catch(error => next(new ApiError(error,500)))
    },

    getUser(request,response,next){
        User.find()
            .then((user)=>{
                console.log(user)
                response.status(200).json(user).end()
            })
    },

    test(request, response, next) {

        try {
            // Request uniform assertions
            const body = request.body;
            assert(typeof(request.body) === 'object', 'Request body must be of type object');
            assert(typeof(request.body.payload) === 'object', 'Payload must be of type object');
            assert(body.hash, 'Hash is missing from body');
            assert(typeof(body.hash) === 'string', 'Hash property must be of type string');

            // Request specific assertions
            const payload = request.body.payload;
            assert(payload.prime, 'Prime is missing from body');
            assert(payload.generator, 'Generator is missing from body');
            assert(payload.key, 'Key is missing from body');

            assert(typeof(payload.prime) === 'string', 'Prime property must be of type string');
            assert(typeof(payload.generator) === 'string', 'Generator property must be of type string');
            assert(typeof(payload.key) === 'string', 'Key property must be of type string');
        } catch(error) {
            next(new ApiError(error.message, 412));
        }
        console.log('Session ID: ' + request.session.id);
        console.log('Session Secret: ' + request.session.secret);

        const prime = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.prime, 'base64'));
        const generator = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.generator, 'base64'));
        const key = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.key, 'base64'));

        const serverDiffieHellman = crypto.createDiffieHellman(prime, generator);
        const serverKey = serverDiffieHellman.generateKeys();
        const secret = serverDiffieHellman.computeSecret(key);

        response.status(200).json({
            key: serverKey.toString('base64'),
            secret: secret.toString('base64')
        }).end();

    }
};
