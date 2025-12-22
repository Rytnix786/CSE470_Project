const Report = require('../../models/Report');
const Appointment = require('../../models/Appointment');
const AdminAuditLog = require('../../models/AdminAuditLog');
const { createNotification } = require('../../utils/notify');
const mongoose = require('mongoose');

// Create a report
const createReport = async (req, res) => {
  try {
    const { doctorId, appointmentId, reason, description } = req.body;
    const patientId = req.user._id;

    // Verify appointment exists and belongs to patient
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if appointment belongs to patient
    if (appointment.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to report this appointment',
      });
    }

    // Check if appointment is with the specified doctor
    if (appointment.doctorId.toString() !== doctorId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID does not match appointment',
      });
    }

    // Check if report already exists for this appointment
    const existingReport = await Report.findOne({ appointmentId });
    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Report already exists for this appointment',
      });
    }

    // Create report
    const report = await Report.create({
      patientId,
      doctorId,
      appointmentId,
      reason,
      description,
    });

    // Fetch doctor name for notification
    const User = require('../../models/User');
    const DoctorProfile = require('../../models/DoctorProfile');
    const doctorUser = await User.findById(doctorId).select('name');
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId }).select('licenseNo specialization');
    
    const doctorName = doctorUser ? doctorUser.name : `Doctor ${doctorId}`;
    const licenseInfo = doctorProfile && doctorProfile.licenseNo ? ` (License: ${doctorProfile.licenseNo})` : '';

    // Create notification for admin
    await createNotification({
      recipientRole: 'ADMIN',
      type: 'SYSTEM',
      title: 'New Doctor Report',
      message: `A new report has been submitted against Dr. ${doctorName}${licenseInfo}`,
      metadata: { reportId: report._id, doctorId, doctorName, patientId }
    });

    // Note: We don't log patient report creation in AdminAuditLog
    // Only admin actions should be logged there

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: { report },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get reports (admin only)
const getReports = async (req, res) => {
  try {
    const { status, reason, doctorId, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (reason) {
      query.reason = reason;
    }

    if (doctorId) {
      query.doctorId = doctorId;
    }

    const reports = await Report.find(query)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: { 
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        }
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get report by ID (admin only)
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID',
      });
    }

    const report = await Report.findById(id)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email')
      .populate('appointmentId');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    res.json({
      success: true,
      data: { report },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update report (admin only)
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, internalNote } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID',
      });
    }

    // Find the report
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Store original values for audit log
    const originalStatus = report.status;

    // Update report
    if (status) {
      report.status = status;
    }
    
    if (internalNote !== undefined) {
      report.internalNote = internalNote;
    }

    await report.save();

    // Log the action
    const changedFields = {};
    if (status && status !== originalStatus) {
      changedFields.status = { from: originalStatus, to: status };
    }
    
    await AdminAuditLog.create({
      adminId: req.user._id,
      actionType: 'UPDATE_REPORT',
      targetType: 'REPORT',
      targetId: report._id,
      note: internalNote || `Report status updated from ${originalStatus} to ${status}`,
      metadata: { changedFields }
    });

    // Populate for response
    const populatedReport = await Report.findById(report._id)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email');

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: { report: populatedReport },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
};