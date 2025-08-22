"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Сначала очищаем таблицу, чтобы избежать конфликтов
    await queryInterface.bulkDelete("users", null, {});

    // Вставляем записи с фиксированными id, чтобы совпадали с мок-токенами
    await queryInterface.bulkInsert("users", [
      {
        id: 3,
        telegram_id: "382388583",
        role: "mentor",
        name: "Владислав Андреевич",
        tz: "Europe/Samara",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
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
    await queryInterface.bulkDelete("users", null, {});
  },
};
