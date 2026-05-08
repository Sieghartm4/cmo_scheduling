'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('post_comment', {
      pc_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      pc_post_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'post',
          key: 'post_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pc_mu_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'master_user',
          key: 'mu_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pc_parent_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'post_comment',
          key: 'pc_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pc_comment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      pc_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('post_comment');
  }
};
