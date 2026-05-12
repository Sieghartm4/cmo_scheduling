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
      .orderBy(Master.appointment.selectOptionColumns.date, 'DESC')
      .orderBy(Master.appointment.selectOptionColumns.start_time, 'ASC')
      .build()

    const rawAppointments = await Query(
      query,
      [],
      [Master.appointment.prefix_, Master.master_user.prefix_],
    )

    // FIX: Format the date object to string to avoid timezone shifting
    const appointments = rawAppointments.map(app => {
      // Ensure we have a valid date object
      const dateObj = new Date(app.date);
      
      return {
        ...app,
        // toISOString().split('T')[0] extracts 'YYYY-MM-DD' regardless of local time
        // However, if the driver shifted it back to 16:00 the previous day, 
        // we use local date methods to ensure it stays as 'May 14'
        date: dateObj.getFullYear() + '-' + 
              String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
              String(dateObj.getDate()).padStart(2, '0')
      };
    });

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

    const query = sql
      .update(Master.appointment.tablename)
      .set({
        [Master.appointment.updateOptionColumns.mu_id]: app_mu_id,
        [Master.appointment.updateOptionColumns.date]: app_date,
        [Master.appointment.updateOptionColumns.start_time]: app_start_time,
        [Master.appointment.updateOptionColumns.end_time]: app_end_time,
        [Master.appointment.updateOptionColumns.reason]: app_reason,
        [Master.appointment.updateOptionColumns.status]: app_status,
        [Master.appointment.updateOptionColumns.notes]: app_notes,
      })
      .where(Master.appointment.updateOptionColumns.id, '=', id)
      .build()

    await Query(query, [], [Master.appointment.prefix_])

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

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      })
    }

    const query = sql
      .update(Master.appointment.tablename)
      .set({
        [Master.appointment.updateOptionColumns.status]: app_status,
      })
      .where(Master.appointment.updateOptionColumns.id, '=', id)
      .build()
    await Query(query, [], [Master.appointment.prefix_])

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
