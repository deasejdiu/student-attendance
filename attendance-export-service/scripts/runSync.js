require('dotenv').config();
const mongoose = require('mongoose');
const syncService = require('../services/syncService');
const { createLogger } = require('../utils/logger');

const logger = createLogger('sync-script');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-export')
  .then(async () => {
    logger.info('Connected to MongoDB');
    
    try {
      // Parse command line arguments
      const args = process.argv.slice(2);
      const syncType = args[0] || 'incremental';
      
      if (syncType === 'full') {
        logger.info('Starting full sync');
        const result = await syncService.fullSync();
        logger.info('Full sync completed', result);
      } else {
        logger.info('Starting incremental sync');
        const result = await syncService.incrementalSync();
        logger.info('Incremental sync completed', result);
      }
    } catch (error) {
      logger.error('Sync failed:', error);
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