'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('master_category', {
      mc_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      mc_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      mc_details: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      mc_status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      mc_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      mc_updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('master_category', ['mc_name']);
    await queryInterface.addIndex('master_category', ['mc_status']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('master_category');
  }
};
