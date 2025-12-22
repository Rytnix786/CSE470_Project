const { z } = require('zod');

// Create report schema
const createReportSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  reason: z.enum(['PROFESSIONALISM', 'COMMUNICATION', 'APPOINTMENT_ISSUES', 'OTHER'], {
    required_error: 'Reason is required',
  }),
  description: z.string().min(1, 'Description is required').max(1000, 'Description cannot exceed 1000 characters'),
});

// Update report schema
const updateReportSchema = z.object({
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'ACTIONED', 'DISMISSED']).optional(),
  internalNote: z.string().max(1000, 'Internal note cannot exceed 1000 characters').optional(),
}).partial();

module.exports = {
  createReportSchema,
  updateReportSchema,
};