import React, { useState } from 'react';
import { Building2, Stethoscope, ShieldCheck } from 'lucide-react';
import { doctors, labProfile } from '../data/sampleData';

const DemoSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="min-h-full bg-slate-900 text-slate-100 p-6 -m-6 overflow-y-auto">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-8 border-b border-slate-700 pb-6">
                <div className="p-3 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/50">
                    <ShieldCheck size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Owner Configuration</h1>
                    <p className="text-slate-400">Manage lab details and referral network</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap flex-shrink-0
              ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
                    >
                        <Building2 size={20} />
                        <span className="font-medium">Lab Profile</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('doctors')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap flex-shrink-0
              ${activeTab === 'doctors' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
                    >
                        <Stethoscope size={20} />
                        <span className="font-medium">Doctor Management</span>
                    </button>
                </div>

                {/* Content */}
                <div className="lg:col-span-9">
                    {/* Lab Profile */}
                    {activeTab === 'profile' && (
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Building2 className="text-blue-400" /> Lab Report Header
                            </h2>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Lab Name</label>
                                        <div className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white">
                                            {labProfile.labName}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Full Address</label>
                                        <div className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white">
                                            {labProfile.address}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                                        <div className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white">
                                            {labProfile.phone}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                                        <div className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white">
                                            {labProfile.email}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">License No.</label>
                                        <div className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white">
                                            {labProfile.license}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Report Footer Text</label>
                                        <div className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white">
                                            {labProfile.footerText}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-700">
                                    <p className="text-xs text-slate-500 italic">🔒 Settings are read-only in demo mode</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Doctor Management */}
                    {activeTab === 'doctors' && (
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Stethoscope className="text-blue-400" /> Doctor Network
                            </h2>

                            <div className="overflow-hidden rounded-lg border border-slate-700">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-900 text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-sm font-semibold">Doctor Name</th>
                                            <th className="px-4 py-3 text-sm font-semibold">Clinic</th>
                                            <th className="px-4 py-3 text-sm font-semibold">Commission</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700 text-slate-300">
                                        {doctors.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-700/50">
                                                <td className="px-4 py-3 font-medium text-white">{doc.name}</td>
                                                <td className="px-4 py-3">{doc.clinic_name || '-'}</td>
                                                <td className="px-4 py-3 text-emerald-400">{doc.commission_rate}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4">
                                <p className="text-xs text-slate-500 italic">🔒 Doctor management is read-only in demo mode</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DemoSettings;
