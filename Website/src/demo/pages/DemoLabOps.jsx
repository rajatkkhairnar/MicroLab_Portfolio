import React, { useState } from 'react';
import { Search, Plus, FlaskConical, RefreshCw, CheckCircle2, Clock, Activity } from 'lucide-react';
import { labOrders } from '../data/sampleData';

const DemoLabOps = () => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = labOrders.filter(order => {
        const matchesSearch = !searchTerm ||
            order.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm);
        return matchesSearch;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed':
                return <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Completed</span>;
            case 'Processing':
                return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Activity size={12} /> Processing</span>;
            default:
                return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12} /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Lab Operations</h1>
                    <p className="text-slate-500">Manage test orders and enter results</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50" title="Refresh List">
                        <RefreshCw size={20} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200">
                        <Plus size={18} />
                        <span>Book New Test</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by Patient Name or ID..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setFilter('today')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'today' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                        Today Only
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">ID / Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Tests Requested</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Ref. Doctor</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                    <FlaskConical className="mx-auto mb-2 opacity-50" size={32} />
                                    <p>No active test orders found.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs font-bold text-slate-600">#{order.id}</span>
                                        <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">{order.patient_name}</p>
                                        <p className="text-xs text-slate-500">{order.age} Y / {order.gender}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {order.tests.split(', ').map((test, i) => (
                                                <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">
                                                    {test}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {order.doctor_name || 'Self'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(order.order_status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 font-medium text-sm hover:underline">
                                            Enter Results
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DemoLabOps;
