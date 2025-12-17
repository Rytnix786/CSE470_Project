const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const {
  createHealthRecord,
  getMyHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
} = require('./healthRecords.controller');
const { createHealthRecordSchema } = require('./healthRecords.validation');

router.post('/health-records', requireAuth, requireRole('PATIENT'), validate(createHealthRecordSchema), createHealthRecord);
router.get('/health-records/me', requireAuth, requireRole('PATIENT'), getMyHealthRecords);
router.get('/health-records/:id', requireAuth, getHealthRecordById);
router.patch('/health-records/:id', requireAuth, requireRole('PATIENT'), validate(createHealthRecordSchema), updateHealthRecord);
router.delete('/health-records/:id', requireAuth, requireRole('PATIENT'), deleteHealthRecord);

module.exports = router;
