const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// Authentication routes
router.post('/login', authController.login);
router.post('/loginuuid', authController.loginUUID);
router.post('/loginhash',authController.loginHash);

// ---------------------------------------------------------
// Request authentication for a new device
router.post('/auth', authController.authenticateNewDevice);
// Login authenticated device using certificate
router.put('/auth', authController.loginDevice);
// Request ping
router.get('/auth', authController.ping);
// Route for destroying the session and certificate in case it becomes compromised
//router.delete('/auth', authController.compromise);
// ---------------------------------------------------------
//router.post('/test', authController.test);
// Verification paths
router.all('*', authController.verifySignature);
router.all('*', authController.validateToken);

// Test Verification paths
//router.all('/signature', authController.verifySignature);
//router.all('/token', authController.validateToken);
module.exports = router;
