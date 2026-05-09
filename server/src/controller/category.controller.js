const { Master } = require('../database/model/Master');
const { Query } = require('../database/util/queries.util');

// Get all categories
const getCategories = async (req, res, next) => {
  try {
    const categoryModel = Master.master_category;
    const selectQuery = `SELECT
      ${categoryModel.selectColumns.join(', ')}
    FROM ${categoryModel.tablename}
    WHERE ${categoryModel.prefix_}status = 'active'
    ORDER BY ${categoryModel.prefix_}name ASC`;
    
    const results = await Query(selectQuery, [], [categoryModel.prefix_]);
    
    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const categoryModel = Master.master_category;
    
    const selectQuery = `SELECT
      ${categoryModel.selectColumns.join(', ')}
    FROM ${categoryModel.tablename}
    WHERE ${categoryModel.prefix_}id = ? AND ${categoryModel.prefix_}status = 'active'`;
    
    const results = await Query(selectQuery, [id], [categoryModel.prefix_]);
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: results[0]
    });
  } catch (error) {
    next(error);
  }
};

// Create new category
const createCategory = async (req, res, next) => {
  try {
    const { name, details } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    
    const categoryModel = Master.master_category;
    const insertQuery = `
      INSERT INTO ${categoryModel.tablename} (${categoryModel.insertColumns.join(', ')})
      VALUES (?, ?, ?)
    `;
    
    const result = await Query(insertQuery, [
      name.trim(),
      details || null,
      'active' // Active status
    ], [categoryModel.prefix_]);
    
    // Get the created category
    const selectQuery = `SELECT
      ${categoryModel.selectColumns.join(', ')}
    FROM ${categoryModel.tablename}
    WHERE ${categoryModel.prefix_}id = ?`;
    
    const newCategory = await Query(selectQuery, [result.insertId], [categoryModel.prefix_]);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    next(error);
  }
};

// Update category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, details, status } = req.body;
    
    const categoryModel = Master.master_category;
    
    // Check if category exists
    const checkQuery = `SELECT ${categoryModel.prefix_}id FROM ${categoryModel.tablename} WHERE ${categoryModel.prefix_}id = ?`;
    const existing = await Query(checkQuery, [id], [categoryModel.prefix_]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Category name cannot be empty'
        });
      }
      updateFields.push(`${categoryModel.prefix_}name = ?`);
      updateValues.push(name.trim());
    }
    
    if (details !== undefined) {
      updateFields.push(`${categoryModel.prefix_}details = ?`);
      updateValues.push(details);
    }
    
    if (status !== undefined) {
      updateFields.push(`${categoryModel.prefix_}status = ?`);
      updateValues.push(status);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    updateValues.push(id);
    
    const updateQuery = `
      UPDATE ${categoryModel.tablename}
      SET ${updateFields.join(', ')}, ${categoryModel.prefix_}updated_at = CURRENT_TIMESTAMP
      WHERE ${categoryModel.prefix_}id = ?
    `;
    
    await Query(updateQuery, updateValues, [categoryModel.prefix_]);
    
    // Get updated category
    const selectQuery = `SELECT
      ${categoryModel.selectColumns.join(', ')}
    FROM ${categoryModel.tablename}
    WHERE ${categoryModel.prefix_}id = ?`;
    
    const updatedCategory = await Query(selectQuery, [id], [categoryModel.prefix_]);
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory
};
