const config = require('./config');
const moment = require('moment');
const jwt = require('jwt-simple');

const forge = require('node-forge');

// Encode (from id to token)
function encodeToken(id) {
    const payload = {
        exp: moment().add(10, 'days').unix(),
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
            console.log('Token has expired');
        }
        return payload
        
    } catch(error) {
        console.log(error);
    }
}

function encryptAES(payload, eKey, eIv) {

    var key = forge.util.decode64(eKey);
    var iv = forge.util.decode64(eIv);

    var cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(payload, 'utf8'));
    cipher.finish();
    var encrypted = cipher.output;
// outputs encrypted hex
    return encrypted.toHex();
}

function decryptAES(payload, eKey, eIv) {

    var key = forge.util.decode64(eKey);
    var iv = forge.util.decode64(eIv);
    console.log(key + " | " + iv);
    var decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(forge.util.createBuffer(forge.util.hexToBytes(payload) ,'raw'));
    var result = decipher.finish(); // check 'result' for true/false
    console.log(result);
    // outputs decrypted hex
    return decipher.output.toString();
}

module.exports = { encodeToken, decodeToken, encryptAES, decryptAES };