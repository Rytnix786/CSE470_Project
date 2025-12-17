// This file contains all frontend page implementations
// Import into individual files in production

// ===== DOCTORS LIST (Patient view - FR1.1) =====
import { useState, useEffect } from 'react';
import { doctorAPI, appointmentsAPI, paymentsAPI } from '../api/api';

export function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ specialization: '', availableOn: '' });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const fetchDoctors = async () => {
    try {
      const response = await doctorAPI.getVerifiedDoctors(filters);
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const viewSlots = async (doctor) => {
    setSelectedDoctor(doctor);
    try {
      const response = await doctorAPI.getDoctorSlots(doctor.userId._id, { date: filters.availableOn });
      setSlots(response.data.slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const bookSlot = async (slotId) => {
    setLoading(true);
    try {
      await appointmentsAPI.bookAppointment({ doctorId: selectedDoctor.userId._id, slotId });
      alert('Appointment booked successfully! Please proceed to payment.');
      setSelectedDoctor(null);
    } catch (error) {
      alert('Booking failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find Doctors</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Specialization"
          className="px-4 py-2 border rounded"
          value={filters.specialization}
          onChange={(e) => setFilters({...filters, specialization: e.target.value})}
        />
        <input
          type="date"
          placeholder="Available on"
          className="px-4 py-2 border rounded"
          value={filters.availableOn}
          onChange={(e) => setFilters({...filters, availableOn: e.target.value})}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold">{doctor.userId.name}</h3>
            <p className="text-gray-600">{doctor.specialization}</p>
            <p className="text-sm text-gray-500">{doctor.experienceYears} years experience</p>
            <p className="text-lg font-bold mt-2">BDT {doctor.fee}</p>
            <p className="text-sm mt-2">{doctor.bio}</p>
            <button
              onClick={() => viewSlots(doctor)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              View Available Slots
            </button>
          </div>
        ))}
      </div>

      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Available Slots</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {slots.map((slot) => (
                <div key={slot._id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p>{slot.date}</p>
                    <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
                  </div>
                  <button
                    onClick={() => bookSlot(slot._id)}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Book
                  </button>
                </div>
              ))}
              {slots.length === 0 && <p className="text-gray-500">No available slots</p>}
            </div>
            <button
              onClick={() => setSelectedDoctor(null)}
              className="mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorsList;
