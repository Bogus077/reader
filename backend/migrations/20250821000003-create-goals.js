'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('goals', {
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
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      reward_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'achieved', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      required_bonuses: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      achieved_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('goals', ['student_id']);
    await queryInterface.addIndex('goals', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('goals', ['status']);
    await queryInterface.removeIndex('goals', ['student_id']);
    await queryInterface.dropTable('goals');
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_goals_status\";");
  },
};

