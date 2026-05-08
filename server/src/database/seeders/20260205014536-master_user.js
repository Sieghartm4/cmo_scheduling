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
        mu_password: 'e10adc3949ba59abbe56e057f20f883e',
        mu_role: 'admin',
        mu_profile: null,
        mu_status: 1
      },
      {
        mu_fullname: 'Test User',
        mu_email: 'user@example.com',
        mu_password: 'e10adc3949ba59abbe56e057f20f883e',
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
