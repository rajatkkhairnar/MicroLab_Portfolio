/**
 * TestDirectory.jsx — Test Records Directory
 * 
 * Displays a searchable, filterable table of all booked tests with:
 * patient name, tests ordered, cost, amount paid, and payment mode.
 * Supports time filtering and CSV export.
 */
import React, { useState, useEffect } from 'react';
import { Search, FileDown, FlaskConical, Calendar, Loader2 } from 'lucide-react';

const TestDirectory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadRecords();
  }, [filter, search]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await window.api.getTestDirectory({ filter, search });
      setRecords(data);
    } catch (err) {
      console.error("Failed to load test directory:", err);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const totalRevenue = records.reduce((s, r) => s + (r.total_amount || 0), 0);
  const totalCollected = records.reduce((s, r) => s + (r.paid_amount || 0), 0);
  const totalDue = totalRevenue - totalCollected;

  // CSV Download
  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Date', 'Patient Name', 'Phone', 'Tests', 'Cost (₹)', 'Amount Paid (₹)', 'Payment Mode', 'Status'];
    const rows = records.map(r => [
      new Date(r.created_at).toLocaleDateString(),
      r.patient_name,
      r.patient_phone || '',
      `"${(r.tests || '').replace(/"/g, '""')}"`,
      r.total_amount,
      r.paid_amount,
      r.payment_mode,
      r.payment_status
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Test_Directory_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Directory</h1>
          <p className="text-slate-500">Complete record of all booked tests and payments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <FileDown size={18} /> <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Total Tests</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{records.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-1">₹{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Collected</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">₹{totalCollected.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Pending Dues</p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">₹{totalDue.toLocaleString()}</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by Patient Name or Test Name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-500" size={28} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Tests</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Cost (₹)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Amount Paid (₹)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Payment Mode</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center text-slate-400">
                        <FlaskConical className="mx-auto mb-3 opacity-30" size={36} />
                        <p className="text-sm">No test records found.</p>
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.invoice_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="text-sm text-slate-700">{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-800">{r.patient_name}</p>
                          {r.patient_phone && <p className="text-xs text-slate-400">{r.patient_phone}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(r.tests || '').split(', ').map((test, i) => (
                              <span key={i} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                {test}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900">₹{(r.total_amount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-emerald-700">₹{(r.paid_amount || 0).toLocaleString()}</span>
                          {r.total_amount > r.paid_amount && (
                            <span className="block text-xs text-red-500">Due: ₹{(r.total_amount - r.paid_amount).toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 border rounded text-xs text-slate-600 bg-slate-50 font-medium">
                            {r.payment_mode}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {r.payment_status === 'Paid'
                            ? <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">PAID</span>
                            : <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded">DUE</span>
                          }
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TestDirectory;
