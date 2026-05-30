/**
 * LabOperations.jsx — Lab Test Order Management
 * 
 * Core workbench for lab staff to manage the full test lifecycle:
 * - View all test orders (filterable by timeframe/status, searchable)
 * - Book new tests via multi-step modal (patient → tests → payment)
 * - Enter test results and generate PDF reports via Electron print
 * - Status tracking: Pending → Processing → Completed
 * - Stackable dropdown filters: timeframe + status combined
 */
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  FlaskConical, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Activity
} from 'lucide-react';
import EnterResultsModal from '../components/EnterResultsModal';
import BookTestModal from '../components/BookTestModal';
import { generateReportHTML } from '../utils/generateReportHTML';
import { useLicense } from '../context/LicenseContext';

const LabOperations = () => {
  const { licenseExpired } = useLicense();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // --- Stackable Filters (dropdown-based) ---
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all orders from database
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await window.api.getLabOrders({ filter: timeFilter, search: searchTerm });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh when time filter or search changes
  useEffect(() => {
    const timer = setTimeout(() => { fetchOrders(); }, 300);
    return () => clearTimeout(timer);
  }, [timeFilter, searchTerm]);

  // Client-side status filter on top of server-filtered orders
  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.order_status === statusFilter);

  // Count helpers for the summary line
  const completedCount = orders.filter(o => o.order_status === 'Completed').length;
  const pendingCount = orders.filter(o => o.order_status === 'Pending').length;
  const processingCount = orders.filter(o => o.order_status === 'Processing').length;

  // --- Handle Saving Results (Database + PDF) ---
  const handleResultsSaved = async (data, action) => {
    try {
      await window.api.saveTestResults({ orderId: selectedOrder.id, results: data });
      fetchOrders();

      if (action === 'print' || action === 'print-only') {
        const isOnlyReport = action === 'print-only';
        setIsPrinting(true);
        try {
          const settings = await window.api.getLabProfile();
          const labProfile = {};
          settings.forEach(item => { labProfile[item.key] = item.value; });

          let testParamSettings = {};
          if (labProfile.testParamSettings) {
            testParamSettings = JSON.parse(labProfile.testParamSettings);
          }

          const htmlContent = generateReportHTML({
            order: selectedOrder,
            results: data,
            labProfile,
            template: 'modern',
            testParamSettings,
            onlyReport: isOnlyReport
          });

          const result = await window.api.printReport(htmlContent, selectedOrder.patient_name || 'Patient');
          if (result && !result.success) console.error('Print failed:', result.error);
        } catch (printErr) {
          console.error('Print error:', printErr);
          alert('Failed to open print dialog. Please try again.');
        } finally {
          setIsPrinting(false);
          setIsResultModalOpen(false);
        }
      } else {
        setIsResultModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save results:", err);
      alert("Error saving results");
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle2 size={12}/> Completed</span>;
      case 'Processing':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Activity size={12}/> Processing</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12}/> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lab Operations</h1>
          <p className="text-slate-500">Manage test orders and enter results</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={fetchOrders}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            title="Refresh List"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => setIsBookModalOpen(true)}
            disabled={licenseExpired}
            title={licenseExpired ? 'License expired — contact vendor to renew' : ''}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200 ${licenseExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus size={18} />
            <span>Book New Test</span>
          </button>
        </div>
      </div>

      {/* Filter Bar — Stackable dropdown filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Patient Name or ID..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Time Duration Filter */}
        <select 
          value={timeFilter} 
          onChange={(e) => setTimeFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500 text-sm"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>

        {/* Status Filter */}
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500 text-sm"
        >
          <option value="all">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
        </select>

        {/* Clear Filters */}
        {(timeFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => { setTimeFilter('all'); setStatusFilter('all'); }}
            className="px-3 py-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Summary Bar */}
      <div className="flex items-center gap-4 px-1 text-sm text-slate-500">
        <span className="font-medium text-slate-700">
          {filteredOrders.length} orders
        </span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          {completedCount} completed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
          {pendingCount} pending
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
          {processingCount} processing
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">ID / Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Tests Requested</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Ref. Doctor</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                  <FlaskConical className="mx-auto mb-2 opacity-50" size={32} />
                  <p>No active test orders found.</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-600">#{order.id}</span>
                    <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{order.patient_name}</p>
                    <p className="text-xs text-slate-500">{order.age} Y / {order.gender}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {order.tests.split(', ').map((test, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">
                          {test}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {order.doctor_name || 'Self'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.order_status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsResultModalOpen(true);
                      }}
                      disabled={licenseExpired}
                      title={licenseExpired ? 'License expired — contact vendor to renew' : ''}
                      className={`text-blue-600 font-medium text-sm hover:underline ${licenseExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Enter Results
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <BookTestModal 
        isOpen={isBookModalOpen} 
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={fetchOrders}
      />
      <EnterResultsModal 
        isOpen={isResultModalOpen} 
        onClose={() => setIsResultModalOpen(false)}
        order={selectedOrder}
        onSuccess={handleResultsSaved}
      />
    </div>
  );
};

export default LabOperations;