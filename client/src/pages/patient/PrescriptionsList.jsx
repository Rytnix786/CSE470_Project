import { useState, useEffect } from 'react';
import { prescriptionsAPI } from '../../api/api';

export default function PrescriptionsList() {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await prescriptionsAPI.getMyPrescriptions();
      setPrescriptions(response.data.prescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Prescriptions</h1>

      <div className="space-y-6">
        {prescriptions.map((prescription) => (
          <div key={prescription._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Dr. {prescription.doctorId?.name}</h3>
                <p className="text-sm text-gray-600">{new Date(prescription.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {prescription.diagnosis && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                <p className="text-sm">{prescription.diagnosis}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="font-medium mb-2">Medications:</p>
              <div className="space-y-3">
                {prescription.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">{item.drugName}</p>
                    <p className="text-sm text-gray-600">Dosage: {item.dosage}</p>
                    <p className="text-sm text-gray-600">Frequency: {item.frequency}</p>
                    <p className="text-sm text-gray-600">Duration: {item.duration}</p>
                    {item.notes && <p className="text-sm text-gray-600">Notes: {item.notes}</p>}
                  </div>
                ))}
              </div>
            </div>

            {prescription.additionalNotes && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm font-medium text-gray-700">Additional Notes:</p>
                <p className="text-sm">{prescription.additionalNotes}</p>
              </div>
            )}
          </div>
        ))}
        {prescriptions.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            No prescriptions yet
          </div>
        )}
      </div>
    </div>
  );
}
