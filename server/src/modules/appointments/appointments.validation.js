const { z } = require('zod');

const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  slotId: z.string().min(1, 'Slot ID is required'),
});

const cancelAppointmentSchema = z.object({
  cancelReason: z.string().optional(),
});

const rescheduleAppointmentSchema = z.object({
  newSlotId: z.string().min(1, 'New slot ID is required'),
});

module.exports = {
  bookAppointmentSchema,
  cancelAppointmentSchema,
  rescheduleAppointmentSchema,
};
