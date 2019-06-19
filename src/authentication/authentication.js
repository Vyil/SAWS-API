const config = require('./config');
const moment = require('moment');
const jwt = require('jwt-simple');

// Importing cryptographic libraries
const forge = require('node-forge');
const pki = forge.pki;

// Importing PEM keys
const privateKeyPem = config.privateKey;

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
    const cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(JSON.stringify(payload), 'utf8'));
    cipher.finish();
    const encrypted = cipher.output;
    // outputs encrypted hex
    return encrypted.toHex();
}

function decryptAES(payload, key, iv) {
    const decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(forge.util.createBuffer(forge.util.hexToBytes(payload) ,'raw'));
    const result = decipher.finish(); // check 'result' for true/false
    // outputs decrypted hex
    return decipher.output.toString();
}

function verifyDigitalSignature(payload, signature, publicKey) {
    try {
        signature = forge.util.decode64(signature);
        const md = forge.md.sha256.create();
        md.update(JSON.stringify(payload), 'utf8');
        return publicKey.verify(md.digest().bytes(), signature);
    } catch(error) {
        console.log(error);
        return false;
    }
}

function verifyHmac(payload, signature, key) {
    try {
        let newHmac = createHmac(payload, key);
        return newHmac === signature;
    } catch(error) {
        console.log(error);
        return false;
    }
}

function createHmac(payload, key) {
    let eKey = forge.util.encode64(key);
    let hmac = forge.hmac.create();
    hmac.start('sha256', eKey);
    hmac.update(JSON.stringify(payload));
    return hmac.digest().toHex();
}

function createDigitalSignature(payload, privateKey) {
    const md = forge.md.sha256.create();
    md.update(JSON.stringify(payload), 'utf8');
    const signature = privateKey.sign(md);
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

module.exports = { encodeToken, decodeToken, encryptAES, decryptAES, verifyDigitalSignature, createDigitalSignature, buildResponse, verifyHmac, createHmac };
