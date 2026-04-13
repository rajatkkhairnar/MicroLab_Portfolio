import React from 'react';
import {
    LayoutDashboard, Users, FlaskConical,
    PackageSearch, IndianRupee, Settings
} from 'lucide-react';

const features = [
    {
        icon: LayoutDashboard,
        title: 'Dashboard',
        description: 'Real-time KPI cards, revenue & patient traffic charts with customizable time ranges, and a live activity feed.',
        color: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
    },
    {
        icon: Users,
        title: 'Patient Directory',
        description: 'Full patient management with search, payment filtering, WhatsApp integration, UHID tracking, and due payment handling.',
        color: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
    },
    {
        icon: FlaskConical,
        title: 'Lab Operations',
        description: 'Book tests, enter results, track order status (Pending → Processing → Completed), and generate PDF reports.',
        color: 'from-violet-500 to-purple-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
    },
    {
        icon: PackageSearch,
        title: 'Inventory Management',
        description: 'Track stock levels with visual progress bars, manage batches & expiry dates, low-stock alerts, and SKU support.',
        color: 'from-amber-500 to-orange-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
    },
    {
        icon: IndianRupee,
        title: 'Financial Overview',
        description: 'Revenue tracking, pending dues, payment mode breakdown (Cash/UPI/Card), transaction ledger with export functionality.',
        color: 'from-rose-500 to-pink-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
    },
    {
        icon: Settings,
        title: 'Owner Settings',
        description: 'Configure lab profile for report headers, manage referral doctor network with commission rates, and role-based access.',
        color: 'from-slate-400 to-slate-500',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
    },
];

const Features = () => {
    return (
        <section id="features" className="py-24 px-6 relative">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-3">Powerful Modules</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Everything Your Lab Needs
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Six tightly integrated modules working together to streamline every aspect of your laboratory operations.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={`group glass-card rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-default animate-slide-up stagger-${index + 1}`}
                        >
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.border} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <feature.icon size={24} className={`bg-gradient-to-r ${feature.color} bg-clip-text`} style={{ color: 'inherit' }} />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
