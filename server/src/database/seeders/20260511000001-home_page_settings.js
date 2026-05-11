'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('home_page_settings', [
      {
        hps_welcome_badge: '🚀 Welcome to the Future of Scheduling',
        hps_hero_title: 'Connect, Schedule, and Stay Informed',
        hps_hero_description: 'Your all-in-one platform for appointment scheduling and community engagement. Book appointments effortlessly and stay connected with our vibrant community.',
        hps_background_value: 'from-emerald-50 via-teal-50 to-cyan-50',
        hps_contact_number: '+1 (555) 123-4567',
        hps_contact_email: 'support@cmoconnect.com',
        hps_website_title: 'CMO Connect',
        hps_website_logo: null,
        hps_location: '123 Business Ave, Suite 100, San Francisco, CA 94105',
        hps_status: 'active'
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('home_page_settings', null, {});
  }
};
