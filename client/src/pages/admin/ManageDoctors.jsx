import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { cleanDoctorName } from '../../utils/doctorUtils';

export default function ManageDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success or error
  const [filters, setFilters] = useState({
    status: '',
    active: '',
    q: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  // Removed unused state variables for edit/suspend functionality

  useEffect(() => {
    fetchDoctors();
  }, [filters, pagination.page]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      const response = await adminAPI.getAllDoctors(params);
      setDoctors(response.data.doctors);
      setPagination(prev => ({
        ...prev,
        total: response.data.total
      }));
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError(error.message || 'Failed to load doctors');
      setMessage('Error fetching doctors: ' + (error.message || 'Failed to load doctors'));
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Removed unused functions for edit/suspend functionality


  const getStatusBadge = (verificationStatus, user) => {
    // If user is suspended, show suspended status regardless of verification status
    if (user.suspendedAt) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
          SUSPENDED
        </span>
      );
    }
    
    const statusClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'VERIFIED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[verificationStatus] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {verificationStatus}
      </span>
    );
  };

  const getActiveBadge = (user) => {
    if (user.deletedAt) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          Deleted
        </span>
      );
    }
    
    if (user.suspendedAt) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          Suspended
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
        Active
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Doctors</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
          {message}
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Search</label>
            <Input
              type="text"
              placeholder="Name, email, license..."
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Verification Status</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Active Status</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              value={filters.active}
              onChange={(e) => handleFilterChange('active', e.target.value)}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={() => {
                setFilters({ status: '', active: '', q: '' });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800">
          <p>Error: {error}</p>
          <button 
            onClick={fetchDoctors}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </Card>
      )}

      {/* Doctors List */}
      <div className="grid gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor._id} className="p-6">
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Dr. {cleanDoctorName(doctor.user.name)}
                  </h3>
                  {getStatusBadge(doctor.verificationStatus, doctor.user)}
                </div>
                <p className="text-slate-600 dark:text-slate-400">{doctor.user.email}</p>
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
                  onClick={() => navigate(`/admin/doctors/${doctor.user._id}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                >
                  View Details
                </button>
              </div>
            </div>
          </Card>
        ))}
        {doctors.length === 0 && !error && !loading && (
          <Card className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No doctors found</p>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {doctors.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} doctors
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.limit >= pagination.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Removed unused modals for edit/suspend functionality */}
    </div>
  );
}