'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('assignments', ['status'], {
      name: 'assignments_status_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('assignments', 'assignments_status_index');
  }
};
