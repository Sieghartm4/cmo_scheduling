'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('master_user', {
      mu_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      mu_fullname: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      mu_email: {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true
      },
      mu_password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      mu_role: {
        type: Sequelize.ENUM('admin', 'user'),
        allowNull: false
      },
      mu_profile: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      mu_status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      mu_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('master_user');
  }
};
