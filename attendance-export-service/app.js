require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const { createLogger } = require('./utils/logger');

// Import routes
const exportRoutes = require('./routes/exportRoutes');
const syncRoutes = require('./routes/syncRoutes');
const statusRoutes = require('./routes/statusRoutes');

// Initialize logger
const logger = createLogger('app');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4500;

// Create exports directory if it doesn't exist
const exportDir = path.join(__dirname, process.env.EXPORTS_STORAGE_PATH || './exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
  logger.info(`Created exports directory at ${exportDir}`);
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for export downloads
app.use('/downloads', express.static(exportDir));

// Routes
app.use('/api/exports', exportRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/status', statusRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'attendance-export-service' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-export')
  .then(() => {
    logger.info('Connected to MongoDB');
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Attendance Export Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;