const express = require('express');
const { signup, login, getUser, forgetPassword, resetPassword } = require('../controllers/authController');
const isAuthenticated = require('../middleware/isAuthenticated');
const router = express.Router();

// Route for user signup
router.post('/signup', signup);

// Route for user login
router.post('/login', login);

// GET /api/auth/user - Get authenticated user's information
router.get('/user', isAuthenticated, getUser);

//Routes for resetting password
router.post("/forgetPassword", forgetPassword);
router.post("/reset-password/:token", resetPassword);   

module.exports = router;
