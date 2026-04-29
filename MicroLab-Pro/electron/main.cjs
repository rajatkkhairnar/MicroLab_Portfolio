/**
 * main.cjs — Electron Main Process (Backend)
 * 
 * This is the central backend for the MicroLab Pro application.
 * All business logic runs here, isolated from the renderer process.
 * 
 * Responsibilities:
 *   - Window management (BrowserWindow creation, sizing)
 *   - IPC handlers for all database operations (CRUD for patients, inventory, etc.)
 *   - PDF report generation via hidden BrowserWindow → printToPDF
 *   - Auto-update lifecycle management (check, download, install)
 *   - CSV export via native file save dialogs
 * 
 * Communication with the renderer happens exclusively through ipcMain.handle()
 * calls, which are invoked by the preload.cjs bridge.
 */
const { app, BrowserWindow, ipcMain, screen, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { db, initDatabase } = require('./database.cjs');
const { autoUpdater } = require('electron-updater');

// Initialize DB schema on startup
initDatabase();

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    title: 'MicroLab Pro',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false, // Security best practice
      sandbox: false // Required for better-sqlite3 in some envs
    }
  });

  // Load React App
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173'); // Vite Dev Server
    mainWindow.webContents.openDevTools(); // Open inspection tools
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// --- IPC HANDLERS (The Backend Logic) ---

// 1. User Auth
ipcMain.handle('login', async (_, { username, password }) => {
  // In a real app, use bcrypt to compare hashes!
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  return user ? { success: true, user } : { success: false, message: 'Invalid credentials' };
});

// 2. DASHBOARD LOGIC

// 2.1 Stats (Fixed Monthly Logic)
ipcMain.handle('get-dashboard-stats', () => {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7); // "2026-01"

  // Today's Revenue
  const revenueToday = db.prepare(`
    SELECT SUM(paid_amount) as total FROM invoices 
    WHERE date(created_at) = ?
  `).get(today);

  // Patient Flow Today
  const patientsToday = db.prepare(`
    SELECT COUNT(*) as count FROM patients 
    WHERE date(last_visit) = ?
  `).get(today);

  // Critical Inventory
  const alerts = db.prepare(`
    SELECT COUNT(*) as count FROM inventory 
    WHERE current_stock <= min_reorder_level
  `).get();

  // Monthly Net Profit (Revenue - Expense)
  // Note: We don't have an 'expenses' table yet, so we use Revenue * 0.7 estimate or just Revenue for now
  const revenueMonth = db.prepare(`
    SELECT SUM(paid_amount) as total FROM invoices 
    WHERE strftime('%Y-%m', created_at) = ?
  `).get(currentMonth);

  // Assuming 30% operational cost for Net Profit calculation
  const netProfit = (revenueMonth.total || 0) * 0.7;

  return {
    revenue: revenueToday.total || 0,
    patientFlow: patientsToday.count || 0,
    alerts: alerts.count || 0,
    netProfit: netProfit
  };
});

// 2.2 Chart Data (Last 7 Days - Revenue AND Patients)
ipcMain.handle('get-dashboard-chart', (_, days = 7) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const result = dates.map(date => {
    const rev = db.prepare(`SELECT SUM(paid_amount) as total FROM invoices WHERE date(created_at) = ?`).get(date);
    const pat = db.prepare(`SELECT COUNT(*) as count FROM patients WHERE date(last_visit) = ?`).get(date);
    return {
      name: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      revenue: rev.total || 0,
      patients: pat.count || 0
    };
  });
  return result;
});

// 2.3 Activity Feed (Real Logs)
ipcMain.handle('get-activity-feed', () => {
  // FIX: specific column mapping for the UNION
  const logs = db.prepare(`
    SELECT 
      'invoice' as type, 
      'Invoice #' || id || ' Generated' as text, 
      created_at as time, 
      'success' as color
    FROM invoices 
    
    UNION ALL
    
    SELECT 
      'patient' as type, 
      'New Patient: ' || name as text, 
      last_visit as time,  -- FIX: Uses last_visit
      'info' as color
    FROM patients
    
    UNION ALL
    
    SELECT 
      'alert' as type, 
      'Low Stock: ' || item_name as text, 
      updated_at as time, 
      'warning' as color
    FROM inventory 
    WHERE current_stock <= min_reorder_level
    
    ORDER BY time DESC 
    LIMIT 5
  `).all();

  return logs;
});

