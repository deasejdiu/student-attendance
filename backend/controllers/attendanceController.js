const { Student, Register, Attendance } = require('../models');

const attendanceController = {
  // Mark attendance when QR code is scanned
  async markAttendance(req, res) {
    try {
      const { registerId, studentId } = req.params;
      
      // Find the register to get the start time and check status
      const register = await Register.findByPk(registerId);
      if (!register) {
        return res.status(404).json({ message: 'Register not found' });
      }
      
      // Check if register is closed
      if (register.status === 'closed') {
        return res.status(403).json({ 
          message: 'Attendance cannot be marked for a closed register',
          closed: true
        });
      }
      
      // Find the student
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Current time
      const now = new Date();
      
      // Parse register date and start time
      const registerDate = new Date(register.date);
      const [startHours, startMinutes] = register.startTime.split(':').map(Number);
      
      // Set the register start time
      registerDate.setHours(startHours, startMinutes, 0, 0);
      
      // Calculate time difference in minutes
      const timeDifferenceMinutes = Math.floor((now - registerDate) / (1000 * 60));
      
      // Determine status based on time difference
      let status = 'present';
      if (timeDifferenceMinutes > 10) {
        status = 'late';
      }
      
      // Find or create attendance record
      const [attendance, created] = await Attendance.findOrCreate({
        where: { 
          studentId,
          registerId
        },
        defaults: {
          status,
          checkInTime: now
        },
        include: [
          { model: Student, as: 'student' },
          { model: Register, as: 'register' }
        ]
      });

      if (!created) {
        // If attendance already exists, update it
        attendance.status = status;
        attendance.checkInTime = now;
        await attendance.save();
        
        // Reload to get the associations
        await attendance.reload({
          include: [
            { model: Student, as: 'student' },
            { model: Register, as: 'register' }
          ]
        });
      }

      res.json({
        message: `Attendance marked as ${status}`,
        attendance
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get attendance URL for QR code generation (frontend will use this to generate QR)
  async getAttendanceUrl(req, res) {
    try {
      const { studentId, registerId } = req.params;
      
      // Verify that student and register exist
      const [student, register] = await Promise.all([
        Student.findByPk(studentId),
        Register.findByPk(registerId)
      ]);

      if (!student || !register) {
        return res.status(404).json({ 
          message: 'Student or Register not found' 
        });
      }
      
      // Check if register is closed
      if (register.status === 'closed') {
        return res.status(403).json({ 
          message: 'Cannot generate QR code for a closed register',
          closed: true
        });
      }

      // Generate the URL that the QR code will point to
      // Frontend will use this URL to generate the QR code
      const attendanceUrl = `/v1/attendance/mark/${registerId}/${studentId}`;
      
      res.json({ 
        attendanceUrl,
        student: {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`
        },
        register: {
          id: register.id,
          className: register.className,
          date: register.date,
          status: register.status
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = attendanceController; 