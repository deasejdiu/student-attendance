'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RegisterStudent extends Model {
    static associate(models) {
      // No additional associations needed as this is a junction table
    }
  }
  
  RegisterStudent.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    registerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Registers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Students',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'RegisterStudent',
  });
  
  return RegisterStudent;
}; 