import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../../api/api';

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentsAPI.getDoctorAppointments();
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING_PAYMENT: 'text-yellow-600',
      CONFIRMED: 'text-green-600',
      COMPLETED: 'text-blue-600',
      CANCELLED: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {appointments.map((apt) => (
              <tr key={apt._id}>
                <td className="px-6 py-4">{apt.patientId?.name}</td>
                <td className="px-6 py-4">
                  {apt.slotId?.date}<br/>
                  <span className="text-sm text-gray-600">{apt.slotId?.startTime} - {apt.slotId?.endTime}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={getStatusColor(apt.status)}>{apt.status}</span>
                </td>
                <td className="px-6 py-4">
                  {apt.status === 'CONFIRMED' && (
                    <button
                      onClick={() => navigate(`/appointments/${apt._id}/chat`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Start Consultation
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No appointments yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
