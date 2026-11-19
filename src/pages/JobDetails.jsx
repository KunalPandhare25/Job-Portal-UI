import { API_URL } from "../config";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Detail from "../components/Detail";

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/jobs/${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Job not found");
        }

        // Match the existing Jobify component's ID format
        setJob({
          ...data.job,
          id: data.job.job_id
        });

      } catch (err) {
        console.error("Error fetching job details:", err);
        setError(err.message || "Unable to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  return (
    <main className="w-full min-w-0 min-h-screen
      px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12
      py-5 sm:py-8">

      {loading ? (
        <p className="text-center text-base sm:text-lg text-white py-10">
          Loading job details...
        </p>
      ) : error ? (
        <p className="text-center text-red-400
          text-base sm:text-xl font-semibold py-10 px-3">
          {error}
        </p>
      ) : (
        <div className="w-full max-w-5xl mx-auto min-w-0">
          <Detail job={job} />
        </div>
      )}

    </main>
  );
}

export default JobDetails;
