const express = require('express');
const { registerUser } = require('../controllers/users.controller');

const router = express.Router();

// User routes
router.post('/register', registerUser);

// More user routes can be added here

module.exports = router; 