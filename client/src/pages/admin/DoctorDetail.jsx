import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { adminAPI, adminReportsAPI } from '../../api/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function DoctorDetail() {
  const { doctorUserId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Track edit modal visibility
  const [editForm, setEditForm] = useState({
    specialization: '',
    experienceYears: 0,
    fee: 0,
    bio: '',
    licenseNo: ''
  }); // Track edit form data
  const [saving, setSaving] = useState(false); // Track saving state
  const [showReportModal, setShowReportModal] = useState(false); // Track report modal visibility
  const [selectedReport, setSelectedReport] = useState(null); // Track selected report for management
  const [reportForm, setReportForm] = useState({
    status: 'OPEN',
    internalNote: ''
  }); // Track report form data

  useEffect(() => {
    if (doctorUserId) {
      console.log("DoctorDetail doctorUserId:", doctorUserId);
      loadDoctorData();
    }
  }, [doctorUserId]);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load doctor profile
      const doctorResponse = await adminAPI.getDoctorById(doctorUserId);
      setDoctor(doctorResponse.data.doctor);

      // Load reviews
      const reviewsResponse = await adminAPI.getDoctorReviews(doctorUserId);
      setReviews(reviewsResponse.data.reviews);

      // Load reports
      const reportsResponse = await adminAPI.getDoctorReports(doctorUserId);
      setReports(reportsResponse.data.reports);
    } catch (err) {
      setError(err.message || 'Failed to load doctor data');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal and populate form with current doctor data
  const handleEditClick = () => {
    if (doctor) {
      setEditForm({
        specialization: doctor.specialization || '',
        experienceYears: doctor.experienceYears || 0,
        fee: doctor.fee || 0,
        bio: doctor.bio || '',
        licenseNo: doctor.licenseNo || ''
      });
      setShowEditModal(true);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save edited doctor profile
  const handleSaveEdit = async () => {
    // Basic validation
    if (!editForm.specialization.trim() || !editForm.licenseNo.trim()) {
      alert('Specialization and License Number are required');
      return;
    }

    try {
      setSaving(true);
      await adminAPI.updateDoctorProfile(doctorUserId, editForm);
      alert('Doctor profile updated successfully');
      setShowEditModal(false);
      loadDoctorData(); // Refresh doctor data
    } catch (err) {
      alert('Error updating doctor profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setShowEditModal(false);
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }

    try {
      await adminAPI.suspendDoctor(doctorUserId, { reason: suspendReason });
      setSuspendReason('');
      setShowSuspendModal(false);
      loadDoctorData(); // Refresh data
    } catch (err) {
      alert(err.message || 'Failed to suspend doctor');
    }
  };

  const handleUnsuspend = async () => {
    if (!window.confirm('Are you sure you want to unsuspend this doctor?')) {
      return;
    }

    try {
      await adminAPI.unsuspendDoctor(doctorUserId, { 
        note: 'Doctor unsuspended by admin' 
      });
      loadDoctorData(); // Refresh data
    } catch (err) {
      alert(err.message || 'Failed to unsuspend doctor');
    }
  };

  const getStatusBadge = (verificationStatus, user) => {
    // If user is suspended, show suspended status regardless of verification status
    if (user.suspendedAt) {
      return (
        <Badge variant="warning">
          SUSPENDED
        </Badge>
      );
    }
    
    const statusVariants = {
      'PENDING': 'warning',
      'VERIFIED': 'success',
      'REJECTED': 'danger'
    };
    
    return (
      <Badge variant={statusVariants[verificationStatus] || 'secondary'}>
        {verificationStatus}
      </Badge>
    );
  };

  const getReportStatusBadge = (status) => {
    // Premium status badge styling with dark mode friendly colors
    const statusClasses = {
      'OPEN': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'UNDER_REVIEW': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'ACTIONED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'DISMISSED': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  // Open report management modal
  const handleManageReport = (report) => {
    setSelectedReport(report);
    setReportForm({
      status: report.status,
      internalNote: report.internalNote || ''
    });
    setShowReportModal(true);
  };

  // Handle report form input changes
  const handleReportInputChange = (field, value) => {
    setReportForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save report updates
  const handleSaveReport = async () => {
    try {
      await adminReportsAPI.updateReport(selectedReport._id, reportForm);
      alert('Report updated successfully');
      setShowReportModal(false);
      loadDoctorData(); // Refresh reports
    } catch (err) {
      alert('Error updating report: ' + err.message);
    }
  };

  // Close report modal
  const handleCloseReport = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-red-600 dark:text-red-400">
            Error: {error}
          </div>
          <Button 
            onClick={loadDoctorData} 
            className="mt-4"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">Doctor not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Doctor Details</h1>
        <Button 
          onClick={() => window.history.back()}
          variant="secondary"
        >
          Back to Doctors
        </Button>
      </div>

      {/* Doctor Profile Section */}
      <Card className="mb-6 p-6">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">Profile Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {/^dr\./i.test(doctor.user.name.trim()) ? doctor.user.name : `Dr. ${doctor.user.name}`}
              </div>
              <div>
                <span className="font-medium">Email:</span> {doctor.user.email}
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <span className="ml-2">
                  {getStatusBadge(doctor.verificationStatus, doctor.user)}
                </span>
              </div>
              {doctor.user.suspendedAt && (
                <div>
                  <span className="font-medium">Suspended At:</span> 
                  <span className="ml-2">
                    {new Date(doctor.user.suspendedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Professional Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Specialization:</span> {doctor.specialization}
              </div>
              <div>
                <span className="font-medium">Experience:</span> {doctor.experienceYears} years
              </div>
              <div>
                <span className="font-medium">Fee:</span> BDT {doctor.fee}
              </div>
              <div>
                <span className="font-medium">License No:</span> {doctor.licenseNo}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Bio</h3>
          <p className="text-slate-700 dark:text-slate-300">{doctor.bio}</p>
        </div>
        
        <div className="mt-6 flex gap-3">
          {!doctor.user.suspendedAt ? (
            <Button
              onClick={() => setShowSuspendModal(true)}
              variant="danger"
            >
              Suspend Doctor
            </Button>
          ) : (
            <Button
              onClick={handleUnsuspend}
              variant="warning"
            >
              Unsuspend Doctor
            </Button>
          )}
          <Button variant="secondary" onClick={handleEditClick}>
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Reviews Section */}
      <Card className="mb-6 p-6">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          Reviews ({reviews.length})
        </h2>
        
        {reviews.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">No reviews found</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {review.patientId.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Rating: {review.rating}/5
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="mt-2 text-slate-700 dark:text-slate-300">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Reports Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          Reports ({reports.length})
        </h2>
        
        {reports.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">No reports found</p>
        ) : (
          <div className="">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {report.patientId.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                      {report.reason.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {getReportStatusBadge(report.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Button
                        size="sm"
                        onClick={() => handleManageReport(report)}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Suspend Doctor Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Suspend Doctor</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reason for Suspension *
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                rows="3"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Please provide a reason for suspension..."
                required
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowSuspendModal(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSuspend}
                variant="warning"
              >
                Suspend
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Doctor Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">Edit Doctor Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specialization *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  value={editForm.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experience (years)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  value={editForm.experienceYears}
                  onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fee (BDT)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  value={editForm.fee}
                  onChange={(e) => handleInputChange('fee', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows="4"
                  value={editForm.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Number *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  value={editForm.licenseNo}
                  onChange={(e) => handleInputChange('licenseNo', e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={handleCloseEdit}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Manage Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">Manage Report</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patient</label>
                <p className="text-slate-900 dark:text-slate-100">{selectedReport.patientId.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                <p className="text-slate-900 dark:text-slate-100">{selectedReport.reason.replace('_', ' ')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300">
                  {selectedReport.description}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  value={reportForm.status}
                  onChange={(e) => handleReportInputChange('status', e.target.value)}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="ACTIONED">ACTIONED</option>
                  <option value="DISMISSED">DISMISSED</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Internal Note</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows="4"
                  value={reportForm.internalNote}
                  onChange={(e) => handleReportInputChange('internalNote', e.target.value)}
                  placeholder="Add internal notes here..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={handleCloseReport}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveReport}
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}