/**
 * Inventory.jsx — Lab Inventory Management Page
 * 
 * Manages reagents, consumables, equipment, and rapid kits.
 * Features: Stock level tracking with visual bars, low-stock/expiry alerts,
 * quick add/remove stock, CRUD operations for inventory items.
 */
import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, AlertTriangle, Package, CalendarClock, ArrowDownCircle, ArrowUpCircle, Trash2, Edit
} from 'lucide-react';
import AddInventoryModal from '../components/AddInventoryModal';
import EditInventoryModal from '../components/EditInventoryModal';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const [stats, setStats] = useState({
    lowStock: 0,
    expiring: 0,
    totalItems: 0
  });

  const loadInventory = async () => {
    try {
      const data = await window.api.getInventory();
      setItems(data);
      calculateStats(data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const calculateStats = (data) => {
    const low = data.filter(i => i.current_stock <= i.min_reorder_level).length;
    const total = data.length;
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const expiring = data.filter(i => {
      if (!i.expiry_date) return false;
      const exp = new Date(i.expiry_date);
      return exp >= today && exp <= thirtyDaysFromNow;
    }).length;

    setStats({ lowStock: low, expiring, totalItems: total });
  };

  const handleStockUpdate = async (id, quantity, type) => {
    await window.api.updateStock(id, quantity, type);
    loadInventory();
  };

  // --- SAFE DELETE FUNCTION (Prevents Freeze) ---
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await window.api.deleteInventory(deleteId);
      setDeleteId(null); // Close modal
      loadInventory();   // Refresh
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const filteredItems = items.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* --- Header Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-amber-600 font-medium text-sm">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold text-amber-900 mt-1">{stats.lowStock} Items</h3>
            <p className="text-xs text-amber-600/80 mt-1">Below reorder level</p>
          </div>
          <AlertTriangle className="text-amber-500" size={32} />
        </div>

        <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-center justify-between">
          <div>
            <p className="text-red-600 font-medium text-sm">Expiring Soon</p>
            <h3 className="text-2xl font-bold text-red-900 mt-1">{stats.expiring} Batches</h3>
            <p className="text-xs text-red-600/80 mt-1">In next 30 days</p>
          </div>
          <CalendarClock className="text-red-500" size={32} />
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-blue-600 font-medium text-sm">Total Inventory</p>
            <h3 className="text-2xl font-bold text-blue-900 mt-1">{stats.totalItems} SKUs</h3>
            <p className="text-xs text-blue-600/80 mt-1">Active items</p>
          </div>
          <Package className="text-blue-500" size={32} />
        </div>
      </div>

      {/* --- Controls --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search Item Name, SKU..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm" onClick={() => setIsAddOpen(true)}>
            <Plus size={18} />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* --- Inventory Table --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Item Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase w-1/4">Stock Level</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Batch / Expiry</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const maxStock = item.min_reorder_level * 3 || 100; 
              const stockPercent = Math.min((item.current_stock / maxStock) * 100, 100);
              const isLow = item.current_stock <= item.min_reorder_level;

              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{item.item_name}</p>
                    <p className="text-xs text-slate-500 font-mono">{item.sku}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {item.category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-bold ${isLow ? 'text-red-600' : 'text-slate-700'}`}>
                        {item.current_stock} {item.unit}
                      </span>
                      <span className="text-slate-400">Min: {item.min_reorder_level}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${stockPercent}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-700">Batch: {item.batch_number || 'N/A'}</p>
                    <p className="text-xs text-slate-500">
                      Exp: {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-center">
                      {/* Bulk Quantity Input */}
                      <input 
                        type="number" 
                        placeholder="Qty" 
                        className="w-12 px-2 py-1.5 text-xs border border-slate-200 rounded-md outline-none"
                        id={`qty-${item.id}`}
                        defaultValue={1}
                      />
                      
                      <button 
                        onClick={() => {
                          const qty = parseInt(document.getElementById(`qty-${item.id}`).value) || 1;
                          handleStockUpdate(item.id, qty, 'add');
                        }}
                        className="p-1.5 text-slate-500 bg-emerald-50 hover:bg-emerald-100 rounded text-emerald-600 transition-colors"
                        title="Add Stock"
                      >
                        <ArrowUpCircle size={16} />
                      </button>
                      
                      <button 
                        onClick={() => {
                           const qty = parseInt(document.getElementById(`qty-${item.id}`).value) || 1;
                           handleStockUpdate(item.id, qty, 'consume');
                        }}
                        className="p-1.5 text-slate-500 bg-red-50 hover:bg-red-100 rounded text-red-600 transition-colors"
                        title="Consume Stock"
                      >
                        <ArrowDownCircle size={16} />
                      </button>

                      <div className="w-px h-4 bg-slate-300 mx-1"></div>

                      {/* EDIT BUTTON */}
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Item"
                      >
                        <Edit size={16} />
                      </button>

                      {/* DELETE BUTTON */}
                      <button 
                        onClick={() => setDeleteId(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No inventory items found.
          </div>
        )}
      </div>

      {/* MODALS */}
      <AddInventoryModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={loadInventory} 
      />
      <EditInventoryModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        item={selectedItem}
        onSuccess={loadInventory} 
      />
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Delete</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this item? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;