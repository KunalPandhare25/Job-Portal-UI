import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

const ManageJobs = () => {
    const navigate = useNavigate();

    const handleEdit = (id) => {
        navigate(`/recruiter/jobs/new?edit=${id}`);
    };

    const [activeTab, setActiveTab] = useState('All Jobs');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    const tabs = ['All Jobs', 'Active', 'Closed', 'Draft'];

    // Fetch jobs from backend
    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Please login as a recruiter.');
            }

            const response = await fetch(
                `${API_URL}/api/recruiter/jobs`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch jobs.');
            }

            setJobs(data.jobs || []);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Load jobs when page opens
    useEffect(() => {
        fetchJobs();
    }, []);

    // Filter jobs by status
    const filteredJobs =
        activeTab === 'All Jobs'
            ? jobs
            : jobs.filter((job) => job.status === activeTab);

    const handleView = async (id) => {
        try {
            setViewLoading(true);
            setSelectedJob(null);

            const token = localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/api/recruiter/jobs/${id}/details`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch job details.');
            }

            setSelectedJob(data.job);

        } catch (error) {
            console.error('View job error:', error);
            alert(error.message);
        } finally {
            setViewLoading(false);
        }
    };

    // Delete job from database
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            'Are you sure you want to permanently delete this job and its applications?'
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/api/recruiter/jobs/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete job.');
            }

            setJobs((prevJobs) =>
                prevJobs.filter((job) => job.job_id !== id)
            );

            alert(data.message);

        } catch (error) {
            console.error('Delete job error:', error);
            alert(error.message);
        }
    };

    // Update job status in database
    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/api/recruiter/jobs/${id}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update job status.');
            }

            setJobs((prevJobs) =>
                prevJobs.map((job) =>
                    job.job_id === id
                        ? { ...job, status: newStatus }
                        : job
                )
            );

            alert(data.message);

        } catch (error) {
            console.error('Update status error:', error);
            alert(error.message);
        }
    };

    return (
        <div className="min-h-screen w-full min-w-0 bg-gray-950 text-white px-3 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7 sm:mb-8">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold break-words">
                        Manage Jobs
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base mt-2">
                        Create, manage and track your job openings.
                    </p>
                </div>

                <Link
                    to="/recruiter/jobs/new"
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg text-center font-medium transition"
                >
                    + Post a Job
                </Link>
            </div>

            {/* Job Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-7 sm:mb-8">

                <div className="min-w-0 bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5">
                    <p className="text-gray-400 text-xs sm:text-sm">Total Jobs</p>
                    <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                        {jobs.length}
                    </h2>
                </div>

                <div className="min-w-0 bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5">
                    <p className="text-gray-400 text-xs sm:text-sm">Active Jobs</p>
                    <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                        {jobs.filter((job) => job.status === 'Active').length}
                    </h2>
                </div>

                <div className="min-w-0 bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5 col-span-2 sm:col-span-1">
                    <p className="text-gray-400 text-xs sm:text-sm">Closed Jobs</p>
                    <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                        {jobs.filter((job) => job.status === 'Closed').length}
                    </h2>
                </div>

            </div>

            {/* Job Listings */}
            <div className="min-w-0 bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5 md:p-6">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

                    <h2 className="text-lg sm:text-xl font-semibold">
                        Your Job Listings
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition whitespace-nowrap ${activeTab === tab
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                </div>

                {/* Loading, Error and Empty States */}
                {loading ? (

                    <p className="text-center text-gray-400 py-16">
                        Loading your jobs...
                    </p>

                ) : error ? (

                    <p className="text-center text-red-400 py-16">
                        {error}
                    </p>

                ) : filteredJobs.length === 0 ? (

                    <div className="text-center py-12 sm:py-16">
                        <h3 className="text-lg font-semibold text-gray-300">
                            No jobs found
                        </h3>

                        <p className="text-gray-500 text-sm mt-2">
                            You haven't posted any jobs in this category yet.
                        </p>

                        <Link
                            to="/recruiter/jobs/new"
                            className="inline-block mt-5 text-purple-400 hover:text-purple-300 font-medium"
                        >
                            Post your first job
                        </Link>
                    </div>

                ) : (

                    /* Job Table */
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">

                            <thead>
                                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                                    <th className="py-4 px-3">Job Title</th>
                                    <th className="py-4 px-3">Location</th>
                                    <th className="py-4 px-3">Applicants</th>
                                    <th className="py-4 px-3">Status</th>
                                    <th className="py-4 px-3">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredJobs.map((job) => (
                                    <tr
                                        key={job.job_id}
                                        className="border-b border-gray-800 hover:bg-gray-800/40"
                                    >

                                        <td className="py-4 px-3 font-medium">
                                            {job.title}
                                        </td>

                                        <td className="py-4 px-3 text-gray-400">
                                            {job.location}
                                        </td>

                                        <td className="py-4 px-3">
                                            {job.applicants}
                                        </td>

                                        <td className="py-4 px-3">
                                            <span className="text-sm text-purple-400">
                                                {job.status}
                                            </span>
                                        </td>

                                        <td className="py-4 px-3">
                                            <div className="flex items-center gap-2">

                                                {job.status === 'Draft' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleView(job.job_id)}
                                                            className="px-3 py-1.5 bg-blue-500/10 border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white rounded-md text-xs font-semibold transition"
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            onClick={() => handleEdit(job.job_id)}
                                                            className="px-3 py-1.5 bg-purple-500/10 border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white rounded-md text-xs font-semibold transition"
                                                        >
                                                            Edit
                                                        </button>
                                                    </>
                                                )}

                                                {job.status === 'Active' && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(job.job_id, 'Closed')
                                                        }
                                                        className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500 text-yellow-400 rounded-md text-xs font-semibold"
                                                    >
                                                        Close
                                                    </button>
                                                )}

                                                {job.status === 'Closed' && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(job.job_id, 'Active')
                                                        }
                                                        className="px-3 py-1.5 bg-green-500/10 border border-green-500 text-green-400 rounded-md text-xs font-semibold"
                                                    >
                                                        Reopen
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(job.job_id)}
                                                    className="px-3 py-1.5 bg-red-500/10 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white rounded-md text-xs font-semibold transition"
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}

            </div>

            {/* View Job Details Modal */}
            {viewLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <p className="text-white">Loading job details...</p>
                </div>
            )}

            {selectedJob && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4">

                    <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">

                        <div className="flex justify-between items-center gap-3 mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold">
                                Job Details
                            </h2>

                            <button
                                onClick={() => setSelectedJob(null)}
                                className="text-gray-400 hover:text-white text-2xl shrink-0"
                                aria-label="Close job details"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="space-y-5 min-w-0">

                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-purple-400 break-words">
                                    {selectedJob.title || 'Untitled Job'}
                                </h3>
                                <p className="text-gray-400 break-words">
                                    {selectedJob.company || 'Company not provided'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div>
                                    <p className="text-gray-500 text-sm">Location</p>
                                    <p className="break-words">{selectedJob.location || 'Not provided'}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Experience</p>
                                    <p>{selectedJob.experience || 'Not provided'}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Workplace Type</p>
                                    <p>{selectedJob.workplaceType || 'Not provided'}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Employment Type</p>
                                    <p>{selectedJob.employmentType || 'Not provided'}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Minimum Salary</p>
                                    <p>{selectedJob.salaryMin ?? 'Not provided'}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Maximum Salary</p>
                                    <p>{selectedJob.salaryMax ?? 'Not provided'}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Last Date to Apply</p>
                                    <p>
                                        {selectedJob.deadline
                                            ? String(selectedJob.deadline).slice(0, 10)
                                            : 'Not provided'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-sm">Status</p>
                                    <p className="text-purple-400">
                                        {selectedJob.status}
                                    </p>
                                </div>

                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Job Description</h3>
                                <p className="text-gray-400 whitespace-pre-wrap break-words">
                                    {selectedJob.description || 'Not provided'}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Required Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedJob.skills || []).length > 0
                                        ? selectedJob.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="bg-gray-800 text-purple-300 px-3 py-1 rounded-lg text-sm break-words"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                        : <span className="text-gray-500">No skills added</span>
                                    }
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Responsibilities</h3>
                                {selectedJob.responsibilities?.length > 0 ? (
                                    <ul className="list-disc pl-5 text-gray-400 space-y-1">
                                        {selectedJob.responsibilities.map((item, index) => (
                                            <li key={index} className="break-words">{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No responsibilities added</p>
                                )}
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Application Questions</h3>
                                {selectedJob.applicationQuestions?.length > 0 ? (
                                    <ol className="list-decimal pl-5 text-gray-400 space-y-2">
                                        {selectedJob.applicationQuestions.map((question, index) => (
                                            <li key={index} className="break-words">
                                                {question.question_text}
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p className="text-gray-500">No custom questions added</p>
                                )}
                            </div>

                        </div>

                        <div className="flex justify-end mt-8">
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default ManageJobs;
