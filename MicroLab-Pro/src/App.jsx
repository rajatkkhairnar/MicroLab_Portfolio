/**
 * App.jsx — Root Application Component
 * 
 * Handles the overall app structure:
 * - Wraps everything in UserProvider for global auth state
 * - Defines route-based access control (owner vs employee roles)
 * - Renders Sidebar + Content layout for authenticated pages
 * - Redirects unauthenticated users to the login page
 */
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { UserProvider, useUser } from './context/UserContext';
import { LicenseProvider } from './context/LicenseContext';

// Page Imports
import Dashboard from './pages/Dashboard';
import PatientDirectory from './pages/PatientDirectory';
import LabOperations from './pages/LabOperations';
import Inventory from './pages/Inventory';
import Financials from './pages/Financials';
import Settings from './pages/Settings';
import TestDirectory from './pages/TestDirectory';
import Login from './pages/Login';

/**
 * ProtectedRoute — Route guard component
 * Redirects to /login if no user session exists.
 * If requiredRole is set (e.g. 'owner'), non-matching roles are redirected to /operations.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useUser();
  
  if (!user) return <Navigate to="/login" />;
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/operations" replace />;
  }

  return children;
};

/**
 * AppLayout — Sidebar + main content wrapper
 * Provides the consistent layout shell for all authenticated pages.
 */
const AppLayout = ({ children }) => (
  <div className="flex h-screen bg-slate-50 overflow-hidden">
    <div className="w-64 flex-shrink-0">
      <Sidebar />
    </div>
    <main className="flex-1 overflow-y-auto bg-slate-50 relative">
      <div className="p-6 min-h-full">
        {children}
      </div>
    </main>
  </div>
);

/** App — Top-level component that wraps routes in the auth provider */
function App() {
  return (
    <UserProvider>
      <LicenseProvider>
        <MainRoutes />
      </LicenseProvider>
    </UserProvider>
  );
}

/**
 * MainRoutes — Determines which layout to render based on current path.
 * Login page gets its own full-screen layout (no sidebar).
 * All other pages are wrapped in AppLayout with the sidebar.
 */
const MainRoutes = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {isLoginPage ? (
        <Routes>
           <Route path="/login" element={<Login />} />
        </Routes>
      ) : (
        <AppLayout>
          <Routes>
            {/* Accessible by all authenticated users */}
            <Route path="/" element={<ProtectedRoute requiredRole="owner"><Dashboard /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><PatientDirectory /></ProtectedRoute>} />
            <Route path="/operations" element={<ProtectedRoute><LabOperations /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/test-directory" element={<ProtectedRoute><TestDirectory /></ProtectedRoute>} />
            
            {/* Owner-only restricted routes */}
            <Route path="/financials" element={
              <ProtectedRoute requiredRole="owner">
                <Financials />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requiredRole="owner">
                <Settings />
              </ProtectedRoute>
            } />

            {/* Catch-all: redirect unknown paths to lab operations */}
            <Route path="*" element={<Navigate to="/operations" replace />} />
          </Routes>
        </AppLayout>
      )}
    </>
  );
};

export default App;