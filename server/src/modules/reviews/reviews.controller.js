const Review = require('../../models/Review');
const Appointment = require('../../models/Appointment');
const DoctorProfile = require('../../models/DoctorProfile');
const { sendEmail } = require('../../config/email');

// Create a review
const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const patientId = req.user._id;

    // Check if user is a patient
    if (req.user.role !== 'PATIENT') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can submit reviews',
      });
    }

    // Verify appointment exists and belongs to patient
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this appointment',
      });
    }

    // Check if appointment is completed
    if (appointment.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed appointments',
      });
    }

    // Check if review already exists for this appointment
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this appointment',
      });
    }

    // Create review
    const review = await Review.create({
      appointmentId,
      patientId,
      doctorId: appointment.doctorId,
      rating,
      comment: comment || '',
    });

    // Update doctor's average rating
    await updateDoctorAverageRating(appointment.doctorId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get reviews for a doctor
const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ doctorId })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ doctorId });

    res.json({
      success: true,
      data: { 
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get patient's reviews
const getMyReviews = async (req, res) => {
  try {
    const patientId = req.user._id;
    
    const reviews = await Review.find({ patientId })
      .populate('doctorId', 'name')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get review by appointment ID
const getReviewByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const review = await Review.findOne({ appointmentId })
      .populate('doctorId', 'name')
      .populate('patientId', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check access
    if (review.patientId._id.toString() !== req.user._id.toString() &&
        review.doctorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this review',
      });
    }

    res.json({
      success: true,
      data: { review },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update doctor's average rating
const updateDoctorAverageRating = async (doctorId) => {
  try {
    const reviews = await Review.find({ doctorId });
    if (reviews.length === 0) {
      await DoctorProfile.updateOne(
        { userId: doctorId },
        { 
          $unset: { avgRating: "", totalReviews: "" } 
        }
      );
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / reviews.length;
    const totalReviews = reviews.length;

    await DoctorProfile.updateOne(
      { userId: doctorId },
      { 
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: totalReviews
      }
    );
  } catch (error) {
    console.error('Error updating doctor rating:', error);
  }
};

module.exports = {
  createReview,
  getDoctorReviews,
  getMyReviews,
  getReviewByAppointment,
};