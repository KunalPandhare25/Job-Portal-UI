import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Profile');

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
  });

  const [password, setPassword] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });

  const [notifications, setNotifications] = useState({
    newApplications: true,
    interviewUpdates: true,
    shortlistedCandidates: true,
    productUpdates: false,
  });

  const [message, setMessage] = useState('');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setMessage('Please login again.');
          return;
        }

        const response = await fetch(
          `${API_URL}/api/recruiter/settings/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load profile');
        }

        setProfile({
          fullName: data.profile.fullName || '',
          email: data.profile.email || '',
          phone: data.profile.phone || '',
          designation: data.profile.designation || ''
        });

      } catch (error) {
        setMessage(error.message);
      }
    };

    fetchProfile();
  }, []);

  const tabs = ['Profile', 'Security', 'Notifications', 'Account'];

  const inputClass =
    'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500';

  const labelClass =
    'block text-sm text-gray-300 mb-2 font-medium';

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const confirmSave = window.confirm(
      'Are you sure you want to save these changes?'
    );

    if (!confirmSave) {
      return;
    }
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/recruiter/settings/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(profile)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setMessage('Profile updated successfully!');

    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivatePassword.trim()) {
      setMessage('Please enter your current password.');
      return;
    }

    setDeactivating(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/recruiter/deactivate-account`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            password: deactivatePassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to deactivate account.');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      window.dispatchEvent(new Event('jobify-auth-changed'));

      window.location.href = '/login';

    } catch (error) {
      setMessage(error.message);
    } finally {
      setDeactivating(false);
    }
  };


  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password.newPassword.length < 8) {
      setMessage('New password must contain at least 8 characters.');
      return;
    }

    if (password.newPassword !== password.confirm) {
      setMessage('New passwords do not match.');
      return;
    }

    const confirmChange = window.confirm(
      'Are you sure you want to change your account password?'
    );

    if (!confirmChange) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/recruiter/settings/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: password.current,
            newPassword: password.newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password update failed.');
      }

      setMessage('Password changed successfully!');

      setPassword({
        current: '',
        newPassword: '',
        confirm: ''
      });

    } catch (error) {
      setMessage(error.message);
    }
  };


  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-8">

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-400 mt-2">
          Manage your recruiter account and preferences.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Settings Navigation */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-fit">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMessage('');
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition ${activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8">

          {/* Profile */}
          {activeTab === 'Profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Update your recruiter account details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    name="fullName"
                    required
                    value={profile.fullName}
                    onChange={handleProfileChange}
                    placeholder="Enter your name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    className={inputClass}
                  />
                </div>


                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter phone number"
                    className={inputClass}
                  />
                </div>


                <div>
                  <label className={labelClass}>Designation</label>
                  <input
                    name="designation"
                    value={profile.designation}
                    onChange={handleProfileChange}
                    placeholder="e.g. HR Manager"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium"
              >
                Save Changes
              </button>
            </form>
          )}

          {/* Security */}
          {activeTab === 'Security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Password & Security</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Update your account password.
                </p>
              </div>

              <div className="space-y-5 max-w-xl">
                <div>
                  <label className={labelClass}>Current Password</label>
                  <input
                    required
                    type="password"
                    name="current"
                    value={password.current}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>New Password</label>
                  <input
                    required
                    type="password"
                    name="newPassword"
                    value={password.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input
                    required
                    type="password"
                    name="confirm"
                    value={password.confirm}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium"
              >
                Update Password
              </button>
            </form>
          )}

          {/* Notifications */}
          {activeTab === 'Notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Notification Preferences</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Choose which updates you want to receive.
                </p>
              </div>

              {[
                {
                  key: 'newApplications',
                  title: 'New Applications',
                  description: 'Get notified when candidates apply for your jobs.',
                },
                {
                  key: 'interviewUpdates',
                  title: 'Interview Updates',
                  description: 'Receive interview scheduling and status updates.',
                },
                {
                  key: 'shortlistedCandidates',
                  title: 'Shortlisted Candidates',
                  description: 'Get updates when candidates are shortlisted.',
                },
                {
                  key: 'productUpdates',
                  title: 'Product Updates',
                  description: 'Receive Jobify announcements and new features.',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between gap-4 border-b border-gray-800 pb-5 cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {item.description}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 accent-purple-600"
                  />
                </label>
              ))}

              <button
                onClick={() => setMessage('Notification preferences updated in this session.')}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium"
              >
                Save Preferences
              </button>
            </div>
          )}

          {/* Account */}
          {activeTab === 'Account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Account Management</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Manage your Jobify recruiter account.
                </p>
              </div>

              <div className="border border-gray-800 rounded-lg p-5">
                <h3 className="font-medium">Account Status</h3>
                <p className="text-green-400 text-sm mt-2">Active</p>
              </div>

              <div className="border border-red-400/20 rounded-lg p-5">
                <h3 className="font-medium text-rose-300">Deactivate Account</h3>

                <p className="text-gray-400 text-sm mt-2">
                  Deactivating your account will hide your active jobs and temporarily
                  disable access to your recruiter account.
                </p>

                <p className="text-gray-500 text-xs mt-2">
                  Your existing applications and scheduled interviews will be preserved.
                  You can reactivate your account by logging in again.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setDeactivatePassword('');
                    setShowDeactivateModal(true);
                    setMessage('');
                  }}
                  className="mt-5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/30 text-rose-300 px-5 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Deactivate Account
                </button>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <p className="mt-6 text-sm text-purple-400">
              {message}
            </p>
          )}

        </div>
      </div>

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">

            <h2 className="text-xl font-semibold text-white">
              Deactivate Account?
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Enter your current password to confirm account deactivation.
              Your applications and scheduled interviews will be preserved.
            </p>

            <div className="mt-5">
              <label className={labelClass}>Current Password</label>

              <input
                type="password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                placeholder="Enter your current password"
                className={inputClass}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeactivateModal(false);
                  setDeactivatePassword('');
                  setMessage('');
                }}
                disabled={deactivating}
                className="rounded-lg border border-gray-700 px-4 py-2.5 text-gray-300 hover:bg-gray-800 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeactivateAccount}
                disabled={deactivating}
                className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 font-medium text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50"
              >
                {deactivating ? 'Deactivating...' : 'Yes, Deactivate'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
