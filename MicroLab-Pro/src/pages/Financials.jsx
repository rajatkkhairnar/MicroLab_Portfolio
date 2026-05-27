/**
 * Financials.jsx — Financial Overview & Transaction Ledger
 * 
 * Provides revenue analytics, pending dues tracking, and transaction history.
 * Features: Time-filtered stats cards, transaction ledger table, payment mode
 * pie chart breakdown, CSV export for financial reports.
 * 
 * Doctor Commission Panel: Per-doctor referral cards with time filter showing
 * clear breakdown of patients, revenue, and commission due.
 */
import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, TrendingUp, Download, Stethoscope, Users, Building2, X, Loader2, FileDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Financials = () => {
  const [data, setData] = useState({ transactions: [], stats: { byMode: {} } });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // --- Doctor Commission State ---
  const [commissionPeriod, setCommissionPeriod] = useState('all');
  const [commissions, setCommissions] = useState([]);
  const [commissionLoading, setCommissionLoading] = useState(false);

  // --- Doctor Referral Detail Modal ---
  const [selectedDoctor, setSelectedDoctor] = useState(null); // { doctor_id, doctor_name, ... }
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailPayFilter, setDetailPayFilter] = useState('All'); // 'All' | 'Paid' | 'Due'

  useEffect(() => { loadFinancials(); }, [filter]);
  useEffect(() => { loadCommissions(); }, [commissionPeriod]);

  const loadFinancials = async () => {
    setLoading(true);
    try {
      const result = await window.api.getFinancialLedger(filter);
      setData(result);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const loadCommissions = async () => {
    setCommissionLoading(true);
    try {
      const result = await window.api.getDoctorCommissions({ period: commissionPeriod });
      setCommissions(result);
    } catch (err) { console.error(err); }
    finally { setCommissionLoading(false); }
  };

  // --- SETTLE PAYMENT LOGIC ---
  const handleSettle = async (invoiceId, dueAmount) => {
    const amountStr = prompt(`Enter amount to settle (Due: ₹${dueAmount}):`, dueAmount);
    if (!amountStr) return;
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return alert("Invalid amount");

    await window.api.settleDue({ invoiceId, amount, mode: 'Cash' });
    loadFinancials();
  };

  // --- Doctor Referral Detail ---
  const handleDoctorClick = async (doc) => {
    setSelectedDoctor(doc);
    setDetailLoading(true);
    setDoctorPatients([]);
    setDetailPayFilter('All');
    try {
      const result = await window.api.getDoctorPatients({ doctorId: doc.doctor_id, period: commissionPeriod });
      if (result.success) {
        setDoctorPatients(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDoctorDetail = () => {
    setSelectedDoctor(null);
    setDoctorPatients([]);
    setDetailPayFilter('All');
  };

  const downloadDoctorCSV = () => {
    const exportList = filteredDoctorPatients;
    if (exportList.length === 0) return;
    const headers = ['Date', 'Patient Name', 'Phone', 'Age/Gender', 'Tests', 'Payment Mode', 'Total Amount', 'Paid Amount', 'Status'];
    const rows = exportList.map(p => [
      new Date(p.created_at).toLocaleDateString(),
      p.patient_name,
      p.patient_phone || '',
      `${p.patient_age || ''} / ${p.patient_gender || ''}`,
      `"${(p.tests || '').replace(/"/g, '""')}"`,
      p.payment_mode,
      p.total_amount,
      p.paid_amount,
      p.payment_status
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dr_${selectedDoctor.doctor_name}_Referrals_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- Filtered doctor patients for the detail modal ---
  const filteredDoctorPatients = doctorPatients.filter(p => {
    if (detailPayFilter === 'All') return true;
    return detailPayFilter === 'Paid' ? p.payment_status === 'Paid' : p.payment_status !== 'Paid';
  });

  const chartData = [
    { name: 'Cash', value: data.stats.byMode?.Cash || 0, color: '#10B981' },
    { name: 'UPI', value: data.stats.byMode?.UPI || 0, color: '#2563EB' },
    { name: 'Card', value: data.stats.byMode?.Card || 0, color: '#F59E0B' },
  ].filter(item => item.value > 0);

  const periodLabels = {
    all: 'All Time', today: 'Today', yesterday: 'Yesterday',
    week: 'This Week', month: 'This Month', year: 'This Year',
  };

  const totalCommission = commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
  const totalReferredPatients = commissions.reduce((sum, c) => sum + (c.patient_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Overview</h1>
          <p className="text-slate-500">Track revenue, dues, and transaction history</p>
        </div>
        <div className="flex gap-2">
           <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none">
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="today">Today</option>
          </select>
          <button onClick={() => window.api.exportCSV('Financial_Report', data.transactions)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50">
            <Download size={18} /> <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-6 rounded-xl shadow-lg shadow-blue-200 text-white">
          <p className="text-blue-100 font-medium">Total Revenue Collected</p>
          <h3 className="text-3xl font-bold mt-2">₹{data.stats.totalRevenue?.toLocaleString() || 0}</h3>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-100 bg-blue-500/30 p-2 rounded-lg w-fit">
            <TrendingUp size={16} />
            <span>Based on {data.stats.count || 0} invoices</span>
          </div>
        </div>
      
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium">Pending Dues</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">₹{data.stats.totalDue?.toLocaleString() || 0}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <Wallet className="text-red-500" size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Unpaid balances from patients</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium">Net Transactions</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{data.stats.count || 0}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <CreditCard className="text-emerald-500" size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Total invoices generated</p>
        </div>
      </div>

      {/* ═══ Doctor Referral Commission Section ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Section Header with Filter */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-100 rounded-lg">
              <Stethoscope className="text-violet-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Doctor Referral Commissions</h2>
              <p className="text-xs text-slate-400">Commission payable to referring doctors</p>
            </div>
          </div>
          <select 
            value={commissionPeriod} 
            onChange={(e) => setCommissionPeriod(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-violet-400 text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Doctor Commission Cards */}
        <div className="p-5">
          {commissions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Stethoscope className="mx-auto mb-2 opacity-30" size={32} />
              <p className="text-sm">No doctor referrals found for {periodLabels[commissionPeriod].toLowerCase()}</p>
            </div>
          ) : (
            <>
              {/* Per-doctor cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                {commissions.map((doc) => (
                  <div 
                    key={doc.doctor_id} 
                    className="border border-slate-200 rounded-xl p-4 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleDoctorClick(doc)}
                  >
                    {/* Doctor name + clinic */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-violet-700 font-bold text-sm">{doc.doctor_name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">Dr. {doc.doctor_name}</p>
                        {doc.clinic_name && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                            <Building2 size={10} /> {doc.clinic_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Patients</p>
                        <p className="text-lg font-bold text-slate-800">{doc.patient_count}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Revenue</p>
                        <p className="text-lg font-bold text-slate-800">₹{(doc.total_revenue || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Rate</p>
                        <p className="text-lg font-bold text-slate-800">{doc.commission_rate}%</p>
                      </div>
                    </div>

                    {/* Commission amount — the key takeaway */}
                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-violet-600 uppercase">Commission Due</span>
                      <span className="text-xl font-bold text-violet-700">₹{(doc.commission_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-5 text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-violet-200 text-sm font-medium">Total Commission Due — {periodLabels[commissionPeriod]}</p>
                  <p className="text-3xl font-bold mt-1">₹{totalCommission.toLocaleString()}</p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-violet-200 text-xs uppercase">Doctors</p>
                    <p className="text-2xl font-bold">{commissions.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-violet-200 text-xs uppercase">Patients</p>
                    <p className="text-2xl font-bold">{totalReferredPatients}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ledger + Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ledger Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100"><h2 className="text-lg font-bold text-slate-800">Transaction Ledger</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date / ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Mode</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.transactions.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-400">No transactions found</td></tr>
                ) : (
                  data.transactions.slice(0, 10).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900 block">#{t.id}</span>
                        <span className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-800">{t.patient_name}</p>
                        <p className="text-xs text-slate-500">{t.doctor_name ? `Ref: ${t.doctor_name}` : 'Walk-in'}</p>
                      </td>
                      <td className="px-6 py-4"><span className="px-2 py-0.5 border rounded text-xs text-slate-600 bg-slate-50">{t.payment_mode}</span></td>
                      <td className="px-6 py-4 font-mono text-sm">
                        <span className="text-slate-900 font-bold">₹{t.paid_amount}</span>
                        {t.total_amount > t.paid_amount && <span className="block text-xs text-red-500">Due: ₹{t.total_amount - t.paid_amount}</span>}
                      </td>
                      {/* SETTLE DUE BUTTON */}
                      <td className="px-6 py-4">
                         {t.status === 'Paid' 
                           ? <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">PAID</span>
                           : <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded">Due</span>
                         }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Payment Modes</h2>
          <div className="flex-1 min-h-[250px]">
             {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
             ) : <div className="h-full flex items-center justify-center text-slate-400">No data</div>}
          </div>
        </div>
      </div>

      {/* ═══ Doctor Referral Detail Modal ═══ */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="text-violet-700 font-bold text-lg">{selectedDoctor.doctor_name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Dr. {selectedDoctor.doctor_name}</h2>
                  <p className="text-sm text-slate-500">
                    {selectedDoctor.clinic_name && <span>{selectedDoctor.clinic_name} · </span>}
                    Referred Patients — {periodLabels[commissionPeriod]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={detailPayFilter}
                  onChange={(e) => setDetailPayFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-violet-400"
                >
                  <option value="All">All Patients</option>
                  <option value="Paid">Paid Only</option>
                  <option value="Due">Unpaid Only</option>
                </select>
                <button
                  onClick={downloadDoctorCSV}
                  disabled={filteredDoctorPatients.length === 0}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileDown size={16} /> Download CSV
                </button>
                <button onClick={closeDoctorDetail} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1">
              {detailLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="animate-spin text-violet-500" size={28} />
                </div>
              ) : filteredDoctorPatients.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Users className="mx-auto mb-3 opacity-30" size={36} />
                  <p className="text-sm">No patients referred by this doctor for the selected period.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Patient Name</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Tests</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Payment Mode</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDoctorPatients.map((p) => (
                      <tr key={p.invoice_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <span className="text-sm text-slate-700">{new Date(p.created_at).toLocaleDateString()}</span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-slate-800">{p.patient_name}</p>
                          {p.patient_phone && <p className="text-xs text-slate-400">{p.patient_phone}</p>}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(p.tests || '').split(', ').map((test, i) => (
                              <span key={i} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                {test}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 border rounded text-xs text-slate-600 bg-slate-50">{p.payment_mode}</span>
                        </td>
                        <td className="px-5 py-3 font-mono text-sm">
                          <span className="text-slate-900 font-bold">₹{p.total_amount}</span>
                          {p.total_amount > p.paid_amount && (
                            <span className="block text-xs text-red-500">Due: ₹{p.total_amount - p.paid_amount}</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {p.payment_status === 'Paid'
                            ? <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">PAID</span>
                            : <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded">DUE</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer — Summary */}
            {filteredDoctorPatients.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm">
                <span className="text-slate-500">Total: <strong className="text-slate-800">{filteredDoctorPatients.length} patients</strong>{detailPayFilter !== 'All' && <span className="text-xs text-slate-400 ml-1">({detailPayFilter})</span>}</span>
                <span className="text-slate-500">
                  Revenue: <strong className="text-slate-800">₹{filteredDoctorPatients.reduce((s, p) => s + (p.total_amount || 0), 0).toLocaleString()}</strong>
                  {' · '}
                  Collected: <strong className="text-emerald-600">₹{filteredDoctorPatients.reduce((s, p) => s + (p.paid_amount || 0), 0).toLocaleString()}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Financials;