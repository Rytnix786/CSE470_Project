import { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, paymentsAPI, prescriptionsAPI } from '../api/api';
import { cleanDoctorName } from '../utils/doctorUtils';

// Hook to automatically generate notifications based on user data
export const useAutoNotifications = () => {
  const { addNotification, notifications } = useNotifications();
  const { user } = useAuth();

  // Function to check for appointment notifications
  const checkAppointmentNotifications = async () => {
    if (!user) return;
    
    try {
      let appointmentsRes;
      if (user.role === 'PATIENT') {
        appointmentsRes = await appointmentsAPI.getMyAppointments();
      } else if (user.role === 'DOCTOR') {
        appointmentsRes = await appointmentsAPI.getDoctorAppointments();
      }
      
      if (appointmentsRes?.data?.appointments) {
        const appointments = appointmentsRes.data.appointments;
        
        // Check for confirmed appointments
        appointments.forEach(apt => {
          if (apt.status === 'CONFIRMED') {
            // Check if we already have this notification
            const existingNotification = notifications.find(
              n => n.type === 'appointment' && n.appointmentId === apt._id && n.status === 'confirmed'
            );
            
            if (!existingNotification) {
              addNotification({
                type: 'appointment',
                message: `Appointment with ${user.role === 'PATIENT' ? 'Dr. ' + cleanDoctorName(apt.doctorId.name) : apt.patientId.name} confirmed for ${apt.slotId?.date} at ${apt.slotId?.startTime}`,
                appointmentId: apt._id,
                status: 'confirmed'
              });
            }
          }
          
          if (apt.status === 'CANCELLED') {
            // Check if we already have this notification
            const existingNotification = notifications.find(
              n => n.type === 'appointment' && n.appointmentId === apt._id && n.status === 'cancelled'
            );
            
            if (!existingNotification) {
              addNotification({
                type: 'appointment',
                message: `Appointment with ${user.role === 'PATIENT' ? 'Dr. ' + cleanDoctorName(apt.doctorId.name) : apt.patientId.name} has been cancelled`,
                appointmentId: apt._id,
                status: 'cancelled'
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to check appointment notifications:', error);
    }
  };

  // Function to check for payment notifications
  const checkPaymentNotifications = async () => {
    if (!user) return;
    
    try {
      const appointmentsRes = user.role === 'PATIENT' 
        ? await appointmentsAPI.getMyAppointments()
        : await appointmentsAPI.getDoctorAppointments();
      
      if (appointmentsRes?.data?.appointments) {
        const appointments = appointmentsRes.data.appointments;
        
        // Check each appointment for payment status
        for (const apt of appointments) {
          try {
            const paymentRes = await paymentsAPI.getPaymentByAppointment(apt._id);
            
            if (paymentRes?.data?.payment) {
              const payment = paymentRes.data.payment;
              
              if (payment.status === 'SUCCESS') {
                // Check if we already have this notification
                const existingNotification = notifications.find(
                  n => n.type === 'payment' && n.paymentId === payment._id && n.status === 'success'
                );
                
                if (!existingNotification) {
                  addNotification({
                    type: 'payment',
                    message: `Payment of BDT ${payment.amount} for appointment with ${user.role === 'PATIENT' ? 'Dr. ' + cleanDoctorName(apt.doctorId.name) : apt.patientId.name} was successful`,
                    paymentId: payment._id,
                    status: 'success'
                  });
                }
              }
              
              if (payment.status === 'REFUNDED') {
                // Check if we already have this notification
                const existingNotification = notifications.find(
                  n => n.type === 'payment' && n.paymentId === payment._id && n.status === 'refunded'
                );
                
                if (!existingNotification) {
                  addNotification({
                    type: 'payment',
                    message: `Payment of BDT ${payment.amount} for appointment with ${user.role === 'PATIENT' ? 'Dr. ' + cleanDoctorName(apt.doctorId.name) : apt.patientId.name} has been refunded`,
                    paymentId: payment._id,
                    status: 'refunded'
                  });
                }
              }
            }
          } catch (error) {
            // Payment might not exist for this appointment, that's okay
            continue;
          }
        }
      }
    } catch (error) {
      console.error('Failed to check payment notifications:', error);
    }
  };

  // Function to check for prescription notifications
  const checkPrescriptionNotifications = async () => {
    if (!user) return;
    
    try {
      let prescriptionsRes;
      if (user.role === 'PATIENT') {
        prescriptionsRes = await prescriptionsAPI.getMyPrescriptions();
      } else if (user.role === 'DOCTOR') {
        prescriptionsRes = await prescriptionsAPI.getMyDoctorPrescriptions();
      }
      
      if (prescriptionsRes?.data?.prescriptions) {
        const prescriptions = prescriptionsRes.data.prescriptions;
        
        prescriptions.forEach(prescription => {
          // Check if we already have this notification
          const existingNotification = notifications.find(
            n => n.type === 'prescription' && n.prescriptionId === prescription._id
          );
          
          if (!existingNotification) {
            addNotification({
              type: 'prescription',
              message: `New prescription received from Dr. ${cleanDoctorName(prescription.doctorId.name)}`,
              prescriptionId: prescription._id
            });
          }
        });
      }
    } catch (error) {
      console.error('Failed to check prescription notifications:', error);
    }
  };

  // Check for notifications periodically
  useEffect(() => {
    if (!user) return;
    
    // Initial check
    checkAppointmentNotifications();
    checkPaymentNotifications();
    checkPrescriptionNotifications();
    
    // Set up interval to check periodically (every 5 minutes)
    const interval = setInterval(() => {
      checkAppointmentNotifications();
      checkPaymentNotifications();
      checkPrescriptionNotifications();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [user]);
};