import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FlaskConical, Users,
    PackageSearch, IndianRupee, Settings, ArrowLeft, Microscope
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', path: '/demo', icon: LayoutDashboard },
    { name: 'Lab Operations', path: '/demo/operations', icon: FlaskConical },
    { name: 'Patient Directory', path: '/demo/patients', icon: Users },
    { name: 'Inventory', path: '/demo/inventory', icon: PackageSearch },
    { name: 'Financials', path: '/demo/financials', icon: IndianRupee },
    { name: 'Settings', path: '/demo/settings', icon: Settings },
];

const DemoSidebar = ({ onNavClick }) => {
    const navigate = useNavigate();

    return (
        <div className="h-full bg-slate-900 text-white flex flex-col shadow-xl">
            {/* Branding */}
            <div className="p-5 lg:p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Microscope size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">MicroLab Pro</h1>
                    <p className="text-xs text-slate-400">Owner Mode</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 lg:px-4 py-6 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/demo'}
                        onClick={onNavClick}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                            ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }
                        `}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
                <div className="mb-4 px-4">
                    <p className="text-sm text-white font-medium">Admin User</p>
                    <p className="text-xs text-slate-500">Owner Account</p>
                </div>
                <button
                    onClick={() => { onNavClick?.(); navigate('/'); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3
                     text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Portfolio</span>
                </button>
            </div>
        </div>
    );
};

export default DemoSidebar;
