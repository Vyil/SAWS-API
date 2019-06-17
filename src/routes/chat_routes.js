const express = require('express');
const router = express.Router();

//public routes
router.get('/chat', showData);
router.patch('/chatsave',SaveChat)

function showData(){
    console.log('Data= ')
}

module.exports = router;