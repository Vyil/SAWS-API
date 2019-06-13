const auth = require('../authentication/authentication');
const apiError = require('../models/apiError');
const User = require('../models/user');

const crypto = require('crypto');
const filestream = require('fs');

//const publicKey = filestream.readFileSync(__dirname + '../../cert/public.key');
const privateKey = filestream.readFileSync(__dirname + '../../cert/private.key');

module.exports = {

    createNewUser(req,res){
        console.log('CreateNewUser called ');

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
                        res.status(400).send(new apiError(400, 'Error occurred: ' + err)).end();
                        return;
                    });
            }
        })
        .catch(err => {
            res.status(409).send(new apiError(409, 'Username already exists: ' + err)).end();
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
            next(new apiError(412, error.message));
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
        /*
                const clientDH = crypto.createDiffieHellman(256);
                const clientDHKey = crypto.publicEncrypt(publicKey, Buffer.from(clientDH.generateKeys(), 'utf8')).toString('base64');
                const clientDHPrime = crypto.publicEncrypt(publicKey, Buffer.from(clientDH.getPrime(), 'utf8')).toString('base64');
                const clientDHGenerator = crypto.publicEncrypt(publicKey, Buffer.from(clientDH.getGenerator(), 'utf8')).toString('base64');

                console.log('Prime: ' + clientDH.getPrime().toString('base64'));
                console.log('E-Prime: ' + clientDHPrime);
                console.log('Generator: ' + clientDH.getGenerator().toString('base64'));
                console.log('E-Generator: ' + clientDHGenerator);
                console.log('Key: ' + clientDH.generateKeys().toString('base64'));
                console.log('E-Key: ' + clientDHKey);
                console.log('----');

                const prime = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.prime, 'base64'));
                const generator = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.generator, 'base64'));
                const key = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.key, 'base64'));

                console.log('Prime: ' + prime.toString('base64'));
                console.log('Generator: ' + generator.toString('base64'));
                console.log('Key: ' + key.toString('base64'));
                console.log('----');

                const serverDiffieHellman = crypto.createDiffieHellman(prime, generator);
                const serverKey = serverDiffieHellman.generateKeys();
                const secret = serverDiffieHellman.computeSecret(key);
                console.log('Calculated Secret: ' + secret);
                //request.session.secret = secret.toString('hex');


                // Generate Alice's keys...
                const alice = crypto.createDiffieHellman(256);
                const aliceKey = alice.generateKeys();

        // Generate Bob's keys...
                const Aprime = crypto.publicEncrypt(publicKey, Buffer.from(alice.getPrime(), 'utf8')).toString('base64');
                const Agenerator = crypto.publicEncrypt(publicKey, Buffer.from(alice.getGenerator(), 'utf8')).toString('base64');
                const Akey = crypto.publicEncrypt(publicKey, Buffer.from(aliceKey, 'utf8')).toString('base64');

                const prime = crypto.privateDecrypt(privateKey, Buffer.from(Aprime, 'base64'));
                const generator = crypto.privateDecrypt(privateKey, Buffer.from(Agenerator, 'base64'));
                const key = crypto.privateDecrypt(privateKey, Buffer.from(Akey, 'base64'));

                const bob = crypto.createDiffieHellman(prime, generator);
                const bobKey = bob.generateKeys();

        // Exchange and generate the secret...
                const aliceSecret = alice.computeSecret(bobKey);
                const bobSecret = bob.computeSecret(aliceKey);

                console.log(aliceSecret.toString('hex'));
                console.log(bobSecret.toString('hex'));*/

    }
};
