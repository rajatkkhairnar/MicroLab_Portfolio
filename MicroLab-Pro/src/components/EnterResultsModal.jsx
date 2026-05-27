/**
 * EnterResultsModal.jsx — Lab Test Results Entry Interface
 * 
 * Split-panel UI for entering observed test values:
 * - Left sidebar: list of tests in the order (e.g. CBC, Lipid Profile)
 *   with edit mode to add/remove tests
 * - Right panel: parameter grid with name, input, unit, and reference range
 * 
 * Loads parameter definitions from testCatalog via getEffectiveParams()
 * (respecting any custom overrides from Settings). Supports Save and Save+Print.
 */
import React, { useState, useEffect } from 'react';
import { X, Save, Printer, FileCheck, AlertCircle, FileText, Edit3, Plus, Trash2, Check } from 'lucide-react';
import { getEffectiveParams } from '../utils/getEffectiveParams';
import { DEFAULT_TESTS } from '../utils/defaultTests';

const EnterResultsModal = ({ isOpen, onClose, order, onSuccess }) => {
  if (!isOpen || !order) return null;

  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [results, setResults] = useState({});
  const [saving, setSaving] = useState(false);
  const [testParamSettings, setTestParamSettings] = useState({});

  // Edit mode state for adding/removing tests
  const [editMode, setEditMode] = useState(false);
  const [testList, setTestList] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [addTestDropdownValue, setAddTestDropdownValue] = useState('');

  const currentTestName = testList[activeTestIndex] || testList[0] || '';
  const currentParams = getEffectiveParams(currentTestName, testParamSettings);

  // Load parameter settings from lab profile
  useEffect(() => {
    const loadParamSettings = async () => {
      try {
        const settings = await window.api.getLabProfile();
        const profileObj = {};
        settings.forEach(item => { profileObj[item.key] = item.value; });
        if (profileObj.testParamSettings) {
          setTestParamSettings(JSON.parse(profileObj.testParamSettings));
        }

        // Load available test list for dropdown
        let tests = DEFAULT_TESTS.map(t => ({...t, enabled: true}));
        if (profileObj.testPricing) {
          const parsed = JSON.parse(profileObj.testPricing);
          tests = parsed.filter(t => t.enabled !== false);
        }
        setAvailableTests(tests);
      } catch (err) {
        console.error('Failed to load param settings:', err);
      }
    };
    loadParamSettings();
  }, []);

  // Initialize test list and results state
  useEffect(() => {
    setActiveTestIndex(0);
    setEditMode(false);
    const parsedTests = order.tests.split(', ').filter(t => t.trim());
    setTestList(parsedTests);

    const fetchSavedResults = async () => {
      if (order && order.id) {
        try {
          const res = await window.api.getOrderResults(order.id);
          if (res.success && res.data) {
            setResults(res.data);
          } else {
            setResults({});
          }
        } catch (err) {
          console.error("Failed to fetch previous results:", err);
          setResults({});
        }
      } else {
        setResults({});
      }
    };
    fetchSavedResults();
  }, [order]);

  const handleInputChange = (paramName, value) => {
    setResults(prev => ({
      ...prev,
      [currentTestName]: {
        ...prev[currentTestName],
        [paramName]: value
      }
    }));
  };

  // --- Add Test ---
  const handleAddTest = async (testName) => {
    if (!testName) return;
    try {
      const result = await window.api.addTestToInvoice({ invoiceId: order.id, testName });
      if (result.success) {
        setTestList(prev => [...prev, testName]);
        setAddTestDropdownValue('');
      } else {
        alert(result.error || 'Failed to add test.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Remove Test ---
  const handleRemoveTest = async (testName) => {
    if (testList.length <= 1) {
      alert('Cannot remove the last test from an order.');
      return;
    }
    const confirmed = confirm(`Remove "${testName}" from this order?`);
    if (!confirmed) return;

    try {
      const result = await window.api.removeTestFromInvoice({ invoiceId: order.id, testName });
      if (result.success) {
        setTestList(prev => prev.filter(t => t !== testName));
        // Remove results for this test
        setResults(prev => {
          const updated = { ...prev };
          delete updated[testName];
          return updated;
        });
        // Adjust active index if needed
        if (activeTestIndex >= testList.length - 1) {
          setActiveTestIndex(Math.max(0, testList.length - 2));
        }
      } else {
        alert(result.error || 'Failed to remove test.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      onSuccess(results); // Pass data back to parent
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Tests available to add (not already in the order)
  const testsToAdd = availableTests.filter(t => !testList.includes(t.name));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Enter Results</h2>
            <p className="text-sm text-slate-500">
              Patient: <span className="font-semibold text-slate-900">{order.patient_name}</span> | 
              ID: #{order.id}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar: Test List */}
          <div className="w-64 bg-slate-50 border-r border-slate-100 p-4 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase">Tests Requested</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`p-1.5 rounded-md transition-colors ${editMode
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                title={editMode ? "Done editing" : "Edit tests"}
              >
                {editMode ? <Check size={14} /> : <Edit3 size={14} />}
              </button>
            </div>

            <div className="space-y-2 flex-1">
              {testList.map((test, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <button
                    onClick={() => { if (!editMode) setActiveTestIndex(idx); }}
                    className={`flex-1 text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-between items-center
                      ${!editMode && activeTestIndex === idx ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}
                      ${editMode ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <span className="truncate">{test}</span>
                    {!editMode && results[test] && <FileCheck size={14} className={activeTestIndex === idx ? 'text-blue-200' : 'text-emerald-500'} />}
                  </button>
                  {editMode && (
                    <button
                      onClick={() => handleRemoveTest(test)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      title="Remove test"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Test Dropdown (visible in edit mode) */}
            {editMode && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Add Test</p>
                <div className="flex gap-1.5">
                  <select
                    className="flex-1 p-2 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500"
                    value={addTestDropdownValue}
                    onChange={(e) => setAddTestDropdownValue(e.target.value)}
                  >
                    <option value="">-- Select Test --</option>
                    {testsToAdd.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAddTest(addTestDropdownValue)}
                    disabled={!addTestDropdownValue}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    title="Add test"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Area: Input Form */}
          <div className="flex-1 p-8 overflow-y-auto">
            <h3 className="text-lg font-bold text-blue-800 mb-6 border-b pb-2">{currentTestName}</h3>

            {currentParams.length === 0 ? (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                <span>No parameters defined for this test in catalog.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase border-b pb-2">
                  <div className="col-span-5">Parameter</div>
                  <div className="col-span-3">Observed Value</div>
                  <div className="col-span-2">Unit</div>
                  <div className="col-span-2">Ref. Range</div>
                </div>

                {/* Rows */}
                {currentParams.map((param, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 items-center hover:bg-slate-50 p-2 rounded transition-colors">
                    <div className="col-span-5 font-medium text-slate-700">{param.name}</div>
                    <div className="col-span-3">
                      <input 
                        type="text" 
                        className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-bold text-slate-900"
                        placeholder="--"
                        value={results[currentTestName]?.[param.name] || ''}
                        onChange={(e) => handleInputChange(param.name, e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 text-sm text-slate-500">{param.unit}</div>
                    <div className="col-span-2 text-xs text-slate-400">{param.ref}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
          <div className="text-xs text-slate-400">
            * Values are auto-saved locally until finalized.
          </div>
          <div className="flex gap-3">
             <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
            >
              <Save size={18} />
              <span>Save Results</span>
            </button>
            <button 
              onClick={() => onSuccess(results, 'print-only')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
              title="Print report without header, footer, or logo"
            >
              <FileText size={18} />
              <span>Only Report</span>
            </button>
            <button 
              onClick={() => onSuccess(results, 'print')}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              <Printer size={18} />
              <span>Save & Print PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EnterResultsModal;