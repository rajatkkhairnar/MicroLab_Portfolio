import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, flask, Users, BadgeIndianRupee, Package, 
  Settings, LogOut, Search, Bell, UserCircle 
} from 'lucide-react';

interface DashboardLayoutProps {
  toggleTheme: () => void;
  isDark: boolean;
}

const DashboardLayout = ({ toggleTheme, isDark }: DashboardLayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In real app, clear auth tokens here
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-lg">
        {/* Branding */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-900">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">M</div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            MicroLab Pro
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavItem to="/app/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/app/operations" icon={<flask size={20} />} label="Lab Operations" />
          <NavItem to="/app/patients" icon={<Users size={20} />} label="Patient Directory" />
          <NavItem to="/app/inventory" icon={<Package size={20} />} label="Inventory" />
          <NavItem to="/app/financials" icon={<BadgeIndianRupee size={20} />} label="Financials" />
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            <NavItem to="/app/settings" icon={<Settings size={20} />} label="Settings" />
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-900">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10">
          {/* Welcome Msg */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Welcome back, Admin 👋</h2>
            <p className="text-xs text-slate-500">Vadodara Main Branch</p>
          </div>

          {/* Global Search */}
          <div className="flex-1 max-w-md mx-8 relative hidden md:block">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Global Search (Patients, Tests, IDs)..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
            <button onClick={toggleTheme} className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 pr-3 rounded-full transition-colors">
               <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                 <UserCircle size={20} />
               </div>
               <span className="text-sm font-medium hidden sm:block">Dr. Admin</span>
            </button>
          </div>
        </header>

        {/* Tab Content Injection Point */}
        <main className="flex-1 overflow-auto p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Helper for Sidebar Links
const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default DashboardLayout;