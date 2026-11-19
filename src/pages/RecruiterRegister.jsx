import { API_URL } from '../config';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RecruiterRegister = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');

    const [companyName, setCompanyName] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [designation, setDesignation] = useState('');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        if (
            !fullName.trim() ||
            !email.trim() ||
            !mobile.trim() ||
            !companyName.trim() ||
            !designation.trim() ||
            !password ||
            !confirm
        ) {
            setError('Please fill in all required fields.');
            return;
        }

        if (!/^\d{10}$/.test(mobile)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/;

        if (!passwordRegex.test(password)) {
            setError('Password must contain at least 8 characters, uppercase, lowercase, number and special character.');
            return;
        }

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fullName,
                        email,
                        mobile,
                        password,
                        role: 'recruiter',
                        companyName,
                        companyWebsite,
                        designation
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed.');
            }

            // Store authentication details
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            window.dispatchEvent(new Event('jobify-auth-changed'));

            setSuccess('Recruiter account created successfully! Redirecting to dashboard...');

            setTimeout(() => {
                navigate('/recruiter/dashboard');
            }, 1500);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-10 text-white"
            style={{
                background: 'linear-gradient(to right, rgb(15, 23, 42), rgb(88, 28, 135), rgb(15, 23, 42))',
            }}
        >
            <div className="w-full max-w-lg bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-xl">

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">
                        Create Recruiter Account
                    </h2>
                    <p className="text-gray-300 text-sm mt-2">
                        Find and hire talented candidates with Jobify.
                    </p>
                </div>


                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm mb-1 text-gray-300">
                            Full Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            autoComplete="name"
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-300">
                            Work Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your work email"
                            autoComplete="email"
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-300">
                            Mobile Number
                        </label>
                        <input
                            type="tel"
                            placeholder="Enter your mobile number"
                            autoComplete="tel"
                            maxLength={10}
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-300">
                            Company Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your company name"
                            autoComplete="organization"
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-300">
                            Company Website (Optional)
                        </label>
                        <input
                            type="url"
                            placeholder="https://www.example.com"
                            autoComplete="url"
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={companyWebsite}
                            onChange={(e) => setCompanyWebsite(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-300">
                            Your Designation
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. HR Manager, Recruiter"
                            autoComplete="organization-title"
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Create a password"
                            autoComplete="new-password"
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-300">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    {success && (
                        <p className="text-green-400 text-sm">{success}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold transition disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Create Recruiter Account'}
                    </button>
                </form>




                <p className="text-sm text-center text-gray-300 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-300 hover:underline">
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default RecruiterRegister;
