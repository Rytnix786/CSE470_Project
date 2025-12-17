const ChatMessage = require('../../models/ChatMessage');
const Appointment = require('../../models/Appointment');

// Get chat messages for an appointment
const getMessages = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;

    // Verify access to appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.patientId.toString() !== userId.toString() &&
        appointment.doctorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this chat',
      });
    }

    const messages = await ChatMessage.find({ appointmentId })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// End consultation (doctor only)
const endConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.user._id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.doctorId.toString() !== doctorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the doctor can end the consultation',
      });
    }

    if (appointment.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Can only end confirmed consultations',
      });
    }

    appointment.status = 'COMPLETED';
    await appointment.save();

    res.json({
      success: true,
      message: 'Consultation ended successfully',
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
  getMessages,
  endConsultation,
};
