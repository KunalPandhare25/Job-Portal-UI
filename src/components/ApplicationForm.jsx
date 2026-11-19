import { API_URL } from '../config';
import React, { useState, useEffect } from "react";

function ApplicationForm({ job, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Resume upload
  const [savedResumePath, setSavedResumePath] = useState("");
  const [selectedResumeFile, setSelectedResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");

  // Application workflow
  const [currentStep, setCurrentStep] = useState(1);
  const [questionPage, setQuestionPage] = useState(0);

  // Candidate answers
  const [answers, setAnswers] = useState({});

  // Get questions configured by the recruiter
  const applicationQuestions = (job?.applicationQuestions || []).map(
    (question) => ({
      ...question,
      options:
        typeof question.options === "string"
          ? JSON.parse(question.options)
          : question.options || [],
    })
  );

  // Display four questions per page
  const QUESTIONS_PER_PAGE = 4;

  const totalQuestionPages = Math.ceil(
    applicationQuestions.length / QUESTIONS_PER_PAGE
  );

  const currentQuestions = applicationQuestions.slice(
    questionPage * QUESTIONS_PER_PAGE,
    (questionPage + 1) * QUESTIONS_PER_PAGE
  );

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    mobile: "",
    location: "",
    professional_summary: "",
    skills: [],
    experience_level: "",
    years_of_experience: "",
    current_company: "",
    current_job_title: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    cover_letter: "",
    current_ctc: "",
    expected_ctc: "",
  });

  useEffect(() => {
    const fetchCandidateProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login before applying for a job.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/candidate/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        setFormData((prev) => ({
          ...prev,
          full_name: data.user.full_name || "",
          email: data.user.email || "",
          mobile: data.user.mobile || "",
          location: data.profile?.location || "",
          professional_summary:
            data.profile?.professional_summary || "",
          skills: data.profile?.skills
            ? typeof data.profile.skills === "string"
              ? JSON.parse(data.profile.skills)
              : data.profile.skills
            : [],
          experience_level:
            data.profile?.experience_level || "",
          years_of_experience:
            data.profile?.years_of_experience ?? "",
          current_company:
            data.profile?.current_company || "",
          current_job_title:
            data.profile?.current_job_title || "",
          linkedin_url: data.profile?.linkedin_url || "",
          github_url: data.profile?.github_url || "",
          portfolio_url: data.profile?.portfolio_url || "",
        }));

        // Load saved resume from candidate profile
        setSavedResumePath(data.profile?.resume_path || "");

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setResumeError("");

    const isPDF =
      file.type === "application/pdf" &&
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPDF) {
      setResumeError("Please upload a PDF file only.");
      setSelectedResumeFile(null);
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeError("Resume size must not exceed 5 MB.");
      setSelectedResumeFile(null);
      e.target.value = "";
      return;
    }

    setSelectedResumeFile(file);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmitApplication = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setSubmitError("Please login before submitting your application.");
      return;
    }

    const jobId = Number(job?.job_id ?? job?.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      setSubmitError("Invalid job ID. Please refresh and try again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const payload = new FormData();

      payload.append("jobId", String(jobId));
      payload.append("formData", JSON.stringify(formData));
      payload.append("answers", JSON.stringify(answers));

      if (selectedResumeFile) {
        payload.append("resume", selectedResumeFile);
      }

      const response = await fetch(
        `${API_URL}/api/applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Application submission failed.");
      }

      setSubmitSuccess(data.message || "Application submitted successfully!");
      setIsSubmitted(true);

    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center p-6">Loading your profile...</p>;
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onClose}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white text-black p-6 rounded-lg shadow-md">

      <h2 className="text-2xl font-bold mb-2">
        Apply for {job.title}
      </h2>

      <p className="text-gray-500 mb-6">
        Review and edit your information before continuing.
      </p>

      {currentStep === 1 && (
        <div className="space-y-4">

          <h3 className="text-lg font-semibold">
            Personal Information
          </h3>

          <input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border p-3 rounded"
          />

          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border p-3 rounded"
          />

          <input
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Mobile Number"
            className="w-full border p-3 rounded"
          />

          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Current Location"
            className="w-full border p-3 rounded"
          />

          <hr />

          <h3 className="text-lg font-semibold">
            Professional Information
          </h3>

          <textarea
            name="professional_summary"
            value={formData.professional_summary}
            onChange={handleChange}
            placeholder="Professional Summary"
            rows="4"
            className="w-full border p-3 rounded"
          />

          <input
            name="skills"
            value={formData.skills.join(", ")}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                skills: e.target.value
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean),
              }))
            }
            placeholder="Skills separated by commas"
            className="w-full border p-3 rounded"
          />

          <input
            name="experience_level"
            value={formData.experience_level}
            onChange={handleChange}
            placeholder="Experience Level (Fresher / Experienced)"
            className="w-full border p-3 rounded"
          />

          <input
            name="years_of_experience"
            type="number"
            min="0"
            step="0.5"
            value={formData.years_of_experience}
            onChange={handleChange}
            placeholder="Years of Experience"
            className="w-full border p-3 rounded"
          />

          <input
            name="current_company"
            value={formData.current_company}
            onChange={handleChange}
            placeholder="Current Company (Optional)"
            className="w-full border p-3 rounded"
          />

          <input
            name="current_job_title"
            value={formData.current_job_title}
            onChange={handleChange}
            placeholder="Current Job Title (Optional)"
            className="w-full border p-3 rounded"
          />

          <hr />

          <h3 className="text-lg font-semibold">
            Professional Links
          </h3>

          <input
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleChange}
            placeholder="LinkedIn Profile URL"
            className="w-full border p-3 rounded"
          />

          <input
            name="github_url"
            value={formData.github_url}
            onChange={handleChange}
            placeholder="GitHub Profile URL"
            className="w-full border p-3 rounded"
          />

          <input
            name="portfolio_url"
            value={formData.portfolio_url}
            onChange={handleChange}
            placeholder="Portfolio Website URL"
            className="w-full border p-3 rounded"
          />

        </div>
      )}


      {currentStep === 3 && (
        <div className="space-y-6">

          <div>
            <h3 className="text-xl font-semibold">
              Additional Questions
            </h3>

            <p className="text-gray-500 mt-1">
              Please answer the questions provided by the recruiter.
            </p>

            <p className="text-sm text-purple-600 mt-2">
              Page {questionPage + 1} of {totalQuestionPages}
            </p>
          </div>

          {currentQuestions.map((question, index) => {
            const questionId = question.question_id;
            const value = answers[questionId];

            return (
              <div
                key={questionId}
                className="border rounded-lg p-4 space-y-3"
              >
                <label className="block font-medium">
                  {questionPage * QUESTIONS_PER_PAGE + index + 1}.{" "}
                  {question.question_text}

                  {question.is_required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                {question.question_type === "short_answer" && (
                  <input
                    type="text"
                    value={value || ""}
                    onChange={(e) =>
                      handleAnswerChange(questionId, e.target.value)
                    }
                    className="w-full border p-3 rounded"
                    placeholder="Enter your answer"
                  />
                )}

                {question.question_type === "long_answer" && (
                  <textarea
                    rows="4"
                    value={value || ""}
                    onChange={(e) =>
                      handleAnswerChange(questionId, e.target.value)
                    }
                    className="w-full border p-3 rounded"
                    placeholder="Write your answer"
                  />
                )}

                {question.question_type === "number" && (
                  <input
                    type="number"
                    value={value ?? ""}
                    onChange={(e) =>
                      handleAnswerChange(questionId, e.target.value)
                    }
                    className="w-full border p-3 rounded"
                    placeholder="Enter a number"
                  />
                )}

                {question.question_type === "yes_no" && (
                  <div className="flex gap-6">
                    {["Yes", "No"].map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${questionId}`}
                          checked={value === option}
                          onChange={() =>
                            handleAnswerChange(questionId, option)
                          }
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {question.question_type === "multiple_choice" && (
                  <div className="space-y-2">
                    {question.options.map((option, i) => (
                      <label key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${questionId}`}
                          checked={value === option}
                          onChange={() =>
                            handleAnswerChange(questionId, option)
                          }
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {question.question_type === "checkboxes" && (
                  <div className="space-y-2">
                    {question.options.map((option, i) => (
                      <label key={i} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(value || []).includes(option)}
                          onChange={(e) => {
                            const currentValues = value || [];

                            handleAnswerChange(
                              questionId,
                              e.target.checked
                                ? [...currentValues, option]
                                : currentValues.filter(
                                  (item) => item !== option
                                )
                            );
                          }}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {question.question_type === "dropdown" && (
                  <select
                    value={value || ""}
                    onChange={(e) =>
                      handleAnswerChange(questionId, e.target.value)
                    }
                    className="w-full border p-3 rounded"
                  >
                    <option value="">Select an option</option>

                    {question.options.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}

          <div className="flex justify-between items-center">

            {/* Left side: Back and Cancel */}
            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() => {
                  if (questionPage === 0) {
                    setCurrentStep(2);
                  } else {
                    setQuestionPage((prev) => prev - 1);
                  }
                }}
                className="border border-gray-300 bg-white text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="text-gray-500 px-4 py-2 rounded-lg text-sm font-medium hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                Cancel
              </button>

            </div>

            {/* Right side: Next Questions */}
            <button
              type="button"
              onClick={() => {
                if (questionPage < totalQuestionPages - 1) {
                  setQuestionPage((prev) => prev + 1);
                } else {
                  setCurrentStep(4);
                }
              }}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {questionPage < totalQuestionPages - 1
                ? "Next Questions"
                : "Review Application"}
            </button>

          </div>

        </div>
      )}

      {currentStep === 1 && (
        <div className="flex justify-between items-center mt-6">

          {/* Cancel */}
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="text-gray-500 px-4 py-2 rounded-lg text-sm font-medium hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>

          {/* Back and Continue */}
          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 bg-white text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-100"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700"
            >
              Next
            </button>

          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">

          <div>
            <h3 className="text-xl font-semibold">
              Resume & Cover Letter
            </h3>
            <p className="text-gray-500 mt-1">
              Upload your resume and optionally introduce yourself.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block font-medium">
              Resume <span className="text-red-500">*</span>
            </label>

            {savedResumePath && !selectedResumeFile && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <p className="text-green-700 text-sm">
                  A saved resume is available. You can use it or upload a new one.
                </p>
              </div>
            )}

            {selectedResumeFile && (
              <p className="text-sm text-green-700">
                Selected file: {selectedResumeFile.name}
              </p>
            )}

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleResumeChange}
              className="w-full border p-3 rounded-lg"
            />

            <p className="text-sm text-gray-500">
              PDF format only. Maximum file size: 5 MB.
            </p>

            {resumeError && (
              <p className="text-red-600 text-sm">{resumeError}</p>
            )}
          </div>

          <hr />

          <div className="space-y-2">
            <label className="block font-medium">
              Cover Letter <span className="text-gray-400">(Optional)</span>
            </label>

            <textarea
              name="cover_letter"
              value={formData.cover_letter}
              onChange={handleChange}
              rows="6"
              placeholder="Write a short cover letter..."
              className="w-full border p-3 rounded-lg"
            />
          </div>


          <div className="flex justify-between items-center">

            {/* Left: Cancel */}
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="text-gray-500 px-4 py-2 rounded-lg text-sm font-medium hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>

            {/* Right: Previous and Next */}
            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!selectedResumeFile && !savedResumePath) {
                    setResumeError("Please upload your resume before continuing.");
                    return;
                  }

                  setResumeError("");

                  if (applicationQuestions.length > 0) {
                    setCurrentStep(3);
                    setQuestionPage(0);
                  } else {
                    setCurrentStep(4);
                  }
                }}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
              >
                Next
              </button>

            </div>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-6">

          <div>
            <h3 className="text-xl font-semibold">
              Review Your Application
            </h3>
            <p className="text-gray-500 mt-1">
              Please check your information and answers before submitting.
            </p>
          </div>

          {/* Personal Information */}
          <div className="border rounded-lg p-5 space-y-3">
            <h4 className="font-semibold text-lg">
              Personal Information
            </h4>

            <p><strong>Name:</strong> {formData.full_name}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Mobile:</strong> {formData.mobile}</p>
            <p><strong>Location:</strong> {formData.location}</p>
          </div>

          {/* Professional Information */}
          <div className="border rounded-lg p-5 space-y-3">
            <h4 className="font-semibold text-lg">
              Professional Information
            </h4>

            <p>
              <strong>Summary:</strong>{" "}
              {formData.professional_summary || "Not provided"}
            </p>

            <p>
              <strong>Skills:</strong>{" "}
              {formData.skills.join(", ") || "Not provided"}
            </p>

            <p>
              <strong>Experience Level:</strong>{" "}
              {formData.experience_level || "Not provided"}
            </p>

            <p>
              <strong>Years of Experience:</strong>{" "}
              {formData.years_of_experience || "Not provided"}
            </p>

            <p>
              <strong>Current Company:</strong>{" "}
              {formData.current_company || "Not provided"}
            </p>

            <p>
              <strong>Current Job Title:</strong>{" "}
              {formData.current_job_title || "Not provided"}
            </p>
          </div>

          {/* Professional Links */}
          <div className="border rounded-lg p-5 space-y-3">
            <h4 className="font-semibold text-lg">
              Professional Links
            </h4>

            <p>
              <strong>LinkedIn:</strong>{" "}
              {formData.linkedin_url || "Not provided"}
            </p>

            <p>
              <strong>GitHub:</strong>{" "}
              {formData.github_url || "Not provided"}
            </p>

            <p>
              <strong>Portfolio:</strong>{" "}
              {formData.portfolio_url || "Not provided"}
            </p>
          </div>

          {/* Resume & Cover Letter */}
          <div className="border rounded-lg p-5 space-y-4">
            <h4 className="font-semibold text-lg">
              Resume & Cover Letter
            </h4>

            <div>
              <p className="font-medium">Resume:</p>

              <p className="text-gray-600 mt-1">
                {selectedResumeFile
                  ? selectedResumeFile.name
                  : savedResumePath
                    ? savedResumePath.split(/[\\/]/).pop()
                    : "Not provided"}
              </p>
            </div>

            <div>
              <p className="font-medium">Cover Letter:</p>

              <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                {formData.cover_letter || "Not provided"}
              </p>
            </div>
          </div>

          {/* Application Answers */}
          {applicationQuestions.length > 0 && (
            <div className="border rounded-lg p-5 space-y-4">
              <h4 className="font-semibold text-lg">
                Additional Questions
              </h4>

              {applicationQuestions.map((question, index) => (
                <div key={question.question_id} className="border-b pb-3">
                  <p className="font-medium">
                    {index + 1}. {question.question_text}
                  </p>

                  <p className="text-gray-600 mt-2">
                    {Array.isArray(answers[question.question_id])
                      ? answers[question.question_id].join(", ")
                      : answers[question.question_id] || "Not answered"}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="space-y-4">

            {submitError && (
              <p className="text-red-600 text-sm">
                {submitError}
              </p>
            )}

            {submitSuccess && (
              <p className="text-green-600 font-medium">
                {submitSuccess}
              </p>
            )}

            <div className="flex items-center gap-2">

              <button
                type="button"
                disabled={isSubmitting || isSubmitted}
                onClick={() => {
                  if (applicationQuestions.length > 0) {
                    setCurrentStep(3);
                    setQuestionPage(Math.max(0, totalQuestionPages - 1));
                  } else {
                    setCurrentStep(2);
                  }
                }}
                className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Back to Edit
              </button>

              <button
                type="button"
                disabled={isSubmitting || isSubmitted}
                onClick={() => setShowCancelConfirm(true)}
                className="text-gray-500 px-4 py-2 rounded-lg text-sm font-medium hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={isSubmitting || isSubmitted}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 ml-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>

            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

            {/* Red accent line */}
            <div className="h-1.5 bg-red-600"></div>

            <div className="p-7">

              {/* Warning icon */}
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v4m0 4h.01M10.3 3.86L2.9 17.1A2 2 0 004.63 20h14.74a2 2 0 001.73-2.9L13.73 3.86a2 2 0 00-3.46 0z"
                  />
                </svg>
              </div>

              {/* Heading */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Cancel Application?
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-6 mb-7">
                Are you sure you want to cancel your application for
                <span className="font-semibold text-gray-800"> {job.title}</span>?
                Your entered information and answers will be lost.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Keep Applying
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-lg bg-red-600 text-white text-sm font-semibold shadow-sm hover:bg-red-700 active:bg-red-800 transition-all"
                >
                  Yes, Cancel Application
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ApplicationForm;
