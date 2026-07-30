const express = require('express');
const { 
  getHomePageSections,
  getHomePageSectionsByType,
  getHomePageSection,
  createHomePageSection,
  updateHomePageSection,
  deleteHomePageSection
} = require('../controller/homePageSections.controller');

const homePageSectionsRouter = express.Router();

// GET /api/home-page-sections - Get all home page sections grouped by type
homePageSectionsRouter.get('/', getHomePageSections);

// GET /api/home-page-sections/type/:sectionType - Get sections by type
homePageSectionsRouter.get('/type/:sectionType', getHomePageSectionsByType);

// GET /api/home-page-sections/:id - Get single home page section
homePageSectionsRouter.get('/:id', getHomePageSection);

// POST /api/home-page-sections - Create new home page section
homePageSectionsRouter.post('/', createHomePageSection);

// PUT /api/home-page-sections/:id - Update home page section
homePageSectionsRouter.put('/:id', updateHomePageSection);

// DELETE /api/home-page-sections/:id - Delete home page section
homePageSectionsRouter.delete('/:id', deleteHomePageSection);

module.exports = {
  homePageSectionsRouter
};
