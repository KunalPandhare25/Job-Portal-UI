import { API_URL } from "../config";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        const fetchApplications = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login to view your applications.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}/api/applications/my-applications`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load applications.");
                }

                setApplications(data.applications || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    // Withdraw a job application
    const handleWithdraw = async (applicationId) => {
        const confirmWithdraw = window.confirm(
            "Are you sure you want to withdraw this application?"
        );

        if (!confirmWithdraw) return;

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `${API_URL}/api/applications/${applicationId}/withdraw`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to withdraw application.");
            }

            setApplications((prevApplications) =>
                prevApplications.map((app) =>
                    app.application_id === applicationId
                        ? { ...app, status: "Withdrawn" }
                        : app
                )
            );

            alert("Application withdrawn successfully!");

        } catch (err) {
            alert(err.message);
        }
    };

    const filteredApplications =
        filter === "All"
            ? applications
            : applications.filter((app) => app.status === filter);

    const pendingCount = applications.filter(
        (app) => app.status === "Pending"
    ).length;

    const reviewedCount = applications.filter(
        (app) => app.status === "Reviewed"
    ).length;

    const shortlistedCount = applications.filter(
        (app) => app.status === "Shortlisted"
    ).length;

    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-400/10 text-yellow-300 border-yellow-400/30";
            case "Reviewed":
                return "bg-blue-400/10 text-blue-300 border-blue-400/30";
            case "Shortlisted":
                return "bg-green-400/10 text-green-300 border-green-400/30";
            case "Rejected":
                return "bg-red-400/10 text-red-300 border-red-400/30";
            default:
                return "bg-gray-400/10 text-gray-300 border-gray-400/30";
        }
    };

    return (
        <div className="min-h-screen px-5 py-12 text-white">

            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-10">
                    <p className="text-purple-300 uppercase tracking-[4px] text-sm mb-3">
                        Jobify Dashboard
                    </p>

                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                        My <span className="text-purple-300">Applications</span>
                    </h1>

                    <p className="text-gray-300">
                        Track your career journey. Every application, one place.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

                    {[
                        { title: "Total Applications", value: applications.length },
                        { title: "Pending", value: pendingCount },
                        { title: "Reviewed", value: reviewedCount },
                        { title: "Shortlisted", value: shortlistedCount },
                    ].map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{
                                y: -10,
                                rotateX: 5,
                                rotateY: -5,
                                scale: 1.03
                            }}
                            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                            className="group relative rounded-2xl border border-white/10
                                        bg-white/[0.07] backdrop-blur-xl p-6
                                        shadow-[0_15px_40px_rgba(0,0,0,0.25)]
                                        transition-all duration-300
                                        hover:border-purple-400/50
                                        hover:shadow-[0_20px_50px_rgba(139,92,246,0.2)]"
                        >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br
                from-purple-500/10 to-transparent opacity-0
                group-hover:opacity-100 transition duration-300" />

                            <p className="relative text-gray-300 text-sm mb-3">
                                {item.title}
                            </p>

                            <h2 className="relative text-4xl font-bold text-white">
                                {item.value}
                            </h2>

                            <div className="relative mt-4 h-1 w-12 rounded-full bg-purple-400" />
                        </motion.div>
                    ))}

                </div>

                {/* Application List */}
                <div className="rounded-2xl border border-white/10
          bg-white/[0.06] backdrop-blur-xl p-5 md:p-7
          shadow-[0_20px_60px_rgba(0,0,0,0.3)]">

                    <div className="flex flex-col md:flex-row
            justify-between items-start md:items-center gap-4 mb-7">

                        <div>
                            <h2 className="text-2xl font-semibold">
                                Your Applications
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Monitor the progress of your applications.
                            </p>
                        </div>

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-slate-900 border border-white/20
              text-white rounded-lg px-4 py-2 outline-none"
                        >
                            <option value="All">All Applications</option>
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                        </select>

                    </div>

                    {loading ? (
                        <p className="text-center py-12 text-purple-200">
                            Loading your applications...
                        </p>
                    ) : error ? (
                        <p className="text-center py-12 text-red-300">
                            {error}
                        </p>
                    ) : filteredApplications.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-5">—</div>
                            <h3 className="text-xl font-semibold mb-2">
                                No Applications Found
                            </h3>
                            <p className="text-gray-400">
                                {applications.length === 0
                                    ? "You haven't applied for any jobs yet."
                                    : "There are no applications with this status."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {filteredApplications.map((app) => (
                                <motion.div
                                    key={app.application_id}
                                    initial={{ opacity: 0, y: 35 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.15 }}
                                    transition={{ duration: 0.5 }}
                                    whileHover={{
                                        y: -8,
                                        rotateX: 3,
                                        rotateY: -2,
                                        scale: 1.015
                                    }}
                                    style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                                    className="group relative overflow-hidden rounded-xl
                                                border border-white/10 bg-slate-900/70 p-6
                                                transition-all duration-300
                                                hover:border-purple-400/60
                                                hover:shadow-[0_15px_40px_rgba(139,92,246,0.18)]"
                                >

                                    <div className="absolute -top-16 -right-16
                                                    w-40 h-40 bg-purple-600/20 rounded-full
                                                    blur-3xl group-hover:bg-purple-500/30 transition" />

                                    <div className="relative">

                                        <div className="flex justify-between items-start gap-3 mb-4">

                                            <div>
                                                <h3 className="text-xl font-bold mb-2">
                                                    {app.title}
                                                </h3>

                                                <p className="text-purple-200">
                                                    {app.company}
                                                </p>
                                            </div>

                                            <span className={`text-xs px-3 py-1 rounded-full
                        border whitespace-nowrap ${getStatusStyle(app.status)}`}>
                                                {app.status}
                                            </span>

                                        </div>

                                        <p className="text-gray-400 text-sm">
                                            Location: {app.location}
                                        </p>

                                        <div className="border-t border-white/10 mt-5 pt-4">
                                            <p className="text-gray-400 text-xs">
                                                APPLICATION DATE
                                            </p>

                                            <p className="text-sm mt-1">
                                                {new Date(app.application_date).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    }
                                                )}
                                            </p>
                                        </div>

                                        {/* Withdraw Application Button */}
                                        {app.status === "Pending" && (
                                            <button
                                                onClick={() => handleWithdraw(app.application_id)}
                                                className="mt-5 w-full rounded-lg border border-red-400/40
                        bg-red-500/10 px-4 py-2 text-red-300
                        hover:bg-red-500/20 hover:border-red-400
                        transition duration-300"
                                            >
                                                Withdraw Application
                                            </button>
                                        )}

                                    </div>

                                </motion.div>
                            ))}

                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}

export default MyApplications;
