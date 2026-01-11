import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, Users, AlertTriangle, TrendingUp, Clock, FileText } from 'lucide-react';

const data = [
  { name: 'Dec 26', traffic: 40, revenue: 2400 },
  { name: 'Dec 27', traffic: 30, revenue: 1398 },
  { name: 'Dec 28', traffic: 20, revenue: 9800 },
  { name: 'Dec 29', traffic: 27, revenue: 3908 },
  { name: 'Dec 30', traffic: 18, revenue: 4800 },
  { name: 'Dec 31', traffic: 23, revenue: 3800 },
  { name: 'Jan 01', traffic: 34, revenue: 4300 },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Today's Revenue" value="₹ 12,450" change="+12% vs yesterday" icon={<IndianRupee />} color="green" />
        <KpiCard title="Patient Flow" value="42" change="+5% vs yesterday" icon={<Users />} color="blue" />
        <KpiCard title="Critical Inventory" value="0 Alerts" change="All systems normal" icon={<AlertTriangle />} color="gray" />
        <KpiCard title="Net Profit (Mo)" value="₹ 3.2L" change="+8% vs last month" icon={<TrendingUp />} color="emerald" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[400px]">
        {/* Main Analytics Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Analytics Overview</h3>
            <select className="bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-sm px-3 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94A3B8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94A3B8'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="traffic" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Pulse */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold mb-4">Operational Pulse</h3>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
             <PulseItem title="Low Stock: Reagent Kit B" time="2m ago" type="alert" />
             <PulseItem title="Invoice #1024 Paid" time="15m ago" type="success" />
             <PulseItem title="New Patient Registered" time="32m ago" type="info" />
             <PulseItem title="Dr. Sharma Login" time="1h ago" type="neutral" />
             <PulseItem title="QC Check Passed: Cell Counter" time="2h ago" type="success" />
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, change, icon, color }: any) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-start justify-between hover:translate-y-[-2px] transition-transform">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{value}</h3>
      <p className={`text-xs font-semibold ${change.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>{change}</p>
    </div>
    <div className={`p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
      {icon}
    </div>
  </div>
);

const PulseItem = ({ title, time, type }: any) => {
  const colors: any = { alert: 'bg-red-100 text-red-600', success: 'bg-emerald-100 text-emerald-600', info: 'bg-blue-100 text-blue-600', neutral: 'bg-slate-100 text-slate-600' };
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer">
      <div className={`w-2 h-2 rounded-full ${type === 'alert' ? 'bg-red-500' : type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
};

export default Dashboard;