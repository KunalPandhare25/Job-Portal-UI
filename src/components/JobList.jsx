
import React from 'react';
import JobCard from './JobCard';

export default function JobList({ jobs = [] }) {
  return (
    <div className="w-full">

      {jobs.length > 0 ? (
        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-4
          sm:gap-5
          lg:gap-6
          items-stretch
          ">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="h-full animate-[fadeIn_0.4s_ease-in-out]"
            >
              <JobCard job={job} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center
          text-center py-16 px-4 bg-white/5 border
          border-white/10 rounded-xl">

          <h3 className="text-xl font-semibold text-white mb-2">
            No Jobs Found
          </h3>

          <p className="text-gray-400 text-sm max-w-md">
            We couldn't find any jobs matching your selected filters.
            Try adjusting your search criteria.
          </p>
        </div>
      )}

    </div>
  );
}
