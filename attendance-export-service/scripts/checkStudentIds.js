require("dotenv").config();
const mongoose = require("mongoose");
const AttendanceRecord = require("../models/AttendanceRecord");
const { createLogger } = require("../utils/logger");

const logger = createLogger("check-students");

async function checkStudentIds() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/attendance-export"
    );
    logger.info("Connected to MongoDB");

    // Get all unique student IDs
    const studentIds = await AttendanceRecord.distinct("studentId");
    logger.info(`Found ${studentIds.length} unique student IDs in database:`);
    logger.info(JSON.stringify(studentIds, null, 2));

    // Get a sample record for each student
    for (const studentId of studentIds) {
      const record = await AttendanceRecord.findOne({ studentId }).lean();
      logger.info(`Sample record for student ${studentId}:`);
      logger.info(JSON.stringify(record, null, 2));
    }

    // Get total record count
    const totalRecords = await AttendanceRecord.countDocuments();
    logger.info(`Total attendance records: ${totalRecords}`);
  } catch (error) {
    logger.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
  }
}

checkStudentIds();
