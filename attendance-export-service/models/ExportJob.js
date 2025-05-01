const mongoose = require('mongoose');

const exportJobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true
  },
  userId: String,
  studentId: {
    type: String,
    required: true
  },
  startDate: Date,
  endDate: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  format: {
    type: String,
    enum: ['csv', 'excel', 'pdf', 'json'],
    required: true
  },
  filePath: String,
  errorMessage: String,
  downloadCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { 
  timestamps: true 
});

exportJobSchema.index({ expiresAt: 1 });
exportJobSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ExportJob', exportJobSchema);