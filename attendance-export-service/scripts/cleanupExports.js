require('dotenv').config();
const mongoose = require('mongoose');
const exportService = require('../services/exportService');
const { createLogger } = require('../utils/logger');

const logger = createLogger('cleanup-script');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-export')
  .then(async () => {
    logger.info('Connected to MongoDB');
    
    try {
      logger.info('Starting cleanup of expired exports');
      const count = await exportService.cleanupExpiredExports();
      logger.info(`Cleanup completed. Removed ${count} expired exports.`);
    } catch (error) {
      logger.error('Cleanup failed:', error);
    } finally {
      // Disconnect from MongoDB
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
    }
  })
  .catch(error => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });