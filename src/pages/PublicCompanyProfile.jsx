import { API_URL } from "../config";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 35, rotateX: 8 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const PublicCompanyProfile = () => {
  const { recruiterId } = useParams();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/company/${recruiterId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load company profile"
          );
        }

        setCompany(data.profile);
      } catch (err) {
        console.error("Company profile error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [recruiterId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Loading company profile...
        </motion.p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        {error || "Company profile not found"}
      </div>
    );
  }

  const logoUrl = company.company_logo
    ? company.company_logo.startsWith("http")
      ? company.company_logo
      : `${API_URL}/${company.company_logo.replace(/^\/+/, "")}`
    : null;

  const cardClass =
    "w-full min-w-0 bg-white/[0.08] backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-xl hover:border-purple-400/40 hover:shadow-purple-500/10 transition-colors duration-300";

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white px-3 sm:px-5 md:px-8 lg:px-10 py-6 sm:py-8 md:py-12">

      {/* Animated background */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.12, 0.25, 0.12],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-20 -left-20 w-96 h-96 bg-purple-600 blur-[130px] rounded-full pointer-events-none"
      />

      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.22, 0.1],
        }}
        transition={{ duration: 9, repeat: Infinity }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 blur-[130px] rounded-full pointer-events-none"
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">

        {/* Company Header */}
        <motion.section
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{
            y: -6,
            rotateX: 2,
            rotateY: -1,
          }}
          style={{ transformPerspective: 1200 }}
          className={cardClass}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">

            {/* Company Logo */}
            {logoUrl ? (
              <motion.img
                src={logoUrl}
                alt={`${company.company_name} logo`}
                initial={{ opacity: 0, scale: 0.7, rotateY: 45 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                whileHover={{ scale: 1.08, rotateY: 8 }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 rounded-xl object-contain bg-white p-2 shadow-lg"
              />
            ) : (
              <motion.div
                initial={{ scale: 0.7, rotateY: 45 }}
                animate={{ scale: 1, rotateY: 0 }}
                whileHover={{ scale: 1.1, rotateY: 12 }}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-xl"
              >
                {company.company_name?.charAt(0) || "C"}
              </motion.div>
            )}

            <div className="w-full min-w-0 text-center sm:text-left">
              <motion.h1
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="text-2xl sm:text-3xl md:text-4xl font-bold break-words"
              >
                {company.company_name}
              </motion.h1>

              <motion.p
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.15 }}
                className="text-purple-300 mt-2"
              >
                {company.industry || "Industry not specified"}
              </motion.p>

              <motion.p
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.25 }}
                className="text-gray-400 mt-1"
              >
                {company.location || "Location not specified"}
              </motion.p>
            </div>
          </div>
        </motion.section>

        {/* About Company */}
        <motion.section
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -5, rotateX: 2, rotateY: 1 }}
          style={{ transformPerspective: 1200 }}
          className={cardClass}
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            About Company
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm sm:text-base text-gray-300 leading-6 sm:leading-7 whitespace-pre-line break-words"
          >
            {company.about || "No company description available."}
          </motion.p>
        </motion.section>

        {/* Company Information */}
        <motion.section
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -5, rotateX: 2, rotateY: -1 }}
          style={{ transformPerspective: 1200 }}
          className={cardClass}
        >
          <h2 className="text-2xl font-semibold mb-6">
            Company Information
          </h2>

          <motion.div
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12 },
              },
            }}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {[
              ["Company Size", company.company_size],
              ["Industry", company.industry],
              ["Email", company.email],
              ["Phone", company.phone],
            ].map(([label, value]) => (
              <motion.div
                key={label}
                variants={itemVariants}
                whileHover={{ x: 5 }}
                className="border-l-2 border-purple-500 pl-4"
              >
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="mt-1 break-all">
                  {value || "Not specified"}
                </p>
              </motion.div>
            ))}

            <motion.div
              variants={itemVariants}
              whileHover={{ x: 5 }}
              className="border-l-2 border-purple-500 pl-4"
            >
              <p className="text-gray-400 text-sm">Website</p>

              {company.company_website ? (
                <a
                  href={company.company_website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-300 hover:text-purple-200 hover:underline break-all"
                >
                  {company.company_website}
                </a>
              ) : (
                <p className="mt-1">Not specified</p>
              )}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Social Links */}
        {(company.linkedin || company.twitter) && (
          <motion.section
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -5, rotateX: 2 }}
            style={{ transformPerspective: 1200 }}
            className={cardClass}
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Connect With Us
            </h2>

            <div className="flex flex-wrap gap-5">
              {company.linkedin && (
                <motion.a
                  href={company.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  className="text-purple-300 hover:text-purple-200 hover:underline"
                >
                  LinkedIn
                </motion.a>
              )}

              {company.twitter && (
                <motion.a
                  href={company.twitter}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  className="text-purple-300 hover:text-purple-200 hover:underline"
                >
                  Twitter / X
                </motion.a>
              )}
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
};

export default PublicCompanyProfile;
