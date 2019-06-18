const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// Authentication routes
router.post('/login', authController.login);
router.post('/loginuuid', authController.loginUUID);
router.post('/auth', authController.authenticateNewDevice);
router.put('/auth', authController.loginDevice);

router.post('/test', authController.test);

// Verification paths
//router.all('*', authController.verifySignature);
//router.all('*', authController.validateToken);

// Test Verification paths
router.all('/signature', authController.verifySignature);
router.all('/token', authController.validateToken);
module.exports = router;
