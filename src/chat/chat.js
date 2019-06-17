const User = require('../models/user')
const Streams = require('../models/streams')
const Message = require('../models/message')
const ApiError = require('../models/ApiError')

module.exports = (io) =>{

    const receivedPath = io.of('/chat')
    receivedPath.on('connection',(client)=>{
        //increaseViewer(client.handshake.query.stream)
        console.log('client connected: '+client.handshake.query.stream)
        client.join(client.handshake.query.stream)
        client.on('new-message',(msg)=>{
            //saveMessageDB(client.handshake.query.stream,msg)
            receivedPath.to(client.handshake.query.stream).emit('MESSAGE',msg)
        })
        client.on('disconnect',()=>{
            console.log('Client disconnected')
            //decreaseViewer(client.handshake.query.stream)
            client.disconnect()

        })
    })

    function increaseViewer(stream){
        Streams.findOne(stream)
            .then((stream)=>{
                viewers = stream.Viewers
                viewers++;
            })
            .update({
                Viewers : viewers
            })
    }

    function decreaseViewer(stream){
        Streams.findOne(stream)
            .then((stream)=>{
                viewers = stream.Viewers
                viewers--;
                Streams.update({
                    Viewers : viewers
                })
            })
    }

    function saveMessageDB(stream, message){
        //Add streamID from lookup
        User.findOne({username:message.username})
        .then(result=>{
            newMessage = new Message({
                content:message.message,
                stream:stream._id,
                user:result._id
            })
            newMessage.save()
            .then(rslt=>{
                res.status(200).json({message:'Message saved succesfully',rslt}).end();
                return;
            })
            .catch(err=>{
                res.status(500).json(new ApiError(err,500)).end();
                return;
            })
        })
        .catch(err=>{
            res.status(500).json(new ApiError(err,500)).end();
            return;
        })
    }

}