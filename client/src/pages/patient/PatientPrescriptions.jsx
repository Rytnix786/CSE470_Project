import { useState, useEffect } from 'react';
import { prescriptionsAPI } from '../../api/api';

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
        <h1 className="text-3xl font-bold mb-6">My Prescriptions</h1>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Prescriptions</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {prescriptions.length > 0 ? (
          prescriptions.map((prescription) => (
            <div key={prescription._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{prescription.doctorId?.name}</h2>
                  <p className="text-gray-600">
                    Appointment: {prescription.appointmentId?.slotId?.date} at {prescription.appointmentId?.slotId?.startTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">
                    Created: {new Date(prescription.createdAt).toLocaleDateString()}
                  </p>
                  {/* <button
                    onClick={() => handleDownload(prescription._id)}
                    className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Download
                  </button> */}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Medicines:</h3>
                <div className="space-y-3">
                  {prescription.items.map((item, index) => (
                    <div key={index} className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded">
                      <span className="font-medium min-w-[150px]">{item.drugName}</span>
                      <span>Dosage: {item.dosage}</span>
                      <span>Frequency: {item.frequency}</span>
                      <span>Duration: {item.duration}</span>
                    </div>
                  ))}
                </div>
                
                {prescription.additionalNotes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-medium mb-1">Additional Notes:</p>
                    <p className="text-gray-700">{prescription.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
            <p>You don't have any prescriptions yet.</p>
            <p className="mt-2">Prescriptions from your doctors will appear here after consultations.</p>
          </div>
        )}
      </div>
    </div>
  );
}