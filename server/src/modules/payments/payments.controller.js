const crypto = require('crypto');
const Payment = require('../../models/Payment');
const Appointment = require('../../models/Appointment');
const DoctorProfile = require('../../models/DoctorProfile');
const { sendEmail } = require('../../config/email');

// Initialize payment
const initPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email')
      .populate('slotId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if user is the patient
    if (appointment.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (appointment.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is not pending payment',
      });
    }

    // Get doctor fee
    const doctorProfile = await DoctorProfile.findOne({ userId: appointment.doctorId._id });
    const amount = doctorProfile ? doctorProfile.fee : 500; // Default fee

    // Check if payment already exists
    let payment = await Payment.findOne({ appointmentId });

    if (!payment) {
      // Create payment
      const txnRef = 'TXN-' + crypto.randomBytes(8).toString('hex').toUpperCase();

      payment = await Payment.create({
        appointmentId,
        amount,
        currency: 'BDT',
        txnRef,
      });
    }

    res.json({
      success: true,
      message: 'Payment initialized',
      data: { 
        payment,
        paymentIntent: {
          txnRef: payment.txnRef,
          amount: payment.amount,
          currency: payment.currency,
          // Mock payment gateway URL
          paymentUrl: `${process.env.CLIENT_URL}/payment/${payment.txnRef}`,
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

// Confirm payment (mock)
const confirmPayment = async (req, res) => {
  try {
    const { txnRef } = req.body;

    const payment = await Payment.findOne({ txnRef }).populate({
      path: 'appointmentId',
      populate: [
        { path: 'patientId', select: 'name email' },
        { path: 'doctorId', select: 'name email' },
        { path: 'slotId' },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status === 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: 'Payment already confirmed',
      });
    }

    // Update payment status
    payment.status = 'SUCCESS';
    await payment.save();

    // Update appointment status
    const appointment = payment.appointmentId;
    appointment.status = 'CONFIRMED';
    await appointment.save();

    // Send receipt email
    await sendEmail({
      to: appointment.patientId.email,
      subject: 'Payment Receipt - BRACU Consultation System',
      html: `
        <h2>Payment Successful!</h2>
        <p>Hi ${appointment.patientId.name},</p>
        <p>Your payment has been processed successfully.</p>
        <hr/>
        <h3>Receipt Details</h3>
        <p><strong>Transaction Ref:</strong> ${payment.txnRef}</p>
        <p><strong>Amount:</strong> ${payment.amount} ${payment.currency}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Doctor:</strong> ${appointment.doctorId.name}</p>
        <p><strong>Appointment Date:</strong> ${appointment.slotId.date}</p>
        <p><strong>Time:</strong> ${appointment.slotId.startTime} - ${appointment.slotId.endTime}</p>
        <hr/>
        <p>Thank you for using BRACU Consultation System!</p>
      `,
    });

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { payment, appointment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Refund payment
const refundPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const payment = await Payment.findOne({ appointmentId }).populate({
      path: 'appointmentId',
      populate: { path: 'patientId', select: 'name email' },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund successful payments',
      });
    }

    // Update payment status
    payment.status = 'REFUNDED';
    await payment.save();

    // Update appointment status
    const appointment = await Appointment.findById(appointmentId);
    appointment.status = 'CANCELLED';
    await appointment.save();

    // Send refund email
    await sendEmail({
      to: payment.appointmentId.patientId.email,
      subject: 'Refund Processed - BRACU Consultation System',
      html: `
        <h2>Refund Processed</h2>
        <p>Hi ${payment.appointmentId.patientId.name},</p>
        <p>Your payment has been refunded.</p>
        <p><strong>Transaction Ref:</strong> ${payment.txnRef}</p>
        <p><strong>Amount:</strong> ${payment.amount} ${payment.currency}</p>
        <p>The refund will reflect in your account within 5-7 business days.</p>
      `,
    });

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: { payment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get payment by appointment
const getPaymentByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check access
    if (appointment.patientId.toString() !== req.user._id.toString() &&
        appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const payment = await Payment.findOne({ appointmentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  initPayment,
  confirmPayment,
  refundPayment,
  getPaymentByAppointment,
};