// 2.4 Export CSV (Universal Helper)

ipcMain.handle('export-csv', async (_, { type, data }) => {
  const { filePath } = await dialog.showSaveDialog({
    title: `Export ${type}`,
    defaultPath: `MicroLab_${type}_${Date.now()}.csv`,
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });

  if (filePath) {
    // Convert JSON to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','), // Header Row
      ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] || '')).join(',')) // Data Rows
    ].join('\n');

    fs.writeFileSync(filePath, csvContent);
    return { success: true };
  }
  return { success: false };
});

// 3. Patient Management
ipcMain.handle('get-patients', (_, searchTerm) => {
  let sql = `
    SELECT 
      p.*,
      -- Live Calculation of Total Due (Sum of all unpaid invoices)
      COALESCE((SELECT SUM(total_amount - paid_amount) FROM invoices WHERE patient_id = p.id), 0) as calculated_due,
      -- Count of invoices (to distinguish 'no history' from 'fully paid')
      (SELECT COUNT(*) FROM invoices WHERE patient_id = p.id) as invoice_count
    FROM patients p
  `;

  const args = [];
  if (searchTerm) {
    sql += ` WHERE p.name LIKE ? OR p.phone LIKE ? OR p.uhid LIKE ?`;
    args.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
  }

  sql += ` ORDER BY p.last_visit DESC`;

  const patients = db.prepare(sql).all(...args);

  // Map calculated_due to total_due so the frontend works automatically
  return patients.map(p => ({
    ...p,
    total_due: p.calculated_due, // Override the static column
    invoice_count: p.invoice_count
  }));
});

