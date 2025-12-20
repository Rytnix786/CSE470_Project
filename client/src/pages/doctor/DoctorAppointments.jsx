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
      PENDING_PAYMENT: 'text-yellow-600 dark:text-yellow-400',
      CONFIRMED: 'text-green-600 dark:text-green-400',
      COMPLETED: 'text-blue-600 dark:text-blue-400',
      CANCELLED: 'text-red-600 dark:text-red-400',
    };
    return colors[status] || 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100">My Appointments</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-slate-900/70 dark:border dark:border-slate-800">
        <table className="min-w-full divide-y dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-slate-400">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-slate-400">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-slate-400">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-slate-400">Actions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-slate-400">Records</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {appointments.map((apt) => (
              <tr key={apt._id} className="dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{apt.patientId?.name}</td>
                <td className="px-6 py-4">
                  <span className="text-slate-900 dark:text-slate-100">{apt.slotId?.date}</span><br/>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{apt.slotId?.startTime} - {apt.slotId?.endTime}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={getStatusColor(apt.status)}>{apt.status}</span>
                </td>
                <td className="px-6 py-4">
                  {apt.status === 'CONFIRMED' && (
                    <button
                      onClick={() => navigate(`/appointments/${apt._id}/chat`)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Start Consultation
                    </button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => navigate(`/doctor/patients/${apt.patientId._id}/health-records`)}
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View Records
                  </button>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
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
