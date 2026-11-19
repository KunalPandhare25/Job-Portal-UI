import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';

const RecruiterDashboard = () => {

  const [dashboardStats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    hired: 0,
    interviews: 0,
  });

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [analyticsRes, jobsRes, applicantsRes, interviewsRes] =
          await Promise.all([
            fetch(`${API_URL}/api/recruiter/analytics`, { headers }),
            fetch(`${API_URL}/api/recruiter/jobs`, { headers }),
            fetch(`${API_URL}/api/recruiter/applicants`, { headers }),
            fetch(`${API_URL}/api/recruiter/interviews`, { headers }),
          ]);

        if (
          !analyticsRes.ok ||
          !jobsRes.ok ||
          !applicantsRes.ok ||
          !interviewsRes.ok
        ) {
          throw new Error('Unable to load dashboard data.');
        }

        const analyticsData = await analyticsRes.json();
        const jobsData = await jobsRes.json();
        const applicantsData = await applicantsRes.json();
        const interviewsData = await interviewsRes.json();

        const allJobs = jobsData.jobs || [];
        const allApplicants = applicantsData.applicants || [];
        const allInterviews = interviewsData.interviews || [];

        setStats({
          activeJobs: allJobs.filter(job => job.status === 'Active').length,
          totalApplicants: Number(analyticsData.stats?.totalApplicants || 0),
          shortlisted: Number(analyticsData.stats?.shortlisted || 0),
          hired: Number(analyticsData.stats?.hired || 0),
          interviews: allInterviews.filter(
            interview => interview.status === 'Scheduled'
          ).length,
        });

        setJobs(allJobs);
        setApplicants(allApplicants);
        setInterviews(allInterviews);

      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'Active Jobs',
      value: dashboardStats.activeJobs,
      description: 'Currently published',
    },
    {
      title: 'Total Applicants',
      value: dashboardStats.totalApplicants,
      description: 'Across all job posts',
    },
    {
      title: 'Shortlisted',
      value: dashboardStats.shortlisted,
      description: 'Candidates shortlisted',
    },
    {
      title: 'Hired',
      value: dashboardStats.hired,
      description: 'Successfully hired',
    },
    {
      title: 'Interviews',
      value: dashboardStats.interviews,
      description: 'Upcoming scheduled interviews',
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-950 text-white px-3 py-5 sm:px-5 sm:py-6 md:px-8 md:py-10 lg:px-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7 sm:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words">
            Recruiter Dashboard
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-2">
            Welcome back! Here's an overview of your hiring activity.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg text-center font-medium transition"
        >
          + Post a Job
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-7 sm:mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="min-w-0 bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 md:p-5"
          >
            <p className="text-gray-400 text-sm">{stat.title}</p>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2 sm:mt-3">
              {stat.value}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Main Dashboard Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

        {/* Recent Jobs */}
        <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold">Recent Job Posts</h2>
            <Link
              to="/recruiter/jobs"
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">

            {loading ? (
              <p className="text-gray-400 text-center py-10">
                Loading recent jobs...
              </p>
            ) : error ? (
              <p className="text-red-400 text-center py-10">
                {error}
              </p>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-300">
                  No job posts yet
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Start hiring by publishing your first job.
                </p>
                <Link
                  to="/recruiter/jobs/new"
                  className="inline-block mt-5 text-purple-400 hover:text-purple-300 font-medium"
                >
                  Create your first job
                </Link>
              </div>
            ) : (
              jobs.slice(0, 3).map((job) => (
                <div
                  key={job.job_id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-gray-800/70 border border-gray-700/60 hover:border-purple-500/40 transition"
                >
                  <div>
                    <h3 className="font-semibold text-white">
                      {job.title}
                    </h3>

                    <p className="text-gray-400 text-sm mt-1">
                      {job.company} {job.location ? `• ${job.location}` : ''}
                    </p>

                    <p className="text-gray-500 text-xs mt-2">
                      {Number(job.applicants || 0)} Applicants
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === 'Active'
                        ? 'bg-green-500/10 text-green-400'
                        : job.status === 'Closed'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-gray-700 text-gray-300'
                        }`}
                    >
                      {job.status}
                    </span>

                    <Link
                      to="/recruiter/jobs"
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 md:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-6">Quick Actions</h2>

          <div className="space-y-4">
            <Link
              to="/recruiter/jobs/new"
              className="block p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              <h3 className="font-medium">Post a New Job</h3>
              <p className="text-gray-400 text-sm mt-1">
                Create and publish a job opening.
              </p>
            </Link>

            <Link
              to="/recruiter/jobs"
              className="block p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              <h3 className="font-medium">Manage Jobs</h3>
              <p className="text-gray-400 text-sm mt-1">
                View and manage your job listings.
              </p>
            </Link>

            <Link
              to="/recruiter/applicants"
              className="block p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              <h3 className="font-medium">View Applicants</h3>
              <p className="text-gray-400 text-sm mt-1">
                Review candidates who applied.
              </p>
            </Link>

            <Link
              to="/recruiter/company"
              className="block p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              <h3 className="font-medium">Company Profile</h3>
              <p className="text-gray-400 text-sm mt-1">
                Update your company information.
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 md:p-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Upcoming Interviews</h2>
            <p className="text-gray-400 text-sm mt-1">
              Your scheduled candidate interviews
            </p>
          </div>

          <Link
            to="/recruiter/interviews"
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-8">
            Loading interviews...
          </p>
        ) : error ? (
          <p className="text-red-400 text-center py-8">
            {error}
          </p>
        ) : interviews.filter(i => i.status === 'Scheduled').length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-gray-300 font-medium">
              No upcoming interviews
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Scheduled interviews will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews
              .filter(i => i.status === 'Scheduled')
              .slice(0, 5)
              .map(interview => (
                <div
                  key={interview.interview_id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-800/70 border border-gray-700/60 rounded-lg"
                >
                  <div>
                    <h3 className="text-white font-medium">
                      {interview.candidate_name}
                    </h3>

                    <p className="text-gray-400 text-sm mt-1">
                      {interview.job_title}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-purple-300 text-sm font-medium">
                      {new Date(interview.interview_date).toLocaleDateString()}
                    </p>

                    <p className="text-gray-400 text-xs mt-1">
                      {interview.interview_time} · {interview.interview_type}
                    </p>

                    <span className="inline-block mt-2 text-xs text-green-400">
                      Scheduled
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

      </div>

      {/* Recent Applications */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 md:p-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Recent Applications</h2>
            <p className="text-gray-400 text-sm mt-1">
              Latest candidates applying to your jobs
            </p>
          </div>

          <Link
            to="/recruiter/applicants"
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-8">
            Loading applications...
          </p>
        ) : error ? (
          <p className="text-red-400 text-center py-8">
            {error}
          </p>
        ) : applicants.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-gray-300 font-medium">
              No applications yet
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              New candidate applications will appear here.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-800">
                  <th className="py-3 pr-4">Candidate</th>
                  <th className="py-3 pr-4">Job Position</th>
                  <th className="py-3 pr-4">Applied Date</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {applicants.slice(0, 5).map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="border-b border-gray-800/70 last:border-0"
                  >
                    <td className="py-4 pr-4">
                      <p className="text-white text-sm font-medium">
                        {applicant.name}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {applicant.email}
                      </p>
                    </td>

                    <td className="py-4 pr-4 text-gray-300 text-sm">
                      {applicant.jobTitle}
                    </td>

                    <td className="py-4 pr-4 text-gray-400 text-sm">
                      {applicant.appliedDate}
                    </td>

                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${applicant.status === 'Hired'
                        ? 'bg-green-500/10 text-green-400'
                        : applicant.status === 'Rejected'
                          ? 'bg-red-500/10 text-red-400'
                          : applicant.status === 'Shortlisted'
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                        {applicant.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default RecruiterDashboard;
