const Notification = require('../models/Notification');

/**
 * Create a notification for a specific user
 * @param {Object} options - Notification options
 * @param {String} options.recipientUserId - User ID of recipient (can be null for role-based)
 * @param {String} options.recipientRole - Role of recipient (ADMIN, DOCTOR, PATIENT, ALL)
 * @param {String} options.type - Type of notification (APPOINTMENT, PAYMENT, PRESCRIPTION, etc.)
 * @param {String} options.title - Title of notification
 * @param {String} options.message - Message content
 * @param {Object} options.metadata - Additional metadata
 */
const createNotification = async ({
  recipientUserId = null,
  recipientRole = 'ALL',
  type,
  title,
  message,
  metadata = {}
}) => {
  try {
    const notification = new Notification({
      recipientUserId,
      recipientRole,
      type,
      title,
      message,
      metadata
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Create appointment-related notifications
 */
const createAppointmentNotification = async (appointment, eventType) => {
  const { patientId, doctorId } = appointment;
  
  switch (eventType) {
    case 'BOOKED':
      // Notify doctor about new appointment
      await createNotification({
        recipientUserId: doctorId,
        recipientRole: 'DOCTOR',
        type: 'APPOINTMENT',
        title: 'New Appointment Request',
        message: 'You have a new appointment request',
        metadata: { appointmentId: appointment._id }
      });
      break;
      
    case 'CONFIRMED':
      // Notify patient about confirmed appointment
      await createNotification({
        recipientUserId: patientId,
        recipientRole: 'PATIENT',
        type: 'APPOINTMENT',
        title: 'Appointment Confirmed',
        message: 'Your appointment has been confirmed',
        metadata: { appointmentId: appointment._id }
      });
      break;
      
    case 'CANCELLED':
      // Notify both parties about cancellation
      await createNotification({
        recipientUserId: patientId,
        recipientRole: 'PATIENT',
        type: 'APPOINTMENT',
        title: 'Appointment Cancelled',
        message: 'Your appointment has been cancelled',
        metadata: { appointmentId: appointment._id }
      });
      
      await createNotification({
        recipientUserId: doctorId,
        recipientRole: 'DOCTOR',
        type: 'APPOINTMENT',
        title: 'Appointment Cancelled',
        message: 'An appointment with you has been cancelled',
        metadata: { appointmentId: appointment._id }
      });
      break;
  }
};

/**
 * Create payment-related notifications
 */
const createPaymentNotification = async (payment, eventType) => {
  const { appointmentId } = payment;
  
  // Get appointment to find patient/doctor
  const Appointment = require('../models/Appointment');
  const appointment = await Appointment.findById(appointmentId).populate('patientId doctorId');
  
  if (!appointment) return;
  
  const { patientId } = appointment;
  
  switch (eventType) {
    case 'SUCCESS':
      await createNotification({
        recipientUserId: patientId,
        recipientRole: 'PATIENT',
        type: 'PAYMENT',
        title: 'Payment Successful',
        message: 'Your payment has been processed successfully',
        metadata: { paymentId: payment._id, appointmentId: appointment._id }
      });
      break;
      
    case 'REFUNDED':
      await createNotification({
        recipientUserId: patientId,
        recipientRole: 'PATIENT',
        type: 'PAYMENT',
        title: 'Refund Processed',
        message: 'Your refund has been processed',
        metadata: { paymentId: payment._id, appointmentId: appointment._id }
      });
      break;
  }
};

/**
 * Create prescription-related notifications
 */
const createPrescriptionNotification = async (prescription) => {
  const { patientId, doctorId, appointmentId } = prescription;
  
  await createNotification({
    recipientUserId: patientId,
    recipientRole: 'PATIENT',
    type: 'PRESCRIPTION',
    title: 'New Prescription',
    message: 'You have received a new prescription',
    metadata: { prescriptionId: prescription._id, appointmentId, doctorId }
  });
};

/**
 * Create verification-related notifications
 */
const createVerificationNotification = async (profile, eventType, rejectionReason = null) => {
  const { userId } = profile;
  
  switch (eventType) {
    case 'VERIFIED':
      await createNotification({
        recipientUserId: userId,
        recipientRole: 'DOCTOR',
        type: 'VERIFICATION',
        title: 'Profile Verified',
        message: 'Your doctor profile has been verified',
        metadata: { profileId: profile._id }
      });
      break;
      
    case 'REJECTED':
      await createNotification({
        recipientUserId: userId,
        recipientRole: 'DOCTOR',
        type: 'VERIFICATION',
        title: 'Profile Rejected',
        message: `Your doctor profile has been rejected${rejectionReason ? `: ${rejectionReason}` : ''}`,
        metadata: { profileId: profile._id }
      });
      break;
  }
};

module.exports = {
  createNotification,
  createAppointmentNotification,
  createPaymentNotification,
  createPrescriptionNotification,
  createVerificationNotification
};