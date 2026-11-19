
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import JobList from '../components/JobList';
import { API_URL } from '../config';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    jobRole: '',
    location: 'All',
    skills: []
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${API_URL}/api/jobs`);

        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();

        const formattedJobs = data.jobs.map(job => ({
          ...job,
          id: job.job_id
        }));

        setJobs(formattedJobs);

      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Unable to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const { jobRole, location, skills } = filters;

    const search = jobRole.trim().toLowerCase();

    if (search) {
      const title = (job.title || '').toLowerCase();
      const company = (job.company || '').toLowerCase();

      if (!title.includes(search) && !company.includes(search)) {
        return false;
      }
    }

    if (
      location !== 'All' &&
      !(job.location || '').toLowerCase().includes(location.toLowerCase())
    ) {
      return false;
    }

    if (
      skills.length > 0 &&
      !skills.every(skill => {
        const jobSkills = [
          ...(job.tags || []),
          ...(job.skills || [])
        ].map(item => item.toLowerCase());

        return jobSkills.includes(skill.toLowerCase());
      })
    ) {
      return false;
    }

    return true;
  });

  return (
    <main className="min-h-screen w-full px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">

      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative text-center mb-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.3, 0.15]
            }}
            transition={{
              duration: 6,
              repeat: Infinity
            }}
            className="absolute left-1/2 -translate-x-1/2 -top-10 w-64 h-32 bg-purple-500/30 blur-3xl rounded-full pointer-events-none"
          />

          <div className="relative">
            <p className="text-purple-300 text-xs sm:text-sm font-semibold tracking-[3px] mb-3">
              YOUR CAREER STARTS HERE
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight break-words">
              Find a Job That Moves
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-400">
                Your Career Forward
              </span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-base mt-4 max-w-2xl mx-auto">
              Explore opportunities from companies looking for talented people like you.
            </p>
          </div>
        </motion.section>

        {/* Search */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{
            y: -3,
            transition: { duration: 0.25 }
          }}
          className="mb-9 rounded-2xl"
        >
          <SearchBar onSearch={handleFilterChange} />
        </motion.section>

        {/* Job Listings */}
        <section>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-between gap-3 mb-5"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Latest Opportunities
              </h2>

              <p className="text-gray-300 text-sm mt-1">
                Explore jobs that match your interests.
              </p>
            </div>

            {!loading && !error && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm text-purple-200 bg-white/10 border border-white/10 rounded-lg px-3 py-2 whitespace-nowrap"
              >
                {filteredJobs.length} jobs
              </motion.span>
            )}
          </motion.div>

          {loading ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-300 py-12"
            >
              Loading jobs...
            </motion.p>
          ) : error ? (
            <p className="text-center text-red-300 py-12">
              {error}
            </p>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <JobList jobs={filteredJobs} />
            </motion.div>
          )}

        </section>

      </div>
    </main>
  );
};

export default Home;
