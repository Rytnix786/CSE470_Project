import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../api/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);
  const lastFetchedRef = useRef(0);
  const minRefreshInterval = 5000; // 5 seconds

  // Clear notifications when logout event is received
  useEffect(() => {
    const handleClearNotifications = () => {
      setNotifications([]);
      setLoading(false);
      lastFetchedRef.current = 0;
    };

    window.addEventListener('clearNotifications', handleClearNotifications);
    return () => {
      window.removeEventListener('clearNotifications', handleClearNotifications);
    };
  }, []);

  // Fetch notifications from API with guards
  const fetchNotifications = async (force = false) => {
    if (!user) return;
    
    // Guard against duplicate fetches
    if (fetchingRef.current) return;
    
    // Rate limiting - unless forced
    if (!force) {
      const now = Date.now();
      if (now - lastFetchedRef.current < minRefreshInterval) return;
    }
    
    fetchingRef.current = true;
    setLoading(true);
    
    try {
      const response = await notificationsAPI.getMyNotifications();
      setNotifications(response.data.notifications);
      lastFetchedRef.current = Date.now();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  // Refresh notifications when user changes
  useEffect(() => {
    // Clear notifications and set loading when user changes
    setNotifications([]);
    setLoading(true);
    lastFetchedRef.current = 0; // Reset rate limiting
    fetchNotifications(true); // Force fetch on user change
  }, [user]);

  // Add a new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      read: false,
      timestamp: new Date().toISOString(),
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Optimistically update UI
      const now = new Date().toISOString();
      setNotifications(prev => 
        prev.map(notification => 
          notification.read ? notification : { ...notification, read: true, readAt: now }
        )
      );
      
      // Make API call to persist the change
      await notificationsAPI.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert optimistic update on error
      await fetchNotifications(); // Refresh notifications to get correct state
    }
  };

  // Mark a specific notification as read
  const markAsRead = async (id) => {
    try {
      // Validate ID before making API call
      if (!id) {
        console.warn('Attempted to mark notification as read with invalid ID');
        return;
      }
      
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notification => 
          (notification._id === id || notification.id === id) 
            ? { ...notification, read: true, readAt: new Date().toISOString() } 
            : notification
        )
      );
      
      // Make API call to persist the change
      await notificationsAPI.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert optimistic update on error
      await fetchNotifications(); // Refresh notifications to get correct state
    }
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    loading,
    fetchNotifications,
    addNotification,
    markAllAsRead,
    markAsRead,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};