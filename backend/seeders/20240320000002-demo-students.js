"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Students", [
      {
        id: uuidv4(),
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.j@student.com",
        studentId: "STU003",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        firstName: "Emily",
        lastName: "Brown",
        email: "emily.b@student.com",
        studentId: "STU004",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        firstName: "David",
        lastName: "Wilson",
        email: "david.w@student.com",
        studentId: "STU005",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Students", null, {});
  },
};
