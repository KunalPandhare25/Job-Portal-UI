import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';


const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [shortlistedApplicants, setShortlistedApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [applicantError, setApplicantError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHiredModal, setShowHiredModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);


  const [formData, setFormData] = useState({
    candidate: '',
    email: '',
    jobTitle: '',
    date: '',
    time: '',
    type: 'Online',
    meetingLink: '',
    location: '',
    interviewer: '',
  });

  useEffect(() => {
    const fetchShortlistedApplicants = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setApplicantError('Please login as a recruiter.');
        setLoadingApplicants(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/recruiter/shortlisted-applicants`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setShortlistedApplicants(data.applicants || []);
      } catch (error) {
        setApplicantError(error.message);
      } finally {
        setLoadingApplicants(false);
      }
    };

    const fetchInterviews = async () => {
      const token = localStorage.getItem('token');

      if (!token) return;

      try {
        const response = await fetch(
          `${API_URL}/api/recruiter/interviews`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setInterviews(
          (data.interviews || []).map((item) => ({
            id: item.interview_id,
            applicationId: item.application_id,
            candidate: item.candidate_name,
            email: item.candidate_email,
            jobTitle: item.job_title,
            date: item.interview_date,
            time: item.interview_time,
            type: item.interview_type,
            meetingLink: item.meeting_link,
            location: item.location,
            interviewer: item.interviewer,
            status: item.status,
          }))
        );
      } catch (error) {
        console.error('Fetch interviews error:', error);
      }
    };

    fetchShortlistedApplicants();
    fetchInterviews();
  }, []);

  const openScheduleForm = (applicant = null) => {
    setFormData({
      candidate: applicant?.candidate || '',
      email: applicant?.email || '',
      jobTitle: applicant?.jobTitle || '',
      applicationId: applicant?.applicationId || null,
      date: '',
      time: '',
      type: 'Online',
      meetingLink: '',
      location: '',
      interviewer: '',
    });

    setShowForm(true);
  };

  const statuses = ['All', 'Scheduled', 'Completed', 'Cancelled'];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login as a recruiter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/recruiter/interviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to schedule interview.'
        );
      }

      // Add the successfully saved interview to the UI
      const newInterview = {
        id: data.interviewId,
        ...formData,
        status: 'Scheduled',
      };

      setInterviews((prev) => [newInterview, ...prev]);

      setShowForm(false);

      setFormData({
        candidate: '',
        email: '',
        jobTitle: '',
        date: '',
        time: '',
        type: 'Online',
        meetingLink: '',
        location: '',
        interviewer: '',
      });

      alert(data.message);

    } catch (error) {
      console.error('Schedule interview error:', error);
      alert(error.message);

    } finally {
      setIsSubmitting(false);
    }
  };


  const updateStatus = (id, status) => {
    setInterviews((prev) =>
      prev.map((interview) =>
        interview.id === id
          ? { ...interview, status }
          : interview
      )
    );
  };

  const handleCompleteInterview = async (hired) => {
    if (!selectedInterview) return;

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login as a recruiter.');
      return;
    }

    setIsUpdatingStatus(true);

    try {
      const response = await fetch(
        `${API_URL}/api/recruiter/interviews/${selectedInterview.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'Completed',
            hired,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update interview.');
      }

      setInterviews((prev) =>
        prev.map((interview) =>
          interview.id === selectedInterview.id
            ? { ...interview, status: 'Completed' }
            : interview
        )
      );

      setShowHiredModal(false);
      setSelectedInterview(null);

      alert(data.message);

    } catch (error) {
      alert(error.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredInterviews = interviews.filter(
    (interview) =>
      filter === 'All' || interview.status === filter
  );

  const inputClass =
    'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500';

  const labelClass =
    'block text-sm text-gray-300 mb-2 font-medium';

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Interview Management
          </h1>
          <p className="text-gray-400 mt-2">
            Schedule and manage candidate interviews.
          </p>
        </div>

        <button
          onClick={() => openScheduleForm()}
          className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg font-medium transition"
        >
          + Schedule Interview
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {[
          {
            title: 'Shortlisted',
            value: shortlistedApplicants.length,
          },
          {
            title: 'Total Interviews',
            value: interviews.length,
          },
          {
            title: 'Scheduled',
            value: interviews.filter((i) => i.status === 'Scheduled').length,
          },
          {
            title: 'Completed',
            value: interviews.filter((i) => i.status === 'Completed').length,
          },
          {
            title: 'Cancelled',
            value: interviews.filter((i) => i.status === 'Cancelled').length,
          },
        ].map((stat) => (
          <div
            key={stat.title}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5"
          >
            <p className="text-gray-400 text-sm">{stat.title}</p>
            <h2 className="text-3xl font-bold mt-3">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Shortlisted Candidates */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              Shortlisted Candidates
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Candidates ready for interview scheduling.
            </p>
          </div>

          <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg text-sm">
            {shortlistedApplicants.length} Candidates
          </span>
        </div>

        {loadingApplicants ? (
          <p className="text-gray-400 py-6 text-center">
            Loading shortlisted candidates...
          </p>
        ) : applicantError ? (
          <p className="text-red-400 py-6 text-center">
            {applicantError}
          </p>
        ) : shortlistedApplicants.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">
            No shortlisted candidates yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">

              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">Job Position</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {shortlistedApplicants.map((applicant) => (
                  <tr
                    key={applicant.applicationId}
                    className="border-b border-gray-800 hover:bg-gray-800/40"
                  >
                    <td className="py-4 px-3 font-medium">
                      {applicant.candidate}
                    </td>

                    <td className="py-4 px-3 text-gray-300">
                      {applicant.jobTitle}
                    </td>

                    <td className="py-4 px-3 text-gray-400">
                      {applicant.email}
                    </td>

                    <td className="py-4 px-3">
                      <span className="text-green-400 text-sm">
                        Shortlisted
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <button
                        type="button"
                        onClick={() => openScheduleForm(applicant)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Schedule Interview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* Schedule Interview Form */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
          onClick={() => setShowForm(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6"
          >
            <h2 className="text-xl font-semibold">
              Schedule New Interview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className={labelClass}>Candidate Name *</label>
                <input
                  required
                  name="candidate"
                  value={formData.candidate}
                  onChange={handleChange}
                  placeholder="Enter candidate name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Candidate Email *</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="candidate@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Job Position *</label>
                <input
                  required
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g. Software Developer"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Interviewer</label>
                <input
                  name="interviewer"
                  value={formData.interviewer}
                  onChange={handleChange}
                  placeholder="Interviewer name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Interview Date *</label>
                <input
                  required
                  type="date"
                  min={new Date().toLocaleDateString('en-CA')}
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Interview Time *</label>
                <input
                  required
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Interview Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option>Online</option>
                  <option>In-person</option>
                  <option>Phone</option>
                </select>
              </div>

              {formData.type === 'Online' && (
                <div>
                  <label className={labelClass}>Meeting Link</label>
                  <input
                    type="url"
                    name="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleChange}
                    placeholder="https://meet.google.com/..."
                    className={inputClass}
                  />
                </div>
              )}

              {formData.type === 'In-person' && (
                <div>
                  <label className={labelClass}>Interview Location</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter office address"
                    className={inputClass}
                  />
                </div>
              )}

            </div>

            <div className="flex flex-wrap gap-3 pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium"
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interview List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">
            All Interviews
          </h2>

          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm transition ${filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredInterviews.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold text-gray-300">
              No interviews scheduled
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Schedule your first candidate interview to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="py-4 px-3">Candidate</th>
                  <th className="py-4 px-3">Job Position</th>
                  <th className="py-4 px-3">Date & Time</th>
                  <th className="py-4 px-3">Type</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 px-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInterviews.map((interview) => (
                  <tr
                    key={interview.id}
                    className="border-b border-gray-800 hover:bg-gray-800/40"
                  >
                    <td className="py-4 px-3">
                      <p className="font-medium">
                        {interview.candidate}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {interview.email}
                      </p>
                    </td>

                    <td className="py-4 px-3">
                      {interview.jobTitle}
                    </td>

                    <td className="py-4 px-3 text-gray-400">
                      {interview.date} at {interview.time}
                    </td>

                    <td className="py-4 px-3">
                      {interview.type}
                    </td>

                    <td className="py-4 px-3">
                      <span className="text-purple-400 text-sm">
                        {interview.status}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      {interview.status === 'Scheduled' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setSelectedInterview(interview);
                              setShowHiredModal(true);
                            }}
                            className="text-green-400 hover:text-green-300 text-sm"
                          >
                            Complete
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(interview.id, 'Cancelled')
                            }
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {interview.status !== 'Scheduled' && (
                        <span className="text-gray-500 text-sm">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hired Confirmation Modal */}
      {showHiredModal && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Complete Interview
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Update the candidate's hiring outcome
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => {
                    setShowHiredModal(false);
                    setSelectedInterview(null);
                  }}
                  className="text-gray-500 hover:text-white transition text-xl"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">

              <p className="text-gray-300 text-sm mb-5">
                Has this candidate been successfully selected for the position?
              </p>

              {/* Candidate Information */}
              <div className="bg-gray-800/60 border border-gray-700/70 rounded-xl p-4">

                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                  Candidate Details
                </p>

                <h3 className="text-white font-semibold text-base">
                  {selectedInterview.candidate}
                </h3>

                <p className="text-gray-400 text-sm mt-1">
                  {selectedInterview.email}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">
                    Applied Position
                  </p>
                  <p className="text-purple-300 text-sm font-medium">
                    {selectedInterview.jobTitle}
                  </p>
                </div>
              </div>

              {/* Hiring Question */}
              <div className="mt-6">
                <p className="text-sm font-medium text-white mb-3">
                  Select hiring outcome
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleCompleteInterview(true)}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl text-sm font-semibold transition"
                  >
                    {isUpdatingStatus ? 'Saving...' : 'Yes, Hired'}
                  </button>

                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleCompleteInterview(false)}
                    className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 text-gray-200 px-4 py-3 rounded-xl text-sm font-medium transition"
                  >
                    {isUpdatingStatus ? 'Saving...' : 'No, Not Hired'}
                  </button>

                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-5">
                The interview will be marked as completed after confirmation.
              </p>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;
