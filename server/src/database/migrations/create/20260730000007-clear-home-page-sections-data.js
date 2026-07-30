'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Delete all existing data from home_page_sections table
    await queryInterface.sequelize.query(
      'DELETE FROM home_page_sections',
      { type: Sequelize.QueryTypes.DELETE }
    )
  },

  async down(queryInterface, Sequelize) {
    // This migration is data-destructive and cannot be easily reversed
    // In a production environment, you would restore from a backup
    console.warn('Migration down: Cannot restore deleted home_page_sections data. Please restore from backup if needed.')
  }
}
