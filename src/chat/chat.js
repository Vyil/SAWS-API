const User = require('../models/user')
const Streams = require('../models/streams')
const Message = require('../models/message')
const ApiError = require('../models/ApiError')

module.exports = (io) => {

    const receivedPath = io.of('/chat')
    receivedPath.on('connection', (client) => {
        increaseViewer(client.handshake.query.stream)
        console.log('client connected: ' + client.handshake.query.stream)
        client.join(client.handshake.query.stream)
        client.on('new-message', (msg) => {
            saveMessageDB(client.handshake.query.stream, msg)
            receivedPath.to(client.handshake.query.stream).emit('MESSAGE', msg)
        })
        client.on('disconnect', () => {
            console.log('Client disconnected')
            decreaseViewer(client.handshake.query.stream)
            client.disconnect()

        })
    })

    function increaseViewer(stream) {
        let viewerCount
        Streams.findOne({username: stream, live: true})
            .then((stream) => {
                viewerCount = stream.viewers
                viewerCount++;

                stream.update({
                    viewers: viewerCount
                })
            })
            .catch(err =>{
                response.status(500).json(new ApiError(err,500)).end()
            })
    }

    function decreaseViewer(stream) {
        let viewerCount
        Streams.findOne({username: stream, live: true})
            .then((stream) => {
                viewerCount = stream.viewers
                viewerCount--;

                stream.update({
                    viewers: viewerCount
                })
            })
            .catch(err =>{
                response.status(500).json(new ApiError(err,500)).end()
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