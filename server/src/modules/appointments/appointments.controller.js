const Appointment = require('../../models/Appointment');
const AvailabilitySlot = require('../../models/AvailabilitySlot');
const DoctorProfile = require('../../models/DoctorProfile');
const { sendEmail } = require('../../config/email');

// Patient books an appointment
const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { doctorId, slotId } = req.body;

    // Check if slot is available
    const slot = await AvailabilitySlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found',
      });
    }

    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Slot is already booked',
      });
    }

    if (slot.doctorId.toString() !== doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Slot does not belong to this doctor',
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      slotId,
    });

    // Mark slot as booked
    slot.isBooked = true;
    await slot.save();

    // Populate details
    await appointment.populate([
      { path: 'patientId', select: 'name email' },
      { path: 'doctorId', select: 'name email' },
      { path: 'slotId' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully. Please proceed to payment.',
      data: { appointment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user appointments (patient or doctor)
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let query = {};
    if (role === 'PATIENT') {
      query.patientId = userId;
    } else if (role === 'DOCTOR') {
      query.doctorId = userId;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .populate('slotId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { appointments },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { cancelReason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check ownership
    if (appointment.patientId.toString() !== userId.toString() && 
        appointment.doctorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment',
      });
    }

    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${appointment.status.toLowerCase()} appointment`,
      });
    }

    appointment.status = 'CANCELLED';
    appointment.cancelReason = cancelReason || '';
    await appointment.save();

    // Free up the slot
    const slot = await AvailabilitySlot.findById(appointment.slotId);
    if (slot) {
      slot.isBooked = false;
      await slot.save();
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reschedule appointment
const rescheduleAppointment = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { id } = req.params;
    const { newSlotId } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Check new slot
    const newSlot = await AvailabilitySlot.findById(newSlotId);

    if (!newSlot || newSlot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'New slot is not available',
      });
    }

    if (newSlot.doctorId.toString() !== appointment.doctorId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'New slot must be with the same doctor',
      });
    }

    // Free old slot
    const oldSlot = await AvailabilitySlot.findById(appointment.slotId);
    if (oldSlot) {
      oldSlot.isBooked = false;
      await oldSlot.save();
    }

    // Book new slot
    newSlot.isBooked = true;
    await newSlot.save();

    // Update appointment
    appointment.slotId = newSlotId;
    appointment.status = 'RESCHEDULED';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: { appointment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get doctor's appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email')
      .populate('slotId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { appointments },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single appointment
const getAppointmentById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .populate('slotId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check access
    if (appointment.patientId._id.toString() !== userId.toString() &&
        appointment.doctorId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment',
      });
    }

    res.json({
      success: true,
      data: { appointment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getDoctorAppointments,
  getAppointmentById,
};
