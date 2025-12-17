import { useState, useEffect } from 'react';
import { doctorAPI } from '../../api/api';

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    specialization: '',
    experienceYears: 0,
    fee: 0,
    bio: '',
    licenseNo: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await doctorAPI.getMyProfile();
      setProfile(response.data.profile);
      setFormData({
        specialization: response.data.profile.specialization,
        experienceYears: response.data.profile.experienceYears,
        fee: response.data.profile.fee,
        bio: response.data.profile.bio,
        licenseNo: response.data.profile.licenseNo,
      });
    } catch (error) {
      console.log('No profile found');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await doctorAPI.createProfile(formData);
      setMessage('Profile saved successfully! Awaiting admin verification.');
      fetchProfile();
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Doctor Profile</h1>

      {profile && (
        <div className="bg-blue-50 p-4 rounded mb-6">
          <p className="font-semibold">Status: {profile.verificationStatus}</p>
          {profile.verificationStatus === 'PENDING' && (
            <p className="text-sm text-gray-600">Your profile is awaiting admin verification</p>
          )}
          {profile.verificationStatus === 'VERIFIED' && (
            <p className="text-sm text-green-600">Your profile is verified! You can now receive bookings.</p>
          )}
          {profile.verificationStatus === 'REJECTED' && (
            <p className="text-sm text-red-600">Rejected: {profile.rejectionReason}</p>
          )}
        </div>
      )}

      {message && (
        <div className={`p-4 rounded mb-6 ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Specialization</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded"
            value={formData.specialization}
            onChange={(e) => setFormData({...formData, specialization: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Years of Experience</label>
          <input
            type="number"
            required
            min="0"
            className="w-full px-3 py-2 border rounded"
            value={formData.experienceYears}
            onChange={(e) => setFormData({...formData, experienceYears: Number(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Consultation Fee (BDT)</label>
          <input
            type="number"
            required
            min="0"
            className="w-full px-3 py-2 border rounded"
            value={formData.fee}
            onChange={(e) => setFormData({...formData, fee: Number(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">License Number</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded"
            value={formData.licenseNo}
            onChange={(e) => setFormData({...formData, licenseNo: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            required
            rows="4"
            className="w-full px-3 py-2 border rounded"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
