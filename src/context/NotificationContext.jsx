import { API_URL, SOCKET_URL } from '../config';
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import { io } from 'socket.io-client';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let socket = null;
    let active = true;

    const connectNotifications = () => {
      // Close any previous connection
      if (socket) {
        socket.disconnect();
        socket = null;
      }

      const token = localStorage.getItem('token');

      let user;

      try {
        user = JSON.parse(localStorage.getItem('user'));
      } catch {
        user = null;
      }

      if (
        !token ||
        user?.role !== 'job_seeker' ||
        !user?.user_id
      ) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const currentSocket = io(SOCKET_URL);
      socket = currentSocket;

      currentSocket.on('connect', () => {
        currentSocket.emit('join-user-room', user.user_id);
        console.log('Connected to Jobify notifications');
      });

      const fetchNotifications = async () => {
        try {
          const response = await fetch(
            `${API_URL}/api/candidate/notifications`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (!response.ok) return;

          const data = await response.json();

          if (active && data.success) {
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
          }
        } catch (error) {
          console.error('Notification fetch error:', error);
        }
      };

      fetchNotifications();

      currentSocket.on('new-notification', () => {
        fetchNotifications();
      });
    };

    // Connect when the user logs in
    window.addEventListener(
      'jobify-auth-changed',
      connectNotifications
    );

    // Connect if already logged in
    connectNotifications();

    return () => {
      active = false;

      window.removeEventListener(
        'jobify-auth-changed',
        connectNotifications
      );

      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
