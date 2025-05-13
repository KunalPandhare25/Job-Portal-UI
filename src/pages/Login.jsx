import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setUsername }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  // Check for saved email in local storage
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    setError(''); // Clear any previous error

    if (email && password) {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Simulate username setting after successful login
      setUsername(email); // You can change this to something else if needed

      // Redirect to home after login
      navigate('/');
    } else {
      setError('Please enter both email and password.');
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
      <div className="w-full max-w-lg sm:max-w-md bg-black/50 backdrop-blur-md p-8 rounded-lg shadow-xl space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center">Login</h2>

        {error && (
          <div className="text-center text-red-400 text-sm sm:text-base" role="alert">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block mb-1 text-sm sm:text-base text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-sm sm:text-base text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm sm:text-base text-gray-300">
              <input
                type="checkbox"
                className="mr-2 accent-purple-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-purple-600 hover:bg-purple-700 transition rounded"
          >
            Log In
          </button>
        </form>

        <p className="text-sm sm:text-base text-center text-gray-300">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
