const express = require('express');
const { 
  getHomePageSettings, 
  updateHomePageSettings, 
  createHomePageSettings
} = require('../controller/homePageSettings.controller');

const homePageSettingsRouter = express.Router();

// GET /api/home-page-settings - Get home page settings
homePageSettingsRouter.get('/', getHomePageSettings);

// POST /api/home-page-settings - Create new home page settings
homePageSettingsRouter.post('/', createHomePageSettings);

// PUT /api/home-page-settings/:id - Update home page settings
homePageSettingsRouter.put('/:id', updateHomePageSettings);

module.exports = {
  homePageSettingsRouter
};
