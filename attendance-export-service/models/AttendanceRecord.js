const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
  {
    originalId: {
      type: String,
      required: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    studentName: String,
    studentNumber: String,
    registerId: {
      type: String,
      required: true,
      index: true,
    },
    className: String,
    date: Date,
    startTime: String,
    endTime: String,
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "absent",
    },
    checkInTime: Date,
    lastSyncedAt: Date,
    syncSource: String,
  },
  {
    timestamps: true,
  }
);

attendanceRecordSchema.index({ studentId: 1, date: 1 });
attendanceRecordSchema.index({ registerId: 1, date: 1 });
attendanceRecordSchema.index({ date: 1, status: 1 });
attendanceRecordSchema.index({ lastSyncedAt: 1 });

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema);
