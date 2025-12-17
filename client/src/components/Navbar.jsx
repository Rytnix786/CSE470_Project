import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-500">BRACU Health</span>
            </Link>
            
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
                {user.role === 'PATIENT' && (
                  <>
                    <Link to="/doctors" className="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800 rounded-lg">
                      Doctors
                    </Link>
                    <Link to="/appointments" className="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg">
                      Appointments
                    </Link>
                    <Link to="/prescriptions" className="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg">
                      Prescriptions
                    </Link>
                    <Link to="/health-records" className="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg">
                      Health Records
                    </Link>
                  </>
                )}
                
                {user.role === 'DOCTOR' && (
                  <>
                    <Link to="/doctor/profile" className="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800 rounded-lg">
                      Profile
                    </Link>
                    <Link to="/doctor/slots" className="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg">
                      Slots
                    </Link>
                    <Link to="/doctor/appointments" className="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg">
                      Appointments
                    </Link>
                  </>
                )}
                
                {user.role === 'ADMIN' && (
                  <Link to="/admin/verify-doctors" className="inline-flex items-center px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800 rounded-lg">
                    Verify Doctors
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-zinc-400">
                  {user.name} <span className="text-zinc-600">•</span> <span className="text-blue-500">{user.role}</span>
                </span>
                <button
                  onClick={logout}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
