const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const {
  createPrescription,
  getPrescriptionByAppointment,
  getPatientPrescriptions,
  getMyPrescriptions,
} = require('./prescriptions.controller');
const { createPrescriptionSchema } = require('./prescriptions.validation');

router.post('/prescriptions', requireAuth, requireRole('DOCTOR'), validate(createPrescriptionSchema), createPrescription);
router.get('/prescriptions/appointment/:appointmentId', requireAuth, getPrescriptionByAppointment);
router.get('/prescriptions/patient/:patientId', requireAuth, getPatientPrescriptions);
router.get('/prescriptions/me', requireAuth, requireRole('PATIENT'), getMyPrescriptions);

module.exports = router;
