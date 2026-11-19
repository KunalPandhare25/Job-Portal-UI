
import React, { useState, useEffect } from 'react';
import { API_URL } from "../../config";

const Applicants = () => {
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedJob, setSelectedJob] = useState('All Jobs');

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Individual application view
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');

    const statuses = [
        'All',
        'Pending',
        'Reviewed',
        'Shortlisted',
        'Rejected'
    ];

    // Fetch applicants
    const fetchApplicants = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Please login as a recruiter.');
            }

            const response = await fetch(
                `${API_URL}/api/recruiter/applicants`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch applicants.');
            }

            setApplicants(data.applicants || []);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
    }, []);

    // Fetch individual application
    const viewApplication = async (id) => {
        try {
            setDetailLoading(true);
            setDetailError('');
            setSelectedApplication(null);

            const token = localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/api/recruiter/applications/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Unable to load application details.'
                );
            }

            setSelectedApplication(data);

        } catch (err) {
            setDetailError(err.message);
        } finally {
            setDetailLoading(false);
        }
    };

    // Get unique job titles
    const jobs = [
        ...new Set(applicants.map((applicant) => applicant.jobTitle))
    ];

    // Filter applicants
    const filteredApplicants = applicants.filter((applicant) => {
        const matchesSearch =
            applicant.name.toLowerCase().includes(search.toLowerCase()) ||
            applicant.email.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            selectedStatus === 'All' ||
            applicant.status === selectedStatus;

        const matchesJob =
            selectedJob === 'All Jobs' ||
            applicant.jobTitle === selectedJob;

        return matchesSearch && matchesStatus && matchesJob;
    });

    // Update applicant status
    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/api/recruiter/applications/${id}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ status })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update status.');
            }

            setApplicants((prev) =>
                prev.map((applicant) =>
                    applicant.id === id
                        ? { ...applicant, status }
                        : applicant
                )
            );

        } catch (err) {
            alert(err.message);
            fetchApplicants();
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            Pending: 'bg-yellow-500/10 text-yellow-400',
            Reviewed: 'bg-blue-500/10 text-blue-400',
            Shortlisted: 'bg-green-500/10 text-green-400',
            Rejected: 'bg-red-500/10 text-red-400'
        };

        return styles[status] || 'bg-gray-700 text-gray-300';
    };

    const formatAnswer = (answer) => {
        if (Array.isArray(answer)) return answer.join(', ');
        if (answer && typeof answer === 'object') {
            return JSON.stringify(answer);
        }
        return answer ?? 'Not provided';
    };

    const formatDate = (date) => {
        if (!date) return 'Not available';

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const DetailSection = ({ title, children }) => (
        <section className="min-w-0 bg-gray-800/50 border border-gray-700/70 rounded-xl p-3 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">
                {title}
            </h3>
            <div className="space-y-3 text-sm">
                {children}
            </div>
        </section>
    );

    const DetailRow = ({ label, value }) => (
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-gray-700/50 pb-2 last:border-0 min-w-0">
            <span className="text-gray-400 shrink-0">{label}</span>
            <span className="text-gray-200 sm:text-right break-words min-w-0">
                {value || 'Not provided'}
            </span>
        </div>
    );

    const application = selectedApplication?.application;

    return (
        <div className="min-h-screen w-full min-w-0 bg-gray-950 text-white px-3 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8">

            {/* Header */}
            <div className="mb-7 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold break-words">
                    Applicants
                </h1>
                <p className="text-gray-400 text-sm sm:text-base mt-2">
                    Review applications and manage your candidates.
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-7 sm:mb-8">
                {[
                    { title: 'Total Applicants', value: applicants.length },
                    {
                        title: 'Pending',
                        value: applicants.filter((a) => a.status === 'Pending').length
                    },
                    {
                        title: 'Shortlisted',
                        value: applicants.filter((a) => a.status === 'Shortlisted').length
                    },
                    {
                        title: 'Rejected',
                        value: applicants.filter((a) => a.status === 'Rejected').length
                    }
                ].map((stat) => (
                    <div
                        key={stat.title}
                        className="min-w-0 bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5"
                    >
                        <p className="text-gray-400 text-xs sm:text-sm">
                            {stat.title}
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-bold mt-2 sm:mt-3">
                            {stat.value}
                        </h2>
                    </div>
                ))}
            </div>

            {/* Applicants Table */}
            <div className="min-w-0 bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5 md:p-6">

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold">
                        All Applications
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or email..."
                            className="w-full sm:w-auto min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                        />

                        <select
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                            className="w-full sm:w-auto min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm outline-none"
                        >
                            <option value="All Jobs">All Jobs</option>
                            {jobs.map((job) => (
                                <option key={job} value={job}>{job}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {statuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition ${
                                selectedStatus === status
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Loading and Error */}
                {loading ? (
                    <p className="text-center text-gray-400 py-16">
                        Loading applicants...
                    </p>
                ) : error ? (
                    <p className="text-center text-red-400 py-16">{error}</p>
                ) : filteredApplicants.length === 0 ? (
                    <div className="text-center py-16">
                        <h3 className="text-lg font-semibold text-gray-300">
                            No applicants found
                        </h3>
                        <p className="text-gray-500 text-sm mt-2">
                            Applications for your job posts will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[1050px] text-left">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                                    <th className="py-4 px-3">Candidate</th>
                                    <th className="py-4 px-3">Job Position</th>
                                    <th className="py-4 px-3">Applied Date</th>
                                    <th className="py-4 px-3">Status</th>
                                    <th className="py-4 px-3">Update Status</th>
                                    <th className="py-4 px-3">Application</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredApplicants.map((applicant) => (
                                    <tr
                                        key={applicant.id}
                                        className="border-b border-gray-800 hover:bg-gray-800/40 transition"
                                    >
                                        <td className="py-4 px-3">
                                            <p className="font-medium">
                                                {applicant.name}
                                            </p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                {applicant.email}
                                            </p>
                                        </td>

                                        <td className="py-4 px-3 text-gray-300">
                                            {applicant.jobTitle}
                                        </td>

                                        <td className="py-4 px-3 text-gray-400">
                                            {applicant.appliedDate}
                                        </td>

                                        <td className="py-4 px-3">
                                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(applicant.status)}`}>
                                                {applicant.status}
                                            </span>
                                        </td>

                                        <td className="py-4 px-3">
                                            <select
                                                value={applicant.status}
                                                onChange={(e) =>
                                                    updateStatus(applicant.id, e.target.value)
                                                }
                                                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                                            >
                                                {statuses
                                                    .filter((status) => status !== 'All')
                                                    .map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                            </select>
                                        </td>

                                        <td className="py-4 px-3">
                                            <button
                                                onClick={() => viewApplication(applicant.id)}
                                                className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600/15 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white transition whitespace-nowrap"
                                            >
                                                View Application
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Application Details Modal */}
            {(detailLoading || detailError || selectedApplication) && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-gray-800">
                            <div className="min-w-0">
                                <h2 className="text-lg sm:text-xl font-bold">
                                    Application Details
                                </h2>
                                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                                    Review the candidate's submitted information.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedApplication(null);
                                    setDetailError('');
                                }}
                                className="text-gray-400 hover:text-white text-2xl px-2 shrink-0"
                                aria-label="Close application details"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-3 sm:p-5 md:p-6 overflow-y-auto max-h-[calc(92vh-90px)]">

                            {detailLoading ? (
                                <p className="text-center text-gray-400 py-16">
                                    Loading application details...
                                </p>
                            ) : detailError ? (
                                <p className="text-center text-red-400 py-16">
                                    {detailError}
                                </p>
                            ) : application && (
                                <div className="space-y-5 min-w-0">

                                    {/* Candidate Heading */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-800/60 border border-gray-700 rounded-xl p-4 sm:p-5">
                                        <div className="min-w-0">
                                            <h3 className="text-xl sm:text-2xl font-bold break-words">
                                                {application.full_name}
                                            </h3>
                                            <p className="text-purple-300 mt-1 break-words">
                                                {application.jobTitle}
                                            </p>
                                            <p className="text-gray-400 text-sm mt-1 break-words">
                                                {application.company}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-start sm:items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusStyle(application.status)}`}>
                                                {application.status}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                Applied {formatDate(application.appliedDate)}
                                            </span>
                                        </div>
                                    </div>

                                    <DetailSection title="Personal Information">
                                        <DetailRow label="Full Name" value={application.full_name} />
                                        <DetailRow label="Email" value={application.email} />
                                        <DetailRow label="Mobile" value={application.mobile} />
                                        <DetailRow label="Location" value={application.location} />
                                    </DetailSection>

                                    <DetailSection title="Professional Information">
                                        <DetailRow label="Professional Summary" value={application.professional_summary} />
                                        <DetailRow label="Experience Level" value={application.experience_level} />
                                        <DetailRow label="Years of Experience" value={application.years_of_experience} />
                                        <DetailRow label="Current Company" value={application.current_company} />
                                        <DetailRow label="Current Job Title" value={application.current_job_title} />
                                        <DetailRow label="Skills" value={Array.isArray(application.skills) ? application.skills.join(', ') : application.skills} />
                                    </DetailSection>

                                    <DetailSection title="Professional Links">
                                        <DetailRow label="LinkedIn" value={application.linkedin_url} />
                                        <DetailRow label="GitHub" value={application.github_url} />
                                        <DetailRow label="Portfolio" value={application.portfolio_url} />
                                    </DetailSection>

                                    <DetailSection title="Salary Information">
                                        <DetailRow label="Current CTC" value={application.current_ctc} />
                                        <DetailRow label="Expected CTC" value={application.expected_ctc} />
                                    </DetailSection>

                                    <DetailSection title="Resume">
                                        {application.resume_path ? (
                                            <a
                                                href={`${API_URL}/${application.resume_path.replace(/^\/+/, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
                                            >
                                                View / Download Resume
                                            </a>
                                        ) : (
                                            <p className="text-gray-400">
                                                No resume available.
                                            </p>
                                        )}
                                    </DetailSection>

                                    <DetailSection title="Cover Letter">
                                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed break-words">
                                            {application.cover_letter || 'No cover letter provided.'}
                                        </p>
                                    </DetailSection>

                                    <DetailSection title="Additional Questions">
                                        {selectedApplication.answers?.length > 0 ? (
                                            selectedApplication.answers.map((item, index) => (
                                                <div key={index} className="border-b border-gray-700/50 pb-3 last:border-0">
                                                    <p className="text-gray-400 mb-2">
                                                        {item.question_text}
                                                    </p>
                                                    <p className="text-gray-200 whitespace-pre-wrap break-words">
                                                        {formatAnswer(item.answer)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400">
                                                No additional questions were answered.
                                            </p>
                                        )}
                                    </DetailSection>

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Applicants;
