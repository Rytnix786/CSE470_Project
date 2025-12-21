const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { checkDoctorRestrictions } = require('../../middlewares/doctorRestrictions');
const { validate } = require('../../middlewares/validate');
const {
  createPrescription,
  getPrescriptionByAppointment,
  getPatientPrescriptions,
  getMyPrescriptions,
  getMyDoctorPrescriptions,
} = require('./prescriptions.controller');
const { createPrescriptionSchema } = require('./prescriptions.validation');

router.post('/prescriptions', requireAuth, requireRole('DOCTOR'), checkDoctorRestrictions, validate(createPrescriptionSchema), createPrescription);
router.get('/prescriptions/appointment/:appointmentId', requireAuth, getPrescriptionByAppointment);
router.get('/prescriptions/patient/:patientId', requireAuth, getPatientPrescriptions);
router.get('/prescriptions/me', requireAuth, requireRole('PATIENT'), getMyPrescriptions);
router.get('/prescriptions/doctor/me', requireAuth, requireRole('DOCTOR'), getMyDoctorPrescriptions);

module.exports = router;
