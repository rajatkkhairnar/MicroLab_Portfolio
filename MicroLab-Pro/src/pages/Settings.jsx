/**
 * Settings.jsx — Owner Configuration Panel
 * 
 * Admin-only settings page with four tabs:
 * 
 *   1. Lab Profile — Lab name, address, phone numbers, logo upload,
 *      lab assistant/technician names, report footer text, lab timing.
 *      All fields are saved to the SQLite 'settings' table as key-value pairs.
 * 
 *   2. Doctor Management — CRUD for referring doctors used in test bookings.
 *      Supports inline editing and commission rate tracking.
 * 
 *   3. Test Settings — Toggle tests on/off, set custom pricing,
 *      expand each test to configure individual parameters (enable/disable,
 *      customize reference ranges). Merges user overrides with testCatalog defaults.
 * 
 *   4. Software Update — Check for updates via electron-updater,
 *      download and install updates from GitHub Releases (owner-only).
 */
import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  Stethoscope,
  Trash2,
  Loader2,
  ShieldCheck,
  Edit,
  X,
  Check,
  FlaskConical,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Download,
  RefreshCw,
  DownloadCloud,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DEFAULT_TESTS } from '../utils/defaultTests';
import { TEST_CATALOG } from '../utils/testCatalog';
import { useUser } from '../context/UserContext';

