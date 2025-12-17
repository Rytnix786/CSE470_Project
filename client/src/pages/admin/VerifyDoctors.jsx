import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/api';

export default function VerifyDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const response = await adminAPI.getPendingDoctors();
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleVerify = async (doctorUserId, status, reason = '') => {
    setLoading(true);
    try {
      await adminAPI.verifyDoctor(doctorUserId, {
        status,
        rejectionReason: reason,
      });
      alert(`Doctor ${status.toLowerCase()} successfully!`);
      fetchPendingDoctors();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Verify Doctors</h1>

      <div className="grid gap-6">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{doctor.userId.name}</h3>
                <p className="text-gray-600">{doctor.userId.email}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Specialization</p>
                    <p className="font-medium">{doctor.specialization}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{doctor.experienceYears} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fee</p>
                    <p className="font-medium">BDT {doctor.fee}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">License No</p>
                    <p className="font-medium">{doctor.licenseNo}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="text-sm">{doctor.bio}</p>
                </div>
              </div>
              <div className="ml-6 flex flex-col gap-2">
                <button
                  onClick={() => handleVerify(doctor.userId._id, 'VERIFIED')}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Verify
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason:');
                    if (reason) handleVerify(doctor.userId._id, 'REJECTED', reason);
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {doctors.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            No pending doctors
          </div>
        )}
      </div>
    </div>
  );
}
