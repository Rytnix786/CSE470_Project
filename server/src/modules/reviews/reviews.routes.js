const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const {
  createReview,
  getDoctorReviews,
  getMyReviews,
  getReviewByAppointment,
} = require('./reviews.controller');
const { createReviewSchema } = require('./reviews.validation');

// Patient routes
router.post('/', requireAuth, requireRole('PATIENT'), validate(createReviewSchema), createReview);
router.get('/me', requireAuth, requireRole('PATIENT'), getMyReviews);

// Public routes
router.get('/doctor/:doctorId', getDoctorReviews);

// Protected routes
router.get('/appointment/:appointmentId', requireAuth, getReviewByAppointment);

module.exports = router;