const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { getMessages, endConsultation } = require('./chat.controller');

router.get('/chat/:appointmentId/messages', requireAuth, getMessages);
router.post('/chat/:appointmentId/end', requireAuth, requireRole('DOCTOR'), endConsultation);

module.exports = router;
