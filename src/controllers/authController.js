const auth = require('../authentication/authentication');
const ApiError = require('../models/ApiError');
const User = require('../models/user');
const Certificate = require('../models/certificate');

// Importing used packages
const forge = require('node-forge');
const pki = forge.pki;
const crypto = require('crypto');
const filestream = require('fs');

// Import relevant keys
const publicKey = filestream.readFileSync(__dirname + '/cert/public.key');
const privateKey = filestream.readFileSync(__dirname + '/cert/private.key');

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
            let username, password, uuid, passphrase, hash;
            try {
                username = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.username, 'base64'));
                password = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.password, 'base64'));
                uuid = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.uuid, 'base64'));
                passphrase = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.passphrase, 'base64'));
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
                    console.log(result);
                    response.status(200).json({}).end();

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

                    let pemCertificate = pki.certificateToPem(certificate);
                    //console.log(pemCertificate);
                    //console.log(pki.publicKeyToPem(keypair.publicKey));

                    /*let newCertificate = new Certificate({
                        username: username,
                        certificate: pemCertificate,
                        publicKey: pki.publicKeyToPem(keypair.publicKey),
                        privateKey: pki.privateKeyToPem(keypair.privateKey)
                    });

                    newCertificate.save()
                        .then(result => {
                            response.status(200).json({
                                certificate: crypto.
                            })
                        })
                        .catch(error => {
                            next(new ApiError(error, 500));
                    })*/
                })
                .catch(err => {
                    next(new ApiError(err, 500));
                });


        } catch (error) {
            // TODO - generic error
        }

    }
};
