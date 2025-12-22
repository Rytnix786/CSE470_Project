import { useState, useEffect } from 'react';
import { adminReportsAPI } from '../../api/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function ManageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    reason: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    internalNote: ''
  });

  useEffect(() => {
    loadReports();
  }, [filters, pagination.page]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await adminReportsAPI.getReports(params);
      setReports(response.data.reports);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total
      }));
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleUpdateReport = async (reportId) => {
    try {
      await adminReportsAPI.updateReport(reportId, updateForm);
      setSelectedReport(null);
      setUpdateForm({ status: '', internalNote: '' });
      loadReports(); // Refresh the list
    } catch (err) {
      alert(err.message || 'Failed to update report');
    }
  };

  const getStatusBadge = (status) => {
    const statusVariants = {
      'OPEN': 'warning',
      'UNDER_REVIEW': 'info',
      'ACTIONED': 'success',
      'DISMISSED': 'secondary'
    };
    
    return (
      <Badge variant={statusVariants[status] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getReasonBadge = (reason) => {
    const reasonVariants = {
      'PROFESSIONALISM': 'danger',
      'COMMUNICATION': 'warning',
      'APPOINTMENT_ISSUES': 'info',
      'OTHER': 'secondary'
    };
    
    return (
      <Badge variant={reasonVariants[reason] || 'secondary'}>
        {reason.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Reports</h1>
      
      {/* Filters */}
      <Card className="mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ACTIONED">Actioned</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Reason
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              value={filters.reason}
              onChange={(e) => handleFilterChange('reason', e.target.value)}
            >
              <option value="">All Reasons</option>
              <option value="PROFESSIONALISM">Professionalism</option>
              <option value="COMMUNICATION">Communication</option>
              <option value="APPOINTMENT_ISSUES">Appointment Issues</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={() => {
                setFilters({ status: '', reason: '' });
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
          <Button 
            onClick={loadReports}
            className="mt-2"
          >
            Retry
          </Button>
        </Card>
      )}

      {/* Reports Table */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">No reports found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Doctor
                    </th>
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        {report.doctorId.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        {report.patientId.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {getReasonBadge(report.reason)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Button
                          onClick={() => {
                            setSelectedReport(report);
                            setUpdateForm({
                              status: report.status,
                              internalNote: report.internalNote || ''
                            });
                          }}
                          size="sm"
                        >
                          View/Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {reports.length > 0 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports
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
          </>
        )}
      </Card>

      {/* Report Detail/Edit Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Report Details
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Doctor</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {selectedReport.doctorId.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Patient</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {selectedReport.patientId.name}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Reason</p>
                <p>{getReasonBadge(selectedReport.reason)}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                <p>{getStatusBadge(selectedReport.status)}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Description</p>
                <p className="text-slate-900 dark:text-slate-100">
                  {selectedReport.description}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                <p className="text-slate-900 dark:text-slate-100">
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              </div>
              
              {selectedReport.internalNote && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Internal Note</p>
                  <p className="text-slate-900 dark:text-slate-100">
                    {selectedReport.internalNote}
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
                Update Report
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                  >
                    <option value="">Select Status</option>
                    <option value="OPEN">Open</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="ACTIONED">Actioned</option>
                    <option value="DISMISSED">Dismissed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Internal Note
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    rows="3"
                    value={updateForm.internalNote}
                    onChange={(e) => setUpdateForm({...updateForm, internalNote: e.target.value})}
                    placeholder="Add internal notes for this report..."
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setSelectedReport(null)}
                variant="secondary"
              >
                Close
              </Button>
              <Button
                onClick={() => handleUpdateReport(selectedReport._id)}
              >
                Update Report
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}