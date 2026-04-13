import React, { useState } from 'react';
import { Search, Plus, FileDown, MessageCircle, Trash2, Edit, Wallet } from 'lucide-react';
import { patients as samplePatients } from '../data/sampleData';

const DemoPatients = () => {
    const [search, setSearch] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('All');

    const getInitials = (name) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    const filteredPatients = samplePatients.filter(p => {
        const matchesSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.phone.includes(search) ||
            p.uhid.toLowerCase().includes(search.toLowerCase());

        const matchesFilter = paymentFilter === 'All' ||
            (paymentFilter === 'Paid' ? p.total_due <= 0 : p.total_due > 0);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Patient Directory</h1>
                    <p className="text-slate-500">Manage patient records and history</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                        <FileDown size={18} /> <span>Export CSV</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus size={18} /> <span>Add Patient</span>
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by Name, Mobile, or UHID..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                >
                    <option value="All">Payment: All</option>
                    <option value="Paid">Paid</option>
                    <option value="Due">Due</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Profile</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Demographics</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">WhatsApp</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Payment</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredPatients.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No patients found.</td></tr>
                        ) : (
                            filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                                {getInitials(patient.name)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{patient.name}</p>
                                                <p className="text-xs text-slate-500">{patient.uhid}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{patient.age} Y / {patient.gender}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600">{patient.phone}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors" title="Send Report via WhatsApp">
                                            <MessageCircle size={18} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        {patient.total_due > 0 ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Due: ₹{patient.total_due}</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Paid</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        {patient.total_due > 0 && (
                                            <button className="p-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded flex items-center gap-1 px-2 text-xs font-bold" title="Pay Dues">
                                                <Wallet size={14} /> Pay
                                            </button>
                                        )}
                                        <button className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Edit"><Edit size={16} /></button>
                                        <button className="p-1 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
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

export default DemoPatients;
