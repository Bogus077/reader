"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", [
      {
        telegram_id: "382388583",
        role: "mentor",
        name: "Владислав Андреевич",
        tz: "Europe/Samara",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        telegram_id: "7797299499",
        role: "student",
        name: "Ирина",
        tz: "Europe/Samara",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", {
      telegram_id: ["382388583", "7797299499"],
    });
  },
};
