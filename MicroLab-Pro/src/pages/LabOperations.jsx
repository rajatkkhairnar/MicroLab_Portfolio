/**
 * LabOperations.jsx — Lab Test Order Management
 * 
 * Core workbench for lab staff to manage the full test lifecycle:
 * - View all test orders (filterable by today/all, searchable)
 * - Book new tests via multi-step modal (patient → tests → payment)
 * - Enter test results and generate PDF reports via Electron print
 * - Status tracking: Pending → Processing → Completed
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

const LabOperations = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'today'
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Fetch all orders from database, filtered by current filter/search state
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await window.api.getLabOrders({filter, search: searchTerm});
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh when filter or search changes (with debounce for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [filter, searchTerm]);

  // --- 2. Handle Saving Results (Database + PDF) ---
  const handleResultsSaved = async (data, action) => {
    try {
      // Step A: Save to Database (Updates Status to 'Completed')
      await window.api.saveTestResults({ 
        orderId: selectedOrder.id, 
        results: data 
      });

      // Step B: Refresh List to show new status
      fetchOrders();

      // Step C: Handle Printing via OS Print Dialog
      if (action === 'print') {
        setIsPrinting(true);
        try {
          // Load lab settings for the report
          const settings = await window.api.getLabProfile();
          const labProfile = {};
          settings.forEach(item => { labProfile[item.key] = item.value; });

          // Parse parameter-level customizations
          let testParamSettings = {};
          if (labProfile.testParamSettings) {
            testParamSettings = JSON.parse(labProfile.testParamSettings);
          }

          // Generate the report HTML
          const htmlContent = generateReportHTML({
            order: selectedOrder,
            results: data,
            labProfile,
            template: 'modern',
            testParamSettings
          });

          // Send to Electron main process for printing
          const result = await window.api.printReport(htmlContent, selectedOrder.patient_name || 'Patient');
          if (result && !result.success) {
            console.error('Print failed:', result.error);
          }
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200"
          >
            <Plus size={18} />
            <span>Book New Test</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Patient Name or ID..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            All Orders
          </button>
          <button 
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'today' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Today Only
          </button>
        </div>
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
            {orders.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                  <FlaskConical className="mx-auto mb-2 opacity-50" size={32} />
                  <p>No active test orders found.</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
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
                      className="text-blue-600 font-medium text-sm hover:underline"
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