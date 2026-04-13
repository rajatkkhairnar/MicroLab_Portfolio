import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import DemoSidebar from './DemoSidebar';
import DemoDashboard from './pages/DemoDashboard';
import DemoPatients from './pages/DemoPatients';
import DemoLabOps from './pages/DemoLabOps';
import DemoInventory from './pages/DemoInventory';
import DemoFinancials from './pages/DemoFinancials';
import DemoSettings from './pages/DemoSettings';

const DemoApp = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden relative">
            {/* Demo Mode Banner */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-brand-600 to-violet-600 text-white text-center py-1.5 text-xs font-bold tracking-wider demo-pulse">
                🔬 LIVE DEMO MODE — Sample Data Only
            </div>

            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-10 left-3 z-[60] p-2.5 bg-slate-900 text-white rounded-lg shadow-lg shadow-black/30 active:scale-95 transition-transform"
                aria-label="Toggle menu"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-40 w-64 flex-shrink-0 pt-8
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <DemoSidebar onNavClick={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50 pt-8 relative w-full">
                <div className="p-4 lg:p-6 min-h-full">
                    {/* Mobile spacer for hamburger button area */}
                    <div className="h-6 lg:hidden" />
                    <Routes>
                        <Route index element={<DemoDashboard />} />
                        <Route path="patients" element={<DemoPatients />} />
                        <Route path="operations" element={<DemoLabOps />} />
                        <Route path="inventory" element={<DemoInventory />} />
                        <Route path="financials" element={<DemoFinancials />} />
                        <Route path="settings" element={<DemoSettings />} />
                        <Route path="*" element={<Navigate to="/demo" replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default DemoApp;