ipcMain.handle('add-patient', (_, data) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO patients (uhid, name, age, gender, phone, address, is_vip)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(data.uhid, data.name, data.age, data.gender, data.phone, data.address, data.is_vip ? 1 : 0);
    return { success: true, id: info.lastInsertRowid };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('delete-patient', (_, id) => {
  try {
    const transaction = db.transaction((patientId) => {
      const invoices = db.prepare('SELECT id FROM invoices WHERE patient_id = ?').all(patientId);
      const deleteLabTestStmt = db.prepare('DELETE FROM lab_tests WHERE invoice_id = ?');
      for (const inv of invoices) {
        deleteLabTestStmt.run(inv.id);
      }
      db.prepare('DELETE FROM invoices WHERE patient_id = ?').run(patientId);
      db.prepare('DELETE FROM patients WHERE id = ?').run(patientId);
    });
    
    transaction(id);
    return { success: true };
  } catch (err) { 
    console.error("Error deleting patient:", err);
    return { success: false, error: err.message }; 
  }
});

ipcMain.handle('update-patient', (_, p) => {
  try {
    db.prepare(`UPDATE patients SET name=?, age=?, gender=?, phone=?, address=? WHERE id=?`)
      .run(p.name, p.age, p.gender, p.phone, p.address, p.id);
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

// 4. Inventory
ipcMain.handle('get-inventory', () => {
  return db.prepare('SELECT * FROM inventory ORDER BY item_name ASC').all();
});

ipcMain.handle('add-inventory', (_, item) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO inventory (item_name, sku, category, current_stock, min_reorder_level, unit, batch_number, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      item.name,
      item.sku,
      item.category,
      item.stock,
      item.minLevel,
      item.unit,
      item.batch,
      item.expiry
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('update-stock', (_, { id, quantity, type }) => {
  const sql = type === 'add'
    ? 'UPDATE inventory SET current_stock = current_stock + ? WHERE id = ?'
    : 'UPDATE inventory SET current_stock = current_stock - ? WHERE id = ?';

  db.prepare(sql).run(quantity, id);
  return { success: true };
});

ipcMain.handle('delete-inventory', (_, id) => {
  db.prepare('DELETE FROM inventory WHERE id = ?').run(id);
  return { success: true };
});

ipcMain.handle('update-inventory', (_, item) => {
  try {
    const stmt = db.prepare(`
      UPDATE inventory 
      SET item_name = ?, sku = ?, category = ?, min_reorder_level = ?
      WHERE id = ?
    `);
    stmt.run(item.name, item.sku, item.category, item.minLevel, item.id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 5. Financials / Invoicing
ipcMain.handle('create-invoice', (_, data) => {
  // Transaction: Create Invoice -> Add Tests -> Update Patient Due
  const insertInvoice = db.transaction((invoice) => {
    const invStmt = db.prepare(`
      INSERT INTO invoices (patient_id, doctor_id, total_amount, paid_amount, payment_mode, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = invStmt.run(invoice.patientId, invoice.doctorId, invoice.total, invoice.paid, invoice.mode, invoice.status);

    // Add tests (Array of test names)
    const testStmt = db.prepare('INSERT INTO lab_tests (invoice_id, test_name) VALUES (?, ?)');
    for (const test of invoice.tests) {
      testStmt.run(info.lastInsertRowid, test);
    }

    return info.lastInsertRowid;
  });

  try {
    const id = insertInvoice(data);
    return { success: true, invoiceId: id };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('settle-due', (_, { invoiceId, amount, mode }) => {
  try {
    const inv = db.prepare('SELECT total_amount, paid_amount FROM invoices WHERE id = ?').get(invoiceId);
    const newPaid = inv.paid_amount + parseFloat(amount);
    const newStatus = newPaid >= inv.total_amount ? 'Paid' : 'Due';

    db.prepare('UPDATE invoices SET paid_amount = ?, status = ?, payment_mode = ? WHERE id = ?')
      .run(newPaid, newStatus, mode, invoiceId);
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

// Get unpaid invoices for a specific patient
ipcMain.handle('get-patient-invoices', (_, patientId) => {
  return db.prepare(`
    SELECT * FROM invoices 
    WHERE patient_id = ? AND status = 'Due'
    ORDER BY created_at DESC
  `).all(patientId);
});

// 6. Settings
ipcMain.handle('get-lab-profile', () => {
  return db.prepare('SELECT * FROM settings').all();
});

ipcMain.handle('save-lab-profile', (_, profile) => {
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, value] of Object.entries(profile)) {
    stmt.run(key, value);
  }
  return { success: true };
});

// --- 7. Lab Operations (New) ---

// Get all Active Orders (Joined with Patient Name & Test List)
ipcMain.handle('get-lab-orders', (_, { filter, search }) => {
  let sql = `
    SELECT 
      invoices.id, 
      invoices.created_at, 
      patients.id as patient_id,
      patients.name as patient_name, 
      patients.age, 
      patients.gender, 
      doctors.name as doctor_name,
      invoices.status as payment_status,
      GROUP_CONCAT(lab_tests.test_name, ', ') as tests,
      -- Smart Status Logic
      CASE 
        WHEN SUM(CASE WHEN lab_tests.status = 'Completed' THEN 1 ELSE 0 END) = COUNT(lab_tests.id) THEN 'Completed'
        WHEN SUM(CASE WHEN lab_tests.status = 'Processing' THEN 1 ELSE 0 END) > 0 THEN 'Processing'
        ELSE 'Pending'
      END as order_status
    FROM invoices
    JOIN patients ON invoices.patient_id = patients.id
    LEFT JOIN doctors ON invoices.doctor_id = doctors.id
    JOIN lab_tests ON lab_tests.invoice_id = invoices.id
  `;

  const conditions = [];
  if (filter === 'today') conditions.push(`date(invoices.created_at) = date('now', 'localtime')`);
  if (search) conditions.push(`(patients.name LIKE '%${search}%' OR invoices.id LIKE '%${search}%')`);

  if (conditions.length > 0) sql += ` WHERE ` + conditions.join(' AND ');

  sql += ` GROUP BY invoices.id ORDER BY invoices.created_at DESC`;

  return db.prepare(sql).all();
});

ipcMain.handle('get-order-results', (_, orderId) => {
  try {
    const tests = db.prepare('SELECT test_name, result_data FROM lab_tests WHERE invoice_id = ? AND result_data IS NOT NULL').all(orderId);
    const resultsObj = {};
    tests.forEach(t => {
      try {
        resultsObj[t.test_name] = JSON.parse(t.result_data);
      } catch (e) {
        console.error("Failed to parse result_data for", t.test_name);
      }
    });
    return { success: true, data: resultsObj };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('save-test-results', (_, { orderId, results }) => {
  // 1. Update results JSON
  // 2. Set status to Completed
  // Note: We update ALL tests in this invoice for simplicity in this version
  const stmt = db.prepare(`UPDATE lab_tests SET result_data = ?, status = 'Completed' WHERE invoice_id = ? AND test_name = ?`);

  const updateTransaction = db.transaction((data) => {
    for (const [testName, resultObj] of Object.entries(data)) {
      stmt.run(JSON.stringify(resultObj), orderId, testName);
    }
  });

  try {
    updateTransaction(results);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Update a specific test's result
ipcMain.handle('update-test-result', (_, { testId, result, status }) => {
  db.prepare(`
    UPDATE lab_tests 
    SET result_data = ?, status = ? 
    WHERE id = ?
  `).run(JSON.stringify(result), status, testId);
  return { success: true };
});

// Fetch Doctors (for the booking dropdown)
ipcMain.handle('get-doctors', () => {
  return db.prepare('SELECT * FROM doctors').all();
});

// Delete a Doctor
ipcMain.handle('delete-doctor', (_, id) => {
  try {
    // Optional: Check if doctor has linked invoices before deleting? 
    // For now, we allow deletion (invoices will just show null/id)
    db.prepare('DELETE FROM doctors WHERE id = ?').run(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Add a new Doctor (Quick add)
ipcMain.handle('add-doctor', (_, doc) => {
  const stmt = db.prepare('INSERT INTO doctors (name, clinic_name, commission_rate) VALUES (?, ?, ?)');
  stmt.run(doc.name, doc.clinic, doc.rate || 0);
  return { success: true };
});

// Update an existing Doctor
ipcMain.handle('update-doctor', (_, doc) => {
  try {
    db.prepare('UPDATE doctors SET name = ?, clinic_name = ?, commission_rate = ? WHERE id = ?')
      .run(doc.name, doc.clinic, doc.rate || 0, doc.id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// --- 8. Financials ---

ipcMain.handle('get-financial-ledger', (_, filter) => {
  let sql = `
    SELECT 
      invoices.id, 
      invoices.created_at, 
      patients.name as patient_name, 
      doctors.name as doctor_name, 
      invoices.total_amount, 
      invoices.paid_amount, 
      invoices.payment_mode, 
      invoices.status
    FROM invoices
    JOIN patients ON invoices.patient_id = patients.id
    LEFT JOIN doctors ON invoices.doctor_id = doctors.id
  `;

  // Simple Date Filtering
  if (filter === 'today') {
    sql += ` WHERE date(invoices.created_at) = date('now', 'localtime')`;
  } else if (filter === 'month') {
    sql += ` WHERE strftime('%Y-%m', invoices.created_at) = strftime('%Y-%m', 'now')`;
  }

  sql += ` ORDER BY invoices.created_at DESC`;

  const transactions = db.prepare(sql).all();

  // Calculate Aggregates
  const stats = {
    totalRevenue: transactions.reduce((sum, t) => sum + (t.paid_amount || 0), 0),
    totalDue: transactions.reduce((sum, t) => sum + (t.total_amount - t.paid_amount), 0),
    count: transactions.length,
    byMode: {
      Cash: transactions.filter(t => t.payment_mode === 'Cash').length,
      UPI: transactions.filter(t => t.payment_mode === 'UPI').length,
      Card: transactions.filter(t => t.payment_mode === 'Card').length,
    }
  };

  return { transactions, stats };
});

// --- 9. Print Report (Generate PDF & Open with System Viewer) ---

ipcMain.handle('print-report', async (_, { htmlContent, patientName }) => {
  const os = require('os');
  const { dialog } = require('electron');

  // Sanitize patient name to prevent invalid filename characters
  const safePName = patientName ? patientName.replace(/[^a-zA-Z0-9_\s]/g, '').replace(/\s+/g, '_') : 'Patient';
  const dateObj = new Date();
  
  // Format YYYY-MM-DD for filename
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  
  const defaultFilename = `${safePName}_${dd}-${mm}-${yyyy}.pdf`;

  // Provide showSaveDialog options
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save Patient Report',
    defaultPath: path.join(app.getPath('documents'), defaultFilename),
    filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
  });

  if (canceled || !filePath) {
    return { success: true, canceled: true };
  }

  const tempHtml = path.join(os.tmpdir(), `microlab_report_${Date.now()}.html`);
  
  try {
    // Step 1: Write HTML to a temp file for loading
    fs.writeFileSync(tempHtml, htmlContent, 'utf-8');

    return new Promise((resolve) => {
      const printWin = new BrowserWindow({
        width: 794,
        height: 1123,
        show: false,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
        }
      });

      printWin.loadFile(tempHtml);

      printWin.webContents.on('did-finish-load', () => {
        // Small delay to let fonts/images render
        setTimeout(async () => {
          try {
            // Step 2: Generate PDF from the rendered page
            const pdfBuffer = await printWin.webContents.printToPDF({
              printBackground: true,
              pageSize: 'A4',
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
            });

            // Step 3: Save PDF to user chosen path
            fs.writeFileSync(filePath, pdfBuffer);
            printWin.close();

            // Clean up HTML temp file
            try { fs.unlinkSync(tempHtml); } catch (e) { /* ignore */ }

            // Step 4: Open PDF with default system viewer
            shell.openPath(filePath);

            resolve({ success: true });
          } catch (pdfErr) {
            console.error('PDF generation error:', pdfErr);
            printWin.close();
            try { fs.unlinkSync(tempHtml); } catch (e) { /* ignore */ }
            resolve({ success: false, error: pdfErr.message });
          }
        }, 800);
      });

      printWin.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Print window failed to load:', errorCode, errorDescription);
        printWin.close();
        try { fs.unlinkSync(tempHtml); } catch (e) { /* ignore */ }
        resolve({ success: false, error: 'Failed to load print content' });
      });
    });
  } catch (err) {
    console.error('Print report error:', err);
    try { fs.unlinkSync(tempHtml); } catch (e) { /* ignore */ }
    return { success: false, error: err.message };
  }
});

// --- 10. Auto-Update (electron-updater) ---

// Disable auto-download — we want the user to trigger it manually
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Enable logging for diagnostics
autoUpdater.logger = require('electron').app ? console : console;
autoUpdater.logger.transports = undefined; // Avoid crash if logger API differs

// Configure GitHub token for private repo access.
// The token is read from the GH_TOKEN environment variable.
// For built apps, it can also be baked into the app-update.yml at build time.
if (process.env.GH_TOKEN) {
  autoUpdater.requestHeaders = { Authorization: `token ${process.env.GH_TOKEN}` };
}

// Allow update checks in dev mode for testing purposes
// Set the FORCE_DEV_UPDATE_CONFIG env variable to enable this
if (!app.isPackaged && process.env.FORCE_DEV_UPDATE_CONFIG) {
  autoUpdater.forceDevUpdateConfig = true;
}

// Forward update events to the renderer
function sendUpdateStatus(channel, data) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, data);
  }
}

autoUpdater.on('checking-for-update', () => {
  sendUpdateStatus('update-status', { status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
  sendUpdateStatus('update-status', {
    status: 'available',
    version: info.version,
    releaseDate: info.releaseDate
  });
});

autoUpdater.on('update-not-available', (info) => {
  sendUpdateStatus('update-status', {
    status: 'up-to-date',
    version: info.version
  });
});

autoUpdater.on('download-progress', (progress) => {
  sendUpdateStatus('update-status', {
    status: 'downloading',
    percent: Math.round(progress.percent),
    transferred: progress.transferred,
    total: progress.total
  });
});

autoUpdater.on('update-downloaded', (info) => {
  sendUpdateStatus('update-status', {
    status: 'downloaded',
    version: info.version
  });
});

autoUpdater.on('error', (err) => {
  console.error('Auto-updater error:', err);
  let userMessage = err.message || 'Update check failed';
  // Provide a more helpful message for common errors
  if (userMessage.includes('404') || userMessage.includes('Not Found')) {
    userMessage = 'No releases found on GitHub. Please create a release first (see README).';
  } else if (userMessage.includes('not packed')) {
    userMessage = 'Update check is unavailable in development mode.';
  }
  sendUpdateStatus('update-status', {
    status: 'error',
    message: userMessage
  });
});

// IPC: Trigger manual update check
ipcMain.handle('check-for-update', async () => {
  try {
    // Guard: In dev mode without forced config, return a friendly message
    if (!app.isPackaged && !autoUpdater.forceDevUpdateConfig) {
      return { 
        success: false, 
        error: 'Update check is unavailable in development mode. Build the app first or set FORCE_DEV_UPDATE_CONFIG=true.' 
      };
    }
    const result = await autoUpdater.checkForUpdates();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC: Download the available update
ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC: Quit and install the downloaded update
ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});

// IPC: Get current app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// --- App Lifecycle ---

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});