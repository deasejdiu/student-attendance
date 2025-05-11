'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    static associate(models) {
      Student.hasMany(models.Attendance, {
        foreignKey: 'studentId',
        as: 'attendances'
      });
      
      // Add many-to-many relationship with Register
      Student.belongsToMany(models.Register, {
        through: models.RegisterStudent,
        foreignKey: 'studentId',
        otherKey: 'registerId',
        as: 'registers'
      });
    }
  }
  
  Student.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Student',
  });
  
  return Student;
}; 