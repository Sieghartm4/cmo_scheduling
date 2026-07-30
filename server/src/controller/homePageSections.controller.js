const { Master } = require('../database/model/Master')
const { Query } = require('../database/util/queries.util')

// Get all home page sections
const getHomePageSections = async (req, res, next) => {
  try {
    const sectionsModel = Master.home_page_sections
    const settingsModel = Master.home_page_settings

    // Fetch home page sections
    const selectQuery = `SELECT
      ${sectionsModel.selectColumns.join(', ')}
    FROM ${sectionsModel.tablename}
    WHERE ${sectionsModel.prefix_}status = 'active'
    LIMIT 1`

    const results = await Query(selectQuery, [], [sectionsModel.prefix_])

    if (results.length === 0) {
      return res.json({
        success: true,
        message: 'No home page content found',
        data: { content: '' },
      })
    }

    // Fetch home page settings to get homepage_image
    const settingsQuery = `SELECT
      ${settingsModel.prefix_}homepage_image
    FROM ${settingsModel.tablename}
    WHERE ${settingsModel.prefix_}status = 'active'
    ORDER BY ${settingsModel.prefix_}id DESC
    LIMIT 1`

    const settingsResults = await Query(settingsQuery, [], [settingsModel.prefix_])

    let content = results[0].content
    const homepageImage = settingsResults.length > 0 ? settingsResults[0].homepage_image : null

    res.json({
      success: true,
      message: 'Home page content retrieved successfully',
      data: {
        ...results[0],
        content: content,
        homepage_image: homepageImage,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get home page sections by type - deprecated
const getHomePageSectionsByType = async (req, res, next) => {
  try {
    return res.status(400).json({
      success: false,
      message: 'This endpoint is deprecated. Use the main home page sections endpoint.',
    })
  } catch (error) {
    next(error)
  }
}

// Get single home page section - deprecated
const getHomePageSection = async (req, res, next) => {
  try {
    return res.status(400).json({
      success: false,
      message: 'This endpoint is deprecated. Use the main home page sections endpoint.',
    })
  } catch (error) {
    next(error)
  }
}

// Create home page section
const createHomePageSection = async (req, res, next) => {
  try {
    const { content, status } = req.body
    const sectionsModel = Master.home_page_sections

    const insertQuery = `INSERT INTO ${sectionsModel.tablename} (
      ${sectionsModel.prefix_}content,
      ${sectionsModel.prefix_}status
    ) VALUES (?, ?)`

    const insertValues = [
      content || '',
      status || 'active',
    ]

    const result = await Query(insertQuery, insertValues)

    // Fetch created record
    const createdQuery = `SELECT ${sectionsModel.selectColumns.join(', ')}
      FROM ${sectionsModel.tablename}
      WHERE ${sectionsModel.prefix_}id = ?`

    const createdResults = await Query(
      createdQuery,
      [result.insertId],
      [sectionsModel.prefix_],
    )

    res.status(201).json({
      success: true,
      message: 'Home page content created successfully',
      data: createdResults[0],
    })
  } catch (error) {
    next(error)
  }
}

// Update home page section
const updateHomePageSection = async (req, res, next) => {
  try {
    const { id } = req.params
    const { content, status } = req.body
    const sectionsModel = Master.home_page_sections

    // Check if record exists
    const checkQuery = `SELECT ${sectionsModel.prefix_}id FROM ${sectionsModel.tablename} WHERE ${sectionsModel.prefix_}id = ?`
    const existing = await Query(checkQuery, [id])

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Home page content not found',
      })
    }

    // Build dynamic update query
    const updateFields = []
    const updateValues = []

    if (content !== undefined) {
      updateFields.push(`${sectionsModel.prefix_}content = ?`)
      updateValues.push(content)
    }

    if (status !== undefined) {
      updateFields.push(`${sectionsModel.prefix_}status = ?`)
      updateValues.push(status)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      })
    }

    updateValues.push(id) // Add id for WHERE clause

    const updateQuery = `UPDATE ${sectionsModel.tablename}
      SET ${updateFields.join(', ')}
      WHERE ${sectionsModel.prefix_}id = ?`

    await Query(updateQuery, updateValues)

    // Fetch updated record
    const updatedQuery = `SELECT ${sectionsModel.selectColumns.join(', ')}
      FROM ${sectionsModel.tablename}
      WHERE ${sectionsModel.prefix_}id = ?`

    const updatedResults = await Query(updatedQuery, [id], [sectionsModel.prefix_])

    res.json({
      success: true,
      message: 'Home page content updated successfully',
      data: updatedResults[0],
    })
  } catch (error) {
    next(error)
  }
}

// Delete home page section
const deleteHomePageSection = async (req, res, next) => {
  try {
    const { id } = req.params
    const sectionsModel = Master.home_page_sections

    // Check if record exists
    const checkQuery = `SELECT ${sectionsModel.prefix_}id FROM ${sectionsModel.tablename} WHERE ${sectionsModel.prefix_}id = ?`
    const existing = await Query(checkQuery, [id])

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Home page section not found',
      })
    }

    // Soft delete by setting status to inactive
    const updateQuery = `UPDATE ${sectionsModel.tablename}
      SET ${sectionsModel.prefix_}status = 'inactive'
      WHERE ${sectionsModel.prefix_}id = ?`

    await Query(updateQuery, [id])

    res.json({
      success: true,
      message: 'Home page section deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getHomePageSections,
  getHomePageSectionsByType,
  getHomePageSection,
  createHomePageSection,
  updateHomePageSection,
  deleteHomePageSection,
}
