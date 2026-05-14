const { Master } = require('../database/model/Master')
const { Query } = require('../database/util/queries.util')

const socialMediaModel = Master.master_social_media

const getSocialMedia = async (req, res, next) => {
  try {
    const { mu_id } = req.query
    let sql = `SELECT ${socialMediaModel.selectColumns.join(', ')} FROM ${socialMediaModel.tablename}`
    const params = []

    if (mu_id) {
      sql += ` WHERE ${socialMediaModel.prefix_}mu_id = ?`
      params.push(mu_id)
    }

    sql += ` ORDER BY ${socialMediaModel.prefix_}created_at DESC`

    const results = await Query(sql, params, [socialMediaModel.prefix_])

    res.json({
      success: true,
      message: 'Social media links retrieved successfully',
      data: results,
    })
  } catch (error) {
    next(error)
  }
}

const createSocialMedia = async (req, res, next) => {
  try {
    const { mu_id, platform, url, status } = req.body

    if (!mu_id || !platform || !url) {
      return res.status(400).json({
        success: false,
        message: 'mu_id, platform, and url are required',
      })
    }

    const insertQuery = `INSERT INTO ${socialMediaModel.tablename} (
      ${socialMediaModel.prefix_}mu_id,
      ${socialMediaModel.prefix_}platform,
      ${socialMediaModel.prefix_}url,
      ${socialMediaModel.prefix_}status
    ) VALUES (?, ?, ?, ?)`

    const insertValues = [mu_id, platform, url, status || 'active']
    const result = await Query(insertQuery, insertValues)

    const selectQuery = `SELECT ${socialMediaModel.selectColumns.join(', ')} FROM ${socialMediaModel.tablename} WHERE ${socialMediaModel.prefix_}id = ?`
    const [created] = await Query(
      selectQuery,
      [result.insertId],
      [socialMediaModel.prefix_],
    )

    res.status(201).json({
      success: true,
      message: 'Social media link created successfully',
      data: created,
    })
  } catch (error) {
    next(error)
  }
}

const updateSocialMedia = async (req, res, next) => {
  try {
    const { id } = req.params
    const { mu_id, platform, url, status } = req.body

    const updateFields = []
    const updateValues = []

    if (mu_id !== undefined) {
      updateFields.push(`${socialMediaModel.prefix_}mu_id = ?`)
      updateValues.push(mu_id)
    }
    if (platform !== undefined) {
      updateFields.push(`${socialMediaModel.prefix_}platform = ?`)
      updateValues.push(platform)
    }
    if (url !== undefined) {
      updateFields.push(`${socialMediaModel.prefix_}url = ?`)
      updateValues.push(url)
    }
    if (status !== undefined) {
      updateFields.push(`${socialMediaModel.prefix_}status = ?`)
      updateValues.push(status)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update',
      })
    }

    updateValues.push(id)

    const updateQuery = `UPDATE ${socialMediaModel.tablename}
      SET ${updateFields.join(', ')}
      WHERE ${socialMediaModel.prefix_}id = ?`

    await Query(updateQuery, updateValues)

    const selectQuery = `SELECT ${socialMediaModel.selectColumns.join(', ')} FROM ${socialMediaModel.tablename} WHERE ${socialMediaModel.prefix_}id = ?`
    const [updated] = await Query(selectQuery, [id], [socialMediaModel.prefix_])

    res.json({
      success: true,
      message: 'Social media link updated successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

const deleteSocialMedia = async (req, res, next) => {
  try {
    const { id } = req.params

    const deleteQuery = `DELETE FROM ${socialMediaModel.tablename} WHERE ${socialMediaModel.prefix_}id = ?`
    await Query(deleteQuery, [id])

    res.json({
      success: true,
      message: 'Social media link deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getSocialMedia,
  createSocialMedia,
  updateSocialMedia,
  deleteSocialMedia,
}
