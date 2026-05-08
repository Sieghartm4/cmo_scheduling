const { checkConnection, SelectAll, SelectWithCondition, Insert, Update, Delete, Query } = require('../database/util/queries.util');
const { Master } = require('../database/model/Master');

// Get all appointments
const getAppointments = async (req, res, next) => {
  try {
    const query = 'SELECT a.*, mu.mu_fullname, mu.mu_email FROM appointment a LEFT JOIN master_user mu ON a.app_mu_id = mu.mu_id ORDER BY a.app_date DESC, a.app_start_time ASC';
    
    const appointments = await Query(query);
    
    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: appointments,
      count: appointments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getAppointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments',
      error: error.message
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT a.*, mu.mu_fullname, mu.mu_email 
      FROM appointment a 
      LEFT JOIN master_user mu ON a.app_mu_id = mu.mu_id 
      WHERE a.app_id = ?
    `;
    
    const appointment = await SelectWithCondition(query, [id]);
    
    if (appointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Appointment retrieved successfully',
      data: appointment[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getAppointmentById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointment',
      error: error.message
    });
  }
};

// Create new appointment
const createAppointment = async (req, res, next) => {
  try {
    const {
      app_mu_id,
      app_date,
      app_start_time,
      app_end_time,
      app_reason,
      app_notes
    } = req.body;

    // Validate required fields
    if (!app_mu_id || !app_date || !app_start_time || !app_end_time || !app_reason) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    const query = `
      INSERT INTO appointment (app_mu_id, app_date, app_start_time, app_end_time, app_reason, app_notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await Insert(query, [app_mu_id, app_date, app_start_time, app_end_time, app_reason, app_notes || null]);
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { insertId: result.insertId },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in createAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
};

// Update appointment
const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      app_mu_id,
      app_date,
      app_start_time,
      app_end_time,
      app_reason,
      app_status,
      app_notes
    } = req.body;

    // Check if appointment exists
    const checkQuery = `SELECT app_id FROM appointment WHERE app_id = ?`;
    const existing = await SelectWithCondition(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const query = `
      UPDATE appointment 
      SET app_mu_id = ?, app_date = ?, app_start_time = ?, app_end_time = ?, 
          app_reason = ?, app_status = ?, app_notes = ?
      WHERE app_id = ?
    `;
    
    await Update(query, [app_mu_id, app_date, app_start_time, app_end_time, app_reason, app_status, app_notes, id]);
    
    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in updateAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// Delete appointment
const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if appointment exists
    const checkQuery = `SELECT app_id FROM appointment WHERE app_id = ?`;
    const existing = await SelectWithCondition(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const query = `DELETE FROM appointment WHERE app_id = ?`;
    await Delete(query, [id]);
    
    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in deleteAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { app_status } = req.body;

    if (!app_status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Check if appointment exists
    const checkQuery = `SELECT app_id FROM appointment WHERE app_id = ?`;
    const existing = await SelectWithCondition(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const query = `UPDATE appointment SET app_status = ? WHERE app_id = ?`;
    await Update(query, [app_status, id]);
    
    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in updateAppointmentStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus
};
