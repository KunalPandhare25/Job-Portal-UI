
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Detail({ job }) {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!job) {
    return <p className="text-center text-red-500">Job not found.</p>;
  }

  const formatSalary = (amount) => {
    if (amount === null || amount === undefined || amount === "") {
      return null;
    }

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const salaryMin = formatSalary(job.salary_min);
  const salaryMax = formatSalary(job.salary_max);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md text-black">

      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>

      <Link
        to={`/company/${job.recruiter_id}`}
        className="text-lg mb-4 text-blue-700 hover:text-purple-700 hover:underline inline-block"
      >
        {job.company} — {job.location}
      </Link>


      {/* Job Information */}
      <div className="flex flex-wrap gap-x-8 gap-y-2 mb-5 mt-3 text-sm">
        {(job.salary_min || job.salary_max) && (
          <p>
            <span className="text-gray-500">Salary: </span>
            <span className="font-semibold">
              {formatSalary(job.salary_min) || "Not specified"} - {formatSalary(job.salary_max) || "Not specified"}
            </span>
          </p>
        )}

        {job.experience && (
          <p>
            <span className="text-gray-500">Experience: </span>
            <span className="font-semibold">{job.experience}</span>
          </p>
        )}

        {job.employment_type && (
          <p>
            <span className="text-gray-500">Employment: </span>
            <span className="font-semibold">{job.employment_type}</span>
          </p>
        )}

        {job.workplace_type && (
          <p>
            <span className="text-gray-500">Workplace: </span>
            <span className="font-semibold">{job.workplace_type}</span>
          </p>
        )}
      </div>


      {/* Job Tags */}
      {job.tags?.length > 0 && (
        <div className="mb-4">
          {job.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-block bg-purple-100 text-purple-700 px-2 py-1 mr-2 mb-2 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-1">Job Description</h2>
      <p className="mb-4">
        {job.description || "No description provided."}
      </p>

      <h2 className="text-xl font-semibold mb-1">Responsibilities</h2>
      <ul className="list-disc pl-5 mb-4">
        {job.responsibilities?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-1">Skills Required</h2>
      <ul className="list-disc pl-5 mb-4">
        {job.skills?.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>

      <button
        onClick={() => {
          const token = localStorage.getItem("token");

          if (!token) {
            setMessage("Please login before applying for a job.");
            setIsSuccess(false);
            return;
          }

          navigate(`/jobs/${job.job_id || job.id}/apply`);
        }}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        Apply Now
      </button>

      {message && (
        <p className={`mt-4 font-medium ${isSuccess ? "text-green-600" : "text-red-500"}`}>
          {message}
        </p>
      )}

    </div>
  );
}

export default Detail;
