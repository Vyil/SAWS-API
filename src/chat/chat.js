module.exports = (io) =>{

    const receivedPath = io.of('/chat')
    receivedPath.on('connection',(client)=>{
        console.log('client connected: '+client.handshake.query.stream)
        client.join(client.handshake.query.stream)
        client.on('new-message',(msg)=>{
            receivedPath.to(client.handshake.query.stream).emit('MESSAGE'+msg)
        })
        client.on('disconnect',()=>{
            console.log('Client disconnected')
            client.disconnect()
        })
    })

}