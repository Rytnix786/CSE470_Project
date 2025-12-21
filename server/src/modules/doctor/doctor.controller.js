const DoctorProfile = require('../../models/DoctorProfile');
const User = require('../../models/User');
const AvailabilitySlot = require('../../models/AvailabilitySlot');
const AdminAuditLog = require('../../models/AdminAuditLog');
const { sendEmail } = require('../../config/email');
const { createVerificationNotification } = require('../../utils/notify');

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

    // Find verified doctors with active users
    let doctors = await DoctorProfile.find({
      verificationStatus: 'VERIFIED'
    }).populate({
      path: 'userId',
      match: { 
        isActive: true,
        role: 'DOCTOR'
      },
      select: 'name email role isActive'
    });

    // Filter out doctors whose users were not populated (inactive or non-doctors)
    doctors = doctors.filter(doc => doc.userId);

    // Apply additional filters
    if (specialization) {
      const regex = new RegExp(specialization, 'i');
      doctors = doctors.filter(doc => regex.test(doc.specialization));
    }

    if (minFee || maxFee) {
      doctors = doctors.filter(doc => {
        if (minFee && doc.fee < Number(minFee)) return false;
        if (maxFee && doc.fee > Number(maxFee)) return false;
        return true;
      });
    }

    if (q) {
      const regex = new RegExp(q, 'i');
      doctors = doctors.filter(doc => 
        regex.test(doc.specialization) || regex.test(doc.bio)
      );
    }

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
    console.error('Error in getVerifiedDoctors:', error);
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
    }).populate({
      path: 'userId',
      match: { isActive: true },
      select: 'name email'
    });

    // Check if doctor user is active
    if (!profile || !profile.userId) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not verified',
      });
    }

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

// Admin - Get pending doctors (including re-verification requests)
const getPendingDoctors = async (req, res) => {
  try {
    // Find pending doctors with active users
    // This includes initial verification requests and re-verification requests
    let doctors = await DoctorProfile.find({
      verificationStatus: 'PENDING'
    }).populate({
      path: 'userId',
      match: { 
        isActive: true,
        role: 'DOCTOR'
      },
      select: 'name email role isActive'
    });

    // Filter out doctors whose users were not populated (inactive or non-doctors)
    doctors = doctors.filter(doc => doc.userId);

    res.json({
      success: true,
      data: { doctors },
    });
  } catch (error) {
    console.error('Error in getPendingDoctors:', error);
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

    // If verifying a doctor, make sure they are active
    if (status === 'VERIFIED') {
      const doctorUser = await User.findById(profile.userId);
      if (doctorUser) {
        doctorUser.isActive = true;
        doctorUser.suspendedAt = null;
        await doctorUser.save();
      }
    }

    // Create verification notification
    await createVerificationNotification(profile, status, rejectionReason);

    // Log the action
    const actionType = status === 'VERIFIED' ? 'VERIFY_DOCTOR' : 'REJECT_DOCTOR';
    await AdminAuditLog.create({
      adminId: req.user._id,
      actionType,
      targetType: 'DOCTOR',
      targetId: doctorUserId,
      note: status === 'VERIFIED' ? 'Doctor verified' : `Doctor rejected: ${rejectionReason || 'No reason provided'}`,
    });

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

// Request reverification for suspended doctors
const requestReverification = async (req, res) => {
  try {
    const doctorUserId = req.user._id;

    // Find the doctor user
    const doctorUser = await User.findById(doctorUserId);
    if (!doctorUser || doctorUser.role !== 'DOCTOR') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Find the doctor profile
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorUserId });
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    // Check if doctor is suspended or rejected
    if (doctorProfile.verificationStatus !== 'SUSPENDED' && doctorProfile.verificationStatus !== 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'Only suspended or rejected doctors can request reverification',
      });
    }

    // Update verification status to PENDING
    doctorProfile.verificationStatus = 'PENDING';
    await doctorProfile.save();

    // Keep doctor inactive until verified
    doctorUser.isActive = false;
    await doctorUser.save();

    // Note: We don't log doctor-initiated actions to AdminAuditLog
    // as they don't have an adminId and aren't admin actions

    res.json({
      success: true,
      message: 'Reverification request sent to admin',
      data: { profile: doctorProfile },
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
  requestReverification,
};
