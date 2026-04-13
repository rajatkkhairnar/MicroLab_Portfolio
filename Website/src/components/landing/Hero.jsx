import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Microscope, Zap, Shield, Wifi, ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-screen flex items-center justify-center hero-gradient grid-pattern overflow-hidden">
            {/* Floating decorative elements */}
            <div className="hidden md:block absolute top-20 left-10 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl animate-float" />
            <div className="hidden md:block absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float-delayed" />
            <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8 animate-fade-in">
                    <Sparkles size={16} className="text-brand-400" />
                    <span className="text-sm font-medium text-brand-300">Offline-First Desktop Application</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black leading-tight mb-6 animate-slide-up">
                    Next-Gen{' '}
                    <span className="gradient-text">Laboratory</span>
                    <br />
                    Management System
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-slide-up stagger-2">
                    MicroLab Pro is a powerful, offline-first LIMS built with React & Electron.
                    Manage patients, lab operations, inventory, financials — all from a single desktop app.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-slide-up stagger-3">
                    <button
                        onClick={() => navigate('/verify')}
                        className="group flex items-center gap-3 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-brand-600/30 hover:shadow-brand-500/40 hover:scale-105"
                    >
                        <Microscope size={22} />
                        <span>Try Live Demo</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a
                        href="#features"
                        className="flex items-center gap-2 px-8 py-4 text-slate-300 hover:text-white font-medium rounded-xl border border-slate-700 hover:border-slate-500 transition-all duration-300"
                    >
                        Explore Features
                    </a>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-12 sm:mt-20 max-w-xl mx-auto animate-slide-up stagger-4">
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-2">
                            <Zap size={20} className="text-amber-400" />
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-white">6</p>
                        <p className="text-xs text-slate-400 mt-1">Core Modules</p>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-2">
                            <Wifi size={20} className="text-emerald-400" />
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-white">100%</p>
                        <p className="text-xs text-slate-400 mt-1">Offline-First</p>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-2">
                            <Shield size={20} className="text-brand-400" />
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-white">RBAC</p>
                        <p className="text-xs text-slate-400 mt-1">Role-Based Access</p>
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-950 to-transparent" />
        </section>
    );
};

export default Hero;
