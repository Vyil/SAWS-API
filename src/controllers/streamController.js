const Stream = require('../models/streams')

module.exports = {
    getViewerCount(request,response,next){
        console.log('GetViewCount called')

        Stream.findOne({User : request.body.username})
            .then((stream)=>{
                response.status(200).json(stream.Viewers).end()
            })
    },
}