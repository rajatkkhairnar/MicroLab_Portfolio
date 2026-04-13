/**
 * EditPatientModal.jsx — Patient Record Editor
 * 
 * Pre-populates the form with existing patient data and allows editing
 * name, age, gender, phone, and address fields. Same validation rules
 * as AddPatientModal (letters-only name, digits-only phone/age).
 */
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const EditPatientModal = ({ isOpen, onClose, patient, onSuccess }) => {
  if (!isOpen || !patient) return null;

  const [formData, setFormData] = useState({ ...patient });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setFormData({ ...patient });
    setFieldErrors({});
  }, [patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name') {
      const isValid = /^[a-zA-Z\s]*$/.test(value);
      if (isValid) {
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
      } else {
        setFieldErrors(prev => ({ ...prev, [name]: 'Only letters and spaces allowed' }));
      }
    } else if (name === 'phone') {
      const isValid = /^\d*$/.test(value);
      if (isValid && value.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: value }));
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
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
      } else if (!isValid) {
        setFieldErrors(prev => ({ ...prev, [name]: 'Only digits allowed' }));
      } else {
        setFieldErrors(prev => ({ ...prev, [name]: 'Age cannot exceed 99 years' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await window.api.updatePatient(formData);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to update: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Edit Patient</h2>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className={`w-full p-2 border rounded outline-none transition-all ${fieldErrors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`} 
              required 
            />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1 font-normal">{fieldErrors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Age</label>
              <input 
                type="text" 
                name="age" 
                value={formData.age} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded outline-none transition-all ${fieldErrors.age ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`} 
              />
              {fieldErrors.age && <p className="text-red-500 text-xs mt-1 font-normal">{fieldErrors.age}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
            <input 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              className={`w-full p-2 border rounded outline-none transition-all ${fieldErrors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`} 
              required 
            />
            {fieldErrors.phone && <p className="text-red-500 text-xs mt-1 font-normal">{fieldErrors.phone}</p>}
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex justify-center items-center gap-2">
              {loading && <Loader2 className="animate-spin" size={16} />} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientModal;