/**
 * EditInventoryModal.jsx — Inventory Item Editor
 * 
 * Pre-populates form with existing inventory item data for editing
 * name, SKU, category, and minimum reorder level. Same validation
 * rules as AddInventoryModal (alphanumeric names, no-space SKUs).
 */
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const EditInventoryModal = ({ isOpen, onClose, item, onSuccess }) => {
  if (!isOpen || !item) return null;

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    sku: '',
    category: '',
    minLevel: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load item data when modal opens
  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.item_name,
        sku: item.sku,
        category: item.category,
        minLevel: item.min_reorder_level
      });
    }
  }, [item]);

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
    setLoading(true);
    try {
      await window.api.updateInventory(formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Edit Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Item Name</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className={`w-full p-2 border rounded outline-none transition-colors ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`} 
              required 
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-normal">{errors.name}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">SKU / Code</label>
              <input 
                name="sku" 
                value={formData.sku} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded outline-none transition-colors ${errors.sku ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`} 
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1 font-normal">{errors.sku}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                <option>Reagents</option>
                <option>Consumables</option>
                <option>Equipment</option>
                <option>Rapid Kits</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Min Reorder Level</label>
            <input type="number" name="minLevel" value={formData.minLevel} onChange={handleChange} className="w-full p-2 border rounded focus:border-blue-500 outline-none" />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={18} />} Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInventoryModal;