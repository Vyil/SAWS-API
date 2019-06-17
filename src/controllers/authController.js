const auth = require('./authentication');
const ApiError = require('../models/ApiError');
const User = require('../models/user');
const chalk = require('chalk');
const Certificate = require('../models/certificate');

// Importing used packages
const forge = require('node-forge');
const pki = forge.pki;
const filestream = require('fs');

// Import relevant keys
const publicKeyPem = filestream.readFileSync(__dirname + '/cert/public.key');
const privateKeyPem = filestream.readFileSync(__dirname + '/cert/private.key');

module.exports = {
    //Authentication controller only login authentication

    login(req,res){
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
                result.set('UUID', UUID);
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
    },

    authenticateNewDevice(request, response, next) {

        //console.log("Username: " + crypto.publicEncrypt(publicKey, Buffer.from('aron', 'utf8')).toString('base64'));
        //console.log("Password: " + crypto.publicEncrypt(publicKey, Buffer.from('c96b8d3274dcd24eceb36699d094fecbb2416c7770082e0707c7b76b29da2548', 'utf8')).toString('base64'));
        //console.log("Uuid: " + crypto.publicEncrypt(publicKey, Buffer.from('v743984nw748v9wfhw784w', 'utf8')).toString('base64'));
        //console.log("Passphrase: " + crypto.publicEncrypt(publicKey, Buffer.from('v983v4b73894478', 'utf8')).toString('base64'));

        try {
            let username, password, uuid, key, iv, hash;
            let privateKey = pki.privateKeyFromPem(privateKeyPem);
            try {
                username = privateKey.decrypt(forge.util.decode64(request.body.payload.username));
                password = privateKey.decrypt(forge.util.decode64(request.body.payload.password));
                uuid = privateKey.decrypt(forge.util.decode64(request.body.payload.uuid));

                key = privateKey.decrypt(forge.util.decode64(request.body.payload.key));
                iv = privateKey.decrypt(forge.util.decode64(request.body.payload.iv));

                //username = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.username, 'base64'));
                //password = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.password, 'base64'));
                //uuid = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.uuid, 'base64'));
                //key = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.key, 'base64'));
                //iv = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.iv, 'base64'));
            } catch (decrypterror) {
                console.log(decrypterror);
                // TODO - decrypt error
            }

            User.findOne({
                username: username,
                password: password
            })
                .then(result => {
                    // TODO - Check username/password combo in database
                    //console.log(result);
                    //response.status(200).json({}).end();

                    let keypair = pki.rsa.generateKeyPair(2048);
                    let certificate = pki.createCertificate();

                    certificate.publicKey = keypair.publicKey;
                    certificate.validity.notBefore = new Date();
                    certificate.validity.notAfter = new Date();
                    certificate.validity.notAfter.setFullYear(certificate.validity.notBefore.getFullYear() + 1);

                    let attributes = [{
                        name: 'commonName',
                        value: username
                    }, {
                        name: 'countryName',
                        value: 'NL'
                    }, {
                        shortName: 'ST',
                        value: 'Noord-Brabant'
                    }, {
                        name: 'localityName',
                        value: 'The Netherlands'
                    }, {
                        name: 'organizationName',
                        value: 'Avans'
                    }, {
                        shortName: 'OU',
                        value: username
                    }];

                    certificate.setSubject(attributes);
                    certificate.setIssuer(attributes);
                    certificate.sign(keypair.privateKey);

                    //let encrypted = auth.encryptAES('test', key, iv);
                    //console.log(auth.decryptAES(encrypted, key, iv));
                    let pemCertificate = pki.certificateToPem(certificate);
                    //console.log(pemCertificate);
                    //console.log(pki.publicKeyToPem(keypair.publicKey));

                    let newCertificate = new Certificate({
                        username: username,
                        certificate: pemCertificate,
                        publicKey: pki.publicKeyToPem(keypair.publicKey),
                        privateKey: pki.privateKeyToPem(keypair.privateKey)
                    });

                    newCertificate.save()
                        .then(result => {
                            response.status(200).json({
                                certificate: auth.encryptAES(pemCertificate, key, iv),
                                publicKey: auth.encryptAES(pki.publicKeyToPem(keypair.publicKey), key, iv),
                                privateKey: auth.encryptAES(pki.privateKeyToPem(keypair.privateKey), key, iv)
                            });
                        })
                        .catch(error => {
                            next(new ApiError(error, 500));
                    })
                })
                .catch(err => {
                    next(new ApiError(err, 500));
                });
        } catch (error) {
            next(new ApiError(error, 500));
        }
    },

    loginDevice(request, response, next) {
        let username, certificate, signature;

        username = request.body.payload.username;
        certificate = request.body.payload.certificate;
        signature = request.body.signature;

        Certificate.findOne({
            username: username,
            certificate: certificate
        })
            .then(result => {
                if(result !== null) {
                    request.session.key = result.publicKey;
                    let verified = auth.verifyDigitalSignature(request.body.payload, signature, pki.publicKeyFromPem(result.publicKey));
                    if(verified) {
                        let token = auth.encodeToken(username);
                        response.status(200).json(auth.buildResponse({
                            token: token
                        })).end();
                    } else {
                        next(new ApiError('Invalid credentials provided', 412));
                    }
                } else {
                    next(new ApiError('Invalid credentials', 412))
                }
                /*let privateKey = pki.privateKeyFromPem(result.privateKey);

                let test = {
                    username: "aron"
                };
                let signature = auth.createDigitalSignature(test, privateKey);
                let encodedSignature = forge.util.encode64(signature);
                let decodedSignature = forge.util.decode64(encodedSignature);

                let verified = auth.verifyDigitalSignature(test, decodedSignature, publicKey);
                console.log(verified);*/

            })
            .catch(err => {
                console.log(err);
                next(new ApiError(err, 500));
            });
    },

    validateToken(request, response, next) {
        console.log(chalk.yellow('[TOKEN] Validation of JWT token requested'));
        const token = request.header('x-access-token') || '';

        auth.decodeToken(token, (error, payload) => {
            if(error) {
                next(new ApiError('Token validation failed', 401));
            } else {
                request.header.username = payload.sub;
                console.log(chalk.green('[TOKEN] Authentification OK for: ' + payload.sub));
                next();
            }
        })
    },

    verifySignature(request, response, next) {
        if(request.body.signature && request.session.key) {
            try {
                var verified = auth.verifyDigitalSignature(request.body.payload, request.body.signature, pki.publicKeyFromPem(request.session.key));
                if(verified) {
                    next();
                } else {
                    next(new ApiError('Signature verification failed', 451));
                }
            } catch (error) {
                next(new ApiError('Signature verification failed', 451));
            }
        } else {
            next(new ApiError('Signature verification failed', 451));
        }
    },

    aron(request, response, next) {
        response.status(200).json({}).end();
    }
};
