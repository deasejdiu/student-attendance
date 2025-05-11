const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - studentId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the student
 *         firstName:
 *           type: string
 *           description: The student's first name
 *         lastName:
 *           type: string
 *           description: The student's last name
 *         email:
 *           type: string
 *           format: email
 *           description: The student's email
 *         studentId:
 *           type: string
 *           description: The student's ID number
 *       example:
 *         id: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         studentId: S12345
 */

/**
 * @swagger
 * /students/search:
 *   get:
 *     summary: Search for students by name, email, or ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term to find matching students
 *     responses:
 *       200:
 *         description: List of students matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       500:
 *         description: Server error
 */
router.get('/search', studentController.searchStudents);

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - studentId
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               studentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: The student was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: Student already exists
 *       500:
 *         description: Server error
 */
router.post('/', studentController.createStudent);

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Returns the list of all students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       500:
 *         description: Server error
 */
router.get('/', studentController.getAllStudents);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get a student by id with attendance records
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     responses:
 *       200:
 *         description: The student with attendance records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: The student was not found
 *       500:
 *         description: Server error
 */
router.get('/:id', studentController.getStudentById);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               studentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: The student was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: Email or student ID already in use
 *       404:
 *         description: The student was not found
 *       500:
 *         description: Server error
 */
router.put('/:id', studentController.updateStudent);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     responses:
 *       200:
 *         description: The student was deleted
 *       404:
 *         description: The student was not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', studentController.deleteStudent);

module.exports = router; 