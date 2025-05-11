const express = require("express");
const router = express.Router();
const { Attendance, Student, Register } = require("../models");
const { Op } = require("sequelize");

// Get all attendance records for export service
router.get("/attendance/all", async (req, res) => {
  try {
    const attendances = await Attendance.findAll({
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "firstName", "lastName", "studentId"],
        },
        {
          model: Register,
          as: "register",
          attributes: ["id", "className", "date", "startTime", "endTime"],
        },
      ],
    });

    // Transform to the format expected by the export service
    const formattedAttendances = attendances.map((attendance) => ({
      id: attendance.id,
      studentId: attendance.student.id,
      studentName: `${attendance.student.firstName} ${attendance.student.lastName}`,
      studentNumber: attendance.student.studentId,
      registerId: attendance.register.id,
      className: attendance.register.className,
      date: attendance.register.date,
      startTime: attendance.register.startTime,
      endTime: attendance.register.endTime,
      status: attendance.status,
      checkInTime: attendance.checkInTime,
    }));

    res.json(formattedAttendances);
  } catch (error) {
    console.error("Error fetching all attendance records:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get attendance records updated since a specific time
router.get("/attendance/updated", async (req, res) => {
  try {
    const { since } = req.query;

    if (!since) {
      return res.status(400).json({ error: "Missing since parameter" });
    }

    const sinceDate = new Date(since);

    const attendances = await Attendance.findAll({
      where: {
        updatedAt: { [Op.gte]: sinceDate },
      },
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "firstName", "lastName", "studentId"],
        },
        {
          model: Register,
          as: "register",
          attributes: ["id", "className", "date", "startTime", "endTime"],
        },
      ],
    });

    // Transform to the format expected by the export service
    const formattedAttendances = attendances.map((attendance) => ({
      id: attendance.id,
      studentId: attendance.student.id,
      studentName: `${attendance.student.firstName} ${attendance.student.lastName}`,
      studentNumber: attendance.student.studentId,
      registerId: attendance.register.id,
      className: attendance.register.className,
      date: attendance.register.date,
      startTime: attendance.register.startTime,
      endTime: attendance.register.endTime,
      status: attendance.status,
      checkInTime: attendance.checkInTime,
    }));

    res.json(formattedAttendances);
  } catch (error) {
    console.error("Error fetching updated attendance records:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
