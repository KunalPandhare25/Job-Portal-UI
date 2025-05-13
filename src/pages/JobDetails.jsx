import React from "react";
import { useParams } from "react-router-dom";
import { jobCards } from "../components/JobData"; // Sample job data
import Detail from "../components/Detail"; // Detail component to show job info

function JobDetails() {
  const { id } = useParams();
  const jobId = parseInt(id);

  const job = jobCards.find((item) => item.id === jobId);

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-8">
      {job ? (
        <div className="max-w-5xl mx-auto">
          <Detail job={job} />
        </div>
      ) : (
        <p className="text-center text-red-500 text-lg sm:text-xl font-semibold">
          Job not found.
        </p>
      )}
    </div>
  );
}

export default JobDetails;
