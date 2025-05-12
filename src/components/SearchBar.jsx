import React, { useState } from 'react';

const locations = ["All", "Bengaluru", "Mumbai", "Hyderabad", "Noida", "Pune"];
const skills = ["React", "JavaScript", "Node.js", "Python", "Figma", "CSS"];

export default function JobSearchBar({ onSearch }) {
  const [jobRole, setJobRole] = useState('');
  const [location, setLocation] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const handleSkillToggle = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ jobRole, location, skills: selectedSkills });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-xl flex flex-wrap gap-4 items-center justify-center"
    >
      {/* Job Role Input */}
      <input
        type="text"
        placeholder="Job Role"
        value={jobRole}
        onChange={(e) => setJobRole(e.target.value)}
        className="px-4 py-2 rounded-md w-48 bg-gray-700 text-white placeholder-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {/* Location Dropdown */}
      <select
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="px-4 py-2 rounded-md w-48 bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {locations.map((loc) => (
          <option key={loc} value={loc} className="bg-gray-700 text-white">
            {loc}
          </option>
        ))}
      </select>

      {/* Skills Section (Multi-select with fixed background) */}
      <div className="flex flex-wrap gap-2 w-full justify-center">
        {skills.map((skill) => (
          <label
            key={skill}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-700 border border-gray-600 text-white cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedSkills.includes(skill)}
              onChange={() => handleSkillToggle(skill)}
              className="accent-purple-500"
            />
            <span className="text-sm">{skill}</span>
          </label>
        ))}
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
      >
        Search
      </button>
    </form>
  );
}
