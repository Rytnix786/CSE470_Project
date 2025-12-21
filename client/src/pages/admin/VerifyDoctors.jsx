import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/api';
import Card from '../../components/ui/Card';
import { cleanDoctorName } from '../../utils/doctorUtils';

export default function VerifyDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success or error

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const response = await adminAPI.getPendingDoctors();
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError(error.message || 'Failed to load pending doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (doctorUserId, status, reason = '') => {
    setLoading(true);
    try {
      await adminAPI.verifyDoctor(doctorUserId, {
        status,
        rejectionReason: reason,
      });
      setMessage(`Doctor ${status.toLowerCase()} successfully!`);
      setMessageType('success');
      fetchPendingDoctors();
    } catch (error) {
      setMessage('Error: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (doctorUserId) => {
    if (!window.confirm('Are you sure you want to suspend this doctor?')) return;
    
    setLoading(true);
    setMessage('');
    try {
      const reason = prompt('Suspension reason (optional):') || 'Doctor suspended by admin';
      await adminAPI.suspendDoctor(doctorUserId, { note: reason });
      setMessage('Doctor suspended successfully!');
      setMessageType('success');
      fetchPendingDoctors();
    } catch (error) {
      setMessage('Error suspending doctor: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Verify Doctors</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
          {message}
        </div>
      )}

      {error && (
        <Card className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800">
          <p>Error: {error}</p>
          <button 
            onClick={fetchPendingDoctors}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </Card>
      )}

      <div className="grid gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor._id} className="p-6">
            <div className="flex justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dr. {cleanDoctorName(doctor.userId.name)}</h3>
                <p className="text-slate-600 dark:text-slate-400">{doctor.userId.email}</p>
                {/* Show if this is a re-verification request */}
                {doctor.userId?.suspendedAt && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      Re-verification Request
                    </span>
                  </div>
                )}
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
                <button
                  onClick={() => handleSuspend(doctor.userId._id)}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 dark:bg-yellow-700 dark:hover:bg-yellow-800"
                >
                  Suspend
                </button>
              </div>
            </div>
          </Card>
        ))}
        {doctors.length === 0 && !error && (
          <Card className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No pending doctors</p>
          </Card>
        )}
      </div>
    </div>
  );
}