import React, { useState, useEffect } from 'react';

const locations = ["All", "Bengaluru", "Mumbai", "Hyderabad", "Noida", "Pune"];
const skills = ["React", "JavaScript", "Node.js", "Python", "Figma", "CSS"];

export default function JobSearchBar({ onSearch }) {
  const [jobRole, setJobRole] = useState('');
  const [location, setLocation] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const handleSkillToggle = (skill) => {
    const updatedSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updatedSkills);
  };

  useEffect(() => {
    onSearch({ jobRole, location, skills: selectedSkills });
  }, [location, selectedSkills]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ jobRole, location, skills: selectedSkills });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 md:p-6 rounded-2xl shadow-xl flex flex-col gap-6 items-center w-full max-w-5xl mx-auto"
    >
      {/* Job Role + Search */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-4 justify-center">
        <input
          type="text"
          placeholder="Search by Job Role..."
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          className="px-4 py-2 rounded-md w-full sm:w-64 bg-gray-700 text-white placeholder-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-all duration-200 w-full sm:w-auto"
        >
          Search
        </button>
      </div>

      {/* Skills Filter */}
      <div className="w-full flex flex-wrap justify-center gap-3">
        {skills.map((skill) => (
          <label
            key={skill}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium cursor-pointer transition-all ${
              selectedSkills.includes(skill)
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-purple-500/20'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedSkills.includes(skill)}
              onChange={() => handleSkillToggle(skill)}
              className="accent-purple-500"
            />
            {skill}
          </label>
        ))}
      </div>

      {/* Location Dropdown */}
      <div className="w-full flex justify-center">
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="px-4 py-2 rounded-md w-full sm:w-64 bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc} className="bg-gray-700 text-white">
              {loc}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
