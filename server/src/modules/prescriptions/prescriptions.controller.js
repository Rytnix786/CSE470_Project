const Prescription = require('../../models/Prescription');
const Appointment = require('../../models/Appointment');
const { sendEmail } = require('../../config/email');

// Doctor creates prescription
const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { appointmentId, patientId, items, diagnosis, additionalNotes } = req.body;

    // Verify appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.doctorId._id.toString() !== doctorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create prescription for this appointment',
      });
    }

    // Check if prescription already exists
    const existing = await Prescription.findOne({ appointmentId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Prescription already exists for this appointment',
      });
    }

    // Create prescription
    const prescription = await Prescription.create({
      appointmentId,
      doctorId,
      patientId,
      items,
      diagnosis: diagnosis || '',
      additionalNotes: additionalNotes || '',
    });

    // Send email notification
    await sendEmail({
      to: appointment.patientId.email,
      subject: 'Prescription Created - BRACU Consultation System',
      html: `
        <h2>New Prescription Available</h2>
        <p>Hi ${appointment.patientId.name},</p>
        <p>Dr. ${appointment.doctorId.name} has created a prescription for you.</p>
        <p>Please log in to view your prescription details.</p>
        <p>Diagnosis: ${diagnosis || 'N/A'}</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: { prescription },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get prescription by appointment
const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescription = await Prescription.findOne({ appointmentId })
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    // Check access
    if (prescription.patientId._id.toString() !== req.user._id.toString() &&
        prescription.doctorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this prescription',
      });
    }

    res.json({
      success: true,
      data: { prescription },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get patient prescriptions
const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check access
    if (patientId !== req.user._id.toString() && req.user.role !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name email')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { prescriptions },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get my prescriptions (patient)
const getMyPrescriptions = async (req, res) => {
  try {
    const patientId = req.user._id;

    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name email')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { prescriptions },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPrescription,
  getPrescriptionByAppointment,
  getPatientPrescriptions,
  getMyPrescriptions,
};
