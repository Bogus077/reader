'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_books', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('active', 'finished', 'paused'),
        allowNull: false,
        defaultValue: 'active'
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE')
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      progress_mode: {
        type: Sequelize.ENUM('percent', 'page'),
        allowNull: false,
        defaultValue: 'percent'
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_books');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_student_books_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_student_books_progress_mode";');
  }
};
