const User = require('../models/user');
const Streams = require('../models/streams');
const Message = require('../models/message');
const ApiError = require('../models/ApiError');
const auth = require('../authentication/authentication');
const Certificate = require('../models/certificate');

const forge = require('node-forge');
const pki = forge.pki;

module.exports = (io) => {
    // Set received path origin
    const receivedPath = io.of('/chat');
    // Event when a client connects to the socket
    receivedPath.on('connection', (client) => {

        // Setup variables for later use
        const query = client.handshake.query;
        const stream = query.stream;
        const username = query.username;
        const uncorrectedCertificate = query.certificate;
        const certificate = query.certificate.replace(/#/g, '+').replace(/  |\r\n|\n|\r/gm, '');

        let signature = query.signature.replace(/#/g, '+').replace(/  |\r\n|\n|\r/gm, '');
        if(signature.substring(signature.length - 2, signature.length) !== '==') {
            signature += '==';
        }

        // Construct the payload
        const payload = {
            stream: stream,
            username: username,
            certificate: uncorrectedCertificate
        };

        console.log('Stream: ' + stream);
        console.log('Username: ' + username);
        console.log('Signature: ' + signature);
        console.log('Certificate: ' + certificate);

        // Find the current certificate in the database
        Certificate.findOne({
            username: username,
            certificate: certificate
        }).then(result => {
            if (result !== null) {
                console.log(result);
                // Setting up public key of client for later use
                const publicKey = pki.publicKeyFromPem(result.publicKey);
                if(auth.verifyDigitalSignature(payload, signature, publicKey)) {
                    console.log('Verified');
                    // Increase the viewer count and print a console log
                    increaseViewer(payload.stream);
                    console.log('client connected: ' + payload.stream);

                    // Join the server on provided stream
                    client.join(payload.stream);

                    // Setup event when the client sends a new message
                    client.on('new-message', (msg) => {
                        // Setup variables for later use
                        const newMessageUsername = msg.payload.username;
                        const newMessage = msg.payload.message;
                        const newMessageSignature = msg.signature;

                        const payload = {
                            username: newMessageUsername,
                            message: newMessage
                        };
                        // Verify the signature, save it to the database and broadcast the message to all listeners with a new signature
                        if(auth.verifyDigitalSignature(payload, newMessageSignature, publicKey)) {
                            //saveMessageDB(payload.stream, msg);
                            receivedPath.to(client.handshake.query.stream).emit('MESSAGE', auth.buildResponse(payload))
                        }
                    });

                    // Setup event when the client disconnects
                    client.on('disconnect', () => {
                        console.log('Client disconnected');
                        decreaseViewer(payload.stream);
                        client.disconnect()
                    })
                } else {
                    console.log('not verified');
                }
            }
        }).catch(err => {
            console.log(err);
            //next(new ApiError(err, 500));
        });
    });

    function increaseViewer(stream) {
        Streams.findOne({username: stream, live: true})
            .then((result) => {
                if(result !== null) {
                    result.viewers++;
                    result.save()
                        .then(()=> console.log('Viewercount increased'))
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    function decreaseViewer(stream) {
        Streams.findOne({username: stream, live: true})
            .then((result) => {
                if(result !== null) {
                    result.viewers--;
                    result.save()
                        .then(()=> console.log('Viewercount decreased'))
                }
            })
            .catch(err => {
                console.log(err)
            })
            
    }

    function saveMessageDB(stream, message) {
        let streamID;

        Streams.findOne({ username: stream, live:true })
            .then(rslt => {
                console.log('RsltValue: '+JSON.stringify(rslt))
                if(!rslt){
                    return;
                } else {
                    streamID = rslt._id
                }                
            })
            .then(
                User.findOne({ username: message.payload.username })
                .then(result => {
                    newMessage = new Message({
                        content: message.payload.message,
                        stream: streamID,
                        user: result._id
                    })
                    newMessage.save()
                        .then(rt => {})
                        .catch(err => {
                            console.log(err)
                        })
                })
            )
            .catch(err => {
                console.log(err)
            })
    }

}
