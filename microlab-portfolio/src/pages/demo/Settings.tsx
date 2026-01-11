import React, { useState } from 'react';
import { Building2, Users, FileText, Shield, Save, Upload, Image, PenTool } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex h-full gap-6">
      
      {/* --- SETTINGS SIDEBAR --- */}
      <div className="w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 h-fit">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Configuration</h2>
        <div className="space-y-1">
          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<Building2 size={18} />} 
            label="General Profile" 
          />
          <TabButton 
            active={activeTab === 'doctors'} 
            onClick={() => setActiveTab('doctors')} 
            icon={<Users size={18} />} 
            label="Referral Doctors" 
          />
          <TabButton 
            active={activeTab === 'layout'} 
            onClick={() => setActiveTab('layout')} 
            icon={<FileText size={18} />} 
            label="Report Layout" 
          />
          <TabButton 
            active={activeTab === 'roles'} 
            onClick={() => setActiveTab('roles')} 
            icon={<Shield size={18} />} 
            label="User Roles" 
          />
        </div>
      </div>

      {/* --- FORM AREA (General Profile) --- */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">General Profile</h1>
          <p className="text-sm text-slate-500">Manage your lab's identity and branding details.</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <form className="space-y-8 max-w-4xl">
            
            {/* Lab Identity Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-semibold border-l-4 border-blue-500 pl-3">Lab Identity</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <InputGroup label="Lab Name" placeholder="MicroPath Diagnostics" />
                <InputGroup label="License / Reg No." placeholder="GUJ-DL-2024-8892" />
                <InputGroup label="Phone Number" placeholder="+91 98765 43210" type="tel" />
                <InputGroup label="Email Address" placeholder="contact@micropath.com" type="email" />
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Address</label>
                <textarea 
                  rows={3} 
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Shop 104, Galaxy Complex, Near City Hospital, Vadodara, Gujarat - 390001"
                ></textarea>
              </div>
            </section>

            {/* Branding Assets Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-semibold border-l-4 border-purple-500 pl-3">Branding Assets</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Zone */}
                <UploadZone 
                  title="Lab Logo" 
                  desc="Upload PNG or JPG (Max 2MB)" 
                  icon={<Image size={32} className="text-blue-500 mb-2" />} 
                />

                {/* Signature Zone */}
                <UploadZone 
                  title="Digital Signature" 
                  desc="Used for automated reporting" 
                  icon={<PenTool size={32} className="text-purple-500 mb-2" />} 
                />
              </div>
            </section>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">
            <Save size={18} /> Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Helper Components ---

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
    }`}
  >
    {icon}
    {label}
  </button>
);

const InputGroup = ({ label, placeholder, type = "text" }: any) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
    <input 
      type={type} 
      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      placeholder={placeholder}
    />
  </div>
);

const UploadZone = ({ title, desc, icon }: any) => (
  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-blue-400 transition-all group">
    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="font-semibold text-slate-900 dark:text-white">{title}</h4>
    <p className="text-xs text-slate-500 mt-1">{desc}</p>
  </div>
);

export default Settings;