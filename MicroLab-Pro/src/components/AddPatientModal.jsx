/**
 * AddPatientModal.jsx — New Patient Registration Modal
 * 
 * Form modal for registering new patients with field-level validation:
 * - Name: letters/spaces only
 * - Phone: digits only, max 10
 * - Age: max 99, digits only
 * Auto-generates a random UHID on each render.
 */
import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const AddPatientModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    uhid: `P-${Math.floor(Math.random() * 100000)}`, // Auto-generate random ID
    address: '',
    is_vip: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;

    if (name === 'name') {
      const isValid = /^[a-zA-Z\s]*$/.test(value);
      if (isValid) {
        setFormData(prev => ({ ...prev, [name]: newVal }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
      } else {
        setFieldErrors(prev => ({ ...prev, [name]: 'Only letters and spaces allowed' }));
      }
    } else if (name === 'phone') {
      const isValid = /^\d*$/.test(value);
      if (isValid && value.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: newVal }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
      } else if (!isValid) {
        setFieldErrors(prev => ({ ...prev, [name]: 'Only digits allowed' }));
      } else if (value.length > 10) {
        setFieldErrors(prev => ({ ...prev, [name]: 'Phone number cannot exceed 10 digits' }));
      }
    } else if (name === 'age') {
      const isValid = /^\d*$/.test(value);
      const numValue = parseInt(value);
      if (isValid && (!numValue || numValue <= 99) && value.length <= 2) {
        setFormData(prev => ({ ...prev, [name]: newVal }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
      } else if (!isValid) {
        setFieldErrors(prev => ({ ...prev, [name]: 'Only digits allowed' }));
      } else {
        setFieldErrors(prev => ({ ...prev, [name]: 'Age cannot exceed 99 years' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: newVal }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate
      if (!formData.name || !formData.phone) {
        throw new Error("Name and Phone are required.");
      }

      // Send to Backend (Electron -> SQLite)
      const result = await window.api.addPatient(formData);

      if (result.success) {
        onSuccess(); // Refresh parent table
        onClose();   // Close modal
        // Reset form for next time
        setFormData({
          name: '', age: '', gender: 'Male', phone: '', 
          uhid: `P-${Math.floor(Math.random() * 100000)}`, 
          address: '', is_vip: false
        });
      } else {
        throw new Error(result.error || "Failed to save patient");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Register New Patient</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* UHID (Auto-filled but editable) */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">UHID (Patient ID)</label>
              <input 
                type="text" 
                name="uhid"
                value={formData.uhid}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono text-sm"
              />
            </div>

            {/* Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${fieldErrors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'}`}
                placeholder="e.g. John Doe"
              />
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <input 
                type="text" 
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${fieldErrors.age ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'}`}
                placeholder="e.g. 25"
              />
              {fieldErrors.age && <p className="text-red-500 text-xs mt-1">{fieldErrors.age}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            {/* Phone */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
              <input 
                type="tel" 
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'}`}
                placeholder="e.g. 9876543210"
              />
              {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
            </div>

            {/* VIP Checkbox */}
            <div className="col-span-2 flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="is_vip"
                name="is_vip"
                checked={formData.is_vip}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="is_vip" className="text-sm text-slate-700 cursor-pointer select-none">
                Mark as VIP Patient (Priority Handling)
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isSubmitting ? 'Saving...' : 'Register Patient'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;