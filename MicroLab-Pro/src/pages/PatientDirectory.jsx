/**
 * PatientDirectory.jsx — Patient Records Management Page
 * 
 * Displays a searchable, filterable table of all registered patients.
 * Features: Add/Edit/Delete patients, WhatsApp integration, due payment tracking.
 */
import React, { useState, useEffect } from 'react';
import {
  Search, Plus, FileDown, MessageCircle, Trash2, Edit, Wallet
} from 'lucide-react';

import AddPatientModal from '../components/AddPatientModal';
import EditPatientModal from '../components/EditPatientModal';
import DuePaymentModal from '../components/DuePaymentModal';

const PatientDirectory = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDueOpen, setIsDueOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadPatients();
  }, [search]);

  const loadPatients = async () => {
    try {
      const data = await window.api.getPatients(search);
      setPatients(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // --- FIXED DELETE LOGIC ---
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await window.api.deletePatient(deleteId);
      if (response && response.success === false) {
        alert("Error deleting patient: " + response.error);
        return;
      }
      setDeleteId(null);
      setSearch(''); // Clear search to force clean state
      loadPatients();
    } catch (error) { 
      console.error(error); 
      alert("An unexpected error occurred: " + error.message);
    }
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setIsEditOpen(true);
  };

  const handleDuePay = (patient) => {
    setSelectedPatient(patient);
    setIsDueOpen(true);
  };

  // Filter Logic
  const filteredPatients = patients.filter(p => {
    if (paymentFilter === 'All') return true;
    const isPaid = p.total_due <= 0;
    return paymentFilter === 'Paid' ? isPaid : !isPaid;
  });

  const getInitials = (name) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Directory</h1>
          <p className="text-slate-500">Manage patient records and history</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.api.exportCSV('Patients', patients)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FileDown size={18} /> <span>Export CSV</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm" onClick={() => setIsAddOpen(true)}>
            <Plus size={18} /> <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by Name, Mobile, or UHID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="All">Payment: All</option>
            <option value="Paid">Paid</option>
            <option value="Due">Due</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Profile</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Demographics</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contact</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">WhatsApp</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Payment</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No patients found.</td></tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {getInitials(patient.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{patient.name}</p>
                        <p className="text-xs text-slate-500">{patient.uhid}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{patient.age} Y / {patient.gender}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{patient.phone}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        const number = patient.phone?.replace(/\D/g, '');
                        if (!number) return;
                        const formattedNum = number.length === 10 ? `91${number}` : number;
                        const text = encodeURIComponent("Hello, this is your report.");
                        window.open(`https://wa.me/${formattedNum}?text=${text}`, '_blank');
                      }}
                      className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                      title="Send Report via WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {patient.total_due > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Due: ₹{patient.total_due}</span>
                    ) : patient.invoice_count > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Paid</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {/* DUE PAY BUTTON */}
                    {patient.total_due > 0 && (
                      <button
                        onClick={() => handleDuePay(patient)}
                        className="p-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded flex items-center gap-1 px-2 text-xs font-bold"
                        title="Pay Dues"
                      >
                        <Wallet size={14} /> Pay
                      </button>
                    )}
                    <button onClick={() => handleEdit(patient)} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Edit"><Edit size={16} /></button>
                    <button onClick={() => setDeleteId(patient.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Render Modals */}
      <AddPatientModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadPatients}
      />

      <EditPatientModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        patient={selectedPatient}
        onSuccess={loadPatients}
      />

      <DuePaymentModal
        isOpen={isDueOpen}
        onClose={() => setIsDueOpen(false)}
        patient={selectedPatient}
        onSuccess={loadPatients}
      />

      {/* --- DELETE MODAL --- */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Patient?</h3>
            <p className="text-slate-600 mb-6">This will remove the patient and all their records permanently.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDirectory;