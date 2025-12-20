import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../../api/api';
import { reviewsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function PatientReviews() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch patient appointments
      const appointmentsResponse = await appointmentsAPI.getMyAppointments();
      const appointments = appointmentsResponse.data.appointments || [];
      
      // Fetch patient reviews
      const reviewsResponse = await reviewsAPI.getMyReviews();
      const reviews = reviewsResponse.data.reviews || [];
      
      // Get appointment IDs that already have reviews
      const reviewedAppointmentIds = reviews.map(r => r.appointmentId._id || r.appointmentId);
      
      // Filter pending reviews (COMPLETED appointments without reviews)
      const pending = appointments.filter(appt => {
        const status = (appt.status || "").toUpperCase().trim();
        const isCompleted = status === "COMPLETED";
        const apptPatientId = appt.patientId?._id || appt.patientId;
        const isMine = String(apptPatientId) === String(currentUser._id);
        const hasReview = reviewedAppointmentIds.includes(appt._id);
        
        return isCompleted && isMine && !hasReview;
      });
      
      setPendingReviews(pending);
      setSubmittedReviews(reviews);
    } catch (err) {
      setError('Failed to load reviews data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveReview = (appointment) => {
    // Navigate to the existing review route
    navigate(`/appointments/${appointment._id}/review`);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Reviews</h1>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Reviews</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Pending Reviews Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Pending Reviews</h2>
        <div className="space-y-4">
          {pendingReviews.length > 0 ? (
            pendingReviews.map((appt) => (
              <div key={appt._id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{appt.doctorId?.name}</h3>
                    <p className="text-gray-600">Date: {appt.slotId?.date}</p>
                    <p className="text-gray-600">Time: {appt.slotId?.startTime} - {appt.slotId?.endTime}</p>
                  </div>
                  <button
                    onClick={() => handleLeaveReview(appt)}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Leave Review
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              You have no pending reviews.
            </div>
          )}
        </div>
      </section>

      {/* Submitted Reviews Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">My Submitted Reviews</h2>
        <div className="space-y-4">
          {submittedReviews.length > 0 ? (
            submittedReviews.map((review) => (
              <div key={review._id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{review.doctorId?.name}</h3>
                    <div className="mt-2">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {review.comment && (
                  <div className="border-t pt-3">
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              You haven't reviewed any doctors yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}