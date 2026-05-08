'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('conversation_message', {
      cm_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      cm_con_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'conversation',
          key: 'con_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cm_sender_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'master_user',
          key: 'mu_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cm_message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cm_type: {
        type: Sequelize.ENUM('text', 'image', 'file'),
        allowNull: false,
        defaultValue: 'text'
      },
      cm_file: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      cm_seen: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0
      },
      cm_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('conversation_message');
  }
};
