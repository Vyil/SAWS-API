module.exports = (io) =>{

    const receivedPath = io.of('/chat')
    receivedPath.on('connection',(data)=>{
    console.log('CONNECTED '+data);
    })

}