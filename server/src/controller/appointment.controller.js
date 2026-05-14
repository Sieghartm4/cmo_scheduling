const os = require('os')
const {
  checkConnection,
  SelectAll,
  Transaction,
  Query,
  Insert,
  SelectWithCondition,
} = require('../database/util/queries.util')
const {
  formatMemoryUsage,
  formatTime,
  DataModeling,
} = require('../util/helper.util')
const { Master } = require('../database/model/Master')
const { SQLQueryBuilder } = require('../util/helper.util')
const sql = new SQLQueryBuilder()
require('dotenv').config()

// Get all appointments
const getAppointments = async (req, res, next) => {
  try {
    const { mu_id } = req.query
    let query = sql
      .select([
        { col: Master.appointment.selectOptionColumns.id, as: 'id' },
        { col: Master.appointment.selectOptionColumns.date, as: 'date' },
        { col: Master.appointment.selectOptionColumns.start_time, as: 'start_time' },
        { col: Master.appointment.selectOptionColumns.end_time, as: 'end_time' },
        { col: Master.appointment.selectOptionColumns.reason, as: 'reason' },
        { col: Master.appointment.selectOptionColumns.notes, as: 'notes' },
        { col: Master.appointment.selectOptionColumns.created_at, as: 'created_at' },
        { col: Master.master_user.selectOptionColumns.fullname, as: 'mu_fullname' },
        { col: Master.master_user.selectOptionColumns.email, as: 'mu_email' },
        { col: Master.appointment.selectOptionColumns.status, as: 'status' },
      ])
      .from(Master.appointment.tablename)
      .leftJoin(
        Master.master_user.tablename,
        Master.appointment.selectOptionColumns.mu_id,
        Master.master_user.selectOptionColumns.id,
      )

    if (mu_id) {
      query = query.where(Master.appointment.selectOptionColumns.mu_id, '=', mu_id)
    }

    query = query
      .orderBy(Master.appointment.selectOptionColumns.date, 'DESC')
      .orderBy(Master.appointment.selectOptionColumns.start_time, 'ASC')
      .build()

    console.log('Generated SQL Query:', query)

    const rawAppointments = await Query(query, mu_id ? [mu_id] : [], [
      Master.appointment.prefix_,
      Master.master_user.prefix_,
    ])

    // FIX: Format the date object to string to avoid timezone shifting
    const appointments = rawAppointments.map((app) => {
      // Ensure we have a valid date object
      const dateObj = new Date(app.date)

      return {
        ...app,
        // toISOString().split('T')[0] extracts 'YYYY-MM-DD' regardless of local time
        // However, if the driver shifted it back to 16:00 the previous day,
        // we use local date methods to ensure it stays as 'May 14'
        date:
          dateObj.getFullYear() +
          '-' +
          String(dateObj.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(dateObj.getDate()).padStart(2, '0'),
      }
    })

    console.log('Appointments retrieved (Formatted):', appointments)

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: appointments,
      count: appointments.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in getAppointments:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments',
      error: error.message,
    })
  }
}

// Get appointment by ID
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params

    const query = sql
      .select([
        { col: Master.appointment.selectOptionColumns.id, as: 'id' },
        { col: Master.appointment.selectOptionColumns.mu_id, as: 'mu_id' },
        { col: Master.appointment.selectOptionColumns.date, as: 'date' },
        { col: Master.appointment.selectOptionColumns.start_time, as: 'start_time' },
        { col: Master.appointment.selectOptionColumns.end_time, as: 'end_time' },
        { col: Master.appointment.selectOptionColumns.reason, as: 'reason' },
        { col: Master.appointment.selectOptionColumns.notes, as: 'notes' },
        { col: Master.appointment.selectOptionColumns.status, as: 'status' },
        { col: Master.appointment.selectOptionColumns.created_at, as: 'created_at' },
        { col: Master.master_user.selectOptionColumns.fullname, as: 'mu_fullname' },
        { col: Master.master_user.selectOptionColumns.email, as: 'mu_email' },
      ])
      .from(Master.appointment.tablename)
      .leftJoin(
        Master.master_user.tablename,
        Master.appointment.selectOptionColumns.mu_id,
        Master.master_user.selectOptionColumns.id,
      )
      .where(Master.appointment.selectOptionColumns.id, '=', id)
      .build()

    const appointment = await Query(
      query,
      [id],
      [Master.appointment.prefix_, Master.master_user.prefix_],
    )

    if (appointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Appointment retrieved successfully',
      data: appointment[0],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in getAppointmentById:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointment',
      error: error.message,
    })
  }
}

