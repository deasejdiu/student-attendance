"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Attendances", [
      {
        id: uuidv4(),
        studentId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        registerId: "44444444-4444-4444-4444-444444444444",
        status: "present",
        checkInTime: new Date("2024-03-20 09:05:00"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        studentId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        registerId: "44444444-4444-4444-4444-444444444444",
        status: "late",
        checkInTime: new Date("2024-03-20 09:15:00"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        studentId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        registerId: "55555555-5555-5555-5555-555555555555",
        status: "present",
        checkInTime: new Date("2024-03-20 11:02:00"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        studentId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        registerId: "66666666-6666-6666-6666-666666666666",
        status: "absent",
        checkInTime: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        studentId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        registerId: "77777777-7777-7777-7777-777777777777",
        status: "present",
        checkInTime: new Date("2024-03-21 16:01:00"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Attendances", null, {});
  },
};
