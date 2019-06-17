const chatModel = require("../models/chat")
const userModel = require("../models/user")
const ApiError = require('../models/ApiError');

module.exports ={
    SaveChat(req,res,next) {
        userModel.findOne({ username: req.username}, function(err, userFound) {
            if(err||userFound == null || userFound == undefined || userFound == ""){
                return res.json(404).send(new ApiError("Error occured:"  + err, 404)).end();
            }
            else{
                try{
                    const currentDate = moment().format();
                    let chatMessage = new chatModel({
                        Content : req.body.content,
                        Date: currentDate,
                        Stream: req.param.username,
                        User: userFound._username
                    });

                    chatMessage.save(function(err) {
                    if(err){
                        return console.log(err);
                    } else {
                        const response = {message: "Message sent"}
                        res.status(200).json(response)
                    }
                })
                } catch (err){
                    res.status(err).send(new ApiError("Error occured" + err)).end();
                }
            } 
        });
    }
}