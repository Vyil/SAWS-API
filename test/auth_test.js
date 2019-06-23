const mongoose =require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');
const User =  require('../src/models/user');
const should = chai.should();
// Importing used models
const auth = require('../src/authentication/authentication');
const forge = require('node-forge');
const pki = forge.pki;
const config = require('../src/authentication/config');

const publicKeyPem = config.publicKey;

describe('Authentication', () => {

    it('gives an 412 error when missing the body for authentication', (done) => {
        chai.request(server)
            .post('/api/auth')
            .send({
            })
            .end((error, response) => {
                response.should.have.status(412);
                response.body.message.should.equals('Payload must be of type object');
                done();
            })
    }).timeout(5000);

    it('gives an 412 error when missing the signature for authentication', (done) => {
        chai.request(server)
            .post('/api/auth')
            .send({
                payload: {

                }
            })
            .end((error, response) => {
                response.should.have.status(412);
                response.body.message.should.equals('Hash is missing from body');
                done();
            })
    }).timeout(5000);

    it('gives an 412 error when missing a payload value for authentication', (done) => {
        chai.request(server)
            .post('/api/auth')
            .send({
                payload: {

                },
                signature: '1234'
            })
            .end((error, response) => {
                response.should.have.status(412);
                response.body.message.should.equals('Username is missing from body');
                done();
            })
    }).timeout(5000);

    it('successfully authenticate when providing correct credentials for authentication', (done) => {

        // Generate key and iv for AES encryption
        const key = forge.random.getBytesSync(32);
        const iv = forge.random.getBytesSync(16);

        // Get UUID in case of Android
        const uuid = 'c42n47824vb';

        // Setup needed variables
        const publicKey = pki.publicKeyFromPem(publicKeyPem);

        const payload = {
                username: forge.util.encode64(publicKey.encrypt('Aron')),
                password: forge.util.encode64(publicKey.encrypt('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08')),
                uuid: forge.util.encode64(publicKey.encrypt(uuid)),
                key: forge.util.encode64(publicKey.encrypt(key)),
                iv: forge.util.encode64(publicKey.encrypt(iv))
        };

        // Construct the HMAC signature
        const hmac = auth.createHmac(payload, key);

        // Encode all data and setup request body (POST - /api/auth)
        const body = {
            payload: payload,
            signature: hmac
        };

        chai.request(server)
            .post('/api/auth')
            .send(body)
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.have.property('payload');
                response.body.payload.should.have.property('certificate');
                response.body.payload.should.have.property('publicKey');
                response.body.payload.should.have.property('privateKey');
                done();
            })
    }).timeout(20000);

    it('gives an 412 error when missing the body for login', (done) => {
        chai.request(server)
            .put('/api/auth')
            .send({
            })
            .end((error, response) => {
                response.should.have.status(412);
                response.body.message.should.equals('Payload must be of type object');
                done();
            })
    }).timeout(5000);

    it('gives an 412 error when missing the signature for login', (done) => {
        chai.request(server)
            .put('/api/auth')
            .send({
                payload: {

                }
            })
            .end((error, response) => {
                response.should.have.status(412);
                response.body.message.should.equals('Hash is missing from body');
                done();
            })
    }).timeout(5000);

    it('gives an 412 error when missing a payload value for login', (done) => {
        chai.request(server)
            .post('/api/auth')
            .send({
                payload: {

                },
                signature: '1234'
            })
            .end((error, response) => {
                response.should.have.status(412);
                response.body.message.should.equals('Username is missing from body');
                done();
            })
    }).timeout(5000);
});
