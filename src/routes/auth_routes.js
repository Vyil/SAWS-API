const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

//public routes
//router.post('/login', authController.login);
//router.post('/loginuuid', authController.loginUUID);
//router.post('/test', authController.authenticateNewDevice);
router.post('/logintest', authController.loginDevice);
router.all('*', authController.verifySignature);
router.all('*', authController.validateToken);
router.post('/aron', authController.aron);
module.exports = router;
