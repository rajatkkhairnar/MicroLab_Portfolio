import React, { useState } from 'react';
import {
    LayoutDashboard, Users, FlaskConical,
    PackageSearch, IndianRupee, Settings,
    Monitor
} from 'lucide-react';

const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'operations', label: 'Lab Ops', icon: FlaskConical },
    { id: 'inventory', label: 'Inventory', icon: PackageSearch },
    { id: 'financials', label: 'Financials', icon: IndianRupee },
    { id: 'settings', label: 'Settings', icon: Settings },
];

// Static preview representations of each screen
const screenPreviews = {
    dashboard: {
        title: 'Dashboard Overview',
        desc: 'Real-time KPI metrics with revenue charts, patient flow analytics, and an activity feed to keep you in complete control.',
        elements: (
            <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['₹12,400', '24', '3', '₹84,200'].map((val, i) => (
                        <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                            <div className="text-xs text-slate-400 mb-1">{['Revenue', 'Patients', 'Alerts', 'Net Profit'][i]}</div>
                            <div className="text-lg font-bold text-white">{val}</div>
                        </div>
                    ))}
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 h-32 flex items-end gap-1">
                    {[40, 65, 45, 80, 60, 90, 55].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>
        ),
    },
    patients: {
        title: 'Patient Directory',
        desc: 'Search, filter, and manage all patients with UHID tracking, payment status badges, and WhatsApp messaging integration.',
        elements: (
            <div className="space-y-2">
                <div className="flex gap-2 mb-3">
                    <div className="flex-1 bg-slate-700/50 rounded px-3 py-2 text-xs text-slate-400">🔍 Search patients...</div>
                    <div className="bg-slate-700/50 rounded px-3 py-2 text-xs text-slate-400">Filter</div>
                </div>
                {['Ravi Sharma', 'Priya Patel', 'Amit Singh'].map((name, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-300">
                            {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white">{name}</p>
                            <p className="text-xs text-slate-400">UHID-{1001 + i}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${i === 1 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                            {i === 1 ? 'Due ₹500' : 'Paid'}
                        </span>
                    </div>
                ))}
            </div>
        ),
    },
    operations: {
        title: 'Lab Operations',
        desc: 'Track test orders from booking to completion. Enter results, generate reports, and monitor real-time order statuses.',
        elements: (
            <div className="space-y-2">
                {['Complete Blood Count', 'Lipid Profile', 'Thyroid Panel'].map((test, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                        <div className="text-xs font-mono text-slate-400">#{201 + i}</div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white">{test}</p>
                            <p className="text-xs text-slate-400">{['Ravi Sharma', 'Priya Patel', 'Amit Singh'][i]}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${i === 0 ? 'bg-emerald-500/20 text-emerald-300' : i === 1 ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                            {['✓ Completed', '⟳ Processing', '⏳ Pending'][i]}
                        </span>
                    </div>
                ))}
            </div>
        ),
    },
    inventory: {
        title: 'Inventory Management',
        desc: 'Visual stock tracking with progress bars, batch management, expiry alerts, and quick add/consume actions.',
        elements: (
            <div className="space-y-3">
                {[
                    { name: 'Blood Collection Tubes', stock: 85, low: false },
                    { name: 'Reagent Kit A', stock: 25, low: true },
                    { name: 'Microscope Slides', stock: 60, low: false },
                ].map((item, i) => (
                    <div key={i} className="bg-slate-700/30 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-white">{item.name}</span>
                            <span className={`text-xs font-bold ${item.low ? 'text-red-400' : 'text-slate-400'}`}>{item.stock} units</span>
                        </div>
                        <div className="w-full bg-slate-600/50 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${item.low ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${item.stock}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
    financials: {
        title: 'Financial Overview',
        desc: 'Track total revenue, pending dues, payment mode breakdown with pie charts, and a detailed transaction ledger.',
        elements: (
            <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="bg-blue-600/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-blue-300">Revenue</p>
                        <p className="text-lg font-bold text-white">₹1.2L</p>
                    </div>
                    <div className="bg-red-500/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-red-300">Dues</p>
                        <p className="text-lg font-bold text-white">₹8,400</p>
                    </div>
                    <div className="bg-emerald-500/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-emerald-300">Invoices</p>
                        <p className="text-lg font-bold text-white">156</p>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4 py-3">
                    {[
                        { label: 'Cash', pct: 45, color: 'bg-emerald-500' },
                        { label: 'UPI', pct: 35, color: 'bg-blue-500' },
                        { label: 'Card', pct: 20, color: 'bg-amber-500' },
                    ].map((m, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${m.color}`} />
                            <span className="text-xs text-slate-300">{m.label} ({m.pct}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    settings: {
        title: 'Owner Configuration',
        desc: 'Configure lab profile for report headers, manage referral doctor networks with commission rates, dark UI.',
        elements: (
            <div className="space-y-3">
                <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Lab Name</p>
                    <p className="text-sm font-medium text-white">MicroLab Pro Diagnostics</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Registered Doctors</p>
                    <div className="space-y-1 mt-2">
                        {['Dr. Sharma — 10%', 'Dr. Gupta — 15%'].map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-white">{d.split('—')[0]}</span>
                                <span className="text-emerald-400">{d.split('—')[1]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
    },
};

const Screenshots = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const current = screenPreviews[activeTab];

    return (
        <section id="screenshots" className="py-24 px-6 relative">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-3">Application Preview</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        See It In Action
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Explore every module of MicroLab Pro through interactive previews below.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto pb-2 gap-2 mb-10 justify-start sm:justify-center no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            style={{ flexShrink: 0 }}
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Preview Frame */}
                <div className="max-w-3xl mx-auto">
                    <div className="glass-card rounded-2xl overflow-hidden">
                        {/* Window chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="flex items-center gap-2 px-4 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
                                    <Monitor size={12} />
                                    MicroLab Pro — {current.title}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 min-h-[320px]">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-white mb-1">{current.title}</h3>
                                <p className="text-sm text-slate-400">{current.desc}</p>
                            </div>
                            <div className="transition-all duration-300">
                                {current.elements}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Screenshots;
