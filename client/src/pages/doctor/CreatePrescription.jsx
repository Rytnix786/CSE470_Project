import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { prescriptionsAPI, appointmentsAPI } from '../../api/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import GlowContainer from '../../components/ui/GlowContainer';
import Input from '../../components/ui/Input';

export default function CreatePrescription() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [medicines, setMedicines] = useState([
    { drugName: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');
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

  const handleAddMedicine = () => {
    setMedicines([...medicines, { drugName: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length <= 1) return;
    const newMedicines = [...medicines];
    newMedicines.splice(index, 1);
    setMedicines(newMedicines);
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that all medicine fields are filled
    const isValid = medicines.every(med => 
      med.drugName.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    );
    
    if (!isValid) {
      setError('Please fill in all medicine fields');
      return;
    }
    
    // Prepare payload
    const payload = {
      appointmentId,
      patientId: appointment?.patientId?._id || appointment?.patientId, // Include patientId
      items: medicines,
      additionalNotes,
    };
    
    // Log payload for debugging
    console.log('Prescription payload:', payload);
    
    try {
      setSubmitting(true);
      await prescriptionsAPI.createPrescription(payload);
      alert('Prescription created successfully!');
      navigate('/doctor/prescriptions');
    } catch (err) {
      console.error('Prescription creation error:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <GlowContainer>
          <Card variant="glass" className="border border-red-500/30 bg-red-900/20">
            <p className="text-red-300 mb-4">{error}</p>
            <Button variant="secondary" onClick={() => navigate('/doctor/prescriptions')}>
              Back to Prescriptions
            </Button>
          </Card>
        </GlowContainer>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <GlowContainer>
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Create Prescription</h1>
        
        {appointment && (
          <Card variant="glass" className="mb-6">
            <h2 className="font-semibold text-white">{appointment.patientId?.name}</h2>
            <p className="text-gray-400 mt-1">
              {appointment.slotId?.date} at {appointment.slotId?.startTime}
            </p>
          </Card>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-100">Medicines</h2>
              <Button variant="primary" size="sm" onClick={handleAddMedicine}>
                Add Medicine
              </Button>
            </div>
            
            {medicines.map((medicine, index) => (
              <Card key={index} variant="glass" className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-200">Medicine #{index + 1}</h3>
                  {medicines.length > 1 && (
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleRemoveMedicine(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Drug Name *"
                    value={medicine.drugName}
                    onChange={(e) => handleMedicineChange(index, 'drugName', e.target.value)}
                    placeholder="e.g., Paracetamol"
                    variant="glass"
                  />
                  
                  <Input
                    label="Dosage *"
                    value={medicine.dosage}
                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    placeholder="e.g., 500mg"
                    variant="glass"
                  />
                  
                  <Input
                    label="Frequency *"
                    value={medicine.frequency}
                    onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                    placeholder="e.g., Twice daily"
                    variant="glass"
                  />
                  
                  <Input
                    label="Duration *"
                    value={medicine.duration}
                    onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                    placeholder="e.g., 7 days"
                    variant="glass"
                  />
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mb-6">
            <Input
              label="Additional Notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional instructions or notes..."
              variant="glass"
              as="textarea"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-4">
            <Button variant="secondary" type="button" onClick={() => navigate('/doctor/prescriptions')}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting}
              className={submitting ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {submitting ? 'Creating...' : 'Create Prescription'}
            </Button>
          </div>
        </form>
      </GlowContainer>
    </div>
  );
}