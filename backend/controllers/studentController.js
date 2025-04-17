const { Student, Attendance, Register } = require('../models');
const { Sequelize, Op } = require('sequelize');

const studentController = {
  // Create a new student
  async createStudent(req, res) {
    try {
      const { firstName, lastName, email, studentId } = req.body;
      
      // Check if student with same email or studentId already exists
      const existingStudent = await Student.findOne({
        where: {
          [Sequelize.Op.or]: [
            { email },
            { studentId }
          ]
        }
      });

      if (existingStudent) {
        return res.status(400).json({ 
          message: 'Student with this email or student ID already exists' 
        });
      }

      const student = await Student.create({
        firstName,
        lastName,
        email,
        studentId
      });

      res.status(201).json(student);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all students
  async getAllStudents(req, res) {
    try {
      const students = await Student.findAll();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get student by ID with their attendance records
  async getStudentById(req, res) {
    try {
      const student = await Student.findByPk(req.params.id, {
        include: [{
          model: Attendance,
          as: 'attendances',
          include: ['register']
        }]
      });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a student by ID
  async updateStudent(req, res) {
    try {
      const { firstName, lastName, email, studentId } = req.body;
      
      // Find the student first
      const student = await Student.findByPk(req.params.id);
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Check if email or studentId already exists for another student
      if (email !== student.email || studentId !== student.studentId) {
        const existingStudent = await Student.findOne({
          where: {
            [Sequelize.Op.and]: [
              { id: { [Sequelize.Op.ne]: req.params.id } },
              { 
                [Sequelize.Op.or]: [
                  { email },
                  { studentId }
                ]
              }
            ]
          }
        });
        
        if (existingStudent) {
          return res.status(400).json({ 
            message: 'Email or student ID already in use by another student' 
          });
        }
      }
      
      // Update the student
      await student.update({
        firstName,
        lastName,
        email,
        studentId
      });
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  // Delete a student by ID
  async deleteStudent(req, res) {
    try {
      const student = await Student.findByPk(req.params.id);
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      await student.destroy();
      
      res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add a new search method
  async searchStudents(req, res) {
    try {
      const { query } = req.query;
      
      if (!query || query.trim() === '') {
        // If no search query, return all students
        const students = await Student.findAll();
        return res.json(students);
      }
      
      // Perform advanced search
      const students = await Student.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${query}%` } },
            { lastName: { [Op.iLike]: `%${query}%` } },
            { email: { [Op.iLike]: `%${query}%` } },
            { studentId: { [Op.iLike]: `%${query}%` } },
            Sequelize.literal(`CONCAT("firstName", ' ', "lastName") ILIKE '%${query.replace(/'/g, "''")}%'`)
          ]
        }
      });
      
      res.json(students);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = studentController; 