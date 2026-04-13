/**
 * UserContext.jsx — Global Authentication Context
 * 
 * Provides user session state (login/logout) to the entire app.
 * - Persists login state in localStorage so sessions survive page refreshes
 * - Automatically redirects to /login if no stored session is found
 * - Exposes { user, login, logout } to consuming components via useUser()
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Shape: { name, role: 'owner' | 'employee' }
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * login — Authenticates a user via the Electron IPC bridge.
   * On success, persists the user object and navigates to the dashboard.
   */
  const login = async (username, password) => {
    try {
      const result = await window.api.login(username, password);
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        navigate('/');
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Login Error' };
    }
  };

  /** logout — Clears session and redirects to login screen */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Restore session on app launch from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else if (location.pathname !== '/login') {
      navigate('/login');
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

/** Custom hook for consuming auth state in any component */
export const useUser = () => useContext(UserContext);