const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const {
  initPayment,
  confirmPayment,
  refundPayment,
  getPaymentByAppointment,
} = require('./payments.controller');
const {
  initPaymentSchema,
  confirmPaymentSchema,
  refundPaymentSchema,
} = require('./payments.validation');

router.post('/payments/init', requireAuth, validate(initPaymentSchema), initPayment);
router.post('/payments/confirm', requireAuth, validate(confirmPaymentSchema), confirmPayment);
router.post('/payments/refund', requireAuth, requireRole('ADMIN'), validate(refundPaymentSchema), refundPayment);
router.get('/payments/appointment/:appointmentId', requireAuth, getPaymentByAppointment);

module.exports = router;
