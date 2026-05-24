/**
 * DuePaymentModal.jsx — Patient Due Payment Settlement
 * 
 * Shows all unpaid invoices for a specific patient with inline payment inputs.
 * Allows partial or full payment per invoice. Auto-closes when all dues are cleared.
 * Refreshes both local invoice list and parent component data on successful payment.
 */
import React, { useState, useEffect } from 'react';
import { X, IndianRupee, CheckCircle2, Loader2, Wallet } from 'lucide-react';

const DuePaymentModal = ({ isOpen, onClose, patient, onSuccess }) => {
  if (!isOpen || !patient) return null;

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payAmounts, setPayAmounts] = useState({}); // Store input values per invoice
  const [payModes, setPayModes] = useState({}); // Store payment mode per invoice
  const [customModes, setCustomModes] = useState({}); // Custom mode text per invoice
  const [processingId, setProcessingId] = useState(null); // Which invoice is being paid?

  const loadDues = async () => {
    try {
      const id = patient.id || patient.patient_id;
      const data = await window.api.getPatientInvoices(id);
      setInvoices(data);
      
      // Auto-close if no dues left (with a slight delay for UX)
      if (data.length === 0 && !loading) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDues();
  }, [patient]);

  const handleAmountChange = (invId, value, maxDue) => {
    // Validate input: prevent negative or more than due
    let val = parseFloat(value);
    if (val < 0) val = 0;
    if (val > maxDue) val = maxDue;
    
    setPayAmounts(prev => ({
      ...prev,
      [invId]: value // Keep as string to allow typing decimals
    }));
  };

  const handleSettle = async (inv) => {
    const dueAmount = inv.total_amount - inv.paid_amount;
    // Default to full due amount if input is empty, otherwise parse input
    const amountToPay = payAmounts[inv.id] ? parseFloat(payAmounts[inv.id]) : dueAmount;

    if (!amountToPay || amountToPay <= 0 || amountToPay > dueAmount) {
      alert("Please enter a valid amount.");
      return;
    }

    setProcessingId(inv.id);

    try {
      const selectedMode = payModes[inv.id] || 'Cash';
      const finalMode = selectedMode === 'Any Other' ? (customModes[inv.id] || 'Other') : selectedMode;

      // 1. Send to Backend
      await window.api.settleDue({ 
        invoiceId: inv.id, 
        amount: amountToPay, 
        mode: finalMode 
      });

      // 2. Refresh Parent (Financials/Patient Directory)
      // We do this BEFORE local refresh so the background updates instantly
      if (onSuccess) onSuccess();

      // 3. Refresh Local List
      await loadDues();
      
      // Clear input
      setPayAmounts(prev => ({ ...prev, [inv.id]: '' }));

    } catch (err) {
      console.error("Payment failed:", err);
      alert("Payment failed.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Wallet className="text-blue-600" size={24} />
              Settle Dues
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Patient: <span className="font-semibold text-slate-700">{patient.name || patient.patient_name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-10 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-emerald-800">All Clear!</h3>
              <p className="text-slate-500 text-sm">No pending dues for this patient.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map(inv => {
                const due = inv.total_amount - inv.paid_amount;
                const inputValue = payAmounts[inv.id] !== undefined ? payAmounts[inv.id] : '';
                
                return (
                  <div key={inv.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors shadow-sm">
                    
                    {/* Invoice Info */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-slate-700">Invoice #{inv.id}</span>
                           <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                             {new Date(inv.created_at).toLocaleDateString()}
                           </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Total Bill: ₹{inv.total_amount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-bold">Current Due</p>
                        <p className="text-xl font-bold text-red-600">₹{due}</p>
                      </div>
                    </div>

                    {/* Payment Mode Selection */}
                    <div className="mb-2">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Payment Mode</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {['Cash', 'UPI', 'Card', 'Any Other'].map(mode => {
                          const isActive = (payModes[inv.id] || 'Cash') === mode;
                          return (
                            <button
                              key={mode}
                              onClick={() => setPayModes(prev => ({ ...prev, [inv.id]: mode }))}
                              className={`px-3 py-1 border rounded-md text-xs font-medium transition-colors
                                ${isActive
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                            >
                              {mode}
                            </button>
                          );
                        })}
                      </div>
                      {(payModes[inv.id] === 'Any Other') && (
                        <input
                          type="text"
                          placeholder="e.g. PMJAY, Ayushman Card"
                          className="w-full mt-1.5 px-3 py-1.5 border border-slate-300 rounded-md text-xs outline-none focus:border-blue-500"
                          value={customModes[inv.id] || ''}
                          onChange={(e) => setCustomModes(prev => ({ ...prev, [inv.id]: e.target.value }))}
                        />
                      )}
                    </div>

                    {/* Payment Input Area */}
                    <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg">
                      <div className="relative flex-1">
                        <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input 
                          type="number"
                          placeholder={`Enter amount (Max ${due})`}
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-bold text-slate-700"
                          value={inputValue}
                          onChange={(e) => handleAmountChange(inv.id, e.target.value, due)}
                          disabled={processingId === inv.id}
                        />
                      </div>
                      <button 
                        onClick={() => handleSettle(inv)}
                        disabled={processingId === inv.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                      >
                        {processingId === inv.id ? <Loader2 className="animate-spin" size={16}/> : 'Pay'}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuePaymentModal;