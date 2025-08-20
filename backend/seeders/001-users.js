"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", [
      {
        telegram_id: "1000",
        role: "mentor",
        name: "Mentor",
        tz: "Europe/Samara",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        telegram_id: "2000",
        role: "student",
        name: "Student",
        tz: "Europe/Samara",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", {
      telegram_id: ["1000", "2000"],
    });
  },
};
