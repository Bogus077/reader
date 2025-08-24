'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      action: {
        type: Sequelize.ENUM('progress_open', 'history_open', 'today_open', 'library_open'),
        allowNull: false,
      },
      metadata: {
        type: Sequelize.JSONB,
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

    await queryInterface.addIndex('logs', ['user_id'], { name: 'logs_user_id_idx' });
    await queryInterface.addIndex('logs', ['action'], { name: 'logs_action_idx' });
    await queryInterface.addIndex('logs', ['createdAt'], { name: 'logs_createdAt_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('logs');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_logs_action";');
  },
};
