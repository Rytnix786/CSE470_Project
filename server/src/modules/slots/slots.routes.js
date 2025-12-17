const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const {
  createSlot,
  getMySlots,
  updateSlot,
  deleteSlot,
  getDoctorSlots,
} = require('./slots.controller');
const { createSlotSchema } = require('./slots.validation');

// Public routes
router.get('/doctors/:doctorId/slots', getDoctorSlots);

// Doctor routes
router.post('/doctor/me/slots', requireAuth, requireRole('DOCTOR'), validate(createSlotSchema), createSlot);
router.get('/doctor/me/slots', requireAuth, requireRole('DOCTOR'), getMySlots);
router.patch('/doctor/me/slots/:slotId', requireAuth, requireRole('DOCTOR'), updateSlot);
router.delete('/doctor/me/slots/:slotId', requireAuth, requireRole('DOCTOR'), deleteSlot);

module.exports = router;
