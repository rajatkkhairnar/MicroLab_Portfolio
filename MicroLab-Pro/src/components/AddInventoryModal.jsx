/**
 * AddInventoryModal.jsx — New Inventory Item Registration
 * 
 * Form for adding new lab inventory items with validation:
 * - Name: alphanumeric + hyphens only
 * - SKU: alphanumeric + hyphens only (no spaces)
 * Supports categories: Reagents, Consumables, Equipment, Rapid Kits.
 */
import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const AddInventoryModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Reagents',
    stock: 0,
    minLevel: 10,
    unit: 'Units',
    batch: '',
    expiry: '',
    costPerUnit: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const isValid = /^[a-zA-Z0-9\s-]*$/.test(value);
      if (isValid) {
        setFormData({ ...formData, [name]: value });
        setErrors(prev => ({ ...prev, name: '' }));
      } else {
        setErrors(prev => ({ ...prev, name: 'Only alphabets, numbers, and hyphens (-) allowed' }));
      }
    } else if (name === 'sku') {
      const isValid = /^[a-zA-Z0-9-]*$/.test(value);
      if (isValid) {
        setFormData({ ...formData, [name]: value });
        setErrors(prev => ({ ...prev, sku: '' }));
      } else {
        setErrors(prev => ({ ...prev, sku: 'Only alphabets, numbers, and hyphens (-) allowed (no spaces)' }));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await window.api.addInventory(formData);
      if (res.success) {
        onSuccess();
        onClose();
        setFormData({ name: '', sku: '', category: 'Reagents', stock: 0, minLevel: 10, unit: 'Units', batch: '', expiry: '', costPerUnit: 0 });
      } else {
        alert("Error: " + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Add Inventory Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Item Name *</label>
              <input 
                name="name" 
                required 
                onChange={handleChange} 
                value={formData.name} 
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'focus:ring-blue-500/20'}`} 
                placeholder="e.g. Glucose Reagent Kit" 
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU / Code</label>
              <input 
                name="sku" 
                onChange={handleChange} 
                value={formData.sku} 
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${errors.sku ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'focus:ring-2 focus:ring-blue-500/20'}`} 
                placeholder="e.g. GLU-001" 
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select name="category" onChange={handleChange} value={formData.category} className="w-full px-3 py-2 border rounded-lg outline-none bg-white">
                <option>Reagents</option>
                <option>Consumables</option>
                <option>Equipment</option>
                <option>Rapid Kits</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
              <input type="number" name="stock" onChange={handleChange} value={formData.stock} className="w-full px-3 py-2 border rounded-lg outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cost per Unit (₹)</label>
              <input type="number" name="costPerUnit" onChange={handleChange} value={formData.costPerUnit} className="w-full px-3 py-2 border rounded-lg outline-none" step="0.01" min="0" placeholder="0.00" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level (Alert)</label>
              <input type="number" name="minLevel" onChange={handleChange} value={formData.minLevel} className="w-full px-3 py-2 border rounded-lg outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Batch Number</label>
              <input name="batch" onChange={handleChange} value={formData.batch} className="w-full px-3 py-2 border rounded-lg outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
              <input type="date" name="expiry" onChange={handleChange} value={formData.expiry} className="w-full px-3 py-2 border rounded-lg outline-none text-slate-600" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 border rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Item
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;