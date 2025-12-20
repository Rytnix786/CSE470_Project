import { useState, useEffect } from 'react';
import { slotsAPI } from '../../api/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

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
        <div className={`p-4 rounded mb-6 ${message.includes('Error') ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'}`}>
          {message}
        </div>
      )}

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Create New Slot</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
          <Input
            type="time"
            required
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
          />
          <Input
            type="time"
            required
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {loading ? 'Creating...' : 'Create Slot'}
          </button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b text-slate-900 dark:text-slate-100 dark:border-slate-800">Your Slots</h2>
        <div className="divide-y dark:divide-slate-800">
          {slots.map((slot) => (
            <div key={slot._id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{slot.date}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{slot.startTime} - {slot.endTime}</p>
                <span className={`text-xs ${slot.isBooked ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {slot.isBooked ? 'Booked' : 'Available'}
                </span>
              </div>
              {!slot.isBooked && (
                <button
                  onClick={() => deleteSlot(slot._id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
          {slots.length === 0 && (
            <p className="p-4 text-slate-500 dark:text-slate-400">No slots created yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}
