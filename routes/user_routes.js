const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

//public routes
router.post('/register', userController.createNewUser);
router.post('/test', userController.test);

module.exports = router;
