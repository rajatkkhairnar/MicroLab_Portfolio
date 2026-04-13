/**
 * Login.jsx — Authentication Screen
 * 
 * Full-screen split layout: branded left panel + login form on right.
 * Authenticates users via UserContext.login() → Electron IPC → SQLite.
 * Default credentials are displayed for initial setup convenience.
 */
import React, { useState } from 'react';
import { Microscope, ArrowRight, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Login = () => {
  const { login } = useUser();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await login(formData.username, formData.password);
    if (!res.success) {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl flex overflow-hidden w-[800px] h-[500px]">
        
        {/* Left Side: Brand */}
        <div className="w-1/2 bg-blue-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-6">
              <Microscope size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold">MicroLab Pro</h1>
            <p className="text-blue-100 mt-2">Next-Gen Laboratory Management</p>
          </div>
          <div className="relative z-10 text-sm text-blue-200">
            © 2026 MicroLab Systems. <br/> Offline-First Secure Architecture.
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-1/2 p-12 flex flex-col justify-center bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
              <input 
                type="text" 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <input 
                type="password" 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Login <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-xs text-center text-slate-400">
            <p>Default Owner: <span className="font-mono text-slate-600">admin / admin123</span></p>
            <p>Default Staff: <span className="font-mono text-slate-600">staff / staff123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;