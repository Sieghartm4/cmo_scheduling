'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('master_user', [
      {
        mu_fullname: 'Admin',
        mu_email: 'admin@example.com',
        mu_password: '21232f297a57a5a743894a0e4a801fc3',
        mu_role: 'admin',
        mu_profile: null,
        mu_status: 1
      },
      {
        mu_fullname: 'Test User',
        mu_email: 'user@example.com',
        mu_password: '21232f297a57a5a743894a0e4a801fc3',
        mu_role: 'user',
        mu_profile: null,
        mu_status: 1
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('master_user', null, {});
  }
};
