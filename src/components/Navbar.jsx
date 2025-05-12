import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';

export default function Navbar({ username, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown if user clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className="h-16 flex justify-between items-center px-6 text-white shadow-md w-full relative z-50"
      style={{
        background: 'linear-gradient(to right, rgb(15, 23, 42), rgb(88, 28, 135), rgb(15, 23, 42))',
      }}
    >
      {/* Logo */}
      <div className="text-3xl pl-10 font-bold">
        <Link to="/" className="hover:text-purple-300 transition">
          Jobify
        </Link>
      </div>

      {/* Navigation Links and User Menu */}
      <div className="flex gap-6 pr-10 items-center">
        <Link to="/" className="hover:underline hover:text-purple-300">Home</Link>
        <Link to="/plans" className="hover:underline hover:text-purple-300">Plans</Link>
        <Link to="/about" className="hover:underline hover:text-purple-300">About Us</Link>
        <Link to="/contact" className="hover:underline hover:text-purple-300">Contact Us</Link>

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
                <div>
                  <div className="px-4 py-2 text-sm font-medium text-purple-300">
                    {username}
                  </div>
                  <button
                    onClick={() => {
                      if (onLogout) onLogout(); // call logout function
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div>
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
