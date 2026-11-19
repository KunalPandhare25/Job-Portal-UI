
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { MapPin, Building2, ArrowUpRight } from 'lucide-react';

export default function JobCard({ job }) {
  const companyInitials = (job.company || 'Company')
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const tags = job.tags || [];

  // 3D mouse movement values
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const smoothRotateX = useSpring(rotateX, {
    stiffness: 180,
    damping: 20
  });

  const smoothRotateY = useSpring(rotateY, {
    stiffness: 180,
    damping: 20
  });

  const handleMouseMove = (event) => {
    // Avoid 3D mouse movement on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    rotateX.set(((centerY - y) / centerY) * 5);
    rotateY.set(((x - centerX) / centerX) * 5);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d'
      }}
      whileHover={{
        y: -7,
        boxShadow: '0px 18px 35px rgba(124, 58, 237, 0.16)'
      }}
      transition={{
        type: 'spring',
        stiffness: 250,
        damping: 20
      }}
      className="group bg-white text-gray-900 p-4 sm:p-5 rounded-xl
        border border-gray-200 hover:border-purple-300
        transition-colors duration-300
        flex flex-col h-full min-w-0"
    >

      {/* Company Logo and Job Title */}
      <div
        className="flex items-start gap-3 mb-4 min-w-0"
        style={{ transform: 'translateZ(20px)' }}
      >
        <motion.div
          whileHover={{ rotate: 8, scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-12 h-12 rounded-xl bg-purple-100
            text-purple-700 flex items-center justify-center
            font-bold text-lg shrink-0"
        >
          {companyInitials}
        </motion.div>

        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold leading-snug
            break-words group-hover:text-purple-700 transition-colors">
            {job.title}
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 mt-1
            flex items-center gap-1 min-w-0 break-words">
            <Building2 size={14} className="shrink-0" />
            <span className="break-words min-w-0">
              {job.company}
            </span>
          </p>
        </div>
      </div>

      {/* Job Location */}
      <div
        className="flex items-start gap-2 text-xs sm:text-sm
          text-gray-500 mb-4 min-w-0"
        style={{ transform: 'translateZ(12px)' }}
      >
        <MapPin size={15} className="text-purple-600 shrink-0" />

        <span className="min-w-0 break-words">
          {job.location || 'Location not specified'}
        </span>
      </div>

      {/* Skill Tags */}
      <div
        className="flex flex-wrap gap-2 mb-5 min-w-0"
        style={{ transform: 'translateZ(15px)' }}
      >
        {tags.slice(0, 4).map((tag, index) => (
          <span
            key={index}
            className="bg-purple-50 text-purple-700
              border border-purple-100 px-3 py-1
              rounded-full text-xs font-medium
              transition-colors duration-200
              group-hover:border-purple-200 max-w-full break-words"
          >
            {tag}
          </span>
        ))}

        {tags.length > 4 && (
          <span className="text-xs text-gray-500 px-2 py-1">
            +{tags.length - 4} more
          </span>
        )}
      </div>

      {/* View Details */}
      <div
        className="mt-auto pt-3 border-t border-gray-100"
        style={{ transform: 'translateZ(22px)' }}
      >
        <Link
          to={`/job/${job.id}`}
          className="inline-flex items-center justify-center gap-2
            w-full sm:w-auto
            bg-purple-600 text-white px-4 py-2.5
            rounded-lg text-sm font-semibold
            hover:bg-purple-700 transition-all duration-300"
        >
          View Details

          <motion.span
            whileHover={{ x: 4, y: -2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <ArrowUpRight size={16} />
          </motion.span>
        </Link>
      </div>

    </motion.div>
  );
}
