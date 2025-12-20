import { useState, useEffect } from 'react';
import { healthRecordsAPI } from '../../api/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import HealthSnapshotCard from '../../components/HealthSnapshotCard';

export default function HealthRecords() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    bloodSugar: '',
    weight: '',
    height: '',
    notes: '',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await healthRecordsAPI.getMyRecords();
      setRecords(response.data.records);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await healthRecordsAPI.createRecord(formData);
      alert('Health record added successfully');
      setShowForm(false);
      setFormData({ bloodPressure: { systolic: '', diastolic: '' }, bloodSugar: '', weight: '', height: '', notes: '' });
      fetchRecords();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Health Records</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Record'}
        </button>
      </div>
      
      <div className="mb-6">
        <HealthSnapshotCard 
          latestRecord={records.length > 0 ? records[0] : null}
          loading={false}
        />
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Systolic BP"
                  type="number"
                  value={formData.bloodPressure.systolic}
                  onChange={(e) => setFormData({
                    ...formData,
                    bloodPressure: { ...formData.bloodPressure, systolic: Number(e.target.value) }
                  })}
                />
              </div>
              <div>
                <Input
                  label="Diastolic BP"
                  type="number"
                  value={formData.bloodPressure.diastolic}
                  onChange={(e) => setFormData({
                    ...formData,
                    bloodPressure: { ...formData.bloodPressure, diastolic: Number(e.target.value) }
                  })}
                />
              </div>
              <div>
                <Input
                  label="Blood Sugar"
                  type="number"
                  value={formData.bloodSugar}
                  onChange={(e) => setFormData({...formData, bloodSugar: Number(e.target.value)})}
                />
              </div>
              <div>
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                />
              </div>
              <div>
                <Input
                  label="Height (cm)"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <Textarea
                label="Notes"
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Save Record
            </button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {records.map((record) => (
          <Card key={record._id} className="p-6">
            <p className="text-sm text-slate-600 mb-3 dark:text-slate-400">{new Date(record.date).toLocaleDateString()}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {record.bloodPressure?.systolic && (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Blood Pressure</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{record.bloodPressure.systolic}/{record.bloodPressure.diastolic}</p>
                </div>
              )}
              {record.bloodSugar && (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Blood Sugar</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{record.bloodSugar}</p>
                </div>
              )}
              {record.weight && (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Weight</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{record.weight} kg</p>
                </div>
              )}
              {record.height && (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Height</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{record.height} cm</p>
                </div>
              )}
            </div>
            {record.notes && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{record.notes}</p>
            )}
          </Card>
        ))}
        {records.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No health records yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}
