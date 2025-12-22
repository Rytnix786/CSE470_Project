const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAuditLogs,
  getAdminStats,
  getAllDoctors,
  getDoctorById,
  suspendDoctor,
  unsuspendDoctor,
  editDoctorProfile,
  getDoctorReviews,
  getDoctorReports,
} = require('./admin.controller');
const {
  updateAdminProfileSchema,
  changePasswordSchema,
  suspendDoctorSchema,
  unsuspendDoctorSchema,
  editDoctorProfileSchema,
} = require('./admin.validation');

// Admin profile routes
router.get('/admin/me', requireAuth, requireRole('ADMIN'), getAdminProfile);
router.patch('/admin/me', requireAuth, requireRole('ADMIN'), validate(updateAdminProfileSchema), updateAdminProfile);
router.patch('/admin/me/password', requireAuth, requireRole('ADMIN'), validate(changePasswordSchema), changeAdminPassword);

// Admin audit logs
router.get('/admin/audit-logs', requireAuth, requireRole('ADMIN'), getAuditLogs);

// Admin stats
router.get('/admin/stats', requireAuth, requireRole('ADMIN'), getAdminStats);

// Get all doctors
router.get('/admin/doctors', requireAuth, requireRole('ADMIN'), getAllDoctors);

// Doctor management routes
router.patch('/admin/doctors/:doctorUserId/suspend', requireAuth, requireRole('ADMIN'), validate(suspendDoctorSchema), suspendDoctor);
router.patch('/admin/doctors/:doctorUserId/unsuspend', requireAuth, requireRole('ADMIN'), validate(unsuspendDoctorSchema), unsuspendDoctor);
router.patch('/admin/doctors/:doctorUserId/profile', requireAuth, requireRole('ADMIN'), validate(editDoctorProfileSchema), editDoctorProfile);

// Admin evidence endpoints
router.get('/admin/doctors/:doctorUserId', requireAuth, requireRole('ADMIN'), getDoctorById);
router.get('/admin/doctors/:doctorUserId/reviews', requireAuth, requireRole('ADMIN'), getDoctorReviews);
router.get('/admin/doctors/:doctorUserId/reports', requireAuth, requireRole('ADMIN'), getDoctorReports);

module.exports = router;