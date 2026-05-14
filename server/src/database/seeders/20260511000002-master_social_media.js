'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'master_social_media',
      [
        {
          msm_mu_id: 1,
          msm_platform: 'facebook',
          msm_url: 'https://www.facebook.com/example',
          msm_status: 'active',
          msm_created_at: new Date(),
          msm_updated_at: new Date(),
        },
        {
          msm_mu_id: 1,
          msm_platform: 'youtube',
          msm_url: 'https://www.youtube.com/@example',
          msm_status: 'active',
          msm_created_at: new Date(),
          msm_updated_at: new Date(),
        },
        {
          msm_mu_id: 2,
          msm_platform: 'tiktok',
          msm_url: 'https://www.tiktok.com/@example',
          msm_status: 'active',
          msm_created_at: new Date(),
          msm_updated_at: new Date(),
        },
        {
          msm_mu_id: 2,
          msm_platform: 'instagram',
          msm_url: 'https://www.instagram.com/example',
          msm_status: 'active',
          msm_created_at: new Date(),
          msm_updated_at: new Date(),
        },
      ],
      {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('master_social_media', null, {})
  },
}
