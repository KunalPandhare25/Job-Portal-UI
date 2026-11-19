import { API_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  FaUser,
  FaBars,
  FaTimes,
  FaBell
} from 'react-icons/fa';

export default function Navbar({ username, onLogout }) {
  const navigate = useNavigate();

  const {
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount
  } = useNotifications();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const mobileNotificationRef = useRef(null);

  // Get logged-in user
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  };

  const storedUser = getStoredUser();
  const isJobSeeker = storedUser?.role === 'job_seeker';

  const refreshNotifications = async () => {
    const token = localStorage.getItem('token');

    if (!token || !isJobSeeker) return;

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

      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Unable to refresh notifications:', error);
    }
  };

  const displayName = username
    ? username.split('@')[0]
    : 'Guest';



  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        !notificationRef.current?.contains(event.target) &&
        !mobileNotificationRef.current?.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mark notification as read
  const handleNotificationClick = async (notification) => {
    const token = localStorage.getItem('token');

    if (!notification.is_read) {
      try {
        const response = await fetch(
          `${API_URL}/api/candidate/notifications/${notification.notification_id}/read`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          setNotifications((previous) =>
            previous.map((item) =>
              item.notification_id === notification.notification_id
                ? { ...item, is_read: 1 }
                : item
            )
          );

          setUnreadCount((previous) => Math.max(0, previous - 1));
        }
      } catch (error) {
        console.error('Unable to mark notification as read:', error);
      }
    }

    setIsNotificationOpen(false);
    navigate('/notifications');
  };

  const formatDate = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
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

  return (
    <nav
      className="h-16 fixed top-0 left-0 w-full flex items-center justify-between px-6 md:px-10 text-white shadow-md z-50"
      style={{
        background:
          'linear-gradient(to right, rgb(15, 23, 42), rgb(88, 28, 135), rgb(15, 23, 42))'
      }}
    >
      {/* Logo */}
      <div className="text-2xl font-bold">
        <Link to="/" className="hover:text-purple-300 transition">
          Jobify
        </Link>
      </div>

      {/* Mobile Notification and Hamburger */}
      <div className="md:hidden flex items-center gap-5">

        {/* Mobile Notification Bell */}
        {isJobSeeker && (
          <div className="relative" ref={mobileNotificationRef}>

            <button
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                if (!isNotificationOpen) refreshNotifications();
              }}
              className="relative flex items-center justify-center hover:text-purple-300"
              aria-label="Notifications"
            >
              <FaBell size={20} />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1
            flex items-center justify-center rounded-full
            bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Notification Dropdown */}
            {isNotificationOpen && (
              <div className="fixed right-3 top-20
              w-[min(calc(100vw-1.5rem),360px)]
              max-h-[65vh] overflow-y-auto
              bg-gray-900 border border-gray-700 rounded-xl
    s         hadow-2xl z-[100]">

                <div className="flex items-center justify-between
                  px-4 py-3 border-b border-gray-700">
                  <h3 className="font-semibold text-white">
                    Notifications
                  </h3>

                  <span className="text-xs text-purple-300">
                    {unreadCount} unread
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-400 text-sm">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <button
                        key={notification.notification_id}
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full text-left px-4 py-4
                    border-b border-gray-800 hover:bg-gray-800"
                      >
                        <p className="text-sm font-semibold text-white">
                          {notification.title}
                        </p>

                        <p className="text-xs text-gray-400 mt-1 break-words">
                          {notification.job_title || notification.message}
                        </p>

                        {notification.interview_date && (
                          <p className="text-xs text-gray-300 mt-2">
                            {formatDate(notification.interview_date)}
                            {' · '}
                            {formatTime(notification.interview_time)}
                          </p>
                        )}

                        {!notification.is_read && (
                          <span className="text-xs text-purple-300 mt-2 inline-block">
                            New
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>

                <Link
                  to="/notifications"
                  onClick={() => setIsNotificationOpen(false)}
                  className="block text-center px-4 py-3
              text-sm font-semibold text-purple-300 hover:bg-gray-800"
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Hamburger Menu */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>

      </div>


      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
        />
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:h-auto md:w-auto md:translate-x-0 md:flex md:bg-transparent md:items-center gap-6`}
      >
        <div className="flex flex-col md:flex-row p-6 space-y-4 md:space-y-0 md:space-x-6">

          <Link
            to="/"
            className="hover:text-purple-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            to="/plans"
            className="hover:text-purple-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Plans
          </Link>

          {username && (
            <Link
              to="/my-applications"
              className="hover:text-purple-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Application Status
            </Link>
          )}

          <Link
            to="/about"
            className="hover:text-purple-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About Us
          </Link>

          <Link
            to="/contact"
            className="hover:text-purple-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact Us
          </Link>

          {/* Notification Bell - Job Seekers Only */}
          {isJobSeeker && (
            <div className="relative hidden md:block" ref={notificationRef}>
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  if (!isNotificationOpen) refreshNotifications();
                }}
                className="relative flex items-center gap-2 hover:text-purple-300 transition"
                aria-label="Notifications"
                aria-expanded={isNotificationOpen}
              >
                <FaBell size={19} />

                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">

                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                    <h3 className="font-semibold text-white">
                      Notifications
                    </h3>

                    <span className="text-xs text-purple-300">
                      {unreadCount} unread
                    </span>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-400 text-sm">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <button
                          key={notification.notification_id}
                          onClick={() =>
                            handleNotificationClick(notification)
                          }
                          className={`w-full text-left px-4 py-4 border-b border-gray-800 hover:bg-gray-800 transition ${!notification.is_read ? 'bg-purple-900/20' : ''
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <FaBell className="text-purple-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white">
                                {notification.title}
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                {notification.job_title || notification.message}
                              </p>

                              {notification.interview_date && (
                                <p className="text-xs text-gray-300 mt-2">
                                  {formatDate(notification.interview_date)}
                                  {' · '}
                                  {formatTime(notification.interview_time)}
                                </p>
                              )}

                              {notification.interviewer && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Interviewer: {notification.interviewer}
                                </p>
                              )}

                              {notification.interview_type && (
                                <p className="text-xs text-purple-300 mt-1">
                                  {notification.interview_type}
                                </p>
                              )}

                              {!notification.is_read && (
                                <span className="inline-block mt-2 text-xs text-purple-300">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <Link
                    to="/notifications"
                    onClick={() => setIsNotificationOpen(false)}
                    className="block text-center px-4 py-3 text-sm font-semibold text-purple-300 hover:bg-gray-800 transition"
                  >
                    View All Notifications
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 hover:text-purple-300 transition focus:outline-none"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen ? 'true' : 'false'}
              aria-label="User Menu"
            >
              <FaUser />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-gray-800 text-white rounded shadow-md w-40 z-50">
                {username ? (
                  <>
                    <div className="px-4 py-2 text-sm font-medium text-purple-300">
                      {displayName}
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout?.();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-700"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-700"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
