const { z } = require('zod');

const createReviewSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(500, 'Comment cannot exceed 500 characters').optional(),
});

module.exports = {
  createReviewSchema,
};