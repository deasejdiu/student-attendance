const AttendanceRecord = require('../models/AttendanceRecord');
const { createLogger } = require('../utils/logger');

const logger = createLogger('analytics-service');

class AnalyticsService {
  // Get attendance summary statistics for a student
  async getStudentSummary(studentId, startDate, endDate) {
    const matchStage = { studentId };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    
    const result = await AttendanceRecord.aggregate([
      { $match: matchStage },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      }
    ]);
    
    // Format into a more user-friendly structure
    const statusCounts = {
      present: 0,
      absent: 0,
      late: 0
    };
    
    result.forEach(item => {
      statusCounts[item.status] = item.count;
    });
    
    const totalClasses = statusCounts.present + statusCounts.absent + statusCounts.late;
    const attendanceRate = totalClasses > 0 
      ? ((statusCounts.present + statusCounts.late) / totalClasses * 100).toFixed(1) 
      : 0;
    
    return {
      studentId,
      totalClasses,
      present: statusCounts.present,
      absent: statusCounts.absent,
      late: statusCounts.late,
      attendanceRate: parseFloat(attendanceRate)
    };
  }
  
  // Get attendance trends over time
  async getAttendanceTrends(studentId, startDate, endDate, interval = 'month') {
    let dateFormat;
    let groupId;
    
    // Set the date format and grouping based on the interval
    switch(interval) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        groupId = { 
          year: { $year: '$date' }, 
          month: { $month: '$date' }, 
          day: { $dayOfMonth: '$date' } 
        };
        break;
      case 'week':
        dateFormat = '%Y-W%U';  // Year-Week format
        groupId = { 
          year: { $year: '$date' }, 
          week: { $week: '$date' } 
        };
        break;
      case 'month':
      default:
        dateFormat = '%Y-%m';
        groupId = { 
          year: { $year: '$date' }, 
          month: { $month: '$date' } 
        };
    }
    
    const matchStage = { studentId };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    
    const result = await AttendanceRecord.aggregate([
      { $match: matchStage },
      { $group: {
          _id: {
            timePeriod: groupId,
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $project: {
          _id: 0,
          timePeriod: {
            $dateToString: { format: dateFormat, date: '$_id.timePeriod' }
          },
          status: '$_id.status',
          count: 1
        }
      },
      { $sort: { timePeriod: 1 } }
    ]);
    
    // Transform into a more usable format - with dates as keys
    const trends = {};
    
    result.forEach(item => {
      if (!trends[item.timePeriod]) {
        trends[item.timePeriod] = { present: 0, absent: 0, late: 0 };
      }
      trends[item.timePeriod][item.status] = item.count;
    });
    
    // Convert to array format
    return Object.keys(trends).map(period => ({
      period,
      present: trends[period].present,
      absent: trends[period].absent,
      late: trends[period].late,
      total: trends[period].present + trends[period].absent + trends[period].late
    }));
  }
  
  // Get additional attendance insights
  async getAttendanceInsights(studentId) {
    // Most missed classes (by class name)
    const mostMissedClasses = await AttendanceRecord.aggregate([
      { $match: { studentId, status: 'absent' } },
      { $group: {
          _id: '$className',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: {
          _id: 0,
          className: '$_id',
          absences: '$count'
        }
      }
    ]);
    
    // Attendance by day of week
    const byDayOfWeek = await AttendanceRecord.aggregate([
      { $match: { studentId } },
      { $addFields: {
          dayOfWeek: { $dayOfWeek: '$date' }  // 1 for Sunday, 2 for Monday, etc.
        }
      },
      { $group: {
          _id: {
            dayOfWeek: '$dayOfWeek',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $project: {
          _id: 0,
          dayOfWeek: '$_id.dayOfWeek',
          status: '$_id.status',
          count: 1
        }
      },
      { $sort: { dayOfWeek: 1, status: 1 } }
    ]);
    
    // Transform day of week data
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const attendanceByDay = {};
    
    byDayOfWeek.forEach(item => {
      const dayName = dayNames[item.dayOfWeek - 1];
      if (!attendanceByDay[dayName]) {
        attendanceByDay[dayName] = { present: 0, absent: 0, late: 0 };
      }
      attendanceByDay[dayName][item.status] = item.count;
    });
    
        // Calculate attendance rate by day
        Object.keys(attendanceByDay).forEach(day => {
            const stats = attendanceByDay[day];
            const total = stats.present + stats.absent + stats.late;
            attendanceByDay[day].total = total;
            attendanceByDay[day].attendanceRate = total > 0 
              ? ((stats.present + stats.late) / total * 100).toFixed(1) 
              : 0;
          });
          
          // Format attendance by day as array
          const attendanceByDayArray = Object.keys(attendanceByDay).map(day => ({
            day,
            ...attendanceByDay[day],
            attendanceRate: parseFloat(attendanceByDay[day].attendanceRate)
          }));
          
          return {
            mostMissedClasses,
            attendanceByDay: attendanceByDayArray
          };
        }
        
        // Get comparative statistics (how student compares with peers)
        async getComparativeStats(studentId, classId = null) {
          // Get overall student stats
          const studentStats = await this.getStudentSummary(studentId);
          
          // Get average stats for all students in the same classes
          const query = classId ? { registerId: classId } : {};
          
          const overallStats = await AttendanceRecord.aggregate([
            { $match: query },
            { $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            },
            { $project: {
                _id: 0,
                status: '$_id',
                count: 1
              }
            }
          ]);
          
          // Calculate overall attendance rate
          const statusCounts = {
            present: 0,
            absent: 0,
            late: 0
          };
          
          overallStats.forEach(item => {
            statusCounts[item.status] = item.count;
          });
          
          const totalClasses = statusCounts.present + statusCounts.absent + statusCounts.late;
          const overallAttendanceRate = totalClasses > 0 
            ? ((statusCounts.present + statusCounts.late) / totalClasses * 100).toFixed(1) 
            : 0;
          
          return {
            student: studentStats,
            overall: {
              totalRecords: totalClasses,
              present: statusCounts.present,
              absent: statusCounts.absent,
              late: statusCounts.late,
              attendanceRate: parseFloat(overallAttendanceRate)
            },
            comparison: {
              attendanceRateDifference: parseFloat((studentStats.attendanceRate - overallAttendanceRate).toFixed(1))
            }
          };
        }
      }
      
      module.exports = new AnalyticsService();