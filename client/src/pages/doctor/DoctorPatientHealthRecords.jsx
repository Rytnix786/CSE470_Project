import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { healthRecordsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import GlowContainer from '../../components/ui/GlowContainer';
import Badge from '../../components/ui/Badge';
import HealthSnapshotCard from '../../components/HealthSnapshotCard';

export default function DoctorPatientHealthRecords() {
  const { patientId } = useParams();
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientHealthRecords();
  }, [patientId]);

  const fetchPatientHealthRecords = async () => {
    try {
      setLoading(true);
      const response = await healthRecordsAPI.getPatientRecords(patientId);
      setRecords(response.data.records);
    } catch (error) {
      setError(error.message || 'Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <GlowContainer>
          <h1 className="text-3xl font-bold mb-6">Patient Health Records</h1>
          <div className="mb-6">
            <HealthSnapshotCard 
              latestRecord={null}
              loading={true}
            />
          </div>
          <Card className="text-center py-12">
            <p className="text-gray-400">Loading health records...</p>
          </Card>
        </GlowContainer>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <GlowContainer>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Patient Health Records</h1>
          <Badge variant="info">{records.length} records</Badge>
        </div>
        
        {error && (
          <Card variant="glass" className="mb-6 border border-red-500/30 bg-red-900/20">
            <p className="text-red-300">{error}</p>
          </Card>
        )}
        
        <div className="mb-6">
          <HealthSnapshotCard 
            latestRecord={records.length > 0 ? records[0] : null}
            loading={loading}
          />
        </div>

        <div className="space-y-4">
          {records.length > 0 ? (
            records.map((record) => (
              <Card key={record._id} variant="glass" className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {new Date(record.date).toLocaleDateString()}
                  </h3>
                  <Badge variant="secondary">
                    {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {record.bloodPressure?.systolic && (
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400">Blood Pressure</p>
                      <p className="font-medium text-white">
                        {record.bloodPressure.systolic}/{record.bloodPressure.diastolic}
                      </p>
                    </div>
                  )}
                  
                  {record.bloodSugar && (
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400">Blood Sugar</p>
                      <p className="font-medium text-white">{record.bloodSugar} mg/dL</p>
                    </div>
                  )}
                  
                  {record.weight && (
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400">Weight</p>
                      <p className="font-medium text-white">{record.weight} kg</p>
                    </div>
                  )}
                  
                  {record.height && (
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400">Height</p>
                      <p className="font-medium text-white">{record.height} cm</p>
                    </div>
                  )}
                </div>
                
                {record.notes && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-1">Notes</p>
                    <p className="text-white">{record.notes}</p>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <p className="text-slate-500">No health records found for this patient.</p>
            </Card>
          )}
        </div>
      </GlowContainer>
    </div>
  );
}