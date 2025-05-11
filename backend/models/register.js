'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Register extends Model {
    static associate(models) {
      Register.hasMany(models.Attendance, {
        foreignKey: 'registerId',
        as: 'attendances'
      });
      
      // Add many-to-many relationship with Student
      Register.belongsToMany(models.Student, {
        through: models.RegisterStudent,
        foreignKey: 'registerId',
        otherKey: 'studentId',
        as: 'students'
      });
    }
  }
  
  Register.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    className: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'closed'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'Register',
  });
  
  return Register;
}; 