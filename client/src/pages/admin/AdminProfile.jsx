import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function AdminProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsPagination, setLogsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [logsFilters, setLogsFilters] = useState({
    actionType: ''
  });
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [profileUpdateMessage, setProfileUpdateMessage] = useState('');
  const [profileUpdateMessageType, setProfileUpdateMessageType] = useState(''); // success or error
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState('');
  const [passwordUpdateMessageType, setPasswordUpdateMessageType] = useState(''); // success or error

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Load admin profile
  useEffect(() => {
    loadAdminProfile();
    loadAuditLogs();
    loadStats();
  }, [logsPagination.page, logsFilters]);

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getMe();
      setAdmin(response.data.admin);
      setProfileForm({
        name: response.data.admin.name || '',
        phone: response.data.admin.phone !== null ? response.data.admin.phone : ''
      });
    } catch (error) {
      console.error('Error loading admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLogsLoading(true);
      const params = {
        limit: logsPagination.limit,
        page: logsPagination.page,
        actionType: logsFilters.actionType
      };
      const response = await adminAPI.getAuditLogs(params);
      setAuditLogs(response.data.logs);
      setLogsPagination(prev => ({
        ...prev,
        total: response.data.total
      }));
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to 0 values
      setStats({
        pendingVerifications: 0,
        totalDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileUpdateMessage('');
    try {
      setUpdating(true);
      
      // Prepare the payload - include all fields that are being updated
      const payload = {
        name: profileForm.name
      };
      
      // Include phone field if present
      if (profileForm.phone !== undefined) {
        payload.phone = profileForm.phone || null;
      }
      
      // Include email and role if they exist in the admin object
      if (admin?.email !== undefined) {
        payload.email = admin.email;
      }
      if (admin?.role !== undefined) {
        payload.role = admin.role;
      }
      
      await adminAPI.updateMe(payload);
      setProfileUpdateMessage('Profile updated successfully!');
      setProfileUpdateMessageType('success');
      loadAdminProfile(); // Refresh the profile data
    } catch (error) {
      // Extract specific error message from API response
      let errorMessage = 'Error updating profile: ' + error.message;
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
        // If there are detailed validation errors, include them
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage += ': ' + error.response.data.errors.join(', ');
        }
      } else if (error.message.includes('Validation error')) {
        errorMessage = 'Validation error: Please check your input fields';
      }
      setProfileUpdateMessage(errorMessage);
      setProfileUpdateMessageType('error');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordUpdateMessage('');
    
    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordUpdateMessage('New passwords do not match!');
      setPasswordUpdateMessageType('error');
      return;
    }

    try {
      setChangingPassword(true);
      await adminAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordUpdateMessage('Password changed successfully! You will be logged out and redirected to login.');
      setPasswordUpdateMessageType('success');
      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      
      // Logout and redirect after a short delay
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (error) {
      // Extract specific error message from API response
      let errorMessage = 'Error changing password: ' + (error.message || 'Unknown error');
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && error.message.includes('Validation error')) {
        errorMessage = 'Please check your input fields';
      }
      setPasswordUpdateMessage(errorMessage);
      setPasswordUpdateMessageType('error');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 to-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading admin profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/70 p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          {/* Gradient blur circles for main container */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Admin Profile</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info Card */}
              <div className="lg:col-span-2">
                <Card className="p-6 mb-6 relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg">
                  {/* Gradient blur effect */}
                  <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl"></div>
                  <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Profile Information</h2>
                    <form onSubmit={handleProfileUpdate}>
                      {profileUpdateMessage && (
                        <div className={`mb-4 p-3 rounded-lg ${profileUpdateMessageType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {profileUpdateMessage}
                        </div>
                      )}
                      <div className="space-y-4">
                        <Input
                          label="Name"
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                          required
                        />
                        
                        <Input
                          label="Email"
                          type="email"
                          value={admin?.email || ''}
                          onChange={(e) => setAdmin(prev => ({...prev, email: e.target.value}))}
                        />
                        
                        <Input
                          label="Role"
                          type="text"
                          value={admin?.role || ''}
                          onChange={(e) => setAdmin(prev => ({...prev, role: e.target.value}))}
                        />
                        
                        <Input
                          label="Phone (Optional)"
                          type="tel"
                          value={profileForm.phone || ''}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        />
                      </div>
                      
                      <div className="mt-6">
                        <Button 
                          type="submit" 
                          disabled={updating}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                        >
                          {updating ? 'Updating...' : 'Update Profile'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
                
                {/* Change Password Card */}
                <Card className="p-6 relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg">
                  {/* Gradient blur effect */}
                  <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl"></div>
                  <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-pink-500/10 blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Change Password</h2>
                    <form onSubmit={handleChangePassword}>
                      {passwordUpdateMessage && (
                        <div className={`mb-4 p-3 rounded-lg ${passwordUpdateMessageType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {passwordUpdateMessage}
                        </div>
                      )}
                      <div className="space-y-4">
                        <Input
                          label="Current Password"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          required
                        />
                        
                        <Input
                          label="New Password"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          required
                        />
                        
                        <Input
                          label="Confirm New Password"
                          type="password"
                          value={passwordForm.confirmNewPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmNewPassword: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="mt-6">
                        <Button 
                          type="submit" 
                          disabled={changingPassword}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                        >
                          {changingPassword ? 'Changing...' : 'Change Password'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>
          
          {/* Sidebar with Stats and Audit Log */}
          <div className="lg:col-span-1">
            {/* Stats Widgets */}
            <Card className="p-6 mb-6 relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg">
              {/* Gradient blur effect */}
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl"></div>
              <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Activity Summary</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <p className="text-sm text-blue-800 dark:text-blue-200">Pending Verifications</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {statsLoading ? (
                        <div className="inline-block animate-pulse h-6 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      ) : (
                        stats.pendingVerifications
                      )}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/50">
                    <p className="text-sm text-green-800 dark:text-green-200">Total Doctors</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {statsLoading ? (
                        <div className="inline-block animate-pulse h-6 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      ) : (
                        stats.totalDoctors
                      )}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-900/50">
                    <p className="text-sm text-purple-800 dark:text-purple-200">Total Patients</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {statsLoading ? (
                        <div className="inline-block animate-pulse h-6 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      ) : (
                        stats.totalPatients
                      )}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
                    <p className="text-sm text-amber-800 dark:text-amber-200">Total Appointments</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {statsLoading ? (
                        <div className="inline-block animate-pulse h-6 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      ) : (
                        stats.totalAppointments
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Audit Log Panel */}
            <Card className="p-6 relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg">
              {/* Gradient blur effect */}
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl"></div>
              <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Audit Logs</h2>
                  <select
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 bg-white"
                    value={logsFilters.actionType}
                    onChange={(e) => {
                      setLogsFilters({ actionType: e.target.value });
                      setLogsPagination(prev => ({ ...prev, page: 1 }));
                    }}
                  >
                    <option value="">All Actions</option>
                    <option value="VERIFY_DOCTOR">Verify Doctor</option>
                    <option value="REJECT_DOCTOR">Reject Doctor</option>
                    <option value="SUSPEND_DOCTOR">Suspend Doctor</option>
                    <option value="UNSUSPEND_DOCTOR">Unsuspend Doctor</option>
                    <option value="EDIT_DOCTOR">Edit Doctor</option>
                    <option value="SOFT_DELETE_DOCTOR">Delete Doctor</option>
                  </select>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {logsLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : auditLogs.length > 0 ? (
                    <div className="space-y-3">
                      {auditLogs.map((log) => (
                        <div key={log._id} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {log.actionType.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                            {log.note || 'No additional details'}
                          </p>
                          {log.metadata && Object.keys(log.metadata.changedFields || {}).length > 0 && (
                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                              <strong>Changes:</strong> {Object.keys(log.metadata.changedFields).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                      No audit logs found
                    </p>
                  )}
                </div>
                
                {/* Pagination */}
                {auditLogs.length > 0 && (
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Showing {(logsPagination.page - 1) * logsPagination.limit + 1} to {Math.min(logsPagination.page * logsPagination.limit, logsPagination.total)} of {logsPagination.total} logs
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLogsPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={logsPagination.page <= 1}
                        className="px-3 py-1 text-sm border border-slate-300 rounded disabled:opacity-50 dark:border-slate-600 bg-white dark:bg-slate-800"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setLogsPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={logsPagination.page * logsPagination.limit >= logsPagination.total}
                        className="px-3 py-1 text-sm border border-slate-300 rounded disabled:opacity-50 dark:border-slate-600 bg-white dark:bg-slate-800"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}