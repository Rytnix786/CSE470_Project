import { useState } from 'react';
import { reportsAPI } from '../../api/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';

export default function ReportDoctor({ doctorId, appointmentId, onClose, onReportSubmitted }) {
  const [formData, setFormData] = useState({
    reason: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reasons = [
    { value: 'PROFESSIONALISM', label: 'Professionalism Issues' },
    { value: 'COMMUNICATION', label: 'Communication Problems' },
    { value: 'APPOINTMENT_ISSUES', label: 'Appointment Related Issues' },
    { value: 'OTHER', label: 'Other' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await reportsAPI.createReport({
        doctorId,
        appointmentId,
        reason: formData.reason,
        description: formData.description
      });
      
      setSuccess(true);
      if (onReportSubmitted) {
        onReportSubmitted();
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Report Doctor</h2>
      
      {success ? (
        <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 p-4 rounded-lg mb-4">
          Report submitted successfully!
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Reason for Report
            </label>
            <Select
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              required
            >
              <option value="">Select a reason</option>
              {reasons.map(reason => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Please provide details about the issue..."
              required
              rows={4}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}