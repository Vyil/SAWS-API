module.exports = (io) =>{

    const receivedPath = io.of('/chat')
    receivedPath.on('connection',(client)=>{
        client.join('room-one'/*client.streamURL*/)
        client.on('new-message',(msg)=>{
            console.log('MESSAGE '+msg+' ')
            receivedPath.to('room-one').emit('MESSAGE'+msg)
        })
        client.on('disconnect',()=>{
            console.log('Client disconnected')
            client.disconnect()
        })
    })

}