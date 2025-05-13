import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import JobList from '../components/JobList';
import { jobCards } from '../components/JobData';

const Home = () => {
  const [filteredJobs, setFilteredJobs] = useState(jobCards);

  const handleFilterChange = ({ jobRole, location, skills }) => {
    let filtered = jobCards;

    if (jobRole) {
      const lowerSearch = jobRole.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerSearch) ||
          job.company.toLowerCase().includes(lowerSearch)
      );
    }

    if (location !== 'All') {
      filtered = filtered.filter((job) => job.location === location);
    }

    if (skills.length > 0) {
      filtered = filtered.filter((job) =>
        skills.every((skill) => job.tags.includes(skill))
      );
    }

    setFilteredJobs(filtered);
  };

  return (
    <div className="flex flex-col items-center gap-5 text-white px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-8">
      {/* Heading */}
      <div className="text-center max-w-3xl mb-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
          Your Ideal Job Awaits – Start Your Search Today
        </h1>
        <p className="text-lg sm:text-xl text-gray-300">
          Discover the Latest Job Openings Tailored Just for You!
        </p>
      </div>

      {/* SearchBar */}
      <div className="w-full max-w-6xl">
        <SearchBar onSearch={handleFilterChange} />
      </div>

      {/* Job List */}
      <div className="w-full max-w-6xl mt-6">
        {filteredJobs.length > 0 ? (
          <JobList jobs={filteredJobs} />
        ) : (
          <p className="text-red-400 text-xl mt-4 text-center">
            No Jobs Found Matching Your Criteria.
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
