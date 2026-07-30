'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get table description to check which columns exist
    const tableDescription = await queryInterface.describeTable('home_page_settings')

    // Remove hero-related columns from home_page_settings table if they exist
    if (tableDescription.hps_welcome_badge) {
      await queryInterface.removeColumn('home_page_settings', 'hps_welcome_badge')
    }
    if (tableDescription.hps_hero_title) {
      await queryInterface.removeColumn('home_page_settings', 'hps_hero_title')
    }
    if (tableDescription.hps_hero_description) {
      await queryInterface.removeColumn('home_page_settings', 'hps_hero_description')
    }
    if (tableDescription.hps_background_value) {
      await queryInterface.removeColumn('home_page_settings', 'hps_background_value')
    }
    
    // Add homepage_image column if it doesn't exist
    if (!tableDescription.hps_homepage_image) {
      await queryInterface.addColumn('home_page_settings', 'hps_homepage_image', {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Homepage background image (base64 or URL)',
      })
    }
  },

  async down(queryInterface, Sequelize) {
    // Get table description to check which columns exist
    const tableDescription = await queryInterface.describeTable('home_page_settings')

    // Remove homepage_image column if it exists
    if (tableDescription.hps_homepage_image) {
      await queryInterface.removeColumn('home_page_settings', 'hps_homepage_image')
    }
    
    // Re-add the removed columns if they don't exist
    if (!tableDescription.hps_welcome_badge) {
      await queryInterface.addColumn('home_page_settings', 'hps_welcome_badge', {
        type: Sequelize.STRING(255),
        allowNull: true,
      })
    }
    if (!tableDescription.hps_hero_title) {
      await queryInterface.addColumn('home_page_settings', 'hps_hero_title', {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      })
    }
    if (!tableDescription.hps_hero_description) {
      await queryInterface.addColumn('home_page_settings', 'hps_hero_description', {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      })
    }
    if (!tableDescription.hps_background_value) {
      await queryInterface.addColumn('home_page_settings', 'hps_background_value', {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'CSS gradient/color, base64 image data, or image URL',
      })
    }
  },
}
