const { Master } = require('../database/model/Master')
const { Query } = require('../database/util/queries.util')

// Get home page settings
const getHomePageSettings = async (req, res, next) => {
  try {
    const homePageModel = Master.home_page_settings
    const selectQuery = `SELECT
      ${homePageModel.selectColumns.join(', ')}
    FROM ${homePageModel.tablename}
    WHERE ${homePageModel.prefix_}status = 'active'
    ORDER BY ${homePageModel.prefix_}id DESC
    LIMIT 1`

    const results = await Query(selectQuery, [], [homePageModel.prefix_])

    if (results.length === 0) {
      return res.json({
        success: true,
        message: 'No home page settings found',
        data: null,
      })
    }

    res.json({
      success: true,
      message: 'Home page settings retrieved successfully',
      data: results[0],
    })
  } catch (error) {
    next(error)
  }
}

// Update home page settings
const updateHomePageSettings = async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      welcome_badge,
      hero_title,
      hero_description,
      background_value,
      contact_number,
      contact_email,
      website_title,
      website_logo,
      about_me_description,
      about_me_image,
      disclaimer,
      location,
      status,
    } = req.body

    const homePageModel = Master.home_page_settings

    // Check if record exists
    const checkQuery = `SELECT ${homePageModel.prefix_}id FROM ${homePageModel.tablename} WHERE ${homePageModel.prefix_}id = ?`
    const existing = await Query(checkQuery, [id])

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Home page settings not found',
      })
    }

    // Build dynamic update query
    const updateFields = []
    const updateValues = []

    if (welcome_badge !== undefined) {
      updateFields.push(`${homePageModel.prefix_}welcome_badge = ?`)
      updateValues.push(welcome_badge)
    }

    if (hero_title !== undefined) {
      updateFields.push(`${homePageModel.prefix_}hero_title = ?`)
      updateValues.push(hero_title)
    }

    if (hero_description !== undefined) {
      updateFields.push(`${homePageModel.prefix_}hero_description = ?`)
      updateValues.push(hero_description)
    }

    if (background_value !== undefined) {
      updateFields.push(`${homePageModel.prefix_}background_value = ?`)
      updateValues.push(background_value)
    }

    if (contact_number !== undefined) {
      updateFields.push(`${homePageModel.prefix_}contact_number = ?`)
      updateValues.push(contact_number)
    }

    if (contact_email !== undefined) {
      updateFields.push(`${homePageModel.prefix_}contact_email = ?`)
      updateValues.push(contact_email)
    }

    if (website_title !== undefined) {
      updateFields.push(`${homePageModel.prefix_}website_title = ?`)
      updateValues.push(website_title)
    }

    if (website_logo !== undefined) {
      updateFields.push(`${homePageModel.prefix_}website_logo = ?`)
      updateValues.push(website_logo)
    }

    if (about_me_description !== undefined) {
      updateFields.push(`${homePageModel.prefix_}about_me_description = ?`)
      updateValues.push(about_me_description)
    }

    if (about_me_image !== undefined) {
      updateFields.push(`${homePageModel.prefix_}about_me_image = ?`)
      updateValues.push(about_me_image)
    }

    if (disclaimer !== undefined) {
      updateFields.push(`${homePageModel.prefix_}disclaimer = ?`)
      updateValues.push(disclaimer)
    }

    if (location !== undefined) {
      updateFields.push(`${homePageModel.prefix_}location = ?`)
      updateValues.push(location)
    }

    if (status !== undefined) {
      updateFields.push(`${homePageModel.prefix_}status = ?`)
      updateValues.push(status)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      })
    }

    updateValues.push(id) // Add id for WHERE clause

    const updateQuery = `UPDATE ${homePageModel.tablename}
      SET ${updateFields.join(', ')}
      WHERE ${homePageModel.prefix_}id = ?`

    await Query(updateQuery, updateValues)

    // Fetch updated record
    const updatedQuery = `SELECT ${homePageModel.selectColumns.join(', ')}
      FROM ${homePageModel.tablename}
      WHERE ${homePageModel.prefix_}id = ?`

    const updatedResults = await Query(updatedQuery, [id], [homePageModel.prefix_])

    res.json({
      success: true,
      message: 'Home page settings updated successfully',
      data: updatedResults[0],
    })
  } catch (error) {
    next(error)
  }
}

// Create home page settings
const createHomePageSettings = async (req, res, next) => {
  try {
    const {
      welcome_badge,
      hero_title,
      hero_description,
      background_value,
      contact_number,
      contact_email,
      website_title,
      website_logo,
      about_me_description,
      about_me_image,
      disclaimer,
      location,
      status,
    } = req.body

    const homePageModel = Master.home_page_settings

    const insertQuery = `INSERT INTO ${homePageModel.tablename} (
      ${homePageModel.prefix_}welcome_badge,
      ${homePageModel.prefix_}hero_title,
      ${homePageModel.prefix_}hero_description,
      ${homePageModel.prefix_}background_value,
      ${homePageModel.prefix_}contact_number,
      ${homePageModel.prefix_}contact_email,
      ${homePageModel.prefix_}website_title,
      ${homePageModel.prefix_}website_logo,
      ${homePageModel.prefix_}about_me_description,
      ${homePageModel.prefix_}about_me_image,
      ${homePageModel.prefix_}disclaimer,
      ${homePageModel.prefix_}location,
      ${homePageModel.prefix_}status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const insertValues = [
      welcome_badge || null,
      hero_title || null,
      hero_description || null,
      background_value || null,
      contact_number || null,
      contact_email || null,
      website_title || null,
      website_logo || null,
      about_me_description || null,
      about_me_image || null,
      disclaimer || null,
      location || null,
      status || 'active',
    ]

    const result = await Query(insertQuery, insertValues)

    // Fetch created record
    const createdQuery = `SELECT ${homePageModel.selectColumns.join(', ')}
      FROM ${homePageModel.tablename}
      WHERE ${homePageModel.prefix_}id = ?`

    const createdResults = await Query(
      createdQuery,
      [result.insertId],
      [homePageModel.prefix_],
    )

    res.status(201).json({
      success: true,
      message: 'Home page settings created successfully',
      data: createdResults[0],
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getHomePageSettings,
  updateHomePageSettings,
  createHomePageSettings,
}
