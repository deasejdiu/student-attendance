// backend/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

// Limit each IP to 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  }
});

module.exports = apiLimiter;
