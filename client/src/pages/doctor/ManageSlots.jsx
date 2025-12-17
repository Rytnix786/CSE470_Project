import { useState, useEffect } from 'react';
import { slotsAPI } from '../../api/api';

export default function ManageSlots() {
  const [slots, setSlots] = useState([]);
  const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await slotsAPI.getMySlots();
      setSlots(response.data.slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await slotsAPI.createSlot(formData);
      setMessage('Slot created successfully!');
      setFormData({ date: '', startTime: '', endTime: '' });
      fetchSlots();
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      await slotsAPI.deleteSlot(slotId);
      fetchSlots();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Availability Slots</h1>

      {message && (
        <div className={`p-4 rounded mb-6 ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Slot</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="date"
            required
            className="px-3 py-2 border rounded"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
          <input
            type="time"
            required
            className="px-3 py-2 border rounded"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
          />
          <input
            type="time"
            required
            className="px-3 py-2 border rounded"
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Slot'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Your Slots</h2>
        <div className="divide-y">
          {slots.map((slot) => (
            <div key={slot._id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{slot.date}</p>
                <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
                <span className={`text-xs ${slot.isBooked ? 'text-red-600' : 'text-green-600'}`}>
                  {slot.isBooked ? 'Booked' : 'Available'}
                </span>
              </div>
              {!slot.isBooked && (
                <button
                  onClick={() => deleteSlot(slot._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
          {slots.length === 0 && (
            <p className="p-4 text-gray-500">No slots created yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
