const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

//public routes
router.post('/register', userController.createNewUser);
router.post('/usersuuid', userController.getUserByUUID);
router.get('/user', userController.getUser);

module.exports = router;
