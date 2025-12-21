import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './notifications/NotificationBell';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications } = useNotifications();

  return (
    <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50 dark:bg-gray-950 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">BRACU Health</span>
            </Link>
            
            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1 items-center">
                {user.role === 'PATIENT' && (
                  <>
                    <Link to="/doctors" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50">
                      Doctors
                    </Link>
                    <Link to="/appointments" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50">
                      Appointments
                    </Link>
                    <Link to="/patient/prescriptions" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50">
                      Prescriptions
                    </Link>
                    <Link to="/patient/reviews" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50">
                      Reviews
                    </Link>
                    <Link to="/health-records" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50">
                      Health Records
                    </Link>
                  </>
                )}
                
                {user.role === 'DOCTOR' && (
                  <>
                    <Link to="/doctor/profile" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50">
                      Profile
                    </Link>
                    <Link to="/doctor/slots" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50">
                      Slots
                    </Link>
                    <Link to="/doctor/appointments" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50">
                      Appointments
                    </Link>
                    <Link to="/doctor/prescriptions" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50">
                      Prescriptions
                    </Link>
                  </>
                )}
                
                {user.role === 'ADMIN' && (
                  <>
                    <Link to="/admin/verify-doctors" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50">
                      Verify Doctors
                    </Link>
                    <Link to="/admin/manage-doctors" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50">
                      Manage Doctors
                    </Link>
                    <Link to="/admin/profile" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50">
                      Profile
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <span className="text-sm text-gray-400 hidden md:block dark:text-gray-300">
                  {user.name} <span className="text-gray-600 dark:text-gray-400">•</span> <span className="text-blue-400">{user.role}</span>
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
