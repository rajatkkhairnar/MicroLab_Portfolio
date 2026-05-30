/**
 * Inventory.jsx — Lab Inventory Management Page
 * 
 * Manages reagents, consumables, equipment, and rapid kits.
 * Features: Stock level tracking with visual bars, low-stock/expiry alerts,
 * quick add/remove stock, CRUD operations for inventory items.
 * Cost per unit display (Feature 4).
 * Test-Inventory Linkages configuration (Feature 5).
 */
import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, AlertTriangle, Package, CalendarClock, ArrowDownCircle, ArrowUpCircle, Trash2, Edit, Link2, Save, X, ChevronDown, ChevronUp
} from 'lucide-react';
import AddInventoryModal from '../components/AddInventoryModal';
import EditInventoryModal from '../components/EditInventoryModal';
import { DEFAULT_TESTS } from '../utils/defaultTests';
import { useLicense } from '../context/LicenseContext';

const Inventory = () => {
  const { licenseExpired } = useLicense();
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

  // --- Feature 5: Test Linkages ---
  const [showLinkages, setShowLinkages] = useState(false);
  const [testLinks, setTestLinks] = useState({}); // { "CBC": [{ inventoryId, itemName, quantity }], ... }
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [linkSaving, setLinkSaving] = useState(false);

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

  const loadTestLinks = async () => {
    try {
      const result = await window.api.getTestInventoryLinks();
      if (result.success && result.data) {
        setTestLinks(result.data);
      }
    } catch (err) {
      console.error("Failed to load test links:", err);
    }
  };

  const loadAvailableTests = async () => {
    try {
      const settings = await window.api.getLabProfile();
      const profileObj = {};
      settings.forEach(item => { profileObj[item.key] = item.value; });

      let tests = DEFAULT_TESTS.map(t => ({...t, enabled: true}));
      if (profileObj.testPricing) {
        const parsed = JSON.parse(profileObj.testPricing);
        tests = parsed.filter(t => t.enabled !== false);
      }
      setAvailableTests(tests);
    } catch (err) {
      console.error("Failed to load tests:", err);
    }
  };

  useEffect(() => {
    loadInventory();
    loadTestLinks();
    loadAvailableTests();
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

  // --- Feature 5: Test Linkage Handlers ---
  const addItemToTest = (testName, inventoryId) => {
    const inv = items.find(i => i.id === parseInt(inventoryId));
    if (!inv) return;

    // Check if already linked
    const existing = testLinks[testName] || [];
    if (existing.find(l => l.inventoryId === inv.id)) return;

    setTestLinks(prev => ({
      ...prev,
      [testName]: [...(prev[testName] || []), { inventoryId: inv.id, itemName: inv.item_name, quantity: 1 }]
    }));
  };

  const updateLinkQuantity = (testName, inventoryId, qty) => {
    setTestLinks(prev => ({
      ...prev,
      [testName]: (prev[testName] || []).map(l =>
        l.inventoryId === inventoryId ? { ...l, quantity: Math.max(1, parseInt(qty) || 1) } : l
      )
    }));
  };

  const removeLinkItem = (testName, inventoryId) => {
    setTestLinks(prev => {
      const updated = { ...prev };
      updated[testName] = (updated[testName] || []).filter(l => l.inventoryId !== inventoryId);
      if (updated[testName].length === 0) delete updated[testName];
      return updated;
    });
  };

  const saveTestLinks = async () => {
    setLinkSaving(true);
    try {
      await window.api.saveTestInventoryLinks(testLinks);
      alert('Test linkages saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save linkages.');
    } finally {
      setLinkSaving(false);
    }
  };

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
          <button
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm ${licenseExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => setIsAddOpen(true)}
            disabled={licenseExpired}
            title={licenseExpired ? 'License expired — contact vendor to renew' : ''}
          >
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
              <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Cost/Unit</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase w-1/5">Stock Level</th>
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
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-slate-800">₹{(item.cost_per_unit || 0).toFixed(2)}</span>
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
                        className={`p-1.5 text-slate-500 bg-emerald-50 hover:bg-emerald-100 rounded text-emerald-600 transition-colors ${licenseExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={licenseExpired ? 'License expired' : 'Add Stock'}
                        disabled={licenseExpired}
                      >
                        <ArrowUpCircle size={16} />
                      </button>
                      
                      <button 
                        onClick={() => {
                           const qty = parseInt(document.getElementById(`qty-${item.id}`).value) || 1;
                           handleStockUpdate(item.id, qty, 'consume');
                        }}
                        className={`p-1.5 text-slate-500 bg-red-50 hover:bg-red-100 rounded text-red-600 transition-colors ${licenseExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={licenseExpired ? 'License expired' : 'Consume Stock'}
                        disabled={licenseExpired}
                      >
                        <ArrowDownCircle size={16} />
                      </button>

                      <div className="w-px h-4 bg-slate-300 mx-1"></div>

                      {/* EDIT BUTTON */}
                      <button 
                        onClick={() => handleEdit(item)}
                        className={`p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ${licenseExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={licenseExpired ? 'License expired' : 'Edit Item'}
                        disabled={licenseExpired}
                      >
                        <Edit size={16} />
                      </button>

                      {/* DELETE BUTTON */}
                      <button 
                        onClick={() => setDeleteId(item.id)}
                        className={`p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ${licenseExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={licenseExpired ? 'License expired' : 'Delete Item'}
                        disabled={licenseExpired}
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

      {/* --- Feature 5: Test-Inventory Linkages Section --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <button
          onClick={() => setShowLinkages(!showLinkages)}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Link2 className="text-violet-600" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Test-Inventory Linkages</h3>
              <p className="text-xs text-slate-500">Configure which inventory items are consumed when a test is booked</p>
            </div>
          </div>
          {showLinkages ? <ChevronUp className="text-slate-400" size={20} /> : <ChevronDown className="text-slate-400" size={20} />}
        </button>

        {showLinkages && (
          <div className="p-5 pt-0 border-t border-slate-100 space-y-5">
            
            {/* Add Linkage Controls */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm font-bold text-slate-700 mb-3">Add / Edit Test Linkage</p>
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Select Test</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                  >
                    <option value="">-- Choose a Test --</option>
                    {availableTests.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                {selectedTest && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Add Inventory Item</label>
                    <select
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
                      onChange={(e) => {
                        if (e.target.value) {
                          addItemToTest(selectedTest, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">-- Add Item --</option>
                      {items.map(inv => (
                        <option key={inv.id} value={inv.id}>{inv.item_name} ({inv.current_stock} {inv.unit})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Linked Items for Selected Test */}
              {selectedTest && testLinks[selectedTest] && testLinks[selectedTest].length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Items linked to: {selectedTest}</p>
                  {testLinks[selectedTest].map(link => (
                    <div key={link.inventoryId} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="flex-1 text-sm text-slate-700 font-medium">{link.itemName}</span>
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs text-slate-500">Qty:</label>
                        <input
                          type="number"
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-sm text-center outline-none focus:border-blue-500"
                          value={link.quantity}
                          min={1}
                          onChange={(e) => updateLinkQuantity(selectedTest, link.inventoryId, e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => removeLinkItem(selectedTest, link.inventoryId)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedTest && (!testLinks[selectedTest] || testLinks[selectedTest].length === 0) && (
                <p className="mt-3 text-xs text-slate-400 italic">No items linked to this test yet. Use the dropdown above to add items.</p>
              )}
            </div>

            {/* Summary of All Linkages */}
            {Object.keys(testLinks).length > 0 && (
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">All Configured Linkages</p>
                <div className="space-y-2">
                  {Object.entries(testLinks).map(([testName, linkedItems]) => (
                    <div key={testName} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{testName}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {linkedItems.map(li => (
                            <span key={li.inventoryId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                              {li.itemName} ×{li.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedTest(testName)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={saveTestLinks}
                disabled={linkSaving}
                className="flex items-center gap-2 px-5 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium disabled:opacity-60"
              >
                <Save size={16} />
                {linkSaving ? 'Saving...' : 'Save Linkages'}
              </button>
            </div>
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