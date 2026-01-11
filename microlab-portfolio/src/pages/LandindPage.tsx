import { Link } from 'react-router-dom';
import { Monitor, Sun, Moon, Database, Server, Layout, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  toggleTheme: () => void;
  isDark: boolean;
}

const LandingPage = ({ toggleTheme, isDark }: LandingPageProps) => {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                MicroLab Pro
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              >
                {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
              </button>
              <Link 
                to="/demo-login" 
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
              >
                Try Live Demo <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              v1.0 Production Ready
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
              The Ultimate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Offline Lab Manager
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              A lightning-fast, secure, and fully offline Laboratory Information Management System (LIMS). 
              Engineered with <strong>Python</strong> & <strong>CustomTkinter</strong>. Zero cloud fees. 100% Privacy.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/demo-login" className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-bold shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
                <Monitor size={20} /> Launch Online Simulator
              </Link>
              <a href="#" className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                View Source Code
              </a>
            </div>
          </motion.div>

          {/* APP SCREENSHOT PLACEHOLDER */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-16 relative mx-auto border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 border-[8px] rounded-[1.5rem] h-[300px] w-full max-w-[900px] md:h-[500px] shadow-2xl flex items-center justify-center overflow-hidden group"
          >
            <div className="text-slate-400 text-center group-hover:scale-110 transition-transform duration-500">
               <Monitor size={64} className="mx-auto mb-4 opacity-50" />
               <p className="font-mono text-sm">Interactive Dashboard Preview</p>
               <span className="text-xs opacity-60">(Click "Launch Simulator" to view live)</span>
            </div>
            
            {/* Optional: Add a subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Why MicroLab Pro?</h2>
            <p className="text-slate-500 dark:text-slate-400">Engineered for speed, privacy, and reliability.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Database className="text-blue-500" />}
              title="Local Database"
              desc="100% Data Privacy. Your patients' data never leaves your computer. Powered by SQLite for instant retrieval."
            />
            <FeatureCard 
              icon={<Server className="text-emerald-500" />}
              title="Machine Interfacing"
              desc="Auto-fetch results from CBC machines via RS232 or TCP. Includes built-in ESP32 Listener logic."
            />
            <FeatureCard 
              icon={<Layout className="text-purple-500" />}
              title="Native Performance"
              desc="Clean, dark-mode ready interface built with CustomTkinter. Runs directly on the OS without browser lag."
            />
          </div>
        </div>
      </section>

      {/* --- DEVELOPER BIO --- */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
             {/* Replace with your image later */}
             <span className="text-4xl">👨‍💻</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Built by Rajat K. Khairnar</h2>
            <p className="text-blue-600 font-medium mb-4">Python Developer</p>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              With over 1 years of experience in system architecture and automation, 
              I specialize in building robust tools that solve real-world problems. 
              MicroLab Pro is a testament to efficient, offline-first software engineering.
            </p>
            <div className="flex flex-wrap gap-2">
              <SkillBadge name="Python" />
              <SkillBadge name="React" />
              <SkillBadge name="IoT / Embedded" />
              <SkillBadge name="SQLite" />
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <p>© 2026 MicroLab Pro Portfolio. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Helper Components
const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 group">
    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

const SkillBadge = ({ name }: { name: string }) => (
  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold flex items-center gap-1">
    <CheckCircle2 size={12} className="text-blue-500" /> {name}
  </span>
);

export default LandingPage;