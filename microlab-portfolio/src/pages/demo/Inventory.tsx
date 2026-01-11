import React from 'react';
import { AlertTriangle, Package, ScanLine, Plus, Minus } from 'lucide-react';

const Inventory = () => {
  return (
    <div className="space-y-6">
       {/* Inventory Header Cards */}
       <div className="grid grid-cols-3 gap-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 p-6 rounded-2xl flex items-center gap-4">
             <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-xl"><AlertTriangle /></div>
             <div>
                <h3 className="text-2xl font-bold text-yellow-700 dark:text-yellow-500">5 Items</h3>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Below reorder level</p>
             </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-6 rounded-2xl flex items-center gap-4">
             <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl"><Package /></div>
             <div>
                <h3 className="text-2xl font-bold text-red-700 dark:text-red-500">2 Batches</h3>
                <p className="text-sm text-red-600 dark:text-red-400">Expiring in &lt; 30 days</p>
             </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-6 rounded-2xl flex items-center gap-4">
             <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl"><span className="text-xl font-bold">₹</span></div>
             <div>
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-500">₹ 4.5 L</h3>
                <p className="text-sm text-green-600 dark:text-green-400">Total Valuation</p>
             </div>
          </div>
       </div>

       {/* Controls */}
       <div className="flex justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex gap-4 flex-1">
             <div className="relative w-96">
                <ScanLine className="absolute left-3 top-2.5 text-slate-400" size={20} />
                <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" placeholder="Search Item Name, SKU..." />
             </div>
             <select className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"><option>Category: All</option></select>
          </div>
          <div className="flex gap-3">
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700">+ New Item</button>
             <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Purchase Order</button>
          </div>
       </div>

       {/* Inventory Table */}
       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                   <th className="px-6 py-4">Item Details</th>
                   <th className="px-6 py-4">Category</th>
                   <th className="px-6 py-4 w-1/3">Stock Level</th>
                   <th className="px-6 py-4">Batch / Expiry</th>
                   <th className="px-6 py-4">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                <InventoryRow name="T3/T4 Reagent Kit" sku="SKU-9921" cat="Immunology" stock={85} batch="B-102" exp="2026-05" />
                <InventoryRow name="Glucose Strips (50s)" sku="SKU-2210" cat="Biochemistry" stock={10} batch="G303" exp="2025-02" alert />
                <InventoryRow name="Clean-Pro Solution" sku="SKU-1100" cat="Consumables" stock={45} batch="C-991" exp="2027-01" />
             </tbody>
          </table>
       </div>
    </div>
  );
};

const InventoryRow = ({ name, sku, cat, stock, batch, exp, alert }: any) => (
  <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
     <td className="px-6 py-4">
        <p className="font-bold text-slate-900 dark:text-white">{name}</p>
        <p className="text-xs font-mono text-slate-400">{sku}</p>
     </td>
     <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium">{cat}</span></td>
     <td className="px-6 py-4">
        <div className="flex items-center gap-3">
           <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${stock < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${stock}%` }}></div>
           </div>
           <span className="text-xs font-bold">{stock}/100</span>
        </div>
        {stock < 20 && <button className="mt-1 text-xs text-blue-600 hover:underline">Order Now</button>}
     </td>
     <td className="px-6 py-4">
        <p className="text-slate-600 dark:text-slate-300">{batch}</p>
        <p className={`text-xs ${alert ? 'text-red-500 font-bold' : 'text-slate-400'}`}>Exp: {exp}</p>
     </td>
     <td className="px-6 py-4 flex gap-2">
        <button className="p-1 border rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Plus size={14}/></button>
        <button className="p-1 border rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Minus size={14}/></button>
     </td>
  </tr>
);

export default Inventory;