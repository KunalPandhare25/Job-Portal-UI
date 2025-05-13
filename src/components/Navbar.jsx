import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar({ username, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract part before '@' from username if it's an email
  const displayName = username ? username.split('@')[0] : 'Guest';

  return (
    <nav
      className="h-16 flex items-center justify-between px-6 md:px-10 text-white shadow-md relative z-50"
      style={{
        background: 'linear-gradient(to right, rgb(15, 23, 42), rgb(88, 28, 135), rgb(15, 23, 42))',
      }}
    >
      {/* Logo */}
      <div className="text-2xl font-bold">
        <Link to="/" className="hover:text-purple-300 transition">Jobify</Link>
      </div>

      {/* Hamburger Icon for Mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="focus:outline-none"
        >
          {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Links + User Menu */}
      <div className={`absolute md:static top-16 left-0 w-full md:w-auto bg-gray-900 md:bg-transparent md:flex items-center gap-6 px-6 md:px-0 py-4 md:py-0 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'flex flex-col' : 'hidden md:flex'}`}>
        <Link to="/" className="hover:text-purple-300 py-1">Home</Link>
        <Link to="/plans" className="hover:text-purple-300 py-1">Plans</Link>
        <Link to="/about" className="hover:text-purple-300 py-1">About Us</Link>
        <Link to="/contact" className="hover:text-purple-300 py-1">Contact Us</Link>

        {/* User Dropdown */}
        <div className="relative mt-2 md:mt-0" ref={dropdownRef}>
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
                  <div className="px-4 py-2 text-sm font-medium text-purple-300">{displayName}</div>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsDropdownOpen(false);
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
    </nav>
  );
}
