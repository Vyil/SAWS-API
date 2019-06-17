const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

//public routes
//router.post('/login', authController.login);
router.post('/handshake', authController.handshake);

module.exports = router;