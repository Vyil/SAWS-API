const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// Authentication routes
router.post('/login', authController.login);
router.post('/loginuuid', authController.loginUUID);
router.post('/auth', authController.authenticateNewDevice);
router.put('/auth', authController.loginDevice);
// Verification paths
router.all('*', authController.verifySignature);
router.all('*', authController.validateToken);
module.exports = router;
