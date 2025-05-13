// backend/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15m
  max: 100,                 // limit each IP to 100 requests
  message: { status: 429, error: 'Too many requests, please try again later.' }
});

