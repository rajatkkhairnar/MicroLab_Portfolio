import React from 'react';
import { Search, Filter, Plus, RotateCw } from 'lucide-react';

const Operations = () => {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lab Operations</h1>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/30 font-medium">
               <Plus size={18} /> Register Patient
            </button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
               Enter Results
            </button>
            <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><RotateCw size={20}/></button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4">
        <div className="relative flex-1 max-w-sm">
           <Search className="absolute left-3 top-3 text-slate-400" size={18} />
           <input type="text" placeholder="Search by Name, ID..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button className="px-4 py-2 flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
           <Filter size={18} /> Status: All
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 font-semibold">
               <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Tests</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
               <Row id="1024" name="John Doe" tests="CBC, Lipid Profile" doc="Dr. Smith" status="Pending" color="orange" />
               <Row id="1023" name="Sarah Connor" tests="Thyroid (T3/T4/TSH)" doc="Dr. Lee" status="Processing" color="blue" />
               <Row id="1022" name="Mike Ross" tests="Blood Sugar (F/PP)" doc="Dr. Patel" status="Completed" color="green" />
               <Row id="1021" name="Harvey Specter" tests="Vitamin D, B12" doc="Dr. Smith" status="Completed" color="green" />
            </tbody>
         </table>
      </div>
    </div>
  );
};

const Row = ({ id, name, tests, doc, status, color }: any) => (
  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
     <td className="px-6 py-4 font-mono text-slate-500">#{id}</td>
     <td className="px-6 py-4 font-medium">{name} <br/><span className="text-xs text-slate-400 font-normal">24 / M</span></td>
     <td className="px-6 py-4">{tests}</td>
     <td className="px-6 py-4 text-slate-500">{doc}</td>
     <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-400`}>
           {status}
        </span>
     </td>
     <td className="px-6 py-4">
        <button className="text-blue-600 hover:underline">View</button>
     </td>
  </tr>
);

export default Operations;