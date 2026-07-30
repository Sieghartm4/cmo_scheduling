'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('home_page_sections', {
      hps_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      hps_content: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'HTML content for the entire home page',
      },
      hps_status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      hps_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      hps_updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    })

    // Add index
    await queryInterface.addIndex('home_page_sections', ['hps_status'])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('home_page_sections')
  },
}
