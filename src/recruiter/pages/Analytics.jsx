
import React, { useEffect, useState } from 'react';
import { API_URL } from "../../config";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from 'recharts';

const Analytics = () => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [stats, setStats] = useState({
        totalJobs: 0,
        totalApplicants: 0,
        shortlisted: 0,
        hired: 0
    });

    const [monthlyApplications, setMonthlyApplications] = useState([]);
    const [applicationStatus, setApplicationStatus] = useState([]);
    const [jobPerformance, setJobPerformance] = useState([]);
    const [recruitmentFunnel, setRecruitmentFunnel] = useState([]);

    const COLORS = [
        '#A78BFA',
        '#60A5FA',
        '#34D399',
        '#F87171',
        '#FBBF24',
    ];

    const statCards = [
        { title: 'Total Jobs', value: stats.totalJobs },
        { title: 'Total Applicants', value: stats.totalApplicants },
        { title: 'Shortlisted', value: stats.shortlisted },
        { title: 'Candidates Hired', value: stats.hired },
    ];


    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Please login as a recruiter.');
                }

                const response = await fetch(
                    `${API_URL}/api/recruiter/analytics`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Failed to load analytics.');
                }

                setStats({
                    totalJobs: Number(data.stats.totalJobs) || 0,
                    totalApplicants: Number(data.stats.totalApplicants) || 0,
                    shortlisted: Number(data.stats.shortlisted) || 0,
                    hired: Number(data.stats.hired) || 0,
                });

                setMonthlyApplications(data.monthlyApplications || []);
                setApplicationStatus(data.applicationStatus || []);
                setJobPerformance(data.jobPerformance || []);
                setRecruitmentFunnel(data.recruitmentFunnel || []);

            } catch (err) {
                console.error('Analytics error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                Loading analytics...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 text-red-400 flex items-center justify-center">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 md:p-8">

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-3xl font-bold">
                    Analytics & Reports
                </h1>

                <p className="text-gray-400 mt-2">
                    Track your recruitment performance and hiring insights.
                </p>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                    {statCards.map((stat) => (
                        <div
                            key={stat.title}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                        >
                            <p className="text-gray-400 text-sm">
                                {stat.title}
                            </p>

                            <h2 className="text-3xl font-bold mt-3">
                                {stat.value}
                            </h2>

                            <p className="text-gray-500 text-sm mt-2">
                                Live database data
                            </p>
                        </div>
                    ))}

                </div>

                {/* Monthly Applications - Line Chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold">
                            Application Trends
                        </h2>

                        <p className="text-gray-400 text-sm mt-1">
                            Monthly applications received
                        </p>
                    </div>

                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyApplications}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                                <XAxis
                                    dataKey="month"
                                    stroke="#9CA3AF"
                                />

                                <YAxis stroke="#9CA3AF" />

                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#111827',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        color: '#fff',
                                    }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="applications"
                                    name="Applications"
                                    stroke="#A78BFA"
                                    strokeWidth={3}
                                    dot={{ r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Application Status - Pie Chart */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

                        <h2 className="text-xl font-semibold">
                            Application Status
                        </h2>

                        <p className="text-gray-400 text-sm mt-1">
                            Candidate application distribution
                        </p>

                        <div className="w-full h-80 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={applicationStatus}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={105}
                                        innerRadius={55}
                                        paddingAngle={4}
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                    >
                                        {applicationStatus.map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#111827',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#fff',
                                        }}
                                    />

                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Job Performance - Bar Chart */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

                        <h2 className="text-xl font-semibold">
                            Job Performance
                        </h2>

                        <p className="text-gray-400 text-sm mt-1">
                            Applicants received per job position
                        </p>

                        <div className="w-full h-80 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={jobPerformance}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#374151"
                                    />

                                    <XAxis
                                        dataKey="job"
                                        stroke="#9CA3AF"
                                        angle={-15}
                                        textAnchor="end"
                                        height={65}
                                        interval={0}
                                        fontSize={11}
                                    />

                                    <YAxis stroke="#9CA3AF" />

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#111827',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#fff',
                                        }}
                                    />

                                    <Bar
                                        dataKey="applicants"
                                        name="Applicants"
                                        fill="#8B5CF6"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Recruitment Funnel */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

                    <h2 className="text-xl font-semibold">
                        Recruitment Funnel
                    </h2>

                    <p className="text-gray-400 text-sm mt-1 mb-6">
                        Candidate progression through hiring stages
                    </p>

                    <div className="space-y-5">
                        {recruitmentFunnel.map((stage) => {
                            const maxCandidates = recruitmentFunnel[0]?.candidates || 0;

                            const percentage =
                                maxCandidates > 0
                                    ? (stage.candidates / maxCandidates) * 100
                                    : 0;

                            return (
                                <div key={stage.stage}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-300">
                                            {stage.stage}
                                        </span>

                                        <span className="text-white font-medium">
                                            {stage.candidates}
                                        </span>
                                    </div>

                                    <div className="w-full bg-gray-800 rounded-full h-3">
                                        <div
                                            className="bg-purple-500 h-3 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Analytics;
