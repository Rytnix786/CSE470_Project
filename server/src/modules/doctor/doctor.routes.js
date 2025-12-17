const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const {
  createOrUpdateProfile,
  getMyProfile,
  getVerifiedDoctors,
  getDoctorById,
  getPendingDoctors,
  verifyDoctor,
} = require('./doctor.controller');
const {
  createProfileSchema,
  verifyDoctorSchema,
} = require('./doctor.validation');

// Public routes
router.get('/doctors', getVerifiedDoctors);
router.get('/doctors/:id', getDoctorById);

// Doctor routes
router.post('/doctor/me/profile', requireAuth, requireRole('DOCTOR'), validate(createProfileSchema), createOrUpdateProfile);
router.get('/doctor/me/profile', requireAuth, requireRole('DOCTOR'), getMyProfile);

// Admin routes
router.get('/admin/doctors/pending', requireAuth, requireRole('ADMIN'), getPendingDoctors);
router.patch('/admin/doctors/:doctorUserId/verify', requireAuth, requireRole('ADMIN'), validate(verifyDoctorSchema), verifyDoctor);

module.exports = router;
