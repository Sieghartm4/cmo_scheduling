'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('post', {
      post_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      post_mu_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'master_user',
          key: 'mu_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      post_mc_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'master_category',
          key: 'mc_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      post_content: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
            post_embed_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      post_status: {
        type: Sequelize.ENUM('published', 'draft'),
        allowNull: false,
        defaultValue: 'published'
      },
      post_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      post_updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('post');
  }
};
