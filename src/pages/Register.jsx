import { API_URL } from '../config';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = ({ setUsername }) => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('job_seeker');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    return regex.test(password);
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const validateMobile = (mobile) => {
    return /^[0-9]{10}$/.test(mobile);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedMobile = mobile.trim();

    if (!trimmedFullName || !trimmedEmail || !trimmedMobile || !password || !confirm) {
      setError('All fields are required.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validateMobile(trimmedMobile)) {
      setError('Please enter a valid mobile number (10 digits).');
      return;
    }

    if (!validatePassword(password)) {
      setError(
        'Password must be 8+ characters, include uppercase, lowercase, number, and special character.'
      );
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: trimmedFullName,
          email: trimmedEmail,
          mobile: trimmedMobile,
          password,
          role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      // Store name for existing Navbar display only.
      // This does not authenticate the user.
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUsername(data.user.full_name);
      setSuccess('Account created successfully!');

      setTimeout(() => {
        navigate(data.user.role === 'recruiter' ? '/recruiter/dashboard' : '/');
      }, 1000);

    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 text-white"
      style={{
        background: 'linear-gradient(to right, rgb(15, 23, 42), rgb(88, 28, 135), rgb(15, 23, 42))',
      }}
    >
      <div className="w-full max-w-md md:max-w-lg bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-xl space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">
            Create Job Seeker Account
          </h2>
          <p className="text-gray-300 text-sm mt-2">
            Start your journey towards your next opportunity.
          </p>
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {success && <p className="text-green-400 text-sm text-center">{success}</p>}

        <form className="space-y-5" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm mb-1 text-gray-300">Full Name</label>
            <input
              type="text"
              autoComplete="name"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Mobile</label>
            <input
              type="tel"
              autoComplete="tel"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Confirm Password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full py-2 font-semibold text-white bg-purple-600 rounded hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-300">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-300 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
