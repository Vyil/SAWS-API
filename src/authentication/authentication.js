const config = require('./config');
const moment = require('moment');
const jwt = require('jwt-simple');

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

module.exports = { encodeToken, decodeToken };