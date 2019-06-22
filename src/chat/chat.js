const User = require('../models/user');
const Streams = require('../models/streams');
const Message = require('../models/message');
const ApiError = require('../models/ApiError');
const auth = require('../authentication/authentication');

const forge = require('node-forge');
const pki = forge.pki;

module.exports = (io) => {
    // Set received path origin
    const receivedPath = io.of('/chat');
    // Event when a client connects to the socket
    receivedPath.on('connection', (client) => {

        // Setup variables for later use
        const query = client.handshake.query;
        const payload = query.payload;
        const signature = query.signature;

        // Setting up public key of client for later use
        const publicKeyPem = payload.publicKey;
        const publicKey = pki.publicKeyFromPem(publicKeyPem);

        if(auth.verifyDigitalSignature(payload, signature, publicKey)) {
            // Increase the viewer count and print a console log
            increaseViewer(payload.stream);
            console.log('client connected: ' + payload.stream);

            // Join the server on provided stream
            client.join(payload.stream);

            // Setup event when the client sends a new message
            client.on('new-message', (msg) => {
                // Setup variables for later use
                const newMessagePayload = msg.payload;
                const newMessageSignature = msg.signature;
                // Verify the signature, save it to the database and broadcast the message to all listeners with a new signature
                if(auth.verifyDigitalSignature(newMessagePayload, newMessageSignature, publicKey)) {
                    saveMessageDB(payload.stream, msg);
                    receivedPath.to(client.handshake.query.stream).emit('MESSAGE', auth.buildResponse(newMessagePayload))
                }
            });

            // Setup event when the client disconnects
            client.on('disconnect', () => {
                console.log('Client disconnected');
                decreaseViewer(payload.stream);
                client.disconnect()
            })
        }



    });

    function increaseViewer(stream) {
        Streams.findOne({username: stream, live: true})
            .then((result) => {
                result.viewers++;
                result.save()
                .then(()=> console.log('Viewercount increased'))
            })
            .catch(err => {
                console.log(err)
            })
    }

    function decreaseViewer(stream) {
        Streams.findOne({username: stream, live: true})
            .then((result) => {                
                result.viewers--;
                result.save()
                .then(()=> console.log('Viewercount decreased'))
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
                User.findOne({ username: message.username })
                .then(result => {
                    newMessage = new Message({
                        content: message.message,
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
