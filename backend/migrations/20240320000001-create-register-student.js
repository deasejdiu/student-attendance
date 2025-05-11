'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('RegisterStudents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      registerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Registers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      studentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Students',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add a unique constraint to prevent duplicate entries
    await queryInterface.addConstraint('RegisterStudents', {
      fields: ['registerId', 'studentId'],
      type: 'unique',
      name: 'unique_register_student'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('RegisterStudents');
  }
}; 