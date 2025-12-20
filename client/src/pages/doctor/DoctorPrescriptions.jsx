import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, prescriptionsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function DoctorPrescriptions() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescriptionData();
  }, []);

  const fetchPrescriptionData = async () => {
    try {
      setLoading(true);
      // Fetch doctor's appointments
      const appointmentsResponse = await appointmentsAPI.getDoctorAppointments();
      const appointments = appointmentsResponse.data.appointments || [];
      
      // Fetch doctor's prescriptions
      const prescriptionsResponse = await prescriptionsAPI.getMyDoctorPrescriptions();
      const prescriptions = prescriptionsResponse.data.prescriptions || [];
      
      // Get appointment IDs that already have prescriptions
      const prescribedAppointmentIds = prescriptions.map(p => p.appointmentId._id || p.appointmentId);
      
      // Filter pending appointments (COMPLETED and no prescription yet)
      const pending = appointments.filter(appt => {
        const status = (appt.status || "").toUpperCase().trim();
        const isCompleted = status === "COMPLETED";
        const apptId = appt._id;
        const hasPrescription = prescribedAppointmentIds.includes(apptId);
        return isCompleted && !hasPrescription;
      });
      
      setPendingAppointments(pending);
      setPrescriptionHistory(prescriptions);
    } catch (err) {
      setError('Failed to load prescription data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = (appointment) => {
    navigate(`/doctor/prescriptions/create/${appointment._id}`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Prescriptions</h1>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Prescriptions</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Pending Prescriptions Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Pending Prescriptions</h2>
        <div className="space-y-4">
          {pendingAppointments.length > 0 ? (
            pendingAppointments.map((appt) => (
              <div key={appt._id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{appt.patientId?.name}</h3>
                    <p className="text-gray-600">Date: {appt.slotId?.date}</p>
                    <p className="text-gray-600">Time: {appt.slotId?.startTime} - {appt.slotId?.endTime}</p>
                  </div>
                  <button
                    onClick={() => handleCreatePrescription(appt)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create Prescription
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              No pending prescriptions
            </div>
          )}
        </div>
      </section>

      {/* Prescription History Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Prescription History</h2>
        <div className="space-y-4">
          {prescriptionHistory.length > 0 ? (
            prescriptionHistory.map((prescription) => (
              <div key={prescription._id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{prescription.patientId?.name}</h3>
                    <p className="text-gray-600">
                      Appointment: {prescription.appointmentId?.slotId?.date} at {prescription.appointmentId?.slotId?.startTime}
                    </p>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Created: {new Date(prescription.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Medicines:</h4>
                  <div className="space-y-2">
                    {prescription.items.map((item, index) => (
                      <div key={index} className="flex flex-wrap gap-4 text-sm">
                        <span className="font-medium min-w-[150px]">{item.drugName}</span>
                        <span>Dosage: {item.dosage}</span>
                        <span>Frequency: {item.frequency}</span>
                        <span>Duration: {item.duration}</span>
                      </div>
                    ))}
                  </div>
                  
                  {prescription.additionalNotes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="font-medium">Notes:</p>
                      <p className="text-gray-700">{prescription.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              No prescription history yet
            </div>
          )}
        </div>
      </section>
    </div>
  );
}