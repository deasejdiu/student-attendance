// src/middleware/error.middleware.js

// Global error handler middleware
function errorHandler(err, req, res, next) {
    console.error(err.stack);  // Log error stack to the console for debugging
  
    // Send generic error response to the client
    res.status(500).json({
      message: 'Something went wrong, please try again later.',
    });
  }
  
  module.exports = { errorHandler };
  