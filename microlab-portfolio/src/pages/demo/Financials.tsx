import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { Download, CreditCard, Banknote } from 'lucide-react';

const revData = [
  { name: 'Mon', revenue: 4000, expense: 2400 },
  { name: 'Tue', revenue: 3000, expense: 1398 },
  { name: 'Wed', revenue: 2000, expense: 5800 },
  { name: 'Thu', revenue: 2780, expense: 3908 },
  { name: 'Fri', revenue: 1890, expense: 4800 },
];

const pieData = [
  { name: 'UPI', value: 55, color: '#3B82F6' },
  { name: 'Card', value: 23, color: '#8B5CF6' },
  { name: 'Cash', value: 22, color: '#10B981' },
];

const Financials = () => {
  return (
    <div className="space-y-6">
       {/* Header Controls */}
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Financial Overview</h1>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Download size={18}/> Export GST</button>
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700">Close Day / Tally</button>
          </div>
       </div>

       {/* Financial Cards */}
       <div className="grid grid-cols-4 gap-4">
          <FinCard title="Gross Revenue" value="₹ 4.50L" sub="Cash: 1L | UPI: 3.5L" color="blue" />
          <FinCard title="Total Expenses" value="₹ 1.20L" sub="Click for breakdown" color="red" />
          <FinCard title="Net Profit" value="₹ 3.30L" sub="Healthy Margin" color="emerald" />
          <FinCard title="Referral Payouts" value="₹ 45,000" sub="Pending Settlements" color="orange" />
       </div>

       {/* Charts Row */}
       <div className="grid grid-cols-3 gap-6 h-80">
          <div className="col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
             <h3 className="font-bold mb-4">Revenue vs Expense</h3>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} />
                   <Tooltip cursor={{fill: 'transparent'}} />
                   <Bar dataKey="revenue" fill="#3B82F6" radius={[4,4,0,0]} />
                   <Bar dataKey="expense" fill="#EF4444" radius={[4,4,0,0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center">
             <h3 className="font-bold mb-4 w-full text-left">Payment Modes</h3>
             <PieChart width={200} height={200}>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                   {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                </Pie>
                <Tooltip />
             </PieChart>
             <div className="flex gap-4 text-xs mt-4">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> UPI 55%</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Card 23%</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Cash 22%</div>
             </div>
          </div>
       </div>
    </div>
  );
};

const FinCard = ({ title, value, sub, color }: any) => (
  <div className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border-l-4 border-${color}-500 shadow-sm`}>
     <p className="text-slate-500 text-sm font-medium">{title}</p>
     <h3 className="text-2xl font-bold my-1">{value}</h3>
     <p className="text-xs text-slate-400">{sub}</p>
  </div>
);

export default Financials;