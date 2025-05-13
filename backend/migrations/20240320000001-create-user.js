'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      role: {
        type: Sequelize.ENUM('admin', 'teacher'),
        defaultValue: 'teacher'
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verificationToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add resetToken and resetTokenExpiry columns
    await queryInterface.addColumn('Users', 'resetToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'resetTokenExpiry', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove resetToken and resetTokenExpiry columns
    await queryInterface.removeColumn('Users', 'resetToken');
    await queryInterface.removeColumn('Users', 'resetTokenExpiry');

    // Drop the Users table
    await queryInterface.dropTable('Users');
  }
};