const HealthRecord = require('../../models/HealthRecord');
const Appointment = require('../../models/Appointment');

// Create health record
const createHealthRecord = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { date, bloodPressure, bloodSugar, weight, height, notes } = req.body;

    const record = await HealthRecord.create({
      patientId,
      date: date ? new Date(date) : new Date(),
      bloodPressure: bloodPressure || { systolic: null, diastolic: null },
      bloodSugar: bloodSugar || null,
      weight: weight || null,
      height: height || null,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Health record created successfully',
      data: { record },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get my health records
const getMyHealthRecords = async (req, res) => {
  try {
    const patientId = req.user._id;

    const records = await HealthRecord.find({ patientId }).sort({ date: -1 });

    res.json({
      success: true,
      data: { records },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get health record by ID
const getHealthRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await HealthRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found',
      });
    }

    // Check access
    if (record.patientId.toString() !== req.user._id.toString() && req.user.role !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this record',
      });
    }

    res.json({
      success: true,
      data: { record },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update health record
const updateHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;

    const record = await HealthRecord.findOne({ _id: id, patientId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found',
      });
    }

    const { date, bloodPressure, bloodSugar, weight, height, notes } = req.body;

    if (date) record.date = new Date(date);
    if (bloodPressure) record.bloodPressure = bloodPressure;
    if (bloodSugar !== undefined) record.bloodSugar = bloodSugar;
    if (weight !== undefined) record.weight = weight;
    if (height !== undefined) record.height = height;
    if (notes !== undefined) record.notes = notes;

    await record.save();

    res.json({
      success: true,
      message: 'Health record updated successfully',
      data: { record },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete health record
const deleteHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;

    const record = await HealthRecord.findOne({ _id: id, patientId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found',
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'Health record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get patient health records (for doctors)
const getPatientHealthRecords = async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Requires DOCTOR role',
      });
    }

    const { patientId } = req.params;
    const doctorId = req.user._id;

    // Check if there's an appointment relationship
    const appointment = await Appointment.findOne({
      doctorId,
      patientId,
      status: { $in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] }
    });

    if (!appointment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - No valid appointment with this patient',
      });
    }

    // Get patient's health records (sorted newest first)
    const records = await HealthRecord.find({ patientId }).sort({ date: -1 });

    res.json({
      success: true,
      data: { records },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createHealthRecord,
  getMyHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
  getPatientHealthRecords,
};
