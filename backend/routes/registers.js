const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Register:
 *       type: object
 *       required:
 *         - className
 *         - date
 *         - startTime
 *         - endTime
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the register
 *         className:
 *           type: string
 *           description: The name of the class
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the class
 *         startTime:
 *           type: string
 *           format: time
 *           description: The start time of the class
 *         endTime:
 *           type: string
 *           format: time
 *           description: The end time of the class
 *         status:
 *           type: string
 *           enum: [active, closed]
 *           description: The status of the register
 *       example:
 *         id: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         className: Mathematics 101
 *         date: 2023-04-15
 *         startTime: 09:00:00
 *         endTime: 10:30:00
 *         status: active
 */

/**
 * @swagger
 * /registers:
 *   post:
 *     summary: Create a new register
 *     tags: [Registers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - className
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               className:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: The register was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Register'
 *       500:
 *         description: Server error
 */
router.post('/', registerController.createRegister);

/**
 * @swagger
 * /registers:
 *   get:
 *     summary: Returns the list of all registers
 *     tags: [Registers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of registers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Register'
 *       500:
 *         description: Server error
 */
router.get('/', registerController.getAllRegisters);

/**
 * @swagger
 * /registers/today:
 *   get:
 *     summary: Get all registers for today
 *     tags: [Registers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of today's registers with attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Register'
 *       500:
 *         description: Server error
 */
router.get('/today', registerController.getTodayRegisters);

/**
 * @swagger
 * /registers/{id}:
 *   get:
 *     summary: Get a register by id
 *     tags: [Registers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The register id
 *     responses:
 *       200:
 *         description: The register with attendance records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Register'
 *       404:
 *         description: The register was not found
 *       500:
 *         description: Server error
 */
router.get('/:id', registerController.getRegisterById);

/**
 * @swagger
 * /registers/{id}:
 *   put:
 *     summary: Update a register
 *     tags: [Registers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The register id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               className:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               status:
 *                 type: string
 *                 enum: [active, closed]
 *     responses:
 *       200:
 *         description: The register was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Register'
 *       404:
 *         description: The register was not found
 *       500:
 *         description: Server error
 */
router.put('/:id', registerController.updateRegister);

/**
 * @swagger
 * /registers/{id}:
 *   delete:
 *     summary: Delete a register
 *     tags: [Registers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The register id
 *     responses:
 *       200:
 *         description: The register was deleted
 *       404:
 *         description: The register was not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', registerController.deleteRegister);

module.exports = router; 