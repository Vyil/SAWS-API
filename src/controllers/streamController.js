const mongoose = require('mongoose');
const Streams = require("../models/streams")
const ApiError = require('../models/ApiError');


module.exports = {

    getStreams(req,res,next){
        Streams.find()
        .populate("User")
        .then((streams, err) =>{
            if(err) throw err;
            res.status(200).json(streams)
        })
        .catch ((err) =>{
            console.log(err);
            res.status(error).send(new ApiError('Error occured:' + error)).end();
            return;
        })

    },
    getViewerCount(request,response,next){
        console.log('GetViewCount called')

        Stream.findOne({User : request.body.username})
            .then((stream)=>{
                response.status(200).json(stream.Viewers).end()
            })
    }
}