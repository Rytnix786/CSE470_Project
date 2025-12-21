const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { checkDoctorRestrictions } = require('../../middlewares/doctorRestrictions');
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
router.post('/doctor/me/slots', requireAuth, requireRole('DOCTOR'), checkDoctorRestrictions, validate(createSlotSchema), createSlot);
router.get('/doctor/me/slots', requireAuth, requireRole('DOCTOR'), getMySlots);
router.patch('/doctor/me/slots/:slotId', requireAuth, requireRole('DOCTOR'), checkDoctorRestrictions, updateSlot);
router.delete('/doctor/me/slots/:slotId', requireAuth, requireRole('DOCTOR'), checkDoctorRestrictions, deleteSlot);

module.exports = router;
