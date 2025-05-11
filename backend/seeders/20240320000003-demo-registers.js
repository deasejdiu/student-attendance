const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Registers", [
      {
        id: uuidv4(),
        className: "Mathematics 101",
        date: "2024-03-20",
        startTime: "09:00:00",
        endTime: "10:30:00",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        className: "Physics 101",
        date: "2024-03-20",
        startTime: "11:00:00",
        endTime: "12:30:00",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        className: "Chemistry 101",
        date: "2024-03-21",
        startTime: "14:00:00",
        endTime: "15:30:00",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "77777777-7777-7777-7777-777777777777",
        className: "Biology 101",
        date: "2024-03-21",
        startTime: "16:00:00",
        endTime: "17:30:00",
        status: "closed",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Registers", null, {});
  },
};
