import Card from './ui/Card';

const HealthMetric = ({ label, value, icon }) => (
  <div className="flex flex-col items-center transition-all duration-300 hover:scale-105">
    <div className="text-slate-500 dark:text-slate-400 mb-1">{icon}</div>
    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    <div className="text-xs text-slate-600 dark:text-slate-400">{label}</div>
  </div>
);

export default function HealthSnapshotCard({ name, latestRecord, loading }) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-10"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Simple fade-in animation using CSS keyframes

  if (!latestRecord) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Health Snapshot</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center py-4">No health records yet</p>
      </Card>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card 
      className="p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Health Snapshot</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(latestRecord.date)}
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        <HealthMetric
          icon="🩸"
          label="BP"
          value={latestRecord.bloodPressure?.systolic && latestRecord.bloodPressure?.diastolic 
            ? `${latestRecord.bloodPressure.systolic}/${latestRecord.bloodPressure.diastolic}` 
            : "—"}
        />
        
        <HealthMetric
          icon="🍬"
          label="Sugar"
          value={latestRecord.bloodSugar ? `${latestRecord.bloodSugar}` : "—"}
        />
        
        <HealthMetric
          icon="⚖️"
          label="Weight"
          value={latestRecord.weight ? `${latestRecord.weight} kg` : "—"}
        />
        
        <HealthMetric
          icon="⏱️"
          label="Height"
          value={latestRecord.height ? `${latestRecord.height} cm` : "—"}
        />
      </div>
    </Card>
  );
}