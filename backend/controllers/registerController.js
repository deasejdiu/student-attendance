const { Register, Student, Attendance, RegisterStudent, sequelize } = require('../models');

const registerController = {
  // Create a new register with assigned students
  async createRegister(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { className, date, startTime, endTime, studentIds } = req.body;
      
      // Create the register
      const register = await Register.create({
        className,
        date,
        startTime,
        endTime,
        status: 'active'
      }, { transaction });

      // If studentIds are provided, assign students to the register
      if (studentIds && studentIds.length > 0) {
        // Create register-student associations
        const registerStudents = studentIds.map(studentId => ({
          registerId: register.id,
          studentId
        }));
        
        await RegisterStudent.bulkCreate(registerStudents, { transaction });
        
        // Create initial attendance records for all assigned students
        const attendanceRecords = studentIds.map(studentId => ({
          registerId: register.id,
          studentId,
          status: 'absent'
        }));
        
        await Attendance.bulkCreate(attendanceRecords, { transaction });
      }

      await transaction.commit();

      // Fetch the register with its students to return in the response
      const registerWithStudents = await Register.findByPk(register.id, {
        include: [
          {
            model: Student,
            as: 'students',
            through: { attributes: [] } // Don't include junction table attributes
          }
        ]
      });

      res.status(201).json(registerWithStudents);
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ error: error.message });
    }
  },

  // Get all registers with their assigned students
  async getAllRegisters(req, res) {
    try {
      const registers = await Register.findAll({
        include: [
          {
            model: Student,
            as: 'students',
            through: { attributes: [] }
          }
        ],
        order: [['date', 'DESC'], ['startTime', 'ASC']]
      });
      
      res.json(registers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get register by ID with attendance records and assigned students
  async getRegisterById(req, res) {
    try {
      const register = await Register.findByPk(req.params.id, {
        include: [
          {
            model: Attendance,
            as: 'attendances',
            include: [{
              model: Student,
              as: 'student',
              attributes: ['id', 'firstName', 'lastName', 'studentId']
            }]
          },
          {
            model: Student,
            as: 'students',
            through: { attributes: [] }
          }
        ]
      });

      if (!register) {
        return res.status(404).json({ message: 'Register not found' });
      }

      res.json(register);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a register
  async updateRegister(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { className, date, startTime, endTime, status, studentIds } = req.body;
      
      const register = await Register.findByPk(id);
      
      if (!register) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Register not found' });
      }
      
      // Update register details
      await register.update({
        className: className || register.className,
        date: date || register.date,
        startTime: startTime || register.startTime,
        endTime: endTime || register.endTime,
        status: status || register.status
      }, { transaction });
      
      // If studentIds are provided, update student assignments
      if (studentIds) {
        // Remove all existing student associations
        await RegisterStudent.destroy({
          where: { registerId: id },
          transaction
        });
        
        // Create new student associations
        if (studentIds.length > 0) {
          const registerStudents = studentIds.map(studentId => ({
            registerId: id,
            studentId
          }));
          
          await RegisterStudent.bulkCreate(registerStudents, { transaction });
          
          // Get current attendance records
          const existingAttendances = await Attendance.findAll({
            where: { registerId: id },
            attributes: ['studentId'],
            raw: true,
            transaction
          });
          
          const existingStudentIds = existingAttendances.map(a => a.studentId);
          
          // Create attendance records for newly added students
          const newStudentIds = studentIds.filter(id => !existingStudentIds.includes(id));
          
          if (newStudentIds.length > 0) {
            const newAttendances = newStudentIds.map(studentId => ({
              registerId: id,
              studentId,
              status: 'absent'
            }));
            
            await Attendance.bulkCreate(newAttendances, { transaction });
          }
        }
      }
      
      await transaction.commit();
      
      // Fetch the updated register with its students
      const updatedRegister = await Register.findByPk(id, {
        include: [
          {
            model: Student,
            as: 'students',
            through: { attributes: [] }
          }
        ]
      });
      
      res.json(updatedRegister);
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ error: error.message });
    }
  },

  // Delete register
  async deleteRegister(req, res) {
    try {
      const register = await Register.findByPk(req.params.id);

      if (!register) {
        return res.status(404).json({ message: 'Register not found' });
      }

      await register.destroy();
      res.json({ message: 'Register deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get today's registers with attendance records and assigned students
  async getTodayRegisters(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const registers = await Register.findAll({
        where: {
          date: today
        },
        include: [
          {
            model: Attendance,
            as: 'attendances',
            include: [{
              model: Student,
              as: 'student',
              attributes: ['id', 'firstName', 'lastName', 'studentId']
            }]
          },
          {
            model: Student,
            as: 'students',
            through: { attributes: [] }
          }
        ],
        order: [['startTime', 'ASC']]
      });

      res.json(registers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = registerController; 