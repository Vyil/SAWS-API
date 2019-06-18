const Streams = require("../models/streams");
const User = require('../models/user');
const ApiError = require('../models/ApiError');


module.exports = {

    getStreams(req, res, next) {
        Streams.find()
            .populate("User")
            .then((streams, err) => {
                if (err) throw err;
                res.status(200).json(streams)
            })
            .catch((err) => {
                console.log(err);
                res.status(error).send(new ApiError('Error occured:' + error)).end();
                return;
            })

    },
    getViewerCount(request, response) {
        console.log('GetViewCount called')

        Stream.findOne({ User: request.body.username })
            .then((stream) => {
                response.status(200).json(stream.Viewers).end()
            })
    },

    setupInitialStream(req, res) {
        let newStream = new Streams({
            date: new Date(Date.now()),
            live: true,
            uuid: req.body.uuid,
            username:''
        })

        User.findOne({ uuid: req.body.uuid })
            .then(rslt => {
                if(rslt.live){
                    res.status(500).json(new ApiError('User is already live!',500)).end()
                    return;
                } else {
                    newStream.username = rslt.username;
                    rslt.live=true;
                    Promise.all([
                        rslt.save(),
                        newStream.save()
                    ])
                        .then(result => {
                            res.status(200).json({ message: 'Stream created: ' + result }).end()
                            return;
                        })
                    }                
            })
            .catch(err => {
                res.status(500).json(new ApiError(err, 500)).end()
                return;
            })
    },

    closeStream(req, res) {
        Streams.findOne({ uuid: req.body.uuid, live:true })
            .then(result => {
                User.findOne({uuid:req.body.uuid})
                .then(rslt=>{
                    rslt.live=false;
                    result.live = false;
                    Promise.all([
                        rslt.save(),
                        result.save()
                    ])
                res.status(200).json({ message: 'Closed stream: ' + result._id }).end();
                return;
                })               
            })
            .catch(err => {
                res.status(500).json(new ApiError('Database error, are you sure streamID exists? :' + err, 500)).end()
                return;
            })
    },

    getLiveStreams(req, res) {
        Streams.find({ live: true })
            .then(result => {
                res.status(200).json(result).end()
                return;
            })
            .catch(err => {
                res.status(500).json(new ApiError(err, 500)).end()
                return;
            })
    },

    getUserLive(req,res){
        Streams.findOne({username: req.params.username})
            .then((result)=>{
                res.status(200).json({live: result.live}).end()
            })
            .catch(err =>{
                res.status(500).json(new ApiError(err, 500)).end()
                return;
            })
    }
}