const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus
} = require('../controller/appointment.controller');

// GET /api/appointments - Get all appointments
router.get('/', getAppointments);

// GET /api/appointments/:id - Get appointment by ID
router.get('/:id', getAppointmentById);

// POST /api/appointments - Create new appointment
router.post('/', createAppointment);

// PUT /api/appointments/:id - Update appointment
router.put('/:id', updateAppointment);

// PATCH /api/appointments/:id/status - Update appointment status
router.patch('/:id/status', updateAppointmentStatus);

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id', deleteAppointment);

module.exports = router;
