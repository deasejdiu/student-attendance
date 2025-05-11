const axios = require("axios");
const AttendanceRecord = require("../models/AttendanceRecord");
const SyncStatus = require("../models/SyncStatus");
const { createLogger } = require("../utils/logger");

const logger = createLogger("sync-service");
const MAIN_API_URL = process.env.MAIN_API_URL || "http://localhost:4000/v1";

class SyncService {
  constructor() {
    this.api = axios.create({
      baseURL: MAIN_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Full sync of all attendance data
  async fullSync() {
    logger.info("Starting full sync of attendance data");
    const syncStartTime = new Date();
    let recordsProcessed = 0;

    try {
      // Get all attendance records from main system
      logger.info(
        `Requesting data from ${MAIN_API_URL}/internal/attendance/all`
      );
      const { data: attendanceData } = await this.api.get(
        "/internal/attendance/all"
      );

      logger.info(
        `Received ${
          attendanceData ? attendanceData.length : 0
        } records from main system`
      );

      // Log a sample record for debugging
      if (attendanceData && attendanceData.length > 0) {
        logger.info("Sample record:", JSON.stringify(attendanceData[0]));
      }

      // Process in batches to avoid memory issues
      if (attendanceData && attendanceData.length > 0) {
        const batchSize = 500;
        for (let i = 0; i < attendanceData.length; i += batchSize) {
          const batch = attendanceData.slice(i, i + batchSize);
          logger.info(
            `Processing batch ${i / batchSize + 1} of ${Math.ceil(
              attendanceData.length / batchSize
            )}`
          );

          const operations = batch.map((record) => ({
            updateOne: {
              filter: { originalId: record.id.toString() },
              update: this.transformAttendanceRecord(record),
              upsert: true,
            },
          }));

          const result = await AttendanceRecord.bulkWrite(operations);
          recordsProcessed += result.upsertedCount + result.modifiedCount;
          logger.info(
            `Batch processed. Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`
          );
        }
      } else {
        logger.warn(
          "No attendance data received from main system or empty data array"
        );
      }

      const syncEndTime = new Date();

      // Update sync status
      await this.updateSyncStatus(
        "full",
        syncStartTime,
        syncEndTime,
        recordsProcessed
      );

      logger.info(
        `Full sync completed. Processed ${recordsProcessed} records.`
      );

      return {
        syncType: "full",
        startTime: syncStartTime,
        endTime: syncEndTime,
        recordsProcessed,
      };
    } catch (error) {
      // Proper error logging without circular references
      logger.error("Full sync failed with error:", {
        message: error.message,
        code: error.code,
        // Include response details if available
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        // Include request details if valuable
        url: error.config?.url,
        method: error.config?.method,
      });

      const syncEndTime = new Date();

      // Update sync status as failed
      await this.updateSyncStatus(
        "full",
        syncStartTime,
        syncEndTime,
        recordsProcessed,
        false,
        error.message
      );

      throw new Error(`Full sync failed: ${error.message}`);
    }
  }

  // Incremental sync for new records since last sync
  async incrementalSync() {
    logger.info("Starting incremental sync");

    try {
      // Get last successful sync time
      const lastSync = await SyncStatus.findOne({
        syncType: { $in: ["full", "incremental"] },
        success: true,
      }).sort({ endTime: -1 });

      const lastSyncTime = lastSync ? lastSync.endTime : new Date(0); // Default to epoch if no previous sync
      logger.info(`Last sync: ${lastSyncTime.toISOString()}`);

      // Get records updated since last sync
      const { data: newRecords } = await this.api.get(
        "/internal/attendance/updated",
        {
          params: { since: lastSyncTime.toISOString() },
        }
      );

      logger.info(
        `Received ${
          newRecords ? newRecords.length : 0
        } updated records since last sync`
      );

      const syncStartTime = new Date();
      let recordsProcessed = 0;

      // Process the new records
      if (newRecords && newRecords.length > 0) {
        const operations = newRecords.map((record) => ({
          updateOne: {
            filter: { originalId: record.id.toString() },
            update: this.transformAttendanceRecord(record),
            upsert: true,
          },
        }));

        const result = await AttendanceRecord.bulkWrite(operations);
        recordsProcessed = result.upsertedCount + result.modifiedCount;

        logger.info(
          `Incremental sync processed ${recordsProcessed} records. Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`
        );
      } else {
        logger.info("No new records to process");
      }

      const syncEndTime = new Date();

      // Update sync status
      await this.updateSyncStatus(
        "incremental",
        syncStartTime,
        syncEndTime,
        recordsProcessed
      );

      return {
        syncType: "incremental",
        startTime: syncStartTime,
        endTime: syncEndTime,
        recordsProcessed,
      };
    } catch (error) {
      // Proper error logging without circular references
      logger.error("Incremental sync failed with error:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });

      throw new Error(`Incremental sync failed: ${error.message}`);
    }
  }

  // Transform a record from main system format to our schema
  transformAttendanceRecord(record) {
    return {
      originalId: record.id.toString(),
      studentId: record.studentId.toString(),
      studentName: record.studentName || "Unknown",
      studentNumber: record.studentNumber || "",
      registerId: record.registerId.toString(),
      className: record.className || "Unknown Class",
      date: record.date ? new Date(record.date) : new Date(),
      startTime: record.startTime || "",
      endTime: record.endTime || "",
      status: record.status,
      checkInTime: record.checkInTime ? new Date(record.checkInTime) : null,
      deviceInfo:
        typeof record.deviceInfo === "string"
          ? JSON.parse(record.deviceInfo)
          : record.deviceInfo || null,
      locationData:
        typeof record.locationData === "string"
          ? JSON.parse(record.locationData)
          : record.locationData || null,
      lastSyncedAt: new Date(),
      syncSource: "main-app",
    };
  }

  // Update the sync status collection
  async updateSyncStatus(
    syncType,
    startTime,
    endTime,
    recordsProcessed,
    success = true,
    errorMessage = null
  ) {
    try {
      await SyncStatus.create({
        syncType,
        startTime,
        endTime,
        recordsProcessed,
        success,
        errorMessage,
      });
    } catch (err) {
      logger.error("Failed to update sync status:", err.message);
    }
  }

  // Get sync statistics
  async getSyncStats() {
    const lastSuccessfulSync = await SyncStatus.findOne({
      success: true,
    }).sort({ endTime: -1 });

    const totalRecords = await AttendanceRecord.countDocuments();

    const syncStats = {
      lastSuccessfulSync: lastSuccessfulSync
        ? {
            syncType: lastSuccessfulSync.syncType,
            time: lastSuccessfulSync.endTime,
            recordsProcessed: lastSuccessfulSync.recordsProcessed,
          }
        : null,
      totalRecords,
      syncStatus: lastSuccessfulSync ? "active" : "never-synced",
    };

    // Get last 5 sync attempts
    const recentSyncs = await SyncStatus.find()
      .sort({ endTime: -1 })
      .limit(5)
      .lean();

    return {
      ...syncStats,
      recentSyncs,
    };
  }
}

module.exports = new SyncService();
