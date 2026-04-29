/**
 * BookTestModal.jsx — Multi-Step Test Booking Wizard
 * 
 * 3-step workflow for creating a new lab test order:
 *   Step 1: Select existing patient or register a new one + choose doctor
 *   Step 2: Pick from available tests (loaded from lab settings/defaults)
 *   Step 3: Enter payment amount, select payment mode, confirm booking
 * 
 * Creates an invoice record and associated lab_tests entries in the database.
 */
import React, { useState, useEffect } from 'react';
import { X, Loader2, IndianRupee, UserPlus, Users } from 'lucide-react';
import { DEFAULT_TESTS } from '../utils/defaultTests';
const BookTestModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  // --- State ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data Sources
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);

  // Selection State
  const [patientMode, setPatientMode] = useState('existing'); // 'existing' or 'new'
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [payment, setPayment] = useState({ paid: 0, mode: 'Cash' });

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    uhid: `P-${Math.floor(Math.random() * 100000)}`,
    address: ''
  });

  // --- Load Data ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pts, docs, settings] = await Promise.all([
          window.api.getPatients(),
          window.api.getDoctors(),
          window.api.getLabProfile()
        ]);
        setPatients(pts);
        setDoctors(docs);

        const profileObj = {};
        settings.forEach(item => { profileObj[item.key] = item.value; });

        let tests = DEFAULT_TESTS.map(t => ({...t, enabled: true}));
        if (profileObj.testPricing) {
           const parsed = JSON.parse(profileObj.testPricing);
           tests = parsed.filter(t => t.enabled !== false); // default to true if undefined
        }
        setAvailableTests(tests);
      } catch (err) {
        console.error("Failed to load booking data", err);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // --- Handlers ---
  const handleNewPatientChange = (e) => {
    setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
  };

  const toggleTest = (test) => {
    if (selectedTests.find(t => t.id === test.id)) {
      setSelectedTests(selectedTests.filter(t => t.id !== test.id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const totalAmount = selectedTests.reduce((sum, test) => sum + test.price, 0);
  const dueAmount = totalAmount - payment.paid;

  // --- Submit Logic ---
  const handleSubmit = async () => {
    if (selectedTests.length === 0) return alert("Please select at least one test.");
    setSubmitting(true);

    try {
      let finalPatientId = selectedPatientId;

      // 1. If "New Patient" mode, create the patient first
      if (patientMode === 'new') {
        if (!newPatient.name || !newPatient.phone) {
          setSubmitting(false);
          return alert("Name and Phone are required for new patient.");
        }

        const patRes = await window.api.addPatient(newPatient);
        if (!patRes.success) throw new Error(patRes.error);
        finalPatientId = patRes.id; // Use the newly created ID
      } else {
        if (!finalPatientId) {
          setSubmitting(false);
          return alert("Please select a patient.");
        }
      }

      // 2. Create Invoice
      const invoiceData = {
        patientId: finalPatientId,
        doctorId: selectedDoctorId || null,
        total: totalAmount,
        paid: parseFloat(payment.paid),
        mode: payment.mode,
        status: dueAmount <= 0 ? 'Paid' : 'Due',
        tests: selectedTests.map(t => t.name)
      };

      const result = await window.api.createInvoice(invoiceData);

      if (result.success) {
        onSuccess();
        onClose();
        // Reset Form
        setStep(1);
        setSelectedTests([]);
        setPayment({ paid: 0, mode: 'Cash' });
        setPatientMode('existing');
        setNewPatient({ name: '', age: '', gender: 'Male', phone: '', uhid: '', address: '' });
      } else {
        alert("Error creating order: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Book New Test</h2>
            <p className="text-sm text-slate-500">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : (
            <>
              {/* STEP 1: Patient Info */}
              {step === 1 && (
                <div className="space-y-6">

                  {/* Toggle between Existing / New */}
                  <div className="flex p-1 bg-slate-100 rounded-lg">
                    <button
                      onClick={() => setPatientMode('existing')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all
                        ${patientMode === 'existing' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Users size={16} /> Existing Patient
                    </button>
                    <button
                      onClick={() => setPatientMode('new')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all
                        ${patientMode === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <UserPlus size={16} /> Register New
                    </button>
                  </div>

                  {/* Mode: Existing */}
                  {patientMode === 'existing' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Search Patient</label>
                      <select
                        className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                      >
                        <option value="">-- Select Patient --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Mode: New Patient */}
                  {patientMode === 'new' && (
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Full Name *</label>
                        <input name="name" value={newPatient.name} onChange={handleNewPatientChange} className="w-full p-2 border rounded bg-white" placeholder="Patient Name" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase">Age</label>
                        <input type="number" name="age" value={newPatient.age} onChange={handleNewPatientChange} className="w-full p-2 border rounded bg-white" placeholder="25" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase">Gender</label>
                        <select name="gender" value={newPatient.gender} onChange={handleNewPatientChange} className="w-full p-2 border rounded bg-white">
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Phone *</label>
                        <input type="tel" name="phone" value={newPatient.phone} onChange={handleNewPatientChange} className="w-full p-2 border rounded bg-white" placeholder="9876543210" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Delivery Address</label>
                        <textarea name="address" value={newPatient.address} onChange={handleNewPatientChange} className="w-full p-2 border rounded bg-white" placeholder="Enter delivery address" rows="2"></textarea>
                      </div>
                    </div>
                  )}

                  {/* Common: Doctor Selection */}
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Referring Doctor</label>
                    <select
                      className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                    >
                      <option value="">-- Self / None --</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>Dr. {d.name} ({d.clinic_name})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Tests (Same as before) */}
              {step === 2 && (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">Available Tests</label>
                    <span className="text-sm font-bold text-blue-600">Selected: {selectedTests.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border p-2 rounded-lg">
                    {availableTests.map(test => {
                      const isSelected = selectedTests.find(t => t.id === test.id);
                      return (
                        <div
                          key={test.id}
                          onClick={() => toggleTest(test)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center
                            ${isSelected ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'}
                          `}
                        >
                          <span className={`text-sm ${isSelected ? 'font-medium text-blue-700' : 'text-slate-700'}`}>{test.name}</span>
                          <span className="text-xs font-bold text-slate-500">₹{test.price}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <p className="text-lg font-bold text-slate-900">Total: ₹{totalAmount}</p>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment (Same as before) */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Total Bill:</span>
                      <span className="font-bold text-slate-900">₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Amount Paid:</span>
                      <div className="relative w-32">
                        <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          className="w-full pl-8 pr-3 py-1 border border-slate-300 rounded focus:border-blue-500 outline-none"
                          value={payment.paid}
                          onChange={(e) => setPayment({ ...payment, paid: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-slate-200">
                      <span className="text-slate-600 font-medium">Balance Due:</span>
                      <span className={`font-bold ${dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        ₹{dueAmount}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Payment Mode</label>
                    <div className="flex gap-3">
                      {['Cash', 'UPI', 'Card'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => setPayment({ ...payment, mode })}
                          className={`flex-1 py-2 border rounded-lg text-sm font-medium transition-colors
                           ${payment.mode === mode
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
                         `}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">Back</button>
          ) : (<div></div>)}

          {step < 3 ? (
            <button
              onClick={() => {
                if (patientMode === 'existing' && !selectedPatientId) return alert("Select a patient");
                if (patientMode === 'new' && (!newPatient.name || !newPatient.phone)) return alert("Fill patient details");
                if (step === 2 && selectedTests.length === 0) return alert("Select tests");
                setStep(step + 1);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center gap-2"
            >
              {submitting && <Loader2 className="animate-spin" size={16} />}
              Confirm Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookTestModal;