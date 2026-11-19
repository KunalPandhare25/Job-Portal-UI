
import React from 'react';
import { Outlet } from 'react-router-dom';
import RecruiterSidebar from '../components/RecruiterSidebar';
import RecruiterNavbar from '../components/RecruiterNavbar';

const RecruiterLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950">

      {/* Sidebar */}
      <div className="w-full md:w-64 md:shrink-0">
        <RecruiterSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Navbar */}
        <RecruiterNavbar />

        {/* Page Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default RecruiterLayout;
