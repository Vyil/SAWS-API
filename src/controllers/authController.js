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

/*
{
	"payload": {
		"username": "Cp/dmlV+6WkDUtlaqJe9+4LHDNZHTfaM7AgeYc9ONclVKXlpYJn/HytiisJriVq+CyVdJcsbqgbILEQv/SM0Cb991Zo6IN0ZBI7cfhx5ZeSLWXCBDE4r+B6LZ1DvA3vFubWCWSZn/6Ot9jQAOEFEFe03RRNJA/UEI4uky/9BkqgbCu79hb2HV2KcicmTG7Lpc82pmpOrjQTygcWL962WeW/GSxLGPPE24YpNlKZVXlMW+4ryE5x6GEGjph8C4fYprLwG40qLt4Ax75ZdXRwqPkRbWE5sKM1RC7BBcMnoMMnaRivN7BWeLIOjIqjILNfy1Xs7q2yc4FJqsImsFMR0xA==",
		"password": "D3c6DIfDGwmoom0LhBjztJnRJX8ZTpWm+/PWLNmadpw0lT1jTgTxOqAIs0bXsIGkBQ5TlROONemCXF6kjWXC9kw3O+PNlcX909RI3/MHLRM2TVHLXbhWY+1X+saZodG1WCaYou2LWPmg8orn3KwREHYtj7YdbWpySSTUhfQGdWZ0a/1KY+c55JWTCH/pKjvIkZ8dhiINnWt5ZcL0dyJ4PtjPWhPBAPqzCPAvwkuscQdUqDrsdThTCEU1lySe/bcJNkEfkKpwkoYD4/H8XiX47vwOGI+Kz74OO6iIII4iBrcreloZ42pyrYAgRintSk2qGkt2DmCJWO7HtdIGTlDumg==",
		"uuid": "HUi0qreulO0quoChaXfErN6VdyOwhd3BNSyDKWU21TWisZ+DCxO9VE1nC/zhQUpIex7YKk08RRyckH4dZ16RcW0L8c8AQU4xmJjzb0ZbN9kpIG4E2rOU/3rIBR+yqtf0JtVak0WYfgggEzFIvF2Qxb76IDWAl9igmlW48yF6XjwLJCFbFINfjq/OQxo24RNItHr7Lg01wGG2h774zPgVyhJKsC0b+Ffrn5citCGa6vtOH/VyHioTd5TyKWK+SR9O+GJutcBJRyetIQ9kZ8teByfyOgAgTbAWfOaWIqh+bTANbcpdwjKoU/UnAxtZui1dBkAvSGyTwYUQQUEIb/+kHw==",
		"passphrase": "b1P53t7ByzNVCCa9UspQEbhMfn8VUiTKJ7VcWsMcGug1io64UWM8zntaz0iNbSt2iDSBi6AoMla7faiSZ54gaxa1CnGIJH63ri838PfsYdmHd8t7SSFtb/udX3yzb8zs41RaZAig9zeE5TG/cwaGbho0QmTEJZjTl6SYWdXkB6TBmK9Ki4NiBBOwR8zcjJ+EmfFCQgj7+6cZWHHLz8zLNbD8Fnc8dzflfvtQZYLR/4xUM0BIJdLPreX70Z9SQZAjEuXRx/v2pTzU5+AUENPB0VNedX+ckFVhpWLfCnp9BGsVkkm5XmRhe2jrEw3z/7tftjUFqsezea+7QxSmmILt/w=="
	},
	"hash": "1234"
}
 */
