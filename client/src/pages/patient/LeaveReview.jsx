import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reviewsAPI, appointmentsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import GlowContainer from '../../components/ui/GlowContainer';
import Input from '../../components/ui/Input';
import { cleanDoctorName } from '../../utils/doctorUtils';

export default function LeaveReview() {
  const { id: appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getAppointmentById(appointmentId);
      setAppointment(response.data.appointment);
    } catch (err) {
      setError('Failed to load appointment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await reviewsAPI.createReview({
        appointmentId,
        rating,
        comment,
      });
      alert('Review submitted successfully!');
      navigate('/patient/reviews');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-4xl transition-transform duration-200 hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <GlowContainer>
          <Card className="text-center py-12">
            <p className="text-gray-400">Loading appointment details...</p>
          </Card>
        </GlowContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <GlowContainer>
          <Card variant="glass" className="border border-red-500/30 bg-red-900/20">
            <p className="text-red-300 mb-4">{error}</p>
            <Button variant="secondary" onClick={() => navigate('/patient/reviews')}>
              Back to Reviews
            </Button>
          </Card>
        </GlowContainer>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <GlowContainer>
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Leave a Review</h1>
        
        {appointment && (
          <Card variant="glass" className="mb-6">
            <h2 className="font-semibold text-white">Dr. {cleanDoctorName(appointment.doctorId?.name)}</h2>
            <p className="text-gray-400 mt-1">
              {appointment.slotId?.date} at {appointment.slotId?.startTime}
            </p>
          </Card>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Rating
            </label>
            {renderStars()}
            {rating > 0 && <p className="mt-2 text-sm text-gray-400">Selected: {rating} star(s)</p>}
          </div>
          
          <div className="mb-6">
            <Input
              label="Comment (Optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              variant="glass"
              as="textarea"
              rows={4}
            />
          </div>
          
          <div className="flex space-x-4">
            <Button variant="secondary" type="button" onClick={() => navigate('/patient/reviews')}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting || rating === 0}
              className={submitting || rating === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </GlowContainer>
    </div>
  );
}