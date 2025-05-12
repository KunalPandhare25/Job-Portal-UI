import React from "react";
import { useParams } from "react-router-dom";
import { jobCards } from "../components/JobData"; // Sample job data
import Detail from "../components/Detail"; // Detail component to show job info

function JobDetails() {
  // Get the job ID from the URL
  const params = useParams();
  const jobId = parseInt(params.id);

  // Find the job with the matching ID
  const job = jobCards.find((item) => item.id === jobId);

  return (
    <div className="mt-8">
      {/* Show job detail if found, otherwise show error */}
      {job ? (
        <Detail job={job} />
      ) : (
        <p className="text-center text-red-500">Job not found.</p>
      )}
    </div>
  );
}

export default JobDetails;
