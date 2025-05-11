const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the attendance record
 *         studentId:
 *           type: string
 *           format: uuid
 *           description: The student id
 *         registerId:
 *           type: string
 *           format: uuid
 *           description: The register id
 *         status:
 *           type: string
 *           enum: [present, absent, late]
 *           description: The attendance status
 *         checkInTime:
 *           type: string
 *           format: date-time
 *           description: The time when attendance was marked
 *       example:
 *         id: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         studentId: 7c52dd51-026b-47a4-b9a7-f4b5b5c6ed5a
 *         registerId: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *         status: present
 *         checkInTime: 2023-04-15T09:15:00Z
 */

/**
 * @swagger
 * /attendance/url/{registerId}/{studentId}:
 *   get:
 *     summary: Get attendance URL for QR code generation
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: registerId
 *         schema:
 *           type: string
 *         required: true
 *         description: The register id
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     responses:
 *       200:
 *         description: The attendance URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attendanceUrl:
 *                   type: string
 *                 student:
 *                   type: object
 *                 register:
 *                   type: object
 *       404:
 *         description: Student or Register not found
 *       500:
 *         description: Server error
 */
router.get('/url/:registerId/:studentId', attendanceController.getAttendanceUrl);

/**
 * @swagger
 * /attendance/mark/{registerId}/{studentId}:
 *   get:
 *     summary: Mark attendance (QR code endpoint)
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: registerId
 *         schema:
 *           type: string
 *         required: true
 *         description: The register id
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 *       500:
 *         description: Server error
 */
router.get('/mark/:registerId/:studentId', attendanceController.markAttendance);

module.exports = router; 