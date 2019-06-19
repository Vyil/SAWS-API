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
            .then((result) => {
                if(result.viewers === undefined){
                    viewerCount = 0
                    console.log('Viewercount= ' + viewerCount)
                }else{
                    viewerCount = result.viewers
                    console.log('Viewercount= ' + viewerCount)
                }
                viewerCount++;

                result.findOne({_id: result._id})
                    .update({viewers: viewerCount})
                    .then(()=> console.log('Viewercount increased'))
            })
            .catch(err => {
                console.log(err)
            })
    }

    function decreaseViewer(stream) {
        let viewerCount
        Streams.findOne({username: stream, live: true})
            .then((strresulteam) => {
                if(result.viewers === undefined){
                    viewerCount = 0
                    console.log('Viewercount= ' + viewerCount)
                }else{
                    viewerCount = stream.viewers
                    console.log('Viewercount= ' + viewerCount)
                }
                viewerCount--;

                Streams.findOne({_id: result._id})
                    .update({viewers: viewerCount})
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