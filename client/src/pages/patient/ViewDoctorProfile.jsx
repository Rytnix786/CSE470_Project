import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doctorAPI } from '../../api/api';
import Card from '../../components/ui/Card';
import DoctorTrustBadge from '../../components/doctor/DoctorTrustBadge';
import { cleanDoctorName } from '../../utils/doctorUtils';

export default function ViewDoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorProfile();
  }, [id]);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getDoctorById(id);
      setDoctor(response.data.doctor);
    } catch (error) {
      setError('Failed to load doctor profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </Card>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-6">
          <p className="text-slate-600 dark:text-slate-400">Doctor profile not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          ← Back to Doctors
        </button>
      </div>

      <Card variant="glass" className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {doctor.userId.name.charAt(0)}
            </div>
          </div>
          
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Dr. {cleanDoctorName(doctor.userId.name)}
            </h1>
            
            <DoctorTrustBadge 
              rating={doctor.avgRating || 0}
              totalReviews={doctor.totalReviews || 0}
              specialization={doctor.specialization}
              experienceYears={doctor.experienceYears}
              isVerified={doctor.verificationStatus === 'VERIFIED'}
            />
            
            <div className="mt-4">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Consultation Fee: BDT {doctor.fee}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">About</h2>
        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
          {doctor.bio}
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Professional Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Specialization</h3>
            <p className="text-slate-700 dark:text-slate-300">{doctor.specialization}</p>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Years of Experience</h3>
            <p className="text-slate-700 dark:text-slate-300">{doctor.experienceYears} years</p>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">License Number</h3>
            <p className="text-slate-700 dark:text-slate-300">{doctor.licenseNo}</p>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Verification Status</h3>
            <p className={`font-medium ${
              doctor.verificationStatus === 'VERIFIED' 
                ? 'text-green-600 dark:text-green-400' 
                : doctor.verificationStatus === 'PENDING' 
                  ? 'text-yellow-600 dark:text-yellow-400' 
                  : 'text-red-600 dark:text-red-400'
            }`}>
              {doctor.verificationStatus}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}