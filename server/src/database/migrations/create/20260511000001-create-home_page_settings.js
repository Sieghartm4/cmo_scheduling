'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('home_page_settings', {
      hps_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      hps_welcome_badge: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      hps_hero_title: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      hps_hero_description: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      hps_background_value: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'CSS gradient/color, base64 image data, or image URL'
      },
      hps_contact_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Contact phone number'
      },
      hps_contact_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Contact email address'
      },
      hps_website_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Website title/name'
      },
      hps_website_logo: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Website logo (base64 or URL)'
      },
      hps_location: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Business location/address'
      },
      hps_status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      hps_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      hps_updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('home_page_settings', ['hps_status']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('home_page_settings');
  }
};
