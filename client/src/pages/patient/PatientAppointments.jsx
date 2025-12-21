import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, paymentsAPI } from '../../api/api';
import { cleanDoctorName } from '../../utils/doctorUtils';

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentsAPI.getMyAppointments();
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handlePayment = async (appointmentId) => {
    setLoading(true);
    try {
      const initResponse = await paymentsAPI.initPayment(appointmentId);
      const txnRef = initResponse.data.payment.txnRef;
      
      // Mock payment confirmation
      if (confirm(`Proceed with payment of BDT ${initResponse.data.payment.amount}?`)) {
        await paymentsAPI.confirmPayment(txnRef);
        alert('Payment successful!');
        fetchAppointments();
      }
    } catch (error) {
      alert('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment? Refund depends on timing policy.')) return;

    try {
      const response = await appointmentsAPI.cancelAppointment(id, { cancelReason: 'Patient cancellation' });
      const refundAmount = response.data.refundAmount || 0;
      
      if (refundAmount > 0) {
        alert(`Appointment cancelled successfully. Refund amount: ${refundAmount} BDT`);
      } else {
        alert('Appointment cancelled successfully. No refund (within 24h policy).');
      }
      
      fetchAppointments();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100">My Appointments</h1>

      <div className="space-y-4">
        {appointments.map((apt) => (
          <div key={apt._id} className="bg-white p-6 rounded-lg shadow dark:bg-slate-900/70 dark:border dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Dr. {cleanDoctorName(apt.doctorId?.name)}</h3>
                <p className="text-slate-600 dark:text-slate-400">Date: {apt.slotId?.date}</p>
                <p className="text-slate-600 dark:text-slate-400">Time: {apt.slotId?.startTime} - {apt.slotId?.endTime}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                  {apt.status}
                </span>
              </div>
              <div className="flex gap-2">
                {apt.status === 'PENDING_PAYMENT' && (
                  <>
                    <button
                      onClick={() => handlePayment(apt._id)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => handleCancel(apt._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {apt.status === 'CONFIRMED' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/appointments/${apt._id}/chat`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                      Start Consultation
                    </button>
                    <button
                      onClick={() => handleCancel(apt._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center text-slate-500 dark:bg-slate-900/70 dark:border dark:border-slate-800 dark:text-slate-400">
            No appointments yet
          </div>
        )}
      </div>
    </div>
  );
}