const Settings = () => {
  const { user } = useUser();
  const isAdmin = user?.role === 'owner';
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- Software Update State ---
  const [appVersion, setAppVersion] = useState('');
  const [updateStatus, setUpdateStatus] = useState(null); // { status, version, percent, message }

  // --- Lab Profile State ---
  const [labProfile, setLabProfile] = useState({
    labName: 'MICROLAB PRO DIAGNOSTICS',
    address: '',
    phone: '',
    phone2: '',
    labAssistant: '',
    labTechnician: '',
    footerText: '*** End of Report ***'
  });

  // --- Validation Errors ---
  const [errors, setErrors] = useState({});

  // --- Doctor Management State ---
  const [doctors, setDoctors] = useState([]);
  const [newDoctor, setNewDoctor] = useState({ name: '', clinic: '', rate: '' });
  const [doctorError, setDoctorError] = useState('');
  const [editingDoctor, setEditingDoctor] = useState(null); // { id, name, clinic, rate }

  // --- Test Pricing State ---
  const [testPricingList, setTestPricingList] = useState([]);

  // --- Test Parameter Settings State ---
  const [testParamSettings, setTestParamSettings] = useState({}); // { testName: { paramName: { enabled, ref } } }
  const [expandedTest, setExpandedTest] = useState(null); // which test row is expanded

  // --- Load Data ---
  useEffect(() => {
    loadSettings();
    // Load app version
    if (window.api.getAppVersion) {
      window.api.getAppVersion().then(v => setAppVersion(v));
    }
    // Listen for update events from main process
    let cleanup;
    if (window.api.onUpdateStatus) {
      cleanup = window.api.onUpdateStatus((data) => {
        setUpdateStatus(data);
      });
    }
    return () => { if (cleanup) cleanup(); };
  }, []);

  const loadSettings = async () => {
    try {
      const [settings, docs] = await Promise.all([
        window.api.getLabProfile(),
        window.api.getDoctors()
      ]);

      // Convert settings array [{key: 'labName', value: 'X'}] to object
      const profileObj = {};
      settings.forEach(item => {
        profileObj[item.key] = item.value;
      });

      // Merge with defaults to avoid blank fields on first run
      setLabProfile(prev => ({ ...prev, ...profileObj }));
      setDoctors(docs);
      
      if (profileObj.testPricing) {
        setTestPricingList(JSON.parse(profileObj.testPricing));
      } else {
        setTestPricingList(DEFAULT_TESTS.map(t => ({...t, enabled: true})));
      }

      // Load parameter-level settings
      if (profileObj.testParamSettings) {
        setTestParamSettings(JSON.parse(profileObj.testParamSettings));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Validation Helpers ---
  const isValidLabName = (val) => /^[a-zA-Z\s\-']+$/.test(val);
  const isValidPhone = (val) => /^\d{0,10}$/.test(val);
  const isValidDoctorName = (val) => /^[a-zA-Z\s.\-']+$/.test(val);

  // --- Handlers: Lab Profile ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };

    // Field-specific validation
    if (name === 'labName') {
      if (value === '' || isValidLabName(value)) {
        setLabProfile({ ...labProfile, [name]: value });
        delete newErrors.labName;
      } else {
        newErrors.labName = "Only letters, spaces, hyphens (-) and apostrophes (') allowed";
      }
    } else if (name === 'phone' || name === 'phone2') {
      if (isValidPhone(value)) {
        setLabProfile({ ...labProfile, [name]: value });
        delete newErrors[name];
      } else {
        newErrors[name] = 'Only digits allowed, max 10';
      }
    } else {
      setLabProfile({ ...labProfile, [name]: value });
    }

    setErrors(newErrors);
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    // Final validation before save
    const newErrors = {};
    if (labProfile.labName && !isValidLabName(labProfile.labName)) {
      newErrors.labName = "Only letters, spaces, hyphens (-) and apostrophes (') allowed";
    }
    if (labProfile.phone && labProfile.phone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }
    if (labProfile.phone2 && labProfile.phone2.length !== 10) {
      newErrors.phone2 = 'Phone number must be exactly 10 digits';
    }


    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await window.api.saveLabProfile(labProfile);
      setTimeout(() => setSubmitting(false), 500);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  // --- Handlers: Doctor Name Validation ---
  const handleDoctorNameInput = (value, setter, currentObj, field = 'name') => {
    if (value === '' || isValidDoctorName(value)) {
      setter({ ...currentObj, [field]: value });
      setDoctorError('');
    } else {
      setDoctorError('Doctor name: only letters, spaces, dots (.) and hyphens (-) allowed');
    }
  };

  // --- Handlers: Doctors ---
  const addDoctor = async (e) => {
    e.preventDefault();
    if (!newDoctor.name) return;
    if (!isValidDoctorName(newDoctor.name)) {
      setDoctorError('Doctor name: only letters, spaces, dots (.) and hyphens (-) allowed');
      return;
    }

    await window.api.addDoctor(newDoctor);
    setNewDoctor({ name: '', clinic: '', rate: '' });
    setDoctorError('');
    const docs = await window.api.getDoctors();
    setDoctors(docs);
  };

  const deleteDoctor = async (id) => {
    if (confirm('Are you sure you want to remove this doctor?')) {
      await window.api.deleteDoctor(id);
      const docs = await window.api.getDoctors();
      setDoctors(docs);
    }
  };

  const startEditDoctor = (doc) => {
    setEditingDoctor({
      id: doc.id,
      name: doc.name,
      clinic: doc.clinic_name || '',
      rate: doc.commission_rate || ''
    });
    setDoctorError('');
  };

  const cancelEditDoctor = () => {
    setEditingDoctor(null);
    setDoctorError('');
  };

  const saveEditDoctor = async () => {
    if (!editingDoctor.name) return;
    if (!isValidDoctorName(editingDoctor.name)) {
      setDoctorError('Doctor name: only letters, spaces, dots (.) and hyphens (-) allowed');
      return;
    }
    await window.api.updateDoctor(editingDoctor);
    setEditingDoctor(null);
    setDoctorError('');
    const docs = await window.api.getDoctors();
    setDoctors(docs);
  };

  // --- Handlers: Test Parameter Settings ---
  const getParamSetting = (testName, paramName, field) => {
    const overrides = testParamSettings[testName];
    if (overrides && overrides[paramName] && overrides[paramName][field] !== undefined) {
      return overrides[paramName][field];
    }
    // defaults
    if (field === 'enabled') return true;
    const catalogParams = TEST_CATALOG[testName] || [];
    const p = catalogParams.find(cp => cp.name === paramName);
    if (field === 'ref') return p ? p.ref : '';
    return undefined;
  };

  const setParamSetting = (testName, paramName, field, value) => {
    setTestParamSettings(prev => ({
      ...prev,
      [testName]: {
        ...(prev[testName] || {}),
        [paramName]: {
          ...(prev[testName]?.[paramName] || {}),
          [field]: value
        }
      }
    }));
  };

  const resetParamToDefault = (testName, paramName) => {
    setTestParamSettings(prev => {
      const updated = { ...prev };
      if (updated[testName]) {
        const testOverrides = { ...updated[testName] };
        delete testOverrides[paramName];
        if (Object.keys(testOverrides).length === 0) {
          delete updated[testName];
        } else {
          updated[testName] = testOverrides;
        }
      }
      return updated;
    });
  };

  const saveTestPricing = async () => {
    setSubmitting(true);
    try {
      await window.api.saveLabProfile({ 
        testPricing: JSON.stringify(testPricingList),
        testParamSettings: JSON.stringify(testParamSettings)
      });
      setTimeout(() => setSubmitting(false), 500);
      alert('Test settings saved successfully!');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      alert('Failed to save test settings.');
    }
  };

  // Reusable input style
  const inputClass = "w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none";
  const inputClassError = "w-full bg-slate-900 border border-red-500 rounded-lg px-4 py-2 text-white focus:border-red-400 outline-none";

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 p-6 -m-6 overflow-y-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8 border-b border-slate-700 pb-6">
        <div className="p-3 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/50">
          <ShieldCheck size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Owner Configuration</h1>
          <p className="text-slate-400">Manage lab details and referral network</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar Navigation (Internal) */}
        <div className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <Building2 size={20} />
            <span className="font-medium">Lab Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${activeTab === 'doctors' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <Stethoscope size={20} />
            <span className="font-medium">Doctor Management</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${activeTab === 'tests' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <FlaskConical size={20} />
            <span className="font-medium">Test Settings</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('update')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${activeTab === 'update' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <Download size={20} />
              <span className="font-medium">Software Update</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">

          {/* SECTION 1: LAB PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Building2 className="text-blue-400" /> Lab Report Header
              </h2>

              <form onSubmit={saveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-2 flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium text-slate-400 mb-2">Lab Logo</label>
                      {labProfile.labLogo ? (
                        <div className="relative w-24 h-24 bg-white rounded-lg border border-slate-600 flex items-center justify-center p-2 group">
                          <img src={labProfile.labLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setLabProfile({ ...labProfile, labLogo: '' })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center hover:border-blue-500 transition-colors relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setLabProfile({ ...labProfile, labLogo: reader.result });
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="text-center pointer-events-none">
                            <span className="text-2xl text-slate-400 block">+</span>
                            <span className="text-xs text-slate-500">Upload</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Lab Name (Appears at top)</label>
                      <input
                        name="labName"
                        value={labProfile.labName}
                        onChange={handleProfileChange}
                        className={errors.labName ? inputClassError + ' py-3 focus:ring-1 focus:ring-red-500' : inputClass + ' py-3 focus:ring-1 focus:ring-blue-500'}
                      />
                      {errors.labName && <p className="text-red-400 text-xs mt-1">{errors.labName}</p>}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Full Address</label>
                    <textarea
                      name="address"
                      value={labProfile.address}
                      onChange={handleProfileChange}
                      rows="2"
                      className={inputClass + ' py-3'}
                    ></textarea>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Lab Timing</label>
                    <input
                      name="labTiming"
                      value={labProfile.labTiming || ''}
                      onChange={handleProfileChange}
                      placeholder="e.g. Mon-Sat: 8:00 AM - 8:00 PM, Sun: Closed"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                    <input
                      name="phone"
                      value={labProfile.phone}
                      onChange={handleProfileChange}
                      placeholder="10-digit number"
                      maxLength={10}
                      className={errors.phone ? inputClassError : inputClass}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number 2</label>
                    <input
                      name="phone2"
                      value={labProfile.phone2}
                      onChange={handleProfileChange}
                      placeholder="10-digit number"
                      maxLength={10}
                      className={errors.phone2 ? inputClassError : inputClass}
                    />
                    {errors.phone2 && <p className="text-red-400 text-xs mt-1">{errors.phone2}</p>}
                  </div>



                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Lab Assistant Name</label>
                    <input name="labAssistant" value={labProfile.labAssistant} onChange={handleProfileChange} placeholder="e.g. A.K. Kokani (DMLT)" className={inputClass} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Lab Technician Name</label>
                    <input name="labTechnician" value={labProfile.labTechnician} onChange={handleProfileChange} placeholder="e.g. P. H. Rana (M.SC.MLT)" className={inputClass} />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Report Footer Text</label>
                    <input name="footerText" value={labProfile.footerText} onChange={handleProfileChange} className={inputClass} />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || Object.keys(errors).length > 0}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {submitting ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECTION 2: DOCTOR MANAGEMENT */}
          {activeTab === 'doctors' && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Stethoscope className="text-blue-400" /> Doctor Network
              </h2>

              {/* Error Message */}
              {doctorError && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                  {doctorError}
                </div>
              )}

              {/* Add New Form */}
              <form onSubmit={addDoctor} className="bg-slate-900 p-4 rounded-lg border border-slate-600 mb-6 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs text-slate-400 uppercase font-bold">Doctor Name</label>
                  <input
                    placeholder="e.g. Dr. Sharma"
                    value={newDoctor.name}
                    onChange={(e) => handleDoctorNameInput(e.target.value, setNewDoctor, newDoctor)}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white mt-1 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="text-xs text-slate-400 uppercase font-bold">Clinic / Hospital</label>
                  <input
                    placeholder="e.g. City Hospital"
                    value={newDoctor.clinic}
                    onChange={(e) => setNewDoctor({ ...newDoctor, clinic: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white mt-1 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="w-full md:w-32">
                  <label className="text-xs text-slate-400 uppercase font-bold">Comm. %</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={newDoctor.rate}
                    onChange={(e) => setNewDoctor({ ...newDoctor, rate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white mt-1 outline-none focus:border-blue-500"
                  />
                </div>
                <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded h-[42px] font-medium transition-colors">
                  + Add
                </button>
              </form>

              {/* Table */}
              <div className="overflow-hidden rounded-lg border border-slate-700">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold">Doctor Name</th>
                      <th className="px-4 py-3 text-sm font-semibold">Clinic</th>
                      <th className="px-4 py-3 text-sm font-semibold">Commission</th>
                      <th className="px-4 py-3 text-sm font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-slate-300">
                    {doctors.length === 0 ? (
                      <tr><td colSpan="4" className="p-6 text-center text-slate-500">No doctors registered yet.</td></tr>
                    ) : (
                      doctors.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-700/50">
                          {editingDoctor && editingDoctor.id === doc.id ? (
                            /* --- EDIT MODE --- */
                            <>
                              <td className="px-4 py-2">
                                <input
                                  value={editingDoctor.name}
                                  onChange={(e) => handleDoctorNameInput(e.target.value, setEditingDoctor, editingDoctor)}
                                  className="w-full bg-slate-800 border border-blue-500 rounded px-2 py-1 text-white outline-none"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  value={editingDoctor.clinic}
                                  onChange={(e) => setEditingDoctor({ ...editingDoctor, clinic: e.target.value })}
                                  className="w-full bg-slate-800 border border-blue-500 rounded px-2 py-1 text-white outline-none"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={editingDoctor.rate}
                                  onChange={(e) => setEditingDoctor({ ...editingDoctor, rate: e.target.value })}
                                  className="w-20 bg-slate-800 border border-blue-500 rounded px-2 py-1 text-white outline-none"
                                />
                              </td>
                              <td className="px-4 py-2 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={saveEditDoctor}
                                    className="p-1.5 text-emerald-400 hover:bg-emerald-900/30 rounded transition-colors"
                                    title="Save"
                                  >
                                    <Check size={18} />
                                  </button>
                                  <button
                                    onClick={cancelEditDoctor}
                                    className="p-1.5 text-slate-400 hover:bg-slate-600 rounded transition-colors"
                                    title="Cancel"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            /* --- VIEW MODE --- */
                            <>
                              <td className="px-4 py-3 font-medium text-white">{doc.name}</td>
                              <td className="px-4 py-3">{doc.clinic_name || '-'}</td>
                              <td className="px-4 py-3 text-emerald-400">{doc.commission_rate}%</td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => startEditDoctor(doc)}
                                    className="text-slate-500 hover:text-blue-400 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => deleteDoctor(doc.id)}
                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: TEST SETTINGS */}
          {activeTab === 'tests' && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full max-h-[75vh]">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FlaskConical className="text-blue-400" /> Test Settings
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Configure pricing, parameters, and reference ranges for each test</p>
                </div>
                <button
                  onClick={saveTestPricing}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                  Save Settings
                </button>
              </div>

              <div className="overflow-y-auto rounded-lg border border-slate-700 flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-900 text-slate-400 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold w-10 text-center">On</th>
                      <th className="px-4 py-3 text-sm font-semibold">Test Name</th>
                      <th className="px-4 py-3 text-sm font-semibold w-28 text-right">Price (â‚¹)</th>
                      <th className="px-4 py-3 text-sm font-semibold w-28 text-center">Parameters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-slate-300">
                    {testPricingList.map((test, index) => {
                      const catalogParams = TEST_CATALOG[test.name] || [];
                      const isExpanded = expandedTest === test.name;
                      const hasCustomizations = testParamSettings[test.name] && Object.keys(testParamSettings[test.name]).length > 0;

                      return (
                        <React.Fragment key={test.id || test.name}>
                          {/* Test Row */}
                          <tr className={`hover:bg-slate-700/50 transition-colors ${!test.enabled ? 'opacity-50' : ''} ${isExpanded ? 'bg-slate-700/30' : ''}`}>
                            <td className="px-4 py-2 text-center">
                              <input 
                                type="checkbox" 
                                checked={test.enabled !== false}
                                onChange={(e) => {
                                  const newList = [...testPricingList];
                                  newList[index].enabled = e.target.checked;
                                  setTestPricingList(newList);
                                }}
                                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-2 font-medium text-white">{test.name}</td>
                            <td className="px-4 py-2 text-right">
                              <input
                                type="number"
                                value={test.price}
                                onChange={(e) => {
                                  const newList = [...testPricingList];
                                  newList[index].price = e.target.value === '' ? '' : Number(e.target.value);
                                  setTestPricingList(newList);
                                }}
                                disabled={test.enabled === false}
                                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white outline-none focus:border-blue-500 text-right disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              {catalogParams.length > 0 && test.enabled !== false && (
                                <button
                                  onClick={() => setExpandedTest(isExpanded ? null : test.name)}
                                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                                    isExpanded 
                                      ? 'bg-blue-600 text-white border-blue-600' 
                                      : hasCustomizations
                                        ? 'bg-amber-900/30 text-amber-400 border-amber-700 hover:bg-amber-900/50'
                                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                                  }`}
                                >
                                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                  {catalogParams.length}
                                  {hasCustomizations && !isExpanded && ' âœŽ'}
                                </button>
                              )}
                            </td>
                          </tr>

                          {/* Expanded Parameters Panel */}
                          {isExpanded && catalogParams.length > 0 && (
                            <tr>
                              <td colSpan="4" className="p-0">
                                <div className="bg-slate-900/80 border-t border-b border-slate-600 px-6 py-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wide">
                                      Parameters â€” {test.name}
                                    </h4>
                                    <span className="text-xs text-slate-500">
                                      Toggle parameters on/off and edit reference ranges
                                    </span>
                                  </div>
                                  <table className="w-full text-sm border-collapse">
                                    <thead>
                                      <tr className="text-slate-500 text-xs uppercase border-b border-slate-700">
                                        <th className="py-2 px-2 w-10 text-center">On</th>
                                        <th className="py-2 px-2 text-left">Parameter Name</th>
                                        <th className="py-2 px-2 w-20 text-left">Unit</th>
                                        <th className="py-2 px-2 w-48 text-left">Reference Range</th>
                                        <th className="py-2 px-2 w-10 text-center"></th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                      {catalogParams.map((param, pIdx) => {
                                        const isEnabled = getParamSetting(test.name, param.name, 'enabled');
                                        const currentRef = getParamSetting(test.name, param.name, 'ref');
                                        const isCustom = testParamSettings[test.name]?.[param.name] !== undefined;

                                        return (
                                          <tr 
                                            key={pIdx} 
                                            className={`transition-colors ${isEnabled ? 'hover:bg-slate-800/50' : 'opacity-40'}`}
                                          >
                                            <td className="py-2 px-2 text-center">
                                              <input
                                                type="checkbox"
                                                checked={isEnabled}
                                                onChange={(e) => setParamSetting(test.name, param.name, 'enabled', e.target.checked)}
                                                className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer"
                                              />
                                            </td>
                                            <td className={`py-2 px-2 font-medium ${isEnabled ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
                                              {param.name}
                                            </td>
                                            <td className="py-2 px-2 text-slate-500">
                                              {param.unit || 'â€”'}
                                            </td>
                                            <td className="py-2 px-2">
                                              <input
                                                type="text"
                                                value={currentRef}
                                                onChange={(e) => setParamSetting(test.name, param.name, 'ref', e.target.value)}
                                                disabled={!isEnabled}
                                                className={`w-full bg-slate-800 border rounded px-2 py-1 text-sm outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                                                  isCustom ? 'border-amber-600 text-amber-300' : 'border-slate-700 text-slate-300'
                                                } focus:border-blue-500`}
                                              />
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                              {isCustom && (
                                                <button
                                                  onClick={() => resetParamToDefault(test.name, param.name)}
                                                  className="text-slate-500 hover:text-amber-400 transition-colors"
                                                  title="Reset to default"
                                                >
                                                  <RotateCcw size={14} />
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 4: SOFTWARE UPDATE (Admin Only) */}
          {activeTab === 'update' && isAdmin && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Download className="text-blue-400" /> Software Update
              </h2>

              {/* Current Version */}
              <div className="bg-slate-900 rounded-lg p-5 border border-slate-700 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Current Version</p>
                    <p className="text-2xl font-bold text-white mt-1">v{appVersion || '...'}</p>
                  </div>
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <ShieldCheck size={28} className="text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Update Status Display */}
              {updateStatus && (
                <div className={`rounded-lg p-4 mb-6 border ${
                  updateStatus.status === 'error' ? 'bg-red-900/20 border-red-700' :
                  updateStatus.status === 'available' ? 'bg-amber-900/20 border-amber-700' :
                  updateStatus.status === 'downloaded' ? 'bg-emerald-900/20 border-emerald-700' :
                  updateStatus.status === 'up-to-date' ? 'bg-emerald-900/20 border-emerald-700' :
                  'bg-blue-900/20 border-blue-700'
                }`}>
                  {/* Checking */}
                  {updateStatus.status === 'checking' && (
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin text-blue-400" size={20} />
                      <span className="text-blue-300">Checking for updates...</span>
                    </div>
                  )}

                  {/* Up to date */}
                  {updateStatus.status === 'up-to-date' && (
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-400" size={20} />
                      <span className="text-emerald-300">You are running the latest version (v{updateStatus.version})</span>
                    </div>
                  )}

                  {/* Update Available */}
                  {updateStatus.status === 'available' && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <DownloadCloud className="text-amber-400" size={20} />
                        <span className="text-amber-300 font-semibold">New version available: v{updateStatus.version}</span>
                      </div>
                      <button
                        onClick={() => window.api.downloadUpdate()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                      >
                        <Download size={18} />
                        Download Update
                      </button>
                    </div>
                  )}

                  {/* Downloading */}
                  {updateStatus.status === 'downloading' && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Loader2 className="animate-spin text-blue-400" size={20} />
                        <span className="text-blue-300">Downloading update... {updateStatus.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
                          style={{ width: `${updateStatus.percent || 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Downloaded — Ready to Install */}
                  {updateStatus.status === 'downloaded' && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className="text-emerald-400" size={20} />
                        <span className="text-emerald-300 font-semibold">Update v{updateStatus.version} downloaded and ready!</span>
                      </div>
                      <button
                        onClick={() => window.api.installUpdate()}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/30"
                      >
                        <RefreshCw size={18} />
                        Restart & Update Now
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  {updateStatus.status === 'error' && (
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-red-400" size={20} />
                      <span className="text-red-300">{updateStatus.message || 'Update check failed. Please check your internet connection.'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Check Button */}
              <button
                onClick={() => {
                  setUpdateStatus(null);
                  window.api.checkForUpdate();
                }}
                disabled={updateStatus?.status === 'downloading'}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={18} />
                Check for Updates
              </button>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-500">
                  💡 Updates replace only the application code. Your <strong className="text-slate-400">patient data, settings, and database</strong> are never affected.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
