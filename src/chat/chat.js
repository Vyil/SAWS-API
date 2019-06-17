
const Stream = require('../models/streams')

module.exports = (io) =>{

    const receivedPath = io.of('/chat')
    receivedPath.on('connection',(client)=>{
        increaseViewer(client.handshake.query.stream)
        console.log('client connected: '+client.handshake.query.stream)
        client.join(client.handshake.query.stream)
        client.on('new-message',(msg)=>{
            receivedPath.to(client.handshake.query.stream).emit('MESSAGE'+msg)
        })
        client.on('disconnect',()=>{
            console.log('Client disconnected')
            decreaseViewer(client.handshake.query.stream)
            client.disconnect()

        })
    })

    function increaseViewer(stream){
        Stream.findOne(stream)
            .then((stream)=>{
                viewers = stream.Viewers
                viewers++;
            })
            .update({
                Viewers : viewers
            })
    }

    function decreaseViewer(stream){
        Stream.findOne(stream)
            .then((stream)=>{
                viewers = stream.Viewers
                viewers--;
                Stream.update({
                    Viewers : viewers
                })
            })
    }

}