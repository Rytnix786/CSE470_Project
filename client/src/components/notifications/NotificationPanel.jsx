import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = ({ notifications, loading, isOpen, onClose, onMarkAllAsRead, onNotificationClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Removed automatic mark all as read on open to prevent unexpected behavior

  const getIcon = (type, metadata = {}) => {
    // For verification notifications, use action-specific icons
    if (type === 'VERIFICATION' && metadata.action) {
      switch (metadata.action) {
        case 'VERIFIED':
          return '✅';
        case 'SUSPENDED':
          return '❌';
        case 'UNSUSPENDED':
        case 'REJECTED':
          return '⚠️';
        default:
          return '✅';
      }
    }
    
    // For other notification types
    switch (type) {
      case 'APPOINTMENT':
      case 'appointment':
        return '📅';
      case 'PAYMENT':
      case 'payment':
        return '💳';
      case 'PRESCRIPTION':
      case 'prescription':
        return '💊';
      case 'CHAT':
      case 'chat':
        return '💬';
      case 'VERIFICATION':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'APPOINTMENT':
      case 'appointment':
        return 'Appointment';
      case 'PAYMENT':
      case 'payment':
        return 'Payment';
      case 'PRESCRIPTION':
      case 'prescription':
        return 'Prescription';
      case 'CHAT':
      case 'chat':
        return 'Chat';
      case 'VERIFICATION':
        return 'Verification';
      default:
        return 'System';
    }
  };

  const getTypeColor = (type, metadata = {}) => {
    // For verification notifications, use action-specific colors
    if (type === 'VERIFICATION' && metadata.action) {
      switch (metadata.action) {
        case 'VERIFIED':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'SUSPENDED':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case 'UNSUSPENDED':
        case 'REJECTED':
          return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
        default:
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      }
    }
    
    // For other notification types
    switch (type) {
      case 'APPOINTMENT':
      case 'appointment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'PAYMENT':
      case 'payment':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'PRESCRIPTION':
      case 'prescription':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'CHAT':
      case 'chat':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'VERIFICATION':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTimeAgo = (dateString) => {
    // Handle missing timestamps
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Unknown time';
    
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 0) return 'Just now';
    if (seconds < 60) return `${seconds} sec ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    return `${Math.floor(seconds / 86400)} day ago`;
  };

  // Handle notification click with safety guards
  const handleNotificationClick = async (notification) => {
    try {
      // Call the provided click handler if exists
      if (onNotificationClick) {
        onNotificationClick(notification);
      }
      
      // Try to navigate if notification has a valid link
      if (notification.link) {
        // Guard: only navigate if link is a non-empty string AND starts with "/"
        if (typeof notification.link === 'string' && 
            notification.link.trim() !== '' && 
            notification.link.startsWith('/')) {
          // Additional guard: check for known route prefixes
          const knownRoutes = ['/appointments', '/payments', '/prescriptions', '/doctors', '/profile'];
          const isValidRoute = knownRoutes.some(route => notification.link.startsWith(route));
          
          if (isValidRoute) {
            navigate(notification.link);
          }
        }
      }
      
      // Always close the dropdown
      if (onClose) onClose();
      
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Show error in console only, don't crash the UI
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
          {notifications.some(n => !n.read) && (
            <button 
              onClick={onMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          // Skeleton loading UI
          <ul>
            {[...Array(5)].map((_, i) => (
              <li 
                key={i}
                className="p-4 border-b border-gray-100 dark:border-slate-700"
              >
                <div className="flex items-start animate-pulse">
                  <div className="rounded-full bg-gray-200 dark:bg-slate-700 h-6 w-6 mr-3 mt-0.5"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-slate-600 dark:text-slate-400">
              {user?.role === 'ADMIN' && 'No verification requests right now.'}
              {user?.role === 'PATIENT' && 'No updates yet.'}
              {user?.role === 'DOCTOR' && 'No new appointment updates yet.'}
              {!user?.role && 'No notifications yet.'}
            </p>
          </div>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li 
                key={notification._id || notification.id} 
                className={`p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  <span className="text-xl mr-3 mt-0.5">{getIcon(notification.type, notification.metadata)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm ${notification.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100 font-medium'}`}>
                        {notification.message || 'No message'}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(notification.type || 'default', notification.metadata || {})}`}>
                        {getTypeLabel(notification.type || 'default')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {getTimeAgo(notification.createdAt || notification.timestamp)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;