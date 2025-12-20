import { useState, useEffect } from 'react';
import { prescriptionsAPI } from '../../api/api';
import Card from '../../components/ui/Card';
import GlowContainer from '../../components/ui/GlowContainer';
import Badge from '../../components/ui/Badge';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionsAPI.getMyPrescriptions();
      setPrescriptions(response.data.prescriptions || []);
    } catch (err) {
      setError('Failed to load prescriptions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (prescriptionId) => {
    // For now, we'll just show an alert since the download endpoint might need to be implemented
    alert(`Download functionality for prescription ${prescriptionId} would be implemented here.`);
    // In a real implementation, this would trigger the download endpoint
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <GlowContainer>
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">My Prescriptions</h1>
          <Card className="text-center py-12">
            <p className="text-gray-400">Loading your prescriptions...</p>
          </Card>
        </GlowContainer>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <GlowContainer>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">My Prescriptions</h1>
          <Badge variant="info">{prescriptions.length} prescriptions</Badge>
        </div>
        
        {error && (
          <Card variant="glass" className="mb-6 border border-red-500/30 bg-red-900/20">
            <p className="text-red-300">{error}</p>
          </Card>
        )}

        <div className="space-y-6">
          {prescriptions.length > 0 ? (
            prescriptions.map((prescription) => (
              <Card key={prescription._id} variant="glass" hoverable className="transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{prescription.doctorId?.name}</h2>
                    <p className="text-gray-400 mt-1">
                      Appointment: {prescription.appointmentId?.slotId?.date} at {prescription.appointmentId?.slotId?.startTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4 mt-4 dark:border-slate-700">
                  <h3 className="font-medium mb-3 text-gray-200 dark:text-slate-300">Medicines:</h3>
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
                      <p className="font-medium text-gray-200 mb-1 dark:text-slate-300">Additional Notes:</p>
                      <p className="text-gray-300 dark:text-slate-400">{prescription.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <p className="text-gray-500 dark:text-slate-400">You don't have any prescriptions yet.</p>
              <p className="mt-2 text-gray-600 dark:text-slate-500">Prescriptions from your doctors will appear here after consultations.</p>
            </Card>
          )}
        </div>
      </GlowContainer>
    </div>
  );
}