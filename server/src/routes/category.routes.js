const express = require('express');
const { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory
} = require('../controller/category.controller');

const categoryRouter = express.Router();

// GET /api/categories - Get all categories
categoryRouter.get('/', getCategories);

// GET /api/categories/:id - Get category by ID
categoryRouter.get('/:id', getCategoryById);

// POST /api/categories - Create new category
categoryRouter.post('/', createCategory);

// PUT /api/categories/:id - Update category
categoryRouter.put('/:id', updateCategory);

module.exports = {
  categoryRouter
};
