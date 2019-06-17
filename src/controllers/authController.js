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

    handshake(request, response, next) {
        try {
            // Request uniform assertions
            const body = request.body;
            assert(typeof(request.body) === 'object', 'Request body must be of type object');
            assert(typeof(request.body.payload) === 'object', 'Payload must be of type object');

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

        // Log Current session information
        console.log('Session ID: ' + request.session.id);
        console.log('Session Secret: ' + request.session.secret || 'NONE');

        // Decrypt Diffie Hellman components (encoded in base64) using the private key
        const prime = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.prime, 'base64'));
        const generator = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.generator, 'base64'));
        const key = crypto.privateDecrypt(privateKey, Buffer.from(request.body.payload.key, 'base64'));

        // Generate Diffie Hellman object and retrieve key and secret
        const serverDiffieHellman = crypto.createDiffieHellman(prime, generator);
        const serverKey = serverDiffieHellman.generateKeys();
        const secret = serverDiffieHellman.computeSecret(key);

        // Store secret in current session
        request.session.secret = secret;

        // Send server DH key and secret (DEBUG) in base64 encoding
        response.status(200).json({
            key: serverKey.toString('base64'),
            secret: secret.toString('base64')
        }).end();
    },

    verifySecret(request, response, next) {
        console.log(chalk.yellow('[TOKEN] Verification of secret'));
        if(request.session.secret) {
            next();
        } else {
            next(new ApiError('No session secret stored in current session. Please perform handshake before trying again', 451));
        }
    },

    verifyToken(request, response, next) {
        if (process.env.NODE_ENV !== 'test') {
            console.log(chalk.yellow('[TOKEN] Verification of token'));
        }
        const token = request.header('x-access-token') || '';
        // decode the token and process it
        auth.decodeToken(token, (error, payload) => {
            if (error) {
                next(new ApiError(error.message, 401));
            } else {
                request.header.id = payload.sub;
                if (process.env.NODE_ENV !== 'test') {
                    console.log(chalk.green('[TOKEN] Authentification OK for: ' + payload.sub));
                }
                next();
            }
        });
    }
};