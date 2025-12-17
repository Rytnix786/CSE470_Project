const { z } = require('zod');

const initPaymentSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
});

const confirmPaymentSchema = z.object({
  txnRef: z.string().min(1, 'Transaction reference is required'),
});

const refundPaymentSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
});

module.exports = {
  initPaymentSchema,
  confirmPaymentSchema,
  refundPaymentSchema,
};
