const config = require('../authentication/config');
const moment = require('moment');
const jwt = require('jwt-simple');
const filestream = require('fs');

// Importing cryptographic libraries
const forge = require('node-forge');
const pki = forge.pki;

// Importing PEM keys
const privateKeyPem = filestream.readFileSync(__dirname + '/cert/private.key');

// Encode (from id to token)
function encodeToken(id) {
    const payload = {
        exp: moment().add(2, 'days').unix(),
        iat: moment().unix(),
        sub: id
    };

    return jwt.encode(payload, config.key);
}

// Decode (from token to id)
function decodeToken(token, callback) {
    try {
        const payload = jwt.decode(token, config.key);
        // Check if the token has expired
        const now = moment().unix();
        if(now > payload.exp) {
            callback('Token has expired', null);
        }
        callback(null, payload);
        
    } catch(error) {
        callback(error, null);
    }
}

function encryptAES(payload, key, iv) {

    //var key = forge.util.decode64(eKey);
    //var iv = forge.util.decode64(eIv);

    var cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(payload, 'utf8'));
    cipher.finish();
    var encrypted = cipher.output;
// outputs encrypted hex
    return encrypted.toHex();
}

function decryptAES(payload, key, iv) {

    //var key = forge.util.decode64(eKey);
    //var iv = forge.util.decode64(eIv);
    //console.log(key + " | " + iv);

    var decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(forge.util.createBuffer(forge.util.hexToBytes(payload) ,'raw'));
    var result = decipher.finish(); // check 'result' for true/false
    console.log(result);
    // outputs decrypted hex
    return decipher.output.toString();
}

function verifyDigitalSignature(payload, signature, publicKey) {
    signature = forge.util.decode64(signature);
    var md = forge.md.sha256.create();
    md.update(payload, 'utf8');
    return publicKey.verify(md.digest().bytes(), signature);
}

function createDigitalSignature(payload, privateKey) {
    var md = forge.md.sha256.create();
    md.update(payload, 'utf8');
    var signature = privateKey.sign(md);
    return forge.util.encode64(signature);
}

function buildResponse(payload) {
    let privateKey = pki.privateKeyFromPem(privateKeyPem);
    let signature = forge.util.encode64(createDigitalSignature(payload, privateKey));
    return {
        payload: payload,
        signature: signature
    };
}

module.exports = { encodeToken, decodeToken, encryptAES, decryptAES, verifyDigitalSignature, createDigitalSignature, buildResponse };
