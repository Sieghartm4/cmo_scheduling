'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('master_social_media', {
      msm_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      msm_mu_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Linked user ID (optional)',
      },
      msm_platform: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Social platform name, e.g. facebook, youtube, tiktok',
      },
      msm_url: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
        comment: 'Social media profile URL or link',
      },
      msm_status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      msm_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      msm_updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    })

    await queryInterface.addIndex('master_social_media', ['msm_platform'])
    await queryInterface.addIndex('master_social_media', ['msm_status'])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('master_social_media')
  },
}
