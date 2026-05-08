'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('appointment', {
      app_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      app_mu_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'master_user',
          key: 'mu_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      app_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      app_start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      app_end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      app_reason: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      app_status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'cancelled', 'done'),
        allowNull: false,
        defaultValue: 'pending'
      },
      app_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      app_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('appointment');
  }
};