// Create new appointment
const createAppointment = async (req, res, next) => {
  try {
    const {
      app_mu_id,
      app_date,
      app_start_time,
      app_end_time,
      app_reason,
      app_notes,
    } = req.body

    // Validate required fields
    if (!app_mu_id || !app_date || !app_start_time || !app_end_time || !app_reason) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing',
      })
    }

    const query = `INSERT INTO ${Master.appointment.tablename}(${Master.appointment.selectOptionColumns.mu_id}, ${Master.appointment.selectOptionColumns.date}, ${Master.appointment.selectOptionColumns.start_time}, ${Master.appointment.selectOptionColumns.end_time}, ${Master.appointment.selectOptionColumns.reason}, ${Master.appointment.selectOptionColumns.status}, ${Master.appointment.selectOptionColumns.notes}) VALUES (?, ?, ?, ?, ?, ?, ?)`

    const result = await Insert(query, [
      app_mu_id,
      app_date,
      app_start_time,
      app_end_time,
      app_reason,
      'pending',
      app_notes || null,
    ])

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { insertId: result.insertId },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in createAppointment:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message,
    })
  }
}

// Update appointment
const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      app_mu_id,
      app_date,
      app_start_time,
      app_end_time,
      app_reason,
      app_status,
      app_notes,
    } = req.body

    // Check if appointment exists
    const checkQuery = sql
      .select([{ col: Master.appointment.selectOptionColumns.id, as: 'app_id' }])
      .from(Master.appointment.tablename)
      .where(Master.appointment.selectOptionColumns.id, '=', id)
      .build()
    const existing = await Query(checkQuery, [id], [Master.appointment.prefix_])

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      })
    }

    // Build dynamic update query
    const updateFields = []
    const updateValues = []

    if (app_mu_id !== undefined) {
      updateFields.push(`${Master.appointment.prefix_}mu_id = ?`)
      updateValues.push(app_mu_id)
    }

    if (app_date !== undefined) {
      updateFields.push(`${Master.appointment.prefix_}date = ?`)
      updateValues.push(app_date)
    }

    if (app_start_time !== undefined) {
      updateFields.push(`${Master.appointment.prefix_}start_time = ?`)
      updateValues.push(app_start_time)
    }

    if (app_end_time !== undefined) {
      updateFields.push(`${Master.appointment.prefix_}end_time = ?`)
      updateValues.push(app_end_time)
    }

    if (app_reason !== undefined) {
      updateFields.push(`${Master.appointment.prefix_}reason = ?`)
      updateValues.push(app_reason)
    }

    if (app_status !== undefined) {
      updateFields.push(`${Master.appointment.prefix_}status = ?`)
      updateValues.push(app_status)
    }

    if (app_notes !== undefined) {
      updateFields.push(`${Master.appointment.prefix_}notes = ?`)
      updateValues.push(app_notes)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      })
    }

    updateValues.push(id) // Add id for WHERE clause

    const updateQuery = `UPDATE ${Master.appointment.tablename}
      SET ${updateFields.join(', ')}
      WHERE ${Master.appointment.prefix_}id = ?`

    await Query(updateQuery, updateValues)

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in updateAppointment:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message,
    })
  }
}

// Delete appointment
const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params

    // Check if appointment exists
    const checkQuery = sql
      .select([{ col: Master.appointment.selectOptionColumns.id, as: 'app_id' }])
      .from(Master.appointment.tablename)
      .where(Master.appointment.selectOptionColumns.id, '=', id)
      .build()
    const existing = await Query(checkQuery, [id], [Master.appointment.prefix_])

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      })
    }

    const query = sql
      .delete(Master.appointment.tablename)
      .where(Master.appointment.selectOptionColumns.id, '=', id)
      .build()
    await Query(query, [], [Master.appointment.prefix_])

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in deleteAppointment:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message,
    })
  }
}

// Update appointment status
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { app_status } = req.body

    console.log('UpdateAppointmentStatus - ID:', id, 'Status:', app_status)

    if (!app_status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      })
    }

    // Check if appointment exists
    const checkQuery = sql
      .select([{ col: Master.appointment.selectOptionColumns.id, as: 'app_id' }])
      .from(Master.appointment.tablename)
      .where(Master.appointment.selectOptionColumns.id, '=', id)
      .build()
    const existing = await Query(checkQuery, [id], [Master.appointment.prefix_])

    console.log(
      'Appointment exists check:',
      existing.length > 0 ? 'FOUND' : 'NOT FOUND',
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      })
    }

    const updateQuery = `UPDATE ${Master.appointment.tablename} SET app_status = ? WHERE app_id = ?`

    console.log('Update query:', updateQuery)

    const result = await Query(
      updateQuery,
      [app_status, id],
      [Master.appointment.prefix_],
    )

    console.log('Update result:', result)

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in updateAppointmentStatus:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message,
    })
  }
}

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
}
