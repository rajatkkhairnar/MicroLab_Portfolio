import React, { useState } from 'react';
import { Search, Plus, AlertTriangle, Package, CalendarClock, ArrowDownCircle, ArrowUpCircle, Edit, Trash2 } from 'lucide-react';
import { inventoryItems } from '../data/sampleData';

const DemoInventory = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = inventoryItems.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStock = inventoryItems.filter(i => i.current_stock <= i.min_reorder_level).length;
    const today = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(today.getDate() + 30);
    const expiring = inventoryItems.filter(i => {
        if (!i.expiry_date) return false;
        const exp = new Date(i.expiry_date);
        return exp >= today && exp <= thirtyDays;
    }).length;

    return (
        <div className="space-y-6">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 flex items-center justify-between">
                    <div>
                        <p className="text-amber-600 font-medium text-sm">Low Stock Alerts</p>
                        <h3 className="text-2xl font-bold text-amber-900 mt-1">{lowStock} Items</h3>
                        <p className="text-xs text-amber-600/80 mt-1">Below reorder level</p>
                    </div>
                    <AlertTriangle className="text-amber-500" size={32} />
                </div>

                <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-center justify-between">
                    <div>
                        <p className="text-red-600 font-medium text-sm">Expiring Soon</p>
                        <h3 className="text-2xl font-bold text-red-900 mt-1">{expiring} Batches</h3>
                        <p className="text-xs text-red-600/80 mt-1">In next 30 days</p>
                    </div>
                    <CalendarClock className="text-red-500" size={32} />
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                        <p className="text-blue-600 font-medium text-sm">Total Inventory</p>
                        <h3 className="text-2xl font-bold text-blue-900 mt-1">{inventoryItems.length} SKUs</h3>
                        <p className="text-xs text-blue-600/80 mt-1">Active items</p>
                    </div>
                    <Package className="text-blue-500" size={32} />
                </div>
            </div>

            {/* Controls */}
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
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus size={18} />
                    <span>New Item</span>
                </button>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[750px]">
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
                                            <button className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors" title="Add Stock">
                                                <ArrowUpCircle size={16} />
                                            </button>
                                            <button className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors" title="Consume Stock">
                                                <ArrowDownCircle size={16} />
                                            </button>
                                            <div className="w-px h-4 bg-slate-300 mx-1" />
                                            <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Item">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Item">
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
                    <div className="p-8 text-center text-slate-500">No inventory items found.</div>
                )}
            </div>
        </div>
    );
};

export default DemoInventory;
