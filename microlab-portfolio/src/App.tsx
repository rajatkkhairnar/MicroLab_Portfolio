import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Page Imports
import LandingPage from './pages/LandindPage';
import DemoLogin from './pages/DemoLogin';

// Demo Layout & Tab Imports
import DashboardLayout from './pages/demo/DashboardLayout';
import Dashboard from './pages/demo/Dashboard';
import Operations from './pages/demo/Operations';
import Patients from './pages/demo/Patients';
import Inventory from './pages/demo/Inventory';
import Financials from './pages/demo/Financials';
import Settings from './pages/demo/Settings';

function App() {
  // State for Theme and Authentication
  // Default to 'true' for Auth during dev if you want to skip login, change to 'false' for production
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Check local storage or system preference for theme on load
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply Theme Class to HTML tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <BrowserRouter>
      <div className="min-h-screen w-full transition-colors duration-300 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-200 dark:selection:bg-blue-900">
        <Routes>
          
          {/* 1. Public Portfolio Landing Page */}
          <Route 
            path="/" 
            element={<LandingPage toggleTheme={toggleTheme} isDark={isDarkMode} />} 
          />
          
          {/* 2. Login / Gatekeeper */}
          <Route 
            path="/demo-login" 
            element={<DemoLogin setAuth={setIsAuthenticated} />} 
          />
          
          {/* 3. Protected Demo Application Routes */}
          <Route 
            path="/app" 
            element={
              isAuthenticated ? (
                <DashboardLayout toggleTheme={toggleTheme} isDark={isDarkMode} />
              ) : (
                <Navigate to="/demo-login" replace />
              )
            }
          >
            {/* Redirect /app to /app/dashboard automatically */}
            <Route index element={<Navigate to="dashboard" replace />} />
            
            {/* The 5 Tab Routes */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="operations" element={<Operations />} />
            <Route path="patients" element={<Patients />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="financials" element={<Financials />} />
            <Route path="settings" element={<Settings />} />
            
            {/* Fallback for broken links inside the app */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Fallback for unknown URLs */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;