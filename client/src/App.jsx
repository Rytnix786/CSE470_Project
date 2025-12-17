import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorsList from './pages/DoctorsList';
import DoctorProfile from './pages/doctor/DoctorProfile';
import ManageSlots from './pages/doctor/ManageSlots';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import VerifyDoctors from './pages/admin/VerifyDoctors';
import PatientAppointments from './pages/patient/PatientAppointments';
import PrescriptionsList from './pages/patient/PrescriptionsList';
import HealthRecords from './pages/patient/HealthRecords';
import ConsultationChat from './pages/ConsultationChat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
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
            
            <Route path="/prescriptions" element={
              <ProtectedRoute roles={['PATIENT']}>
                <PrescriptionsList />
              </ProtectedRoute>
            } />
            
            <Route path="/health-records" element={
              <ProtectedRoute roles={['PATIENT']}>
                <HealthRecords />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/doctors" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
