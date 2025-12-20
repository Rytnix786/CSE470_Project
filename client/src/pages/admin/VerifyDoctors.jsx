import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/api';
import Card from '../../components/ui/Card';

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
          <Card key={doctor._id} className="p-6">
            <div className="flex justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{doctor.userId.name}</h3>
                <p className="text-slate-600 dark:text-slate-400">{doctor.userId.email}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Specialization</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{doctor.specialization}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Experience</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{doctor.experienceYears} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Fee</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">BDT {doctor.fee}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">License No</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{doctor.licenseNo}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Bio</p>
                  <p className="text-sm text-slate-900 dark:text-slate-100">{doctor.bio}</p>
                </div>
              </div>
              <div className="ml-6 flex flex-col gap-2">
                <button
                  onClick={() => handleVerify(doctor.userId._id, 'VERIFIED')}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
                >
                  Verify
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason:');
                    if (reason) handleVerify(doctor.userId._id, 'REJECTED', reason);
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Reject
                </button>
              </div>
            </div>
          </Card>
        ))}
        {doctors.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No pending doctors</p>
          </Card>
        )}
      </div>
    </div>
  );
}
