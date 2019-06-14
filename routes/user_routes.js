const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

//public routes
router.post('/register', userController.createNewUser);
router.get('/users', userController.getUser);
router.delete('/users', userController.deleteUser)

module.exports = router;