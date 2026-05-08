'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('conversation', {
      con_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      con_user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'master_user',
          key: 'mu_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      con_admin_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'master_user',
          key: 'mu_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      con_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      con_last_message_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('conversation');
  }
};
