import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, prescriptionsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import GlowContainer from '../../components/ui/GlowContainer';
import Badge from '../../components/ui/Badge';

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
        <GlowContainer>
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Prescriptions</h1>
          <Card className="text-center py-12">
            <p className="text-gray-400">Loading prescriptions...</p>
          </Card>
        </GlowContainer>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <GlowContainer>
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Prescriptions</h1>
        
        {error && (
          <Card variant="glass" className="mb-6 border border-red-500/30 bg-red-900/20">
            <p className="text-red-300">{error}</p>
          </Card>
        )}

        {/* Pending Prescriptions Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-100">Pending Prescriptions</h2>
            <Badge variant="warning">{pendingAppointments.length} pending</Badge>
          </div>
          <div className="space-y-4">
            {pendingAppointments.length > 0 ? (
              pendingAppointments.map((appt) => (
                <Card key={appt._id} variant="glass" hoverable className="transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{appt.patientId?.name}</h3>
                      <p className="text-gray-400 mt-1">Date: {appt.slotId?.date}</p>
                      <p className="text-gray-400">Time: {appt.slotId?.startTime} - {appt.slotId?.endTime}</p>
                    </div>
                    <Button variant="primary" onClick={() => handleCreatePrescription(appt)}>
                      Create Prescription
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <p className="text-gray-500">No pending prescriptions</p>
              </Card>
            )}
          </div>
        </section>

        {/* Prescription History Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-100">Prescription History</h2>
            <Badge variant="success">{prescriptionHistory.length} prescriptions</Badge>
          </div>
          <div className="space-y-4">
            {prescriptionHistory.length > 0 ? (
              prescriptionHistory.map((prescription) => (
                <Card key={prescription._id} variant="glass" hoverable className="transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{prescription.patientId?.name}</h3>
                      <p className="text-gray-400 mt-1">
                        Appointment: {prescription.appointmentId?.slotId?.date} at {prescription.appointmentId?.slotId?.startTime}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4 mt-4 dark:border-slate-700">
                    <h4 className="font-medium mb-3 text-gray-200 dark:text-slate-300">Medicines:</h4>
                    <div className="space-y-3">
                      {prescription.items.map((item, index) => (
                        <div key={index} className="flex flex-wrap gap-4 p-3 bg-gray-800/50 rounded-lg dark:bg-slate-800/50">
                          <span className="font-medium text-white min-w-[150px] dark:text-slate-100">{item.drugName}</span>
                          <span className="text-gray-300 dark:text-slate-400">Dosage: {item.dosage}</span>
                          <span className="text-gray-300 dark:text-slate-400">Frequency: {item.frequency}</span>
                          <span className="text-gray-300 dark:text-slate-400">Duration: {item.duration}</span>
                        </div>
                      ))}
                    </div>
                    
                    {prescription.additionalNotes && (
                      <div className="mt-4 pt-4 border-t border-gray-700 dark:border-slate-700">
                        <p className="font-medium text-gray-200 mb-1 dark:text-slate-300">Notes:</p>
                        <p className="text-gray-300 dark:text-slate-400">{prescription.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <p className="text-gray-500 dark:text-slate-400">No prescription history yet</p>
              </Card>
            )}
          </div>
        </section>
      </GlowContainer>
    </div>
  );
}