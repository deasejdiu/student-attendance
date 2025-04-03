const express = require('express');
const { registerUser, loginUser } = require('../controllers/users.controller');

const router = express.Router();

// User routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// More user routes can be added here

module.exports = router; 