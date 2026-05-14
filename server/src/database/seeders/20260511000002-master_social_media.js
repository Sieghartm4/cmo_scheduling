'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'master_social_media',
      [
        {
          msm_id: 6,
          msm_platform: 'linkedin',
          msm_url: 'https://www.linkedin.com/in/lorenz-bagapuro-320a67194/',
          msm_status: 'active',
          msm_created_at: new Date('2026-05-14T04:36:12.000Z'),
          msm_updated_at: new Date('2026-05-14T04:36:12.000Z'),
        },
        {
          msm_id: 5,
          msm_platform: 'twitter',
          msm_url:
            'https://twitter.com/Theanxietynurse?fbclid=IwAR0kWZIa_nIbooKrESebvIkN18L2h5vGKZlYbee2TDNn8yyacoO_pKzPsp4',
          msm_status: 'active',
          msm_created_at: new Date('2026-05-14T04:35:29.000Z'),
          msm_updated_at: new Date('2026-05-14T04:35:29.000Z'),
        },
        {
          msm_id: 1,
          msm_platform: 'facebook',
          msm_url: 'https://www.facebook.com/profile.php?id=100088542517594',
          msm_status: 'active',
          msm_created_at: new Date('2026-05-13T16:39:15.000Z'),
          msm_updated_at: new Date('2026-05-14T04:35:14.000Z'),
        },
        {
          msm_id: 2,
          msm_platform: 'youtube',
          msm_url: 'https://www.youtube.com/@theanxietynurse/featured',
          msm_status: 'active',
          msm_created_at: new Date('2026-05-13T16:39:15.000Z'),
          msm_updated_at: new Date('2026-05-14T04:35:42.000Z'),
        },
        {
          msm_id: 3,
          msm_platform: 'tiktok',
          msm_url: 'https://www.tiktok.com/@theanxietynurse',
          msm_status: 'active',
          msm_created_at: new Date('2026-05-13T16:39:15.000Z'),
          msm_updated_at: new Date('2026-05-14T04:36:19.000Z'),
        },
        {
          msm_id: 4,
          msm_platform: 'instagram',
          msm_url:
            'https://www.instagram.com/The_anxietynurse/?fbclid=IwAR2WxEH02DV-0J8BLFrqGOasEo2iNAMRYJ0ENdFTme9LnG4WFIyudwCTyOw',
          msm_status: 'active',
          msm_created_at: new Date('2026-05-13T16:39:15.000Z'),
          msm_updated_at: new Date('2026-05-14T04:35:55.000Z'),
        },
      ],
      {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('master_social_media', null, {})
  },
}
