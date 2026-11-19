import { API_URL } from "../config";
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBell,
  FaVideo,
  FaMapMarkerAlt,
  FaCheckDouble
} from 'react-icons/fa';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `${API_URL}/api/candidate/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load notifications.');
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `${API_URL}/api/candidate/notifications/${id}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Unable to update notification.');
      }

      setNotifications(previous =>
        previous.map(item =>
          item.notification_id === id
            ? { ...item, is_read: 1 }
            : item
        )
      );

      setUnreadCount(previous => Math.max(0, previous - 1));
    } catch (err) {
      setError(err.message);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `${API_URL}/api/candidate/notifications/read-all`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Unable to mark all as read.');
      }

      setNotifications(previous =>
        previous.map(item => ({ ...item, is_read: 1 }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Date not available';

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';

    const parts = String(time).split(':');
    const date = new Date();

    date.setHours(Number(parts[0]), Number(parts[1]), 0, 0);

    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center px-4">
        Loading notifications...
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full min-w-0 bg-gray-950 text-white px-3 sm:px-6 md:px-8 py-6 sm:py-10">

      <div className="w-full max-w-4xl mx-auto min-w-0">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">

          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <FaBell className="text-purple-400 text-xl sm:text-2xl shrink-0" />

              <h1 className="text-2xl sm:text-3xl font-bold break-words">
                Notifications
              </h1>
            </div>

            <p className="text-gray-400 text-sm sm:text-base mt-2">
              Stay updated with your job applications and interviews.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition shrink-0"
            >
              <FaCheckDouble />
              Mark all as read
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 mb-6 flex items-center justify-between gap-4">

          <div>
            <p className="text-gray-400 text-xs sm:text-sm">
              Total notifications
            </p>

            <p className="text-xl sm:text-2xl font-bold mt-1">
              {notifications.length}
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-400 text-xs sm:text-sm">
              Unread
            </p>

            <p className="text-xl sm:text-2xl font-bold text-purple-400 mt-1">
              {unreadCount}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-4 mb-5 text-sm break-words">
            {error}
          </div>
        )}

        {/* Notification List */}
        <div className="space-y-4">

          {notifications.length === 0 ? (

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-12 text-center">

              <FaBell className="text-gray-600 text-4xl mx-auto mb-4" />

              <h2 className="text-lg sm:text-xl font-semibold">
                No notifications yet
              </h2>

              <p className="text-gray-400 mt-2 text-sm sm:text-base">
                Your interview updates will appear here.
              </p>

              <Link
                to="/"
                className="inline-block mt-5 text-purple-400 hover:text-purple-300"
              >
                Explore jobs
              </Link>
            </div>

          ) : (

            notifications.map(notification => (

              <div
                key={notification.notification_id}
                className={`bg-gray-900 border rounded-xl p-4 sm:p-5 transition min-w-0 ${
                  !notification.is_read
                    ? 'border-purple-600/70 bg-purple-950/20'
                    : 'border-gray-800'
                }`}
              >

                <div className="flex flex-col sm:flex-row justify-between gap-4">

                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">

                    <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full bg-purple-600/20 flex items-center justify-center">
                      <FaBell className="text-purple-400" />
                    </div>

                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold text-base sm:text-lg break-words">
                          {notification.title}
                        </h3>

                        {!notification.is_read && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full shrink-0">
                            New
                          </span>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm mt-2 break-words">
                        {notification.message}
                      </p>

                      {notification.interview_date && (

                        <div className="mt-4 space-y-3 text-sm text-gray-300 min-w-0">

                          <p className="break-words">
                            <span className="text-gray-500">Position:</span>{' '}
                            {notification.job_title}
                          </p>

                          <p>
                            <span className="text-gray-500">Date:</span>{' '}
                            {formatDate(notification.interview_date)}
                          </p>

                          <p>
                            <span className="text-gray-500">Time:</span>{' '}
                            {formatTime(notification.interview_time)}
                          </p>

                          {notification.interviewer && (
                            <p className="break-words">
                              <span className="text-gray-500">Interviewer:</span>{' '}
                              {notification.interviewer}
                            </p>
                          )}

                          <p className="flex items-center gap-2 flex-wrap">
                            {notification.interview_type === 'Online'
                              ? <FaVideo className="text-purple-400 shrink-0" />
                              : <FaMapMarkerAlt className="text-purple-400 shrink-0" />
                            }

                            {notification.interview_type}
                          </p>

                          {notification.interview_type === 'Online' &&
                            notification.meeting_link && (
                              <a
                                href={notification.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-purple-400 hover:text-purple-300 underline break-all"
                              >
                                Join Interview
                              </a>
                            )}

                          {notification.interview_type !== 'Online' &&
                            notification.location && (
                              <p className="break-words">
                                <span className="text-gray-500">Location:</span>{' '}
                                {notification.location}
                              </p>
                            )}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-4 break-words">
                        {notification.created_at
                          ? new Date(notification.created_at).toLocaleString('en-IN')
                          : ''}
                      </p>

                    </div>
                  </div>

                  {!notification.is_read && (
                    <div className="sm:self-start sm:shrink-0 pl-13 sm:pl-0">
                      <button
                        onClick={() =>
                          markAsRead(notification.notification_id)
                        }
                        className="text-sm text-purple-400 hover:text-purple-300 py-2"
                      >
                        Mark as read
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </main>
  );
}
