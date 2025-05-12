import React from 'react';
import { Link } from 'react-router-dom'; 

export default function JobCard({ job }) {
  return (
    <div className="bg-white text-black p-4 rounded-lg shadow-md hover:shadow-xl transition">
      {/* Job Title */}
      <h2 className="text-xl font-semibold mb-1">{job.title}</h2>

      {/* Company Name */}
      <p className="text-gray-700 mb-1">{job.company}</p>

      {/* Job Location */}
      <p className="text-sm text-gray-500 mb-2">{job.location}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {job.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* View Details Button wrapped in Link */}
      <Link to={`/job/${job.id}`}>
        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          View Details
        </button>
      </Link>
    </div>
  );
}
