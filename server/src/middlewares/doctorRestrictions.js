const User = require('../models/User');

// Middleware to check if doctor is suspended and restrict actions
const checkDoctorRestrictions = async (req, res, next) => {
  try {
    // Only apply to doctors
    if (req.user.role !== 'DOCTOR') {
      return next();
    }

    // Check if doctor is suspended
    const doctor = await User.findById(req.user._id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }
    
    // If doctor is suspended, restrict actions
    if (doctor.suspendedAt) {
      return res.status(403).json({
        success: false,
        message: 'Your account is suspended. You cannot perform this action.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { checkDoctorRestrictions };