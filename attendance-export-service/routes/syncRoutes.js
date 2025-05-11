const express = require('express');
const router = express.Router();
const syncService = require('../services/syncService');
const { authenticateAdmin } = require('../middleware/auth');
const { createLogger } = require('../utils/logger');

const logger = createLogger('sync-routes');

// Get sync status
router.get('/status', authenticateAdmin, async (req, res) => {
  try {
    const syncStats = await syncService.getSyncStats();
    res.json(syncStats);
  } catch (error) {
    logger.error('Error fetching sync status:', error);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
});

// Trigger full sync
router.post('/full', authenticateAdmin, async (req, res) => {
  try {
    // Start the sync process asynchronously
    const syncPromise = syncService.fullSync();
    
    // Respond immediately
    res.status(202).json({ message: 'Full sync initiated' });
    
    // Let the sync process complete in the background
    syncPromise.catch(error => {
      logger.error('Background full sync failed:', error);
    });
  } catch (error) {
    logger.error('Error initiating full sync:', error);
    res.status(500).json({ error: 'Failed to initiate full sync' });
  }
});

// Trigger incremental sync
router.post('/incremental', authenticateAdmin, async (req, res) => {
  try {
    // Start the sync process asynchronously
    const syncPromise = syncService.incrementalSync();
    
    // Respond immediately
    res.status(202).json({ message: 'Incremental sync initiated' });
    
    // Let the sync process complete in the background
    syncPromise.catch(error => {
      logger.error('Background incremental sync failed:', error);
    });
  } catch (error) {
    logger.error('Error initiating incremental sync:', error);
    res.status(500).json({ error: 'Failed to initiate incremental sync' });
  }
});

module.exports = router;