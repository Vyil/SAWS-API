const Streams = require("../models/streams");
const User = require('../models/user');
const ApiError = require('../models/ApiError');
const SatoshiController = require('../controllers/satoshiController');
const auth = require('../authentication/authentication');


module.exports = {

    getStreams(req, res, next) {
        Streams.find()
            .populate("User")
            .then((streams, err) => {
                if (err) throw err;
                res.status(200).json(auth.buildResponse(streams));
            })
            .catch((err) => {
                console.log(err);
                res.status(error).send(new ApiError('Error occured:' + error)).end();
                return;
            })

    },
    getViewerCount(request, response) {
        console.log('GetViewCount called');

        Streams.findOne({ username: request.query.username, live: true })
            .then((stream) => {
                if(stream!=null){
                    console.log('Viewcount = ' + stream.viewers);
                    response.status(200).json(auth.buildResponse({viewers: stream.viewers})).end();
                }else{
                    response.status(400).json(new ApiError('Stream not found', 400)).end()
                }
            })
            .catch(err =>{
                response.status(500).json(new ApiError(err,500)).end()
            })
    },

    setupInitialStream(req, res) {
        try {
            let newStream = new Streams({
                date: new Date(Date.now()),
                live: true,
                uuid: req.body.payload.uuid,
                username: ''
            });

            User.findOne({ uuid: req.body.payload.uuid })
                .then(rslt => {
                    if (rslt.live) {
                        res.status(500).json(new ApiError('User is already live!', 500)).end();
                        return;
                    } else {
                        newStream.username = rslt.username;
                        rslt.live = true;
                        Promise.all([
                            rslt.save(),
                            newStream.save()
                        ])
                            .then(result => {
                                SatoshiController.startSatoshi(rslt.username);
                                res.status(200).json(auth.buildResponse({ message: 'Stream created: ' + result })).end();
                                return;
                            })
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json(new ApiError(err, 500)).end();
                    return;
                })
        } catch(error) {
            console.log(error);
        }
    },

    closeStream(req, res) {
        Streams.findOne({ uuid: req.body.payload.uuid, live: true })
            .then(result => {
                User.findOne({ uuid: req.body.payload.uuid })
                    .then(rslt => {
                        rslt.live = false;
                        result.live = false;
                        Promise.all([
                            rslt.save(),
                            result.save()
                        ]);
                        SatoshiController.startSatoshi(rslt.username)
                            .then(
                                res.status(200).json(auth.buildResponse({ message: 'Closed stream: ' + rslt.username })).end()
                            )

                    })
            })
            .catch(err => {
                res.status(500).json(new ApiError('Database error, are you sure streamID exists? :' + err, 500)).end();
                return;
            })
    },

    getLiveStreams(req, res) {
        User.find({ live: true })
            .then(result => {
                res.status(200).json(auth.buildResponse(result)).end();
                return;
            })
            .catch(err => {
                res.status(500).json(new ApiError(err, 500)).end();
                return;
            })
    },

    getUserLive(req,res){
        User.findOne({username: req.params.username})
            .then((result)=>{
                res.status(200).json(auth.buildResponse({live: result.live})).end()
            })
            .catch(err =>{
                res.status(500).json(new ApiError(err, 500)).end()
                return;
            })
    }
}
