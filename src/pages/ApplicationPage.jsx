import { API_URL } from "../config";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ApplicationForm from "../components/ApplicationForm";

function ApplicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/jobs/${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Job not found.");
        }

        setJob(data.job);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg"
        >
          Loading application...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-10">
        <p className="text-red-400 mb-4">{error}</p>

        <motion.button
          whileHover={{ scale: 1.06, y: -3 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate(-1)}
          className="bg-purple-600 hover:bg-purple-500 px-5 py-2 rounded-lg transition"
        >
          Go Back
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8 sm:px-6">

      {/* Background glow */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Application Form */}
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
          rotateX: 8,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
        }}
        whileHover={{
          y: -4,
          transition: { duration: 0.3 },
        }}
        style={{
          transformPerspective: 1200,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10"
      >
        <ApplicationForm
          job={job}
          onClose={() => navigate(`/job/${id}`)}
        />
      </motion.div>

    </div>
  );
}

export default ApplicationPage;
