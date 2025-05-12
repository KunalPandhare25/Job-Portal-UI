import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import JobList from '../components/JobList';
import { jobCards } from '../components/JobData';

const Home = () => {
  const [filteredJobs, setFilteredJobs] = useState(jobCards);

  const handleFilterChange = ({ jobRole, location, skills }) => {
    let filtered = jobCards;

    // Filter by job role or company name
    if (jobRole) {
      const lowerSearch = jobRole.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerSearch) ||
          job.company.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by location
    if (location !== 'All') {
      filtered = filtered.filter((job) => job.location === location);
    }

    // Filter by skills (all selected skills must match)
    if (skills.length > 0) {
      filtered = filtered.filter((job) =>
        skills.every((skill) => job.tags.includes(skill))
      );
    }

    setFilteredJobs(filtered);
  };

  return (
    <div className="flex flex-col items-center gap-5 text-white text-center">
      <h1 className="text-4xl font-bold mt-6">Your Ideal Job Awaits – Start Your Search Today</h1>
      <p className="text-xl">Discover the Latest Job Openings Tailored Just for You!</p>

      {/* Search Filters */}
      <div className="w-full max-w-6xl px-4">
        <SearchBar onSearch={handleFilterChange} />
      </div>

      {/* Job List */}
      <div className="w-full max-w-6xl px-4 mt-6">
        {filteredJobs.length > 0 ? (
          <JobList jobs={filteredJobs} />
        ) : (
          <p className="text-red-400 text-xl mt-4">No Jobs Found Matching Your Criteria.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
