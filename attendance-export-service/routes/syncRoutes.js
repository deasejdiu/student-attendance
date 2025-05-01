const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AttendanceRecord = require('../models/AttendanceRecord');
const ExportJob = require('../models/ExportJob');
const { createLogger } = require('../utils/logger');

const logger = createLogger('status-routes');

// Public health check route
router.get('/', async (req, res) => {
  try {
    // Check MongoDB connection
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return res.status(503).json({
        status: 'error',
        message: 'Database connection error',
        timestamp: new Date()
      });
    }
    
    // Count records in collections
    const [attendanceCount, exportJobCount] = await Promise.all([
      AttendanceRecord.countDocuments(),
      ExportJob.countDocuments()
    ]);
    
    res.json({
      status: 'ok',
      service: 'attendance-export-service',
      timestamp: new Date(),
      database: {
        connected: isConnected,
        collections: {
          attendanceRecords: attendanceCount,
          exportJobs: exportJobCount
        }
      },
      uptime: process.uptime()
    });
  } catch (error) {
    logger.error('Error checking service status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check service status',
      timestamp: new Date()
    });
  }
});

module.exports = router;