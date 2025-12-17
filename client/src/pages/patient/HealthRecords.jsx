import { useState, useEffect } from 'react';
import { healthRecordsAPI } from '../../api/api';

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

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Systolic BP</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded"
                value={formData.bloodPressure.systolic}
                onChange={(e) => setFormData({
                  ...formData,
                  bloodPressure: { ...formData.bloodPressure, systolic: Number(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Diastolic BP</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded"
                value={formData.bloodPressure.diastolic}
                onChange={(e) => setFormData({
                  ...formData,
                  bloodPressure: { ...formData.bloodPressure, diastolic: Number(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Blood Sugar</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded"
                value={formData.bloodSugar}
                onChange={(e) => setFormData({...formData, bloodSugar: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full px-3 py-2 border rounded"
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Save Record
          </button>
        </form>
      )}

      <div className="space-y-4">
        {records.map((record) => (
          <div key={record._id} className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-3">{new Date(record.date).toLocaleDateString()}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {record.bloodPressure?.systolic && (
                <div>
                  <p className="text-xs text-gray-500">Blood Pressure</p>
                  <p className="font-medium">{record.bloodPressure.systolic}/{record.bloodPressure.diastolic}</p>
                </div>
              )}
              {record.bloodSugar && (
                <div>
                  <p className="text-xs text-gray-500">Blood Sugar</p>
                  <p className="font-medium">{record.bloodSugar}</p>
                </div>
              )}
              {record.weight && (
                <div>
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="font-medium">{record.weight} kg</p>
                </div>
              )}
            </div>
            {record.notes && (
              <p className="mt-3 text-sm text-gray-600">{record.notes}</p>
            )}
          </div>
        ))}
        {records.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            No health records yet
          </div>
        )}
      </div>
    </div>
  );
}
