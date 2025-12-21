import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../../api/api';
import { reviewsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import GlowContainer from '../../components/ui/GlowContainer';
import Badge from '../../components/ui/Badge';
import { cleanDoctorName } from '../../utils/doctorUtils';

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
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
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
        <GlowContainer>
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">My Reviews</h1>
          <Card className="text-center py-12">
            <p className="text-gray-400">Loading your reviews...</p>
          </Card>
        </GlowContainer>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <GlowContainer>
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">My Reviews</h1>
        
        {error && (
          <Card variant="glass" className="mb-6 border border-red-500/30 bg-red-900/20">
            <p className="text-red-300">{error}</p>
          </Card>
        )}

        {/* Pending Reviews Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-100">Pending Reviews</h2>
            <Badge variant="info">{pendingReviews.length} pending</Badge>
          </div>
          <div className="space-y-4">
            {pendingReviews.length > 0 ? (
              pendingReviews.map((appt) => (
                <Card key={appt._id} variant="glass" hoverable className="transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">Dr. {cleanDoctorName(appt.doctorId?.name)}</h3>
                      <p className="text-gray-400 mt-1">Date: {appt.slotId?.date}</p>
                      <p className="text-gray-400">Time: {appt.slotId?.startTime} - {appt.slotId?.endTime}</p>
                    </div>
                    <Button variant="primary" onClick={() => handleLeaveReview(appt)}>
                      Leave Review
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <p className="text-gray-500">You have no pending reviews.</p>
              </Card>
            )}
          </div>
        </section>

        {/* Submitted Reviews Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-100">My Submitted Reviews</h2>
            <Badge variant="success">{submittedReviews.length} submitted</Badge>
          </div>
          <div className="space-y-4">
            {submittedReviews.length > 0 ? (
              submittedReviews.map((review) => (
                <Card key={review._id} variant="glass" hoverable className="transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Dr. {cleanDoctorName(review.doctorId?.name)}</h3>
                      <div className="mt-2">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  
                  {review.comment && (
                    <div className="border-t border-gray-700 pt-4 mt-4 dark:border-slate-700">
                      <p className="text-gray-300 dark:text-slate-400">{review.comment}</p>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <p className="text-gray-500 dark:text-slate-400">You haven't reviewed any doctors yet.</p>
              </Card>
            )}
          </div>
        </section>
      </GlowContainer>
    </div>
  );
}