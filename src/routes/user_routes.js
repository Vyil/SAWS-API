const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

//public routes
router.post('/register', userController.createNewUser);
<<<<<<< HEAD:src/routes/user_routes.js
router.post('/usersuuid', userController.getUserByUUID);
router.post('/test', userController.test);
router.get('/users', userController.getUser)
=======
router.get('/users', userController.getUser);
router.delete('/users', userController.deleteUser)
>>>>>>> feature_passwordLogin:routes/user_routes.js

module.exports = router;
