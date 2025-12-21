import React, { useState, useRef, useEffect } from 'react';
import NotificationPanel from './NotificationPanel';
import { useNotifications } from '../../context/NotificationContext';

const NotificationBell = () => {
  const { notifications, loading, markAllAsRead, fetchNotifications, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const lastFetchTimeRef = useRef(0);
  const panelRef = useRef(null);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark notification as read using the correct ID field
    const notificationId = notification._id || notification.id;
    if (notificationId) {
      try {
        await markAsRead(notificationId);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };
  
  // Fetch notifications when dropdown opens with throttling
  useEffect(() => {
    if (isOpen) {
      const now = Date.now();
      // Only fetch if it's been more than 10 seconds since last fetch
      if (now - lastFetchTimeRef.current > 10000) {
        fetchNotifications();
        lastFetchTimeRef.current = now;
      }
    }
  }, [isOpen, fetchNotifications]);
  
  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        aria-label="Notifications"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      <NotificationPanel 
        notifications={notifications}
        loading={loading}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMarkAllAsRead={markAllAsRead}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
};

export default NotificationBell;