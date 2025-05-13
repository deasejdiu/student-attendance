const express = require('express');
const router = express.Router();
const { sendVerificationEmail, verifyEmail } = require('../controllers/verificationController');

router.post('/send-verification', sendVerificationEmail);
router.get('/verify-email', verifyEmail);

module.exports = router;
