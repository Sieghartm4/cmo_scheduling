'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the existing table and recreate with new structure
    await queryInterface.dropTable('home_page_sections')

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
    // Drop the new table and recreate with old structure
    await queryInterface.dropTable('home_page_sections')

    await queryInterface.createTable('home_page_sections', {
      hps_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      hps_section_type: {
        type: Sequelize.ENUM('features', 'why_choose', 'testimonials'),
        allowNull: false,
        comment: 'Section type: features, why_choose, or testimonials',
      },
      hps_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Section title',
      },
      hps_description: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Section description',
      },
      hps_content: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'JSON content for section items (features, why_choose items, testimonials)',
      },
      hps_sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Sort order for items within section',
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

    // Add indexes
    await queryInterface.addIndex('home_page_sections', ['hps_section_type'])
    await queryInterface.addIndex('home_page_sections', ['hps_status'])
    await queryInterface.addIndex('home_page_sections', ['hps_sort_order'])
  },
}
