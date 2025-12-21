import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/system/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorsList from './pages/DoctorsList';
import DoctorProfile from './pages/doctor/DoctorProfile';
import ManageSlots from './pages/doctor/ManageSlots';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import CreatePrescription from './pages/doctor/CreatePrescription';
import DoctorPatientHealthRecords from './pages/doctor/DoctorPatientHealthRecords';
import VerifyDoctors from './pages/admin/VerifyDoctors';
import PatientAppointments from './pages/patient/PatientAppointments';
import PrescriptionsList from './pages/patient/PrescriptionsList';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientReviews from './pages/patient/PatientReviews';
import HealthRecords from './pages/patient/HealthRecords';
import ConsultationChat from './pages/ConsultationChat';
import LeaveReview from './pages/patient/LeaveReview';
import ViewDoctorProfile from './pages/patient/ViewDoctorProfile';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider onLogout={() => {
        // Clear notifications when user logs out
        const event = new CustomEvent('clearNotifications');
        window.dispatchEvent(event);
      }}>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
              <Navbar />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/doctors" element={
                  <ProtectedRoute>
                    <DoctorsList />
                  </ProtectedRoute>
                } />
                
                <Route path="/doctor/profile" element={
                  <ProtectedRoute roles={['DOCTOR']}>
                    <DoctorProfile />
                  </ProtectedRoute>
                } />
                
                <Route path="/doctor/slots" element={
                  <ProtectedRoute roles={['DOCTOR']}>
                    <ManageSlots />
                  </ProtectedRoute>
                } />
                
                <Route path="/doctor/appointments" element={
                  <ProtectedRoute roles={['DOCTOR']}>
                    <DoctorAppointments />
                  </ProtectedRoute>
                } />
                
                <Route path="/doctor/prescriptions" element={
                  <ProtectedRoute roles={['DOCTOR']}>
                    <DoctorPrescriptions />
                  </ProtectedRoute>
                } />
                
                <Route path="/doctor/prescriptions/create/:appointmentId" element={
                  <ProtectedRoute roles={['DOCTOR']}>
                    <CreatePrescription />
                  </ProtectedRoute>
                } />
                
                <Route path="/doctor/patients/:patientId/health-records" element={
                  <ProtectedRoute roles={['DOCTOR']}>
                    <DoctorPatientHealthRecords />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/verify-doctors" element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <VerifyDoctors />
                  </ProtectedRoute>
                } />
                
                <Route path="/appointments" element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <PatientAppointments />
                  </ProtectedRoute>
                } />
                
                <Route path="/appointments/:id/chat" element={
                  <ProtectedRoute>
                    <ConsultationChat />
                  </ProtectedRoute>
                } />
                
                <Route path="/appointments/:id/review" element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <LeaveReview />
                  </ProtectedRoute>
                } />
                
                <Route path="/patient/reviews" element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <PatientReviews />
                  </ProtectedRoute>
                } />
                
                <Route path="/patient/prescriptions" element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <PatientPrescriptions />
                  </ProtectedRoute>
                } />
                
                <Route path="/health-records" element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <HealthRecords />
                  </ProtectedRoute>
                } />
                
                <Route path="/doctors/:id" element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <ViewDoctorProfile />
                  </ProtectedRoute>
                } />
                
                <Route path="/" element={<Navigate to="/doctors" replace />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
