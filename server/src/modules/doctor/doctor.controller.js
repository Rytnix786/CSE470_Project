const DoctorProfile = require('../../models/DoctorProfile');
const User = require('../../models/User');
const AvailabilitySlot = require('../../models/AvailabilitySlot');
const { sendEmail } = require('../../config/email');

// Doctor creates/updates their profile
const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { specialization, experienceYears, fee, bio, licenseNo, docUploadUrl } = req.body;

    // Check if user is a doctor
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can create profiles',
      });
    }

    // Find existing profile or create new
    let profile = await DoctorProfile.findOne({ userId });

    if (profile) {
      // Update existing
      profile.specialization = specialization;
      profile.experienceYears = experienceYears;
      profile.fee = fee;
      profile.bio = bio;
      profile.licenseNo = licenseNo;
      if (docUploadUrl) profile.docUploadUrl = docUploadUrl;
      // Reset verification if profile is updated
      profile.verificationStatus = 'PENDING';
      await profile.save();
    } else {
      // Create new
      profile = await DoctorProfile.create({
        userId,
        specialization,
        experienceYears,
        fee,
        bio,
        licenseNo,
        docUploadUrl: docUploadUrl || '',
      });
    }

    res.json({
      success: true,
      message: 'Profile saved successfully. Awaiting admin verification.',
      data: { profile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Doctor gets their own profile
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const profile = await DoctorProfile.findOne({ userId }).populate('userId', 'name email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    res.json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public - Get list of verified doctors with filters
const getVerifiedDoctors = async (req, res) => {
  try {
    const { specialization, minFee, maxFee, q, availableOn } = req.query;

    let query = { verificationStatus: 'VERIFIED' };

    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }

    if (minFee || maxFee) {
      query.fee = {};
      if (minFee) query.fee.$gte = Number(minFee);
      if (maxFee) query.fee.$lte = Number(maxFee);
    }

    if (q) {
      query.$or = [
        { specialization: new RegExp(q, 'i') },
        { bio: new RegExp(q, 'i') },
      ];
    }

    let doctors = await DoctorProfile.find(query).populate('userId', 'name email');

    // Filter by availability if requested
    if (availableOn) {
      const availableDoctorIds = await AvailabilitySlot.distinct('doctorId', {
        date: availableOn,
        isBooked: false,
      });

      doctors = doctors.filter((doc) => 
        availableDoctorIds.some(id => id.equals(doc.userId._id))
      );
    }

    res.json({
      success: true,
      data: { doctors },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public - Get single doctor details
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await DoctorProfile.findOne({ 
      userId: id,
      verificationStatus: 'VERIFIED'
    }).populate('userId', 'name email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not verified',
      });
    }

    res.json({
      success: true,
      data: { doctor: profile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin - Get pending doctors
const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await DoctorProfile.find({ 
      verificationStatus: 'PENDING' 
    }).populate('userId', 'name email');

    res.json({
      success: true,
      data: { doctors },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin - Verify or reject doctor
const verifyDoctor = async (req, res) => {
  try {
    const { doctorUserId } = req.params;
    const { status, rejectionReason } = req.body;

    const profile = await DoctorProfile.findOne({ userId: doctorUserId }).populate('userId');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    profile.verificationStatus = status;
    if (status === 'REJECTED' && rejectionReason) {
      profile.rejectionReason = rejectionReason;
    }
    await profile.save();

    // Send notification email
    const statusText = status === 'VERIFIED' ? 'verified' : 'rejected';
    await sendEmail({
      to: profile.userId.email,
      subject: `Doctor Profile ${statusText.toUpperCase()} - BRACU Consultation`,
      html: `
        <h2>Profile ${statusText}</h2>
        <p>Hi Dr. ${profile.userId.name},</p>
        <p>Your doctor profile has been ${statusText}.</p>
        ${status === 'REJECTED' && rejectionReason ? `<p>Reason: ${rejectionReason}</p>` : ''}
        ${status === 'VERIFIED' ? '<p>You can now manage your availability and receive appointment bookings!</p>' : ''}
      `,
    });

    res.json({
      success: true,
      message: `Doctor ${statusText} successfully`,
      data: { profile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrUpdateProfile,
  getMyProfile,
  getVerifiedDoctors,
  getDoctorById,
  getPendingDoctors,
  verifyDoctor,
};
