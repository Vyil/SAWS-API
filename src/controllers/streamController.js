const mongoose = require('mongoose');
const Streams = require("../models/streams")
const Users = require('../models/user')

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

    }
}