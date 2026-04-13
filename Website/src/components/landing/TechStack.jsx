import React from 'react';

const techItems = [
    { name: 'React 18', icon: '⚛️', desc: 'Component-driven UI' },
    { name: 'Electron', icon: '🖥️', desc: 'Cross-platform desktop' },
    { name: 'SQLite', icon: '🗄️', desc: 'Offline-first database' },
    { name: 'Tailwind CSS', icon: '🎨', desc: 'Utility-first styling' },
    { name: 'Vite', icon: '⚡', desc: 'Lightning-fast bundler' },
    { name: 'Recharts', icon: '📊', desc: 'Data visualizations' },
];

const TechStack = () => {
    return (
        <section className="py-24 px-6 relative">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-3">Built With</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Modern Tech Stack</h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Powered by battle-tested technologies for reliability, performance, and developer experience.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {techItems.map((tech, i) => (
                        <div
                            key={tech.name}
                            className="glass-card rounded-xl p-5 text-center hover:scale-105 transition-all duration-300 group cursor-default"
                        >
                            <div className="text-3xl mb-3">{tech.icon}</div>
                            <p className="text-sm font-bold text-white mb-1">{tech.name}</p>
                            <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">{tech.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TechStack;
