import React from 'react';
import { Search, MoreHorizontal, User, Phone, CheckCircle } from 'lucide-react';

const Patients = () => {
  return (
    <div className="flex flex-col h-full space-y-4">
       {/* Header & Controls */}
       <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold">Patient Directory</h1>
          <div className="flex gap-3">
             <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Export / Print</button>
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md">+ Add Patient</button>
          </div>
       </div>

       {/* Search Bar */}
       <div className="flex gap-4">
          <div className="flex-1 relative">
             <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
             <input type="text" placeholder="Search by Name, Mobile, or UHID..." className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          </div>
          <select className="px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"><option>Status: All</option></select>
          <select className="px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"><option>Type: All</option></select>
       </div>

       {/* Data Table */}
       <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-auto">
          <table className="w-full text-left border-collapse">
             <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                   <th className="px-6 py-4">Profile</th>
                   <th className="px-6 py-4">Demographics</th>
                   <th className="px-6 py-4">Contact</th>
                   <th className="px-6 py-4">Last Visit</th>
                   <th className="px-6 py-4">Payment</th>
                   <th className="px-6 py-4">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <PatientRow name="John Doe" id="P-1024" vip={true} age="22 Y / Male" phone="98765 43210" visit="Dec 28, 2025" paid={true} />
                <PatientRow name="Alice Smith" id="P-1025" vip={false} age="34 Y / Female" phone="98989 12345" visit="Jan 02, 2026" paid={false} due="500" />
                <PatientRow name="Robert Fox" id="P-1026" vip={false} age="45 Y / Male" phone="99887 77665" visit="Jan 05, 2026" paid={true} />
             </tbody>
          </table>
       </div>
    </div>
  );
};

const PatientRow = ({ name, id, vip, age, phone, visit, paid, due }: any) => (
  <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
     <td className="px-6 py-4">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold relative">
              {name.charAt(0)}{name.split(' ')[1]?.charAt(0)}
              {vip && <span className="absolute -top-1 -right-1 text-xs">⭐</span>}
           </div>
           <div>
              <p className="font-medium text-slate-900 dark:text-white">{name}</p>
              <p className="text-xs text-slate-500 font-mono">{id}</p>
           </div>
        </div>
     </td>
     <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{age}</td>
     <td className="px-6 py-4">
        <div className="flex items-center gap-2">
           <Phone size={14} className="text-slate-400" /> {phone}
        </div>
     </td>
     <td className="px-6 py-4 text-slate-500">{visit}</td>
     <td className="px-6 py-4">
        {paid ? (
           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle size={12} /> Paid
           </span>
        ) : (
           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Due: ₹{due}
           </span>
        )}
     </td>
     <td className="px-6 py-4">
        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><MoreHorizontal size={18} /></button>
     </td>
  </tr>
);

export default Patients;