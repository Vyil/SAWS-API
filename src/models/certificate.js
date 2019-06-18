const mongoose = require('../database/mongodb');
const Schema = mongoose.Schema;

const CertificateSchema = new Schema ({
    username: {
        type: String,
        required: [true, 'Username is required']
    },
    certificate: {
        type: String,
        required: [true, 'Certificate is required']
    },
    publicKey: {
        type: String,
        required: [true, 'Public Key is required']
    },
    privateKey: {
        type: String,
        required: [true, 'Private Key is required']
    }

});

const Certificate = mongoose.model('certificate',CertificateSchema);
module.exports = Certificate;
