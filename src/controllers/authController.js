// Importing used models
const auth = require('../authentication/authentication');
const ApiError = require('../models/ApiError');
const User = require('../models/user');
const Certificate = require('../models/certificate');
const config = require('../authentication/config');

// Importing used packages
const crypto = require('crypto');
const assert = require('assert');
const chalk = require('chalk');
const forge = require('node-forge');
const pki = forge.pki;

// Import relevant keys
const publicKeyPem = config.publicKey;
const privateKeyPem = config.privatePKCS8Key;
//const pkcs8KeyPem = config.privatePKCS8Key;

module.exports = {
    //Authentication controller only login authentication

    login(req,res){
        console.log('Login called');

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

        let username = req.body.username;
        let password = req.body.password;
        let hashedPass = hashPassword(password);

        if (!username || !password) {
            res.status(412).json(new ApiError('Missing login parameters', 412)).end();
            return
        }

        User.findOne({username:username})
        .then(result=>{
            if(result.password === hashedPass){
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

        let username = req.body.username;
        let password = req.body.password;
        let uuid = req.body.uuid;
        let hashedPass = hashPassword(password);

        if (!username || !password || !uuid) {
            res.status(412).json(new ApiError('Missing login parameters', 412)).end();
            return
        }

        User.findOne({username:username})
        .then(result=>{
            if(result.password === hashedPass){
                let token = auth.encodeToken(result._id);
                let resultObject = {
                    "token":token,
                    "message:":"Successful login for user: "+result.username
                };
                result.set('uuid', uuid);
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

        try {
            // Request uniform assertions
            const body = request.body;
            assert(typeof(request.body) === 'object', 'Request body must be of type object');
            assert(typeof(request.body.payload) === 'object', 'Payload must be of type object');
            assert(body.signature, 'Hash is missing from body');
            assert(typeof(body.signature) === 'string', 'Hash property must be of type string');

            // Request specific assertions
            const payload = request.body.payload;
            assert(payload.username, 'Username is missing from body');
            assert(payload.password, 'Password is missing from body');
            assert(payload.uuid, 'UUID is missing from body');
            assert(payload.key, 'Key is missing from body');
            assert(payload.iv, 'Iv is missing from body');

            assert(typeof(payload.username) === 'string', 'Username property must be of type string');
            assert(typeof(payload.password) === 'string', 'Password property must be of type string');
            assert(typeof(payload.uuid) === 'string', 'UUID property must be of type string');
            assert(typeof(payload.key) === 'string', 'Key property must be of type string');
            assert(typeof(payload.iv) === 'string', 'Iv property must be of type string');
        } catch(error) {
            next(new ApiError(error.message, 412));
            return;
        }

        //console.log("Username: " + crypto.publicEncrypt(publicKey, Buffer.from('aron', 'utf8')).toString('base64'));
        //console.log("Password: " + crypto.publicEncrypt(publicKey, Buffer.from('c96b8d3274dcd24eceb36699d094fecbb2416c7770082e0707c7b76b29da2548', 'utf8')).toString('base64'));
        //console.log("Uuid: " + crypto.publicEncrypt(publicKey, Buffer.from('v743984nw748v9wfhw784w', 'utf8')).toString('base64'));
        //console.log("Passphrase: " + crypto.publicEncrypt(publicKey, Buffer.from('v983v4b73894478', 'utf8')).toString('base64'));

        try {
            let username, password, uuid, key, iv, signature;
            let privateKey = pki.privateKeyFromPem(privateKeyPem);
            try {
                username = privateKey.decrypt(forge.util.decode64(request.body.payload.username));
                password = privateKey.decrypt(forge.util.decode64(request.body.payload.password));
                uuid = privateKey.decrypt(forge.util.decode64(request.body.payload.uuid));

                key = privateKey.decrypt(forge.util.decode64(request.body.payload.key));
                iv = privateKey.decrypt(forge.util.decode64(request.body.payload.iv));
                signature = request.body.signature;

            } catch (decrypterror) {
                next(new ApiError('Error during decryption of body elements', 500));
                return;
            }

            let requestPayload = {
                username: username,
                password: password,
                uuid: uuid,
                key: forge.util.encode64(key),
                iv: forge.util.encode64(iv)
            };
            let verified = auth.verifyHmac(requestPayload, signature, key);
            if(verified) {
                User.findOne({
                    username: username,
                    password: password
                })
                    .then(result => {
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

                        let rsaPrivateKey = pki.privateKeyToAsn1(keypair.privateKey);
                        let privateKeyInfo = pki.wrapRsaPrivateKey(rsaPrivateKey);
                        let newPrivateKeyPem = pki.privateKeyInfoToPem(privateKeyInfo);
                        let privateKey = pki.privateKeyFromPem(newPrivateKeyPem);
                        certificate.sign(privateKey);

                        let pemCertificate = pki.certificateToPem(certificate);
                        let publicKey = pki.publicKeyToPem(keypair.publicKey).toString().replace(/  |\r\n|\n|\r/gm, '');
                        pemCertificate = pemCertificate.toString().replace(/  |\r\n|\n|\r/gm, '');
                        newPrivateKeyPem.toString().replace(/  |\r\n|\n|\r/gm, '');


                        let newCertificate = new Certificate({
                            username: username,
                            certificate: pemCertificate,
                            publicKey: pki.publicKeyToPem(keypair.publicKey),
                            privateKey: newPrivateKeyPem
                        });

                        newCertificate.save()
                            .then(result => {
                                let unencryptedPayload = {
                                    certificate: pemCertificate,
                                    publicKey: pki.publicKeyToPem(keypair.publicKey),
                                    privateKey: newPrivateKeyPem
                                };
                                let payload = {
                                    certificate: auth.encryptAES(pemCertificate, key, iv),
                                    publicKey: auth.encryptAES(pki.publicKeyToPem(keypair.publicKey), key, iv),
                                    privateKey: auth.encryptAES(newPrivateKeyPem, key, iv)
                                };
                                response.status(200).json({
                                    payload: payload,
                                    signature: auth.createHmac(unencryptedPayload, key)
                                });
                            })
                            .catch(error => {
                                next(new ApiError(error, 500));
                            })
                    })
                    .catch(err => {
                        next(new ApiError(err, 500));
                    });
            } else {
                next(new ApiError('Signature verification failed', 451));
            }
        } catch (error) {
            next(new ApiError(error, 500));
        }
    },

    loginDevice(request, response, next) {

        try {
            // Request uniform assertions
            const body = request.body;
            assert(typeof(request.body) === 'object', 'Request body must be of type object');
            assert(typeof(request.body.payload) === 'object', 'Payload must be of type object');
            assert(body.signature, 'Hash is missing from body');
            assert(typeof(body.signature) === 'string', 'Hash property must be of type string');

            // Request specific assertions
            const payload = request.body.payload;
            assert(payload.username, 'Username is missing from body');
            assert(payload.certificate, 'Certificate is missing from body');

            assert(typeof(payload.username) === 'string', 'Username property must be of type string');
            assert(typeof(payload.certificate) === 'string', 'Certificate property must be of type string');
        } catch(error) {
            next(new ApiError(error.message, 412));
            return;
        }

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
                        next(new ApiError('Signature verification failed', 451));
                    }
                } else {
                    next(new ApiError('Invalid credentials provided', 412))
                }
            })
            .catch(err => {
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
                response.status(200).json({}).end();
                //next();
            }
        })
    },

    verifySignature(request, response, next) {
        if(request.body.signature && request.session.key) {
            try {
                const verified = auth.verifyDigitalSignature(request.body.payload, request.body.signature, pki.publicKeyFromPem(request.session.key));
                if(verified) {
                    response.status(200).json({}).end();
                    //next();
                } else {
                    next(new ApiError('Signature verification failed', 451));
                }
            } catch (error) {
                next(new ApiError('Signature verification failed', 451));
            }
        } else {
            next(new ApiError('Signature verification failed', 451));
        }
    }
};
