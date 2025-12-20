import { useState, useEffect } from 'react';
import { doctorAPI } from '../../api/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Textarea from '../../components/ui/Textarea';

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
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100">Doctor Profile</h1>

      {profile && (
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Status: {profile.verificationStatus}</p>
          {profile.verificationStatus === 'PENDING' && (
            <p className="text-sm text-slate-600 dark:text-slate-400">Your profile is awaiting admin verification</p>
          )}
          {profile.verificationStatus === 'VERIFIED' && (
            <p className="text-sm text-green-600 dark:text-green-400">Your profile is verified! You can now receive bookings.</p>
          )}
          {profile.verificationStatus === 'REJECTED' && (
            <p className="text-sm text-red-600 dark:text-red-400">Rejected: {profile.rejectionReason}</p>
          )}
        </Card>
      )}

      {message && (
        <Card className={`p-4 mb-6 ${message.includes('Error') ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800'}`}>
          {message}
        </Card>
      )}

      <Card className="p-6 space-y-4">
        <form onSubmit={handleSubmit}>
          <div>
            <Input
              label="Specialization"
              type="text"
              required
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
            />
          </div>

          <div>
            <Input
              label="Years of Experience"
              type="number"
              required
              min="0"
              value={formData.experienceYears}
              onChange={(e) => setFormData({...formData, experienceYears: Number(e.target.value)})}
            />
          </div>

          <div>
            <Input
              label="Consultation Fee (BDT)"
              type="number"
              required
              min="0"
              value={formData.fee}
              onChange={(e) => setFormData({...formData, fee: Number(e.target.value)})}
            />
          </div>

          <div>
            <Input
              label="License Number"
              type="text"
              required
              value={formData.licenseNo}
              onChange={(e) => setFormData({...formData, licenseNo: e.target.value})}
            />
          </div>

          <div>
            <Textarea
              label="Bio"
              required
              rows="4"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </Card>
    </div>
  );
}
