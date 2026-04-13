import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, Users, AlertTriangle, Activity } from 'lucide-react';
import { dashboardStats, chartData, activityFeed } from '../data/sampleData';

const DemoDashboard = () => {
    const stats = dashboardStats;
    const [timeRange, setTimeRange] = useState(7);

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMins = Math.floor((now - date) / 60000);
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
        return date.toLocaleDateString();
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500">Welcome back, Admin 👋</p>
                </div>
                <span className="hidden sm:inline-block bg-white px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 shadow-sm">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <StatCard title="Today's Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={IndianRupee} color="bg-emerald-500" />
                <StatCard title="Patient Flow" value={stats.patientFlow} icon={Users} color="bg-blue-600" />
                <StatCard title="Critical Alerts" value={stats.alerts} icon={AlertTriangle} color="bg-amber-500" />
                <StatCard title="Net Profit (Month)" value={`₹${stats.netProfit.toLocaleString()}`} icon={Activity} color="bg-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
                        <h2 className="text-lg font-bold text-slate-800">Revenue & Patient Traffic</h2>
                        <select
                            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg outline-none focus:border-blue-500"
                            value={timeRange}
                            onChange={(e) => setTimeRange(Number(e.target.value))}
                        >
                            <option value={7}>Last 7 Days</option>
                            <option value={30}>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-56 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#2563EB" fill="url(#colorRev)" name="Revenue (₹)" />
                                <Area yAxisId="right" type="monotone" dataKey="patients" stroke="#10B981" fill="transparent" name="Patients" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Real-time Pulse</h2>
                    <div className="space-y-6">
                        {activityFeed.map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${item.color === 'success' ? 'bg-emerald-500' : item.color === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`} />
                                <div>
                                    <p className="text-sm text-slate-700 font-medium">{item.text}</p>
                                    <p className="text-xs text-slate-400">{formatTime(item.time)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoDashboard;
