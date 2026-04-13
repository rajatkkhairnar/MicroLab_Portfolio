import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Screenshots from '../components/landing/Screenshots';
import TechStack from '../components/landing/TechStack';
import Footer from '../components/landing/Footer';

const Landing = () => {
    return (
        <div className="min-h-screen bg-surface-950">
            <Hero />
            <Features />
            <Screenshots />
            <TechStack />

            {/* Final CTA */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Ready to Explore?
                    </h2>
                    <p className="text-slate-400 mb-8">
                        Try the fully interactive demo — no installation required. Experience every module with realistic sample data.
                    </p>
                    <a
                        href="/verify"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-brand-600/30 hover:shadow-brand-500/40 hover:scale-105"
                    >
                        Launch Live Demo →
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Landing;
