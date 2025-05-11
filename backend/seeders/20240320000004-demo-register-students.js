"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("RegisterStudents", [
      {
        id: uuidv4(),
        registerId: "44444444-4444-4444-4444-444444444444",
        studentId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        registerId: "44444444-4444-4444-4444-444444444444",
        studentId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        registerId: "55555555-5555-5555-5555-555555555555",
        studentId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        registerId: "66666666-6666-6666-6666-666666666666",
        studentId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        registerId: "77777777-7777-7777-7777-777777777777",
        studentId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("RegisterStudents", null, {});
  },
};
