const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getDoctorAppointments,
  getAppointmentById,
} = require('./appointments.controller');
const {
  bookAppointmentSchema,
  cancelAppointmentSchema,
  rescheduleAppointmentSchema,
} = require('./appointments.validation');

// Patient routes
router.post('/appointments', requireAuth, requireRole('PATIENT'), validate(bookAppointmentSchema), bookAppointment);
router.get('/appointments/me', requireAuth, getMyAppointments);
router.get('/appointments/:id', requireAuth, getAppointmentById);
router.patch('/appointments/:id/cancel', requireAuth, validate(cancelAppointmentSchema), cancelAppointment);
router.patch('/appointments/:id/reschedule', requireAuth, requireRole('PATIENT'), validate(rescheduleAppointmentSchema), rescheduleAppointment);

// Doctor routes
router.get('/doctor/appointments/me', requireAuth, requireRole('DOCTOR'), getDoctorAppointments);

module.exports = router;
