
import React from 'react';
import { Outlet } from 'react-router-dom';
import RecruiterSidebar from '../components/RecruiterSidebar';
import RecruiterNavbar from '../components/RecruiterNavbar';

const RecruiterLayout = () => {
    return (
        <div className="min-h-screen bg-gray-950">

            {/* Fixed Sidebar */}
            <RecruiterSidebar />

            {/* Main Content Area */}
            <div className="min-h-screen flex flex-col md:ml-64">

                {/* Fixed Transparent Navbar */}
                <RecruiterNavbar />

                {/* Page Content */}
                <main className="flex-1 min-w-0 pt-16">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default RecruiterLayout;
