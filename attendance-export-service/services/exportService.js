const AttendanceRecord = require("../models/AttendanceRecord");
const ExportJob = require("../models/ExportJob");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { format } = require("date-fns");
const { createObjectCsvWriter } = require("csv-writer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { createLogger } = require("../utils/logger");

const logger = createLogger("export-service");
const EXPORTS_DIR = process.env.EXPORTS_STORAGE_PATH || "./exports";
const MAX_EXPORT_AGE_DAYS = parseInt(process.env.MAX_EXPORT_AGE_DAYS || 7, 10);

class ExportService {
  async getStudentAttendance(studentId, startDate, endDate) {
    logger.info(
      `Fetching attendance for student: ${studentId}, startDate: ${startDate}, endDate: ${endDate}`
    );

    const query = {};

    if (studentId) {
      query.studentId = studentId;
      logger.info(`Filtering by studentId: ${studentId}`);
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
        logger.info(`Start date filter: ${startDate}`);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
        logger.info(`End date filter: ${endDate}`);
      }
    }

    logger.info(`MongoDB query: ${JSON.stringify(query)}`);

    const count = await AttendanceRecord.countDocuments(query);
    logger.info(`Found ${count} records matching query`);

    if (count === 0 && studentId) {
      logger.info(
        `No records found with exact studentId: ${studentId}. Checking all records...`
      );

      const allStudents = await AttendanceRecord.distinct("studentId");
      logger.info(
        `Available studentIds in database: ${JSON.stringify(allStudents)}`
      );

      if (allStudents.length > 0) {
        const fallbackStudentId = allStudents[0];
        logger.info(`Using fallback studentId: ${fallbackStudentId}`);

        query.studentId = fallbackStudentId;

        const sampleRecord = await AttendanceRecord.findOne({
          studentId: fallbackStudentId,
        });
        if (sampleRecord) {
          logger.info(`Sample record: ${JSON.stringify(sampleRecord)}`);
        }
      }
    }

    const records = await AttendanceRecord.find(query)
      .sort({ date: 1, startTime: 1 })
      .lean();

    logger.info(`Retrieved ${records.length} attendance records`);

    if (records.length > 0) {
      logger.info(`First record: ${JSON.stringify(records[0])}`);
    }

    return records;
  }

  async createExportJob(userId, studentId, format, startDate, endDate) {
    console.log("studentId", studentId);
    const jobId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + MAX_EXPORT_AGE_DAYS);


    const job = await ExportJob.create({
      jobId,
      userId,
      studentId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      format,
      status: "pending",
      expiresAt,
    });

    // Process the job asynchronously
    this.processExportJob(job).catch((err) =>
      logger.error(`Failed to process export job ${jobId}:`, err)
    );

    return job;
  }

  async processExportJob(job) {
    try {
      // Update job status to processing
      job.status = "processing";
      await job.save();

      // Create the output directory if it doesn't exist
      const outputDir = path.join(EXPORTS_DIR, job.userId || "anonymous");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
      const filename = `attendance_${job.studentId}_${timestamp}.${job.format}`;
      const outputPath = path.join(outputDir, filename);

      // Generate the export based on format
      let result;
      switch (job.format) {
        case "csv":
          result = await this.exportToCSV(
            job.studentId,
            job.startDate,
            job.endDate,
            outputPath
          );
          break;
        case "excel":
          result = await this.exportToExcel(
            job.studentId,
            job.startDate,
            job.endDate,
            outputPath
          );
          break;
        case "pdf":
          result = await this.exportToPDF(
            job.studentId,
            job.startDate,
            job.endDate,
            outputPath
          );
          break;
        case "json":
          result = await this.exportToJSON(
            job.studentId,
            job.startDate,
            job.endDate,
            outputPath
          );
          break;
        default:
          throw new Error(`Unsupported export format: ${job.format}`);
      }

      // Update job with success info
      job.status = "completed";
      job.filePath = outputPath;
      await job.save();

      logger.info(`Export job ${job.jobId} completed successfully`);
      return job;
    } catch (error) {
      logger.error(`Export job ${job.jobId} failed:`, error);

      // Update job with error info
      job.status = "failed";
      job.errorMessage = error.message;
      await job.save();

      throw error;
    }
  }

  async exportToCSV(studentId, startDate, endDate, outputPath) {
    const records = await this.getStudentAttendance(
      studentId,
      startDate,
      endDate
    );

    const csvWriter = createObjectCsvWriter({
      path: outputPath,
      header: [
        { id: "date", title: "Date" },
        { id: "className", title: "Class" },
        { id: "startTime", title: "Start Time" },
        { id: "endTime", title: "End Time" },
        { id: "status", title: "Status" },
        { id: "checkInTime", title: "Check-in Time" },
      ],
    });

    const data = records.map((record) => ({
      date: record.date ? format(new Date(record.date), "yyyy-MM-dd") : "N/A",
      className: record.className || "N/A",
      startTime: record.startTime || "N/A",
      endTime: record.endTime || "N/A",
      status: record.status || "N/A",
      checkInTime: record.checkInTime
        ? format(new Date(record.checkInTime), "HH:mm:ss")
        : "N/A",
    }));

    await csvWriter.writeRecords(data);
    return { filePath: outputPath, recordCount: records.length };
  }

  async exportToExcel(studentId, startDate, endDate, outputPath) {
    const records = await this.getStudentAttendance(
      studentId,
      startDate,
      endDate
    );
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Records");

    // Set up headers with styling
    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Class", key: "className", width: 30 },
      { header: "Start Time", key: "startTime", width: 12 },
      { header: "End Time", key: "endTime", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Check-in Time", key: "checkInTime", width: 18 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };

    // Add data
    records.forEach((record) => {
      worksheet.addRow({
        date: format(new Date(record.date), "yyyy-MM-dd"),
        className: record.className,
        startTime: record.startTime,
        endTime: record.endTime,
        status: record.status,
        checkInTime: record.checkInTime
          ? format(new Date(record.checkInTime), "HH:mm:ss")
          : "N/A",
      });
    });

    // Add summary statistics
    worksheet.addRow([]);
    worksheet.addRow(["Summary Statistics"]);

    const presentCount = records.filter((r) => r.status === "present").length;
    const lateCount = records.filter((r) => r.status === "late").length;
    const absentCount = records.filter((r) => r.status === "absent").length;

    worksheet.addRow([
      "Present",
      presentCount,
      `${((presentCount / records.length) * 100).toFixed(1)}%`,
    ]);
    worksheet.addRow([
      "Late",
      lateCount,
      `${((lateCount / records.length) * 100).toFixed(1)}%`,
    ]);
    worksheet.addRow([
      "Absent",
      absentCount,
      `${((absentCount / records.length) * 100).toFixed(1)}%`,
    ]);

    await workbook.xlsx.writeFile(outputPath);
    return { filePath: outputPath, recordCount: records.length };
  }

  async exportToPDF(studentId, startDate, endDate, outputPath) {
    const records = await this.getStudentAttendance(
      studentId,
      startDate,
      endDate
    );

    // Get student info from first record
    const studentName =
      records.length > 0 ? records[0].studentName : "Unknown Student";
    const studentNumber =
      records.length > 0 ? records[0].studentNumber : "Unknown";

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(outputPath));

    // Add header
    doc.fontSize(20).text("Attendance Report", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Student: ${studentName} (${studentNumber})`, { align: "left" });
    doc.moveDown();

    if (startDate && endDate) {
      doc.text(
        `Period: ${format(new Date(startDate), "yyyy-MM-dd")} to ${format(
          new Date(endDate),
          "yyyy-MM-dd"
        )}`
      );
      doc.moveDown();
    }

    // Add table header
    const tableTop = 150;
    const tableLeft = 50;
    const colWidths = [80, 150, 70, 70, 70, 90];

    // Draw table header
    doc.font("Helvetica-Bold");
    doc.text("Date", tableLeft, tableTop);
    doc.text("Class", tableLeft + colWidths[0], tableTop);
    doc.text("Start", tableLeft + colWidths[0] + colWidths[1], tableTop);
    doc.text(
      "End",
      tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
      tableTop
    );
    doc.text(
      "Status",
      tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      tableTop
    );
    doc.text(
      "Check-in",
      tableLeft +
        colWidths[0] +
        colWidths[1] +
        colWidths[2] +
        colWidths[3] +
        colWidths[4],
      tableTop
    );

    // Draw records
    doc.font("Helvetica");
    let y = tableTop + 20;

    records.forEach((record, i) => {
      // Check if we need a new page
      if (y > 700) {
        doc.addPage();
        y = 50;

        // Add header to new page
        doc.font("Helvetica-Bold");
        doc.text("Date", tableLeft, y);
        doc.text("Class", tableLeft + colWidths[0], y);
        doc.text("Start", tableLeft + colWidths[0] + colWidths[1], y);
        doc.text(
          "End",
          tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
          y
        );
        doc.text(
          "Status",
          tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
          y
        );
        doc.text(
          "Check-in",
          tableLeft +
            colWidths[0] +
            colWidths[1] +
            colWidths[2] +
            colWidths[3] +
            colWidths[4],
          y
        );
        doc.font("Helvetica");
        y += 20;
      }

      doc.text(format(new Date(record.date), "yyyy-MM-dd"), tableLeft, y);
      doc.text(record.className, tableLeft + colWidths[0], y, {
        width: colWidths[1],
        ellipsis: true,
      });
      doc.text(record.startTime, tableLeft + colWidths[0] + colWidths[1], y);
      doc.text(
        record.endTime,
        tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
        y
      );

      // Color-code status
      let statusColor = "black";
      if (record.status === "present") statusColor = "green";
      if (record.status === "late") statusColor = "orange";
      if (record.status === "absent") statusColor = "red";

      doc
        .fillColor(statusColor)
        .text(
          record.status,
          tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
          y
        )
        .fillColor("black");

      doc.text(
        record.checkInTime
          ? format(new Date(record.checkInTime), "HH:mm:ss")
          : "N/A",
        tableLeft +
          colWidths[0] +
          colWidths[1] +
          colWidths[2] +
          colWidths[3] +
          colWidths[4],
        y
      );

      y += 20;
    });

    // Add summary statistics
    y += 20;
    doc.moveDown().moveDown();

    const presentCount = records.filter((r) => r.status === "present").length;
    const lateCount = records.filter((r) => r.status === "late").length;
    const absentCount = records.filter((r) => r.status === "absent").length;

    doc.font("Helvetica-Bold").text("Summary", { underline: true });
    doc.moveDown();
    doc.font("Helvetica");
    doc.text(
      `Present: ${presentCount} (${(
        (presentCount / records.length) *
        100
      ).toFixed(1)}%)`
    );
    doc.text(
      `Late: ${lateCount} (${((lateCount / records.length) * 100).toFixed(1)}%)`
    );
    doc.text(
      `Absent: ${absentCount} (${((absentCount / records.length) * 100).toFixed(
        1
      )}%)`
    );

    // Finalize the PDF
    doc.end();

    return { filePath: outputPath, recordCount: records.length };
  }

  async exportToJSON(studentId, startDate, endDate, outputPath) {
    const records = await this.getStudentAttendance(
      studentId,
      startDate,
      endDate
    );

    // Transform records to a more compact JSON structure
    const jsonData = {
      studentId,
      studentName:
        records.length > 0 ? records[0].studentName : "Unknown Student",
      studentNumber: records.length > 0 ? records[0].studentNumber : "Unknown",
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      totalRecords: records.length,
      summary: {
        present: records.filter((r) => r.status === "present").length,
        late: records.filter((r) => r.status === "late").length,
        absent: records.filter((r) => r.status === "absent").length,
      },
      records: records.map((r) => ({
        date: r.date,
        className: r.className,
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status,
        checkInTime: r.checkInTime,
      })),
    };

    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
    return { filePath: outputPath, recordCount: records.length };
  }

  async getExportJobs(userId) {
    return ExportJob.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async getExportJob(jobId) {
    return ExportJob.findOne({ jobId });
  }

  async trackDownload(jobId) {
    const job = await ExportJob.findOne({ jobId });
    if (job) {
      job.downloadCount += 1;
      await job.save();
      return job;
    }
    return null;
  }

  async cleanupExpiredExports() {
    const expiredJobs = await ExportJob.find({
      expiresAt: { $lt: new Date() },
    });

    logger.info(`Found ${expiredJobs.length} expired export jobs to clean up`);

    for (const job of expiredJobs) {
      if (job.filePath && fs.existsSync(job.filePath)) {
        try {
          fs.unlinkSync(job.filePath);
          logger.info(`Deleted expired file: ${job.filePath}`);
        } catch (err) {
          logger.error(`Failed to delete expired file ${job.filePath}:`, err);
        }
      }

      await job.deleteOne();
    }

    return expiredJobs.length;
  }
}

module.exports = new ExportService();
