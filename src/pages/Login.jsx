import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setUsername }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('job_seeker');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReactivationModal, setShowReactivationModal] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'ACCOUNT_INACTIVE') {
          setShowReactivationModal(true);
          return;
        }

        throw new Error(data.message || 'Login failed.');
      }

      // Verify account type
      if (data.user.role !== accountType) {
        throw new Error('Invalid email, password, or account type.');
      }

      // Store authentication details
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('jobify-auth-changed'));

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email.trim());
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      setUsername(data.user.full_name);

      // Redirect based on account type
      if (data.user.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/');
      }

    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateAccount = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_URL}/api/recruiter/reactivate-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim(),
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Account reactivation failed.');
      }

      // Store authentication details
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.dispatchEvent(new Event('jobify-auth-changed'));

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email.trim());
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      setUsername(data.user.full_name);
      setShowReactivationModal(false);

      navigate('/recruiter/dashboard');

    } catch (err) {
      setError(err.message || 'Unable to reactivate account.');
      setShowReactivationModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 text-white"
      style={{
        background:
          'linear-gradient(to right, rgb(15, 23, 42), rgb(88, 28, 135), rgb(15, 23, 42))',
      }}
    >
      {showReactivationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-md rounded-xl border border-gray-600 bg-gray-900 p-6 shadow-2xl">

            <h2 className="mb-3 text-xl font-bold text-white">
              Reactivate Your Account?
            </h2>

            <p className="mb-6 text-sm leading-6 text-gray-300">
              Your recruiter account is currently deactivated.
              Would you like to reactivate it? Your previously active
              job listings will become visible again.
            </p>

            <div className="flex justify-between gap-3">

              <button
                type="button"
                onClick={handleReactivateAccount}
                disabled={loading}
                className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Reactivating...' : 'Yes, Reactivate'}
              </button>

              <button
                type="button"
                onClick={() => setShowReactivationModal(false)}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-500 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-gray-700"
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Login Card - Original Size */}
      <div className="w-full max-w-lg sm:max-w-md bg-black/50 backdrop-blur-md p-8 rounded-lg shadow-xl space-y-6">

        <h2 className="text-3xl sm:text-4xl font-bold text-center">
          Login
        </h2>

        {/* Login As */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-400"></div>
          <span className="text-sm font-medium whitespace-nowrap">
            Login As
          </span>
          <div className="flex-1 border-t border-gray-400"></div>
        </div>

        {/* Account Type Selection */}
        <div className="grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={() => setAccountType('job_seeker')}
            aria-pressed={accountType === 'job_seeker'}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg border transition ${accountType === 'job_seeker'
              ? 'border-purple-500 bg-purple-600/20 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
              : 'border-gray-500 hover:border-purple-400'
              }`}
          >
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${accountType === 'job_seeker'
              ? 'border-purple-500'
              : 'border-gray-400'
              }`}>
              {accountType === 'job_seeker' && (
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              )}
            </span>

            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="7" r="4" />
              <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            </svg>

            <span className="text-xs sm:text-sm font-medium">
              Job Seeker
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('recruiter')}
            aria-pressed={accountType === 'recruiter'}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg border transition ${accountType === 'recruiter'
              ? 'border-purple-500 bg-purple-600/20 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
              : 'border-gray-500 hover:border-purple-400'
              }`}
          >
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${accountType === 'recruiter'
              ? 'border-purple-500'
              : 'border-gray-400'
              }`}>
              {accountType === 'recruiter' && (
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              )}
            </span>

            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="7" width="18" height="14" rx="2" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M3 12h18M10 12v2h4v-2" />
            </svg>

            <span className="text-xs sm:text-sm font-medium">
              Recruiter
            </span>
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="text-center text-red-400 text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-5" onSubmit={handleLogin}>

          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm text-gray-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm text-gray-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <label className="flex items-center text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                className="mr-2 accent-purple-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition rounded disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

        </form>

        {/* Register Link */}
        <p className="text-sm text-center text-gray-300">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
