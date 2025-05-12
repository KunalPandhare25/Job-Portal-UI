import React from "react";

function Detail({ job }) {
  // If job is not provided, show a message
  if (!job) {
    return <p className="text-center text-red-500">Job not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md text-black">
      {/* Job Title */}
      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>

      {/* Company and Location */}
      <p className="text-lg mb-1">
        {job.company} — {job.location}
      </p>

      {/* Job Tags */}
      <div className="mb-4">
        {job.tags && job.tags.map((tag, index) => (
          <span
            key={index}
            className="inline-block bg-purple-100 text-purple-700 px-2 py-1 mr-2 mb-2 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Description */}
      <h2 className="text-xl font-semibold mb-1">Job Description</h2>
      <p className="mb-4">{job.description || "No description provided."}</p>

      {/* Responsibilities */}
      <h2 className="text-xl font-semibold mb-1">Responsibilities</h2>
      <ul className="list-disc pl-5 mb-4">
        {job.responsibilities && job.responsibilities.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      {/* Skills */}
      <h2 className="text-xl font-semibold mb-1">Skills Required</h2>
      <ul className="list-disc pl-5 mb-4">
        {job.skills && job.skills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>

      {/* Apply Button */}
      <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
        Apply Now
      </button>
    </div>
  );
}

export default Detail;
