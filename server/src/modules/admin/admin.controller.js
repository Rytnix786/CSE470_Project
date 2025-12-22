const User = require('../../models/User');
const DoctorProfile = require('../../models/DoctorProfile');
const AdminAuditLog = require('../../models/AdminAuditLog');
const Appointment = require('../../models/Appointment');
const Review = require('../../models/Review');
const Report = require('../../models/Report');
const { createNotification } = require('../../utils/notify');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id)
      .select('-password -emailVerificationToken');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.json({
      success: true,
      data: { admin },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    // Normalize request body to handle both legacy and current field names
    const normalizedBody = {
      // Map {name/fullName} -> name
      name: req.body.name || req.body.fullName,
      // Map {phone/phoneNumber} -> phone (keep phone optional)
      phone: req.body.phone !== undefined ? req.body.phone : req.body.phoneNumber,
      // Email and role from request body
      email: req.body.email,
      role: req.body.role
    };
    
    // Filter out undefined fields to allow partial updates
    const updateData = {};
    Object.keys(normalizedBody).forEach(key => {
      if (normalizedBody[key] !== undefined) {
        updateData[key] = normalizedBody[key];
      }
    });
    
    // Check if any fields are being updated
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update fields provided',
      });
    }

    // Handle name update - trim whitespace
    // Name is required, so validate it if provided
    if (updateData.name !== undefined) {
      if (updateData.name === '' || updateData.name === null) {
        return res.status(400).json({
          success: false,
          message: 'Name is required',
        });
      } else {
        updateData.name = updateData.name.trim();
      }
    }

    // Handle phone update - accept any string, including empty/null
    if (updateData.phone !== undefined) {
      if (updateData.phone === '' || updateData.phone === null) {
        updateData.phone = null; // Set to null instead of removing
      }
    }
    
    // Handle email validation if provided
    if (updateData.email !== undefined) {
      if (updateData.email === '' || updateData.email === null) {
        return res.status(400).json({
          success: false,
          message: 'Email cannot be empty',
        });
      }
      // Basic email format validation
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email',
        });
      }
    }
    
    // Handle role validation if provided
    if (updateData.role !== undefined) {
      const validRoles = ['PATIENT', 'DOCTOR', 'ADMIN'];
      if (!validRoles.includes(updateData.role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be one of: ' + validRoles.join(', '),
        });
      }
    }

    const admin = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password -emailVerificationToken');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { admin },
    });
  } catch (error) {
    // Return more specific error messages
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => `${e.path}: ${e.message}`);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Change admin password
const changeAdminPassword = async (req, res) => {
  try {
    // Normalize request body to handle both legacy and current field names
    const normalizedBody = {
      // Map {currentPassword/oldPassword} -> currentPassword
      currentPassword: req.body.currentPassword || req.body.oldPassword,
      // Map {newPassword/password} -> newPassword
      newPassword: req.body.newPassword || req.body.password
    };
    
    const { currentPassword, newPassword } = normalizedBody;

    // Validate input
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is required',
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required',
      });
    }

    // Get admin with password
    const admin = await User.findById(req.user._id).select('+password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Check current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password - assign plain text, let pre-save hook handle hashing
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get admin audit logs
const getAuditLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1, actionType, targetId } = req.query;
    const skip = (page - 1) * limit;

    // For admins, show all audit logs (not just their own)
    let query = {};

    if (actionType) {
      query.actionType = actionType;
    }

    if (targetId) {
      query.targetId = targetId;
    }

    const logs = await AdminAuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('adminId', 'name email');

    const total = await AdminAuditLog.countDocuments(query);

    res.json({
      success: true,
      data: { logs, total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    console.error('Error in getAuditLogs:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Suspend a doctor
const suspendDoctor = async (req, res) => {
  try {
    const { doctorUserId } = req.params;
    const { reason, note } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor id',
      });
    }

    // Validate reason is provided
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Reason is required for suspension',
      });
    }

    // Find the doctor user
    const doctorUser = await User.findById(doctorUserId);
    if (!doctorUser || doctorUser.role !== 'DOCTOR') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Suspend the doctor
    doctorUser.isActive = false;
    doctorUser.suspendedAt = new Date();
    await doctorUser.save();

    // Also update the doctor profile if it exists
    console.log('DEBUG: Looking for doctor profile with userId:', doctorUserId);
    const profileResult = await DoctorProfile.findOneAndUpdate(
      { userId: doctorUserId },
      { verificationStatus: 'SUSPENDED' },
      { new: true }
    );
    console.log('DEBUG: Doctor profile update result:', profileResult);
    if (profileResult) {
      console.log('DEBUG: Updated profile verificationStatus:', profileResult.verificationStatus);
    }
    
    // Check if profile was found and updated
    if (!profileResult) {
      console.log('DEBUG: WARNING - Doctor profile not found for update');
      // Try to find the profile to see what's in the database
      const existingProfile = await DoctorProfile.findOne({ userId: doctorUserId });
      console.log('DEBUG: Existing profile in database:', existingProfile);
      if (existingProfile) {
        console.log('DEBUG: Existing profile verificationStatus:', existingProfile.verificationStatus);
      }
    }
    
    // Also log the actual doctor profile to see what's in the database
    const actualProfile = await DoctorProfile.findOne({ userId: doctorUserId });
    console.log('DEBUG: Actual doctor profile in database:', actualProfile);
    if (actualProfile) {
      console.log('DEBUG: Actual profile verificationStatus:', actualProfile.verificationStatus);
    }

    // Create notification for the doctor
    await createNotification({
      recipientUserId: doctorUserId,
      recipientRole: 'DOCTOR',
      type: 'VERIFICATION',
      title: 'Account Suspended',
      message: 'Your account has been suspended. Please contact support/admin.',
      metadata: { action: 'SUSPENDED' }
    });

    // Log the action with reason
    await AdminAuditLog.create({
      adminId: req.user._id,
      actionType: 'SUSPEND_DOCTOR',
      targetType: 'DOCTOR',
      targetId: doctorUserId,
      note: reason + (note ? ` - ${note}` : ''),
    });

    res.json({
      success: true,
      message: 'Doctor suspended successfully',
      data: { doctor: doctorUser },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Unsuspend a doctor
const unsuspendDoctor = async (req, res) => {
  try {
    const { doctorUserId } = req.params;
    const { note } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor id',
      });
    }

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

    // Check if doctor has requested re-verification
    if (doctorProfile.verificationStatus === 'SUSPENDED' && !doctorProfile.reverificationRequestedAt) {
      return res.status(403).json({
        success: false,
        message: 'Doctor must request re-verification before unsuspending.',
      });
    }

    // Unsuspend the doctor but keep verification status as is
    doctorUser.isActive = true;
    doctorUser.suspendedAt = null;
    await doctorUser.save();

    // Clear reverification requested flag
    doctorProfile.reverificationRequestedAt = null;
    await doctorProfile.save();

    // Create notification for the doctor
    await createNotification({
      recipientUserId: doctorUserId,
      recipientRole: 'DOCTOR',
      type: 'VERIFICATION',
      title: 'Account Unsuspended',
      message: 'Your account has been unsuspended. You can use the platform again.',
      metadata: { action: 'UNSUSPENDED' }
    });

    // Log the action
    await AdminAuditLog.create({
      adminId: req.user._id,
      actionType: 'UNSUSPEND_DOCTOR',
      targetType: 'DOCTOR',
      targetId: doctorUserId,
      note: note || 'Doctor unsuspended by admin',
    });

    res.json({
      success: true,
      message: 'Doctor unsuspended successfully',
      data: { doctor: doctorUser },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get doctor by userId
const getDoctorById = async (req, res) => {
  try {
    const { doctorUserId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID',
      });
    }

    // Aggregate doctor with user
    const doctors = await DoctorProfile.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(doctorUserId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]);

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Add id alias for frontend convenience
    const doctor = {
      ...doctors[0],
      id: doctors[0].user._id.toString()
    };

    res.json({
      success: true,
      data: { doctor }
    });
  } catch (error) {
    console.error('Error in getDoctorById:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all doctors with filters
const getAllDoctors = async (req, res) => {
  try {
    const { status, active, q, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    const userQuery = {};

    // Status filter (verification status)
    if (status) {
      query.verificationStatus = status;
    }

    // Active filter
    if (active) {
      if (active === 'active') {
        userQuery.isActive = true;
        userQuery.suspendedAt = null;
        userQuery.deletedAt = null;
      } else if (active === 'suspended') {
        userQuery.suspendedAt = { $ne: null };
        userQuery.deletedAt = null;
      } else if (active === 'deleted') {
        userQuery.deletedAt = { $ne: null };
      }
    }

    // Text search
    let textSearch = null;
    if (q) {
      textSearch = new RegExp(q, 'i');
      // We'll filter after population
    }

    // Aggregate doctors with users
    const aggregatePipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: userQuery }
    ];

    // Add text search if provided
    if (textSearch) {
      aggregatePipeline.push({
        $match: {
          $or: [
            { 'user.name': textSearch },
            { 'user.email': textSearch },
            { specialization: textSearch },
            { licenseNo: textSearch },
            { bio: textSearch }
          ]
        }
      });
    }

    // Add sorting, pagination
    aggregatePipeline.push({ $sort: { 'user.createdAt': -1 } });
    
    // Get total count
    const countPipeline = [...aggregatePipeline, { $count: 'total' }];
    const countResult = await DoctorProfile.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    aggregatePipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    const doctors = await DoctorProfile.aggregate(aggregatePipeline);

    // Add id alias for frontend convenience
    const doctorsWithIdAlias = doctors.map(doctor => ({
      ...doctor,
      id: doctor.user._id.toString()
    }));

    res.json({
      success: true,
      data: { doctors: doctorsWithIdAlias, total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    console.error('Error in getAllDoctors:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get admin stats
const getAdminStats = async (req, res) => {
  try {
    // Count pending verifications (pending doctors who are active)
    const pendingQuery = DoctorProfile.aggregate([
      {
        $match: {
          verificationStatus: 'PENDING'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.isActive': true,
          'user.role': 'DOCTOR'
        }
      },
      {
        $count: 'total'
      }
    ]);

    const pendingResult = await pendingQuery;
    const pendingVerifications = pendingResult.length > 0 ? pendingResult[0].total : 0;

    // Count total active doctors
    const totalDoctors = await User.countDocuments({
      role: 'DOCTOR',
      isActive: true
    });

    // Count total active patients
    const totalPatients = await User.countDocuments({
      role: 'PATIENT',
      isActive: true
    });

    // Count total appointments
    const totalAppointments = await Appointment.countDocuments({});

    res.json({
      success: true,
      data: {
        pendingVerifications,
        totalDoctors,
        totalPatients,
        totalAppointments
      }
    });
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Edit doctor profile
const editDoctorProfile = async (req, res) => {
  try {
    const { doctorUserId } = req.params;
    
    // Normalize request body to handle both legacy and current field names
    const normalizedBody = {
      // User model fields
      name: req.body.name || req.body.fullName,
      email: req.body.email,
      role: req.body.role,
      phone: req.body.phone || req.body.phoneNumber,
      
      // DoctorProfile model fields
      // Map {specialization/department} -> specialization
      specialization: req.body.specialization || req.body.department,
      // Map {fee/consultationFee} -> fee
      fee: req.body.fee !== undefined ? req.body.fee : req.body.consultationFee,
      // Other DoctorProfile fields
      experienceYears: req.body.experienceYears,
      bio: req.body.bio,
      licenseNo: req.body.licenseNo
    };
    
    // Separate updates for User and DoctorProfile models
    const userUpdateData = {};
    const doctorProfileUpdateData = {};
    
    // Define which fields belong to which model
    const userFields = ['name', 'email', 'role', 'phone'];
    const doctorProfileFields = ['specialization', 'experienceYears', 'fee', 'bio', 'licenseNo'];
    
    // Distribute fields to appropriate update objects
    Object.keys(normalizedBody).forEach(key => {
      if (normalizedBody[key] !== undefined) {
        if (userFields.includes(key)) {
          userUpdateData[key] = normalizedBody[key];
        } else if (doctorProfileFields.includes(key)) {
          doctorProfileUpdateData[key] = normalizedBody[key];
        }
      }
    });
    
    // Check if any fields are being updated
    if (Object.keys(userUpdateData).length === 0 && Object.keys(doctorProfileUpdateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update fields provided',
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor id',
      });
    }

    // Update User document if there are user fields to update
    let doctorUser = null;
    if (Object.keys(userUpdateData).length > 0) {
      doctorUser = await User.findByIdAndUpdate(
        doctorUserId,
        { $set: userUpdateData },
        { new: true, runValidators: true, context: 'query' }
      );
      
      if (!doctorUser || doctorUser.role !== 'DOCTOR') {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found',
        });
      }
    } else {
      // Just fetch the doctor user for audit log if no user updates
      doctorUser = await User.findById(doctorUserId);
      if (!doctorUser || doctorUser.role !== 'DOCTOR') {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found',
        });
      }
    }

    // Update DoctorProfile document if there are profile fields to update
    let doctorProfile = null;
    if (Object.keys(doctorProfileUpdateData).length > 0) {
      doctorProfile = await DoctorProfile.findOneAndUpdate(
        { userId: doctorUserId },
        { $set: doctorProfileUpdateData },
        { new: true, runValidators: true, context: 'query' }
      );
      
      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found',
        });
      }
    } else {
      // Just fetch the doctor profile for audit log if no profile updates
      doctorProfile = await DoctorProfile.findOne({ userId: doctorUserId });
      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found',
        });
      }
    }

    // Store original values for audit log
    const originalValues = {};
    const changedFields = {};
    
    // Track changes from both user and profile updates
    Object.keys(userUpdateData).forEach(key => {
      if (doctorUser && doctorUser[key] !== undefined && doctorUser[key] !== userUpdateData[key]) {
        originalValues[`user.${key}`] = doctorUser[key];
        changedFields[`user.${key}`] = userUpdateData[key];
      }
    });
    
    Object.keys(doctorProfileUpdateData).forEach(key => {
      if (doctorProfile && doctorProfile[key] !== undefined && doctorProfile[key] !== doctorProfileUpdateData[key]) {
        originalValues[`profile.${key}`] = doctorProfile[key];
        changedFields[`profile.${key}`] = doctorProfileUpdateData[key];
      }
    });

    // Log the action
    await AdminAuditLog.create({
      adminId: req.user._id,
      actionType: 'EDIT_DOCTOR',
      targetType: 'DOCTOR',
      targetId: doctorUserId,
      note: 'Doctor profile edited by admin',
      metadata: {
        changedFields,
        originalValues
      }
    });

    // Return combined data from both User and DoctorProfile in the format expected by frontend
    const responseData = {
      ...(doctorProfile?.toObject() || {}),
      user: doctorUser?.toObject() || {}
    };
    
    res.json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: { doctor: responseData },
    });
  } catch (error) {
    console.error('Error in editDoctorProfile:', error);
    // Return more specific error messages
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => `${e.path}: ${e.message}`);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get doctor reviews (admin only)
const getDoctorReviews = async (req, res) => {
  try {
    const { doctorUserId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID',
      });
    }

    // Check if doctor exists
    const doctorUser = await User.findById(doctorUserId);
    if (!doctorUser || doctorUser.role !== 'DOCTOR') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const reviews = await Review.find({ doctorId: new mongoose.Types.ObjectId(doctorUserId) })
      .populate('patientId', 'name email')
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

// Get doctor reports (admin only)
const getDoctorReports = async (req, res) => {
  try {
    const { doctorUserId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID',
      });
    }

    // Check if doctor exists
    const doctorUser = await User.findById(doctorUserId);
    if (!doctorUser || doctorUser.role !== 'DOCTOR') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const reports = await Report.find({ doctorId: new mongoose.Types.ObjectId(doctorUserId) })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { reports },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAuditLogs,
  getAdminStats,
  getAllDoctors,
  getDoctorById,
  suspendDoctor,
  unsuspendDoctor,
  editDoctorProfile,
  getDoctorReviews,
  getDoctorReports,
};