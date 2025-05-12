import React from 'react';
import JobCard from './JobCard';

export default function JobList({ jobs }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {jobs.length > 0 ? (
        jobs.map((job) => <JobCard key={job.id} job={job} />)
      ) : (
        <p className="text-white text-center col-span-full">No jobs match the selected filters.</p>
      )}
    </div>
  );
}
