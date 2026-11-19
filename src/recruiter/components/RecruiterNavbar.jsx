
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RecruiterNavbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 md:px-8 flex items-center justify-between text-white">
      <div>
        <h1 className="text-lg font-semibold">Recruiter Portal</h1>
      </div>

      <div className="relative flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">Recruiter</p>
          <p className="text-xs text-gray-400">Manage your hiring</p>
        </div>

        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center font-semibold transition"
        >
          R
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-52 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 py-2">

            <Link
              to="/recruiter/company"
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Company Profile
            </Link>

            <Link
              to="/recruiter/settings"
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Account Settings
            </Link>

            <div className="border-t border-gray-700 my-1"></div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-800"
            >
              Logout
            </button>

          </div>
        )}
      </div>
    </header>
  );
};

export default RecruiterNavbar;
