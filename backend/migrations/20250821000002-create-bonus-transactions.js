'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bonus_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      assignment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
        references: {
          model: 'assignments',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      delta: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      source: {
        type: Sequelize.ENUM('grade', 'manual', 'reset'),
        allowNull: false,
        defaultValue: 'grade',
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('bonus_transactions', ['student_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('bonus_transactions', ['student_id']);
    await queryInterface.dropTable('bonus_transactions');
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_bonus_transactions_source\";");
  },
};
