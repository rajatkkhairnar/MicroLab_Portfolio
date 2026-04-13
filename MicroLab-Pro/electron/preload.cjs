/**
 * preload.cjs — Electron Preload Script (Security Bridge)
 * 
 * Exposes a safe, curated API surface to the renderer process via contextBridge.
 * The renderer accesses these methods as `window.api.<method>()`.
 * All communication happens through ipcRenderer.invoke() → main.cjs handlers.
 * 
 * IMPORTANT: Never expose raw ipcRenderer or Node.js modules directly.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

  // ─── 1. Authentication ─────────────────────────────────────────────
  login: (username, password) => ipcRenderer.invoke('login', { username, password }),

  // ─── 2. Dashboard ──────────────────────────────────────────────────
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
  getDashboardChart: (days) => ipcRenderer.invoke('get-dashboard-chart', days),
  getActivityFeed: () => ipcRenderer.invoke('get-activity-feed'),

  // ─── 3. Utilities ──────────────────────────────────────────────────
  exportCSV: (type, data) => ipcRenderer.invoke('export-csv', { type, data }),

  // ─── 4. Patient Operations ─────────────────────────────────────────
  getPatients: (search) => ipcRenderer.invoke('get-patients', search),
  addPatient: (patientData) => ipcRenderer.invoke('add-patient', patientData),
  updatePatient: (patientData) => ipcRenderer.invoke('update-patient', patientData),
  deletePatient: (id) => ipcRenderer.invoke('delete-patient', id),
  getPatientInvoices: (id) => ipcRenderer.invoke('get-patient-invoices', id),

  // ─── 5. Inventory Management ───────────────────────────────────────
  getInventory: () => ipcRenderer.invoke('get-inventory'),
  addInventory: (item) => ipcRenderer.invoke('add-inventory', item),
  updateStock: (id, quantity, type) => ipcRenderer.invoke('update-stock', { id, quantity, type }),
  updateInventory: (item) => ipcRenderer.invoke('update-inventory', item),
  deleteInventory: (id) => ipcRenderer.invoke('delete-inventory', id),

  // ─── 6. Financials & Invoicing ─────────────────────────────────────
  createInvoice: (invoiceData) => ipcRenderer.invoke('create-invoice', invoiceData),
  getFinancialLedger: (filter) => ipcRenderer.invoke('get-financial-ledger', filter),
  settleDue: (data) => ipcRenderer.invoke('settle-due', data),

  // ─── 7. Settings (Lab Profile) ─────────────────────────────────────
  getLabProfile: () => ipcRenderer.invoke('get-lab-profile'),
  saveLabProfile: (profileData) => ipcRenderer.invoke('save-lab-profile', profileData),

  // ─── 8. Lab Operations ─────────────────────────────────────────────
  getLabOrders: (params) => ipcRenderer.invoke('get-lab-orders', params),
  getOrderResults: (orderId) => ipcRenderer.invoke('get-order-results', orderId),
  getDoctors: () => ipcRenderer.invoke('get-doctors'),
  addDoctor: (doc) => ipcRenderer.invoke('add-doctor', doc),
  deleteDoctor: (id) => ipcRenderer.invoke('delete-doctor', id),
  updateDoctor: (doc) => ipcRenderer.invoke('update-doctor', doc),
  updateTestResult: (data) => ipcRenderer.invoke('update-test-result', data),
  saveTestResults: (data) => ipcRenderer.invoke('save-test-results', data),
  printReport: (htmlContent, patientName) => ipcRenderer.invoke('print-report', { htmlContent, patientName }),

  // ─── 9. Auto-Update (electron-updater) ─────────────────────────────
  checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  /** Listen for update status events from main process (returns cleanup fn) */
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('update-status');
  },

  // ─── 10. System Events ─────────────────────────────────────────────
  /** Generic event listener for validated channels (e.g. push notifications) */
  onReceiveData: (channel, func) => {
    const validChannels = ['notification'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});