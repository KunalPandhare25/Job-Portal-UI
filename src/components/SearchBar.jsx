import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  X,
  SlidersHorizontal
} from 'lucide-react';

const locations = [
  "All",
  "Bengaluru",
  "Mumbai",
  "Hyderabad",
  "Noida",
  "Pune"
];

export default function JobSearchBar({ onSearch }) {
  const [jobRole, setJobRole] = useState('');
  const [location, setLocation] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Dynamic skills
  const [skills, setSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);

  // Fetch skills from backend
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/skills`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }

        const data = await response.json();
        setSkills(data.skills || []);

      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Real-time job search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch({
        jobRole,
        location,
        skills: selectedSkills
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [jobRole, location, selectedSkills, onSearch]);

  // Toggle skill selection
  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(item => item !== skill)
        : [...prev, skill]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setJobRole('');
    setLocation('All');
    setSelectedSkills([]);
    setSkillSearch('');
    setShowAllSkills(false);
  };

  const activeFilterCount =
    (jobRole.trim() ? 1 : 0) +
    (location !== 'All' ? 1 : 0) +
    selectedSkills.length;

  // Filter skills by search text
  const filteredSkills = skills.filter(skill =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const visibleSkills =
    skillSearch || showAllSkills
      ? filteredSkills
      : filteredSkills.slice(0, 6);

  return (
    <div className="w-full bg-gradient-to-br from-gray-800 to-gray-900
      border border-gray-700/70 rounded-2xl shadow-xl p-3 sm:p-5">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">

        <div>
          <h2 className="text-lg font-semibold text-white">
            Find Your Next Opportunity
          </h2>

          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Discover jobs that match your skills and interests.
          </p>
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-purple-300 hover:text-white
              flex items-center gap-1.5 transition-colors"
          >
            <X size={15} />
            Clear all

            <span className="bg-purple-600/20 px-2 py-0.5
              rounded-full text-xs">
              {activeFilterCount}
            </span>
          </button>
        )}
      </div>

      {/* Job Search and Location */}
      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr]
        gap-3 mb-5">

        {/* Job Search */}
        <div>
          <label className="block text-xs font-medium
            text-gray-300 mb-2">
            Job title or company
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2
                -translate-y-1/2 text-purple-400"
            />

            <input
              type="text"
              value={jobRole}
              onChange={e => setJobRole(e.target.value)}
              placeholder="e.g. React Developer"
              className="w-full bg-gray-700/80 border border-gray-600
                rounded-lg pl-10 pr-10 py-3 text-sm text-white
                placeholder-gray-400 focus:outline-none
                focus:border-purple-500 focus:ring-2
                focus:ring-purple-500/30 transition"
            />

            {jobRole && (
              <button
                type="button"
                onClick={() => setJobRole('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2
                  -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium
            text-gray-300 mb-2">
            Location
          </label>

          <div className="relative">
            <MapPin
              size={17}
              className="absolute left-3.5 top-1/2
                -translate-y-1/2 text-purple-400"
            />

            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full appearance-none bg-gray-700/80
                border border-gray-600 rounded-lg pl-10 pr-9
                py-3 text-sm text-white focus:outline-none
                focus:border-purple-500 focus:ring-2
                focus:ring-purple-500/30 transition cursor-pointer"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc === 'All' ? 'All Locations' : loc}
                </option>
              ))}
            </select>

            <span className="absolute right-3 top-1/2
              -translate-y-1/2 text-gray-400 pointer-events-none">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Skills Filter */}
      <div>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">

          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={16}
              className="text-purple-400"
            />

            <h3 className="text-sm font-medium text-gray-200">
              Skills
            </h3>

            <span className="text-xs text-gray-500">
              Select multiple
            </span>
          </div>

          {!skillsLoading && skills.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllSkills(prev => !prev)}
              className="text-xs text-purple-300 hover:text-white"
            >
              {showAllSkills ? 'Show Less' : 'Show All'}
            </button>
          )}
        </div>

        {/* Search Skills */}
        <div className="relative mb-3">

          <Search
            size={16}
            className="absolute left-3 top-1/2
              -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={skillSearch}
            onChange={e => setSkillSearch(e.target.value)}
            placeholder="Search available skills..."
            className="w-full sm:w-72 bg-gray-700/70
              border border-gray-600 rounded-lg
              pl-9 pr-9 py-2 text-sm text-white
              placeholder-gray-400 focus:outline-none
              focus:border-purple-500"
          />

          {skillSearch && (
            <button
              type="button"
              onClick={() => setSkillSearch('')}
              aria-label="Clear skill search"
              className="absolute right-3 top-1/2
                -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">

            {selectedSkills.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className="flex items-center gap-1.5
                  bg-purple-600 text-white px-3 py-1.5
                  rounded-full text-xs"
              >
                {skill}
                <X size={13} />
              </button>
            ))}

          </div>
        )}

        {/* Available Skills */}
        <div className="flex flex-wrap gap-2">

          {visibleSkills.map(skill => {
            const selected = selectedSkills.includes(skill);

            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                aria-pressed={selected}
                className={`px-3.5 py-2 rounded-lg
                  text-xs sm:text-sm font-medium border
                  transition-all duration-200
                  ${selected
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-gray-700/60 border-gray-600 text-gray-300 hover:border-purple-400 hover:text-white'
                  }`}
              >
                {selected ? '✓ ' : '+ '}
                {skill}
              </button>
            );
          })}

        </div>

        {/* Loading and Empty States */}
        {skillsLoading && (
          <p className="text-xs text-gray-400 mt-2">
            Loading available skills...
          </p>
        )}

        {!skillsLoading && skills.length === 0 && (
          <p className="text-sm text-gray-400 mt-2">
            No skills available at the moment.
          </p>
        )}

        {!skillsLoading && skills.length > 0 &&
          filteredSkills.length === 0 && (
            <p className="text-sm text-gray-400 mt-2">
              No matching skills found.
            </p>
          )}

      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-gray-700/80
        flex flex-wrap items-center justify-between gap-2">

        <p className="text-xs text-gray-400">
          {activeFilterCount === 0
            ? 'Explore all available opportunities'
            : `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`}
        </p>

        <span className="text-xs text-purple-300">
          Live Search
        </span>

      </div>

    </div>
  );
}
