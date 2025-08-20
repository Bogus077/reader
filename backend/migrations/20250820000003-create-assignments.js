'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('assignments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      student_book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'student_books',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      deadline_time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      target_percent: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      target_page: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      target_chapter: {
        type: Sequelize.STRING,
        allowNull: true
      },
      target_last_paragraph: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'submitted', 'missed', 'graded'),
        allowNull: false,
        defaultValue: 'pending'
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Создаем уникальный индекс на (student_book_id, date)
    await queryInterface.addIndex('assignments', ['student_book_id', 'date'], {
      unique: true,
      name: 'assignments_student_book_date_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('assignments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assignments_status";');
  }
};
