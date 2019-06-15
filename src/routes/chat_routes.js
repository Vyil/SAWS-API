const express = require('express');
const router = express.Router();

//public routes
router.get('/chat', showData);

function showData(){
    console.log('Data= ')
}

module.exports = router;