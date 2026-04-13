/**
 * Sidebar.jsx — Main Navigation Sidebar
 * 
 * Renders the app's primary navigation with role-based menu filtering.
 * Owner role sees all items; employee role sees only operational items.
 * Includes user info display and logout functionality at the bottom.
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  LayoutDashboard, FlaskConical, Users, 
  PackageSearch, IndianRupee, Settings, LogOut, Microscope 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useUser(); // <--- Get current user

  // Define ALL items
  const allNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, role: 'owner' },
    { name: 'Lab Operations', path: '/operations', icon: FlaskConical, role: 'all' },
    { name: 'Patient Directory', path: '/patients', icon: Users, role: 'all' },
    { name: 'Inventory', path: '/inventory', icon: PackageSearch, role: 'all' },
    // Restricted Items
    { name: 'Financials', path: '/financials', icon: IndianRupee, role: 'owner' },
    { name: 'Settings', path: '/settings', icon: Settings, role: 'owner' },
    

  ];

  // Filter items based on role
  const navItems = allNavItems.filter(item => 
    item.role === 'all' || item.role === user?.role
  );

  return (
    <div className="h-full bg-slate-900 text-white flex flex-col shadow-xl">
      {/* Branding */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Microscope size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">MicroLab Pro</h1>
          <p className="text-xs text-slate-400 capitalize">{user?.role || 'Guest'} Mode</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
           <p className="text-sm text-white font-medium">{user?.name}</p>
           <p className="text-xs text-slate-500 capitalize">{user?.role} Account</p>
        </div>
        <button 
          onClick={logout} // <--- Call Logout
          className="w-full flex items-center justify-center gap-2 px-4 py-3 
                     text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;