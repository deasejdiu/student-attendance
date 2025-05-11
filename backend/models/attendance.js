'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
      Attendance.belongsTo(models.Student, {
        foreignKey: 'studentId',
        as: 'student'
      });
      Attendance.belongsTo(models.Register, {
        foreignKey: 'registerId',
        as: 'register'
      });
    }
  }
  
  Attendance.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    registerId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late'),
      defaultValue: 'absent'
    },
    checkInTime: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Attendance',
  });
  
  return Attendance;
}; 