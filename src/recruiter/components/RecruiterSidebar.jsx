
import React from 'react';
import { NavLink } from 'react-router-dom';

const RecruiterSidebar = () => {
    const menuItems = [
        { name: 'Dashboard', path: '/recruiter/dashboard' },
        { name: 'Manage Jobs', path: '/recruiter/jobs' },
        { name: 'Post a Job', path: '/recruiter/jobs/new' },
        { name: 'Applicants', path: '/recruiter/applicants' },
        { name: 'Interviews', path: '/recruiter/interviews' },
        { name: 'Company Profile', path: '/recruiter/company' },
        { name: 'Analytics', path: '/recruiter/analytics' },
        { name: 'Settings', path: '/recruiter/settings' },
    ];

    return (
        <aside className="w-full md:w-64 min-h-0 md:min-h-screen bg-gray-950 text-white border-b md:border-b-0 md:border-r border-gray-800 p-3 sm:p-5">

            <h2 className="text-lg sm:text-xl font-bold mb-4 md:mb-8">
                Jobify <span className="text-purple-400">Recruiter</span>
            </h2>

            <nav className="flex flex-wrap gap-2 md:flex-col md:space-y-2 md:gap-0">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={true}
                        className={({ isActive }) =>
                            `block px-3 sm:px-4 py-2.5 md:py-3 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${isActive
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default RecruiterSidebar;
