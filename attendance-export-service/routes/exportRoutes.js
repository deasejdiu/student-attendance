const express = require("express");
const router = express.Router();
const exportService = require("../services/exportService");
const analyticsService = require("../services/analyticsService");
const { authenticateRequest } = require("../middleware/auth");
const { validateExportRequest } = require("../middleware/validators");
const path = require("path");
const { createLogger } = require("../utils/logger");

const logger = createLogger("export-routes");

// Create a new export job
router.post(
  "/",
  authenticateRequest,
  validateExportRequest,
  async (req, res) => {
    try {
      const { studentId, format, startDate, endDate } = req.body;
      const userId = req.user.id;

      const job = await exportService.createExportJob(
        userId,
        studentId,
        format,
        startDate,
        endDate
      );

      res.status(201).json({
        message: "Export job created successfully",
        job: {
          jobId: job.jobId,
          status: job.status,
          format,
          createdAt: job.createdAt,
        },
      });
    } catch (error) {
      logger.error("Error creating export job:", error);
      res.status(500).json({ error: "Failed to create export job" });
    }
  }
);

// Get all export jobs for the current user
router.get("/", authenticateRequest, async (req, res) => {
  try {
    const userId = req.user.id;
    const jobs = await exportService.getExportJobs(userId);

    res.json({
      jobs: jobs.map((job) => ({
        jobId: job.jobId,
        studentId: job.studentId,
        studentName: job.studentName,
        format: job.format,
        status: job.status,
        createdAt: job.createdAt,
        downloadUrl:
          job.status === "completed"
            ? `/exports/download/${job.jobId}`
            : null,
      })),
    });
  } catch (error) {
    logger.error("Error fetching export jobs:", error);
    res.status(500).json({ error: "Failed to fetch export jobs" });
  }
});

// Get export job status
router.get("/status/:jobId", authenticateRequest, async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await exportService.getExportJob(jobId);

    if (!job) {
      return res.status(404).json({ error: "Export job not found" });
    }

    // Check if user is authorized to access this job
    if (job.userId && job.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this export" });
    }

    res.json({
      job: {
        jobId: job.jobId,
        status: job.status,
        format: job.format,
        createdAt: job.createdAt,
        downloadUrl:
          job.status === "completed"
            ? `/exports/download/${job.jobId}`
            : null,
        error: job.errorMessage,
      },
    });
  } catch (error) {
    logger.error("Error fetching export job status:", error);
    res.status(500).json({ error: "Failed to fetch export job status" });
  }
});

// Download export file
router.post("/download/:jobId", authenticateRequest, async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await exportService.getExportJob(jobId);

    if (!job) {
      return res.status(404).json({ error: "Export job not found" });
    }

    // Check if job is completed
    if (job.status !== "completed") {
      return res
        .status(400)
        .json({ error: "Export is not ready for download" });
    }

    // Check if user is authorized to access this job
    if (job.userId && job.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this export" });
    }

    // Check if file exists
    if (!job.filePath || !require("fs").existsSync(job.filePath)) {
      return res.status(404).json({ error: "Export file not found" });
    }

    // Track download
    await exportService.trackDownload(jobId);

    // Set appropriate content type
    const contentTypes = {
      csv: "text/csv",
      excel:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      pdf: "application/pdf",
      json: "application/json",
    };

    const filename = path.basename(job.filePath);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader(
      "Content-Type",
      contentTypes[job.format] || "application/octet-stream"
    );

    // Use absolute path in res.sendFile
    const absolutePath = path.resolve(job.filePath);
    res.sendFile(absolutePath);
  } catch (error) {
    logger.error("Error downloading export:", error);
    res.status(500).json({ error: "Failed to download export" });
  }
});

// Get analytics for a student
router.get("/analytics/:studentId", authenticateRequest, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // Get attendance summary
    const summary = await analyticsService.getStudentSummary(
      studentId,
      startDate,
      endDate
    );

    // Get attendance trends
    const trends = await analyticsService.getAttendanceTrends(
      studentId,
      startDate,
      endDate,
      "month"
    );

    // Get attendance insights
    const insights = await analyticsService.getAttendanceInsights(studentId);

    res.json({
      summary,
      trends,
      insights,
    });
  } catch (error) {
    logger.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;
