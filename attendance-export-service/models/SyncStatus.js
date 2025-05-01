const mongoose = require('mongoose');

const syncStatusSchema = new mongoose.Schema({
  syncType: {
    type: String,
    enum: ['full', 'incremental'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  recordsProcessed: {
    type: Number,
    default: 0
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: String
}, { 
  timestamps: true 
});

module.exports = mongoose.model('SyncStatus', syncStatusSchema);