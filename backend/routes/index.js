const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const registerController = require('../controllers/registerController');

// Import route modules
router.use('/users', require('./users'));
router.use('/students', auth, require('./students'));
router.use('/attendance', require('./attendance'));
router.use('/registers', auth, require('./registers'));
router.use('/internal', require('./internal'));

// Public endpoints
router.get('/public/registers/today', registerController.getTodayRegisters);

module.exports = router; 