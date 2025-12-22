const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
} = require('./reports.controller');
const { createReportSchema } = require('./reports.validation');

// Patient routes
router.post('/', requireAuth, requireRole('PATIENT'), validate(createReportSchema), createReport);

// Admin routes
router.get('/', requireAuth, requireRole('ADMIN'), getReports);
router.get('/:id', requireAuth, requireRole('ADMIN'), getReportById);
router.patch('/:id', requireAuth, requireRole('ADMIN'), updateReport);

module.exports = router;