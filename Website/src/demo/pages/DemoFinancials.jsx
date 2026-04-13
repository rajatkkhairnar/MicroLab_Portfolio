import React, { useState } from 'react';
import { IndianRupee, Wallet, CreditCard, TrendingUp, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { transactions, financialStats } from '../data/sampleData';

const DemoFinancials = () => {
    const [filter, setFilter] = useState('all');
    const data = { transactions, stats: financialStats };

    const chartData = [
        { name: 'Cash', value: data.stats.byMode?.Cash || 0, color: '#10B981' },
        { name: 'UPI', value: data.stats.byMode?.UPI || 0, color: '#2563EB' },
        { name: 'Card', value: data.stats.byMode?.Card || 0, color: '#F59E0B' },
    ].filter(item => item.value > 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Financial Overview</h1>
                    <p className="text-sm text-slate-500">Track revenue, dues, and transaction history</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none text-sm">
                        <option value="all">All Time</option>
                        <option value="month">This Month</option>
                        <option value="today">Today</option>
                    </select>
                    <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm">
                        <Download size={16} /> <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-600 p-6 rounded-xl shadow-lg shadow-blue-200 text-white">
                    <p className="text-blue-100 font-medium">Total Revenue Collected</p>
                    <h3 className="text-3xl font-bold mt-2">₹{data.stats.totalRevenue?.toLocaleString() || 0}</h3>
                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-100 bg-blue-500/30 p-2 rounded-lg w-fit">
                        <TrendingUp size={16} />
                        <span>Based on {data.stats.count || 0} invoices</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium">Pending Dues</p>
                            <h3 className="text-2xl font-bold text-red-600 mt-1">₹{data.stats.totalDue?.toLocaleString() || 0}</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <Wallet className="text-red-500" size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-4">Unpaid balances from patients</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium">Net Transactions</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{data.stats.count || 0}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg">
                            <CreditCard className="text-emerald-500" size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-4">Total invoices generated</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ledger Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100"><h2 className="text-lg font-bold text-slate-800">Transaction Ledger</h2></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date / ID</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Mode</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.transactions.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-slate-400">No transactions found</td></tr>
                                ) : (
                                    data.transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-900 block">#{t.id}</span>
                                                <span className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-800">{t.patient_name}</p>
                                                <p className="text-xs text-slate-500">{t.doctor_name ? `Ref: ${t.doctor_name}` : 'Walk-in'}</p>
                                            </td>
                                            <td className="px-6 py-4"><span className="px-2 py-0.5 border rounded text-xs text-slate-600 bg-slate-50">{t.payment_mode}</span></td>
                                            <td className="px-6 py-4 font-mono text-sm">
                                                <span className="text-slate-900 font-bold">₹{t.paid_amount}</span>
                                                {t.total_amount > t.paid_amount && <span className="block text-xs text-red-500">Due: ₹{t.total_amount - t.paid_amount}</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {t.status === 'Paid'
                                                    ? <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">PAID</span>
                                                    : <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded">Due</span>
                                                }
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Payment Modes</h2>
                    <div className="flex-1 min-h-[250px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-slate-400">No data</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoFinancials;
