const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

//public routes
router.post('/login', authController.login);
router.post('/loginuuid', authController.loginUUID);
router.post('/test', authController.authenticateNewDevice);

module.exports = router;
