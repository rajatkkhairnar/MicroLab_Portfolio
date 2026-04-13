// ============================================
// SAMPLE DATA FOR LIVE DEMO
// All data is hardcoded — no backend needed.
// ============================================

// --- Dashboard Stats ---
export const dashboardStats = {
    revenue: 12400,
    patientFlow: 24,
    alerts: 3,
    netProfit: 84200,
};

// --- Chart Data (7-day revenue trend) ---
export const chartData = [
    { name: 'Mon', revenue: 8200, patients: 18 },
    { name: 'Tue', revenue: 11400, patients: 22 },
    { name: 'Wed', revenue: 9800, patients: 15 },
    { name: 'Thu', revenue: 14200, patients: 28 },
    { name: 'Fri', revenue: 10600, patients: 20 },
    { name: 'Sat', revenue: 16800, patients: 32 },
    { name: 'Sun', revenue: 12400, patients: 24 },
];

// --- Activity Feed ---
export const activityFeed = [
    { text: 'CBC results entered for Ravi Sharma', color: 'success', time: new Date(Date.now() - 15 * 60000).toISOString() },
    { text: 'New patient registered: Priya Patel', color: 'info', time: new Date(Date.now() - 45 * 60000).toISOString() },
    { text: 'Low stock alert: Reagent Kit A (5 units)', color: 'warning', time: new Date(Date.now() - 2 * 3600000).toISOString() },
    { text: 'Payment received ₹2,400 from Amit Singh', color: 'success', time: new Date(Date.now() - 3 * 3600000).toISOString() },
    { text: 'Thyroid Panel booked for Neha Gupta', color: 'info', time: new Date(Date.now() - 4 * 3600000).toISOString() },
];

// --- Patients ---
export const patients = [
    { id: 1, name: 'Ravi Sharma', uhid: 'UHID-1001', age: 34, gender: 'Male', phone: '9876543210', total_due: 0 },
    { id: 2, name: 'Priya Patel', uhid: 'UHID-1002', age: 28, gender: 'Female', phone: '9876543211', total_due: 500 },
    { id: 3, name: 'Amit Singh', uhid: 'UHID-1003', age: 45, gender: 'Male', phone: '9876543212', total_due: 0 },
    { id: 4, name: 'Neha Gupta', uhid: 'UHID-1004', age: 31, gender: 'Female', phone: '9876543213', total_due: 1200 },
    { id: 5, name: 'Raj Malhotra', uhid: 'UHID-1005', age: 52, gender: 'Male', phone: '9876543214', total_due: 0 },
    { id: 6, name: 'Sunita Devi', uhid: 'UHID-1006', age: 60, gender: 'Female', phone: '9876543215', total_due: 800 },
    { id: 7, name: 'Vikram Joshi', uhid: 'UHID-1007', age: 38, gender: 'Male', phone: '9876543216', total_due: 0 },
    { id: 8, name: 'Ananya Reddy', uhid: 'UHID-1008', age: 25, gender: 'Female', phone: '9876543217', total_due: 0 },
];

// --- Lab Orders ---
export const labOrders = [
    { id: 201, patient_name: 'Ravi Sharma', age: 34, gender: 'Male', tests: 'Complete Blood Count, ESR', doctor_name: 'Dr. Mehta', order_status: 'Completed', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 202, patient_name: 'Priya Patel', age: 28, gender: 'Female', tests: 'Lipid Profile', doctor_name: 'Dr. Sharma', order_status: 'Processing', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 203, patient_name: 'Amit Singh', age: 45, gender: 'Male', tests: 'Thyroid Panel, HbA1c', doctor_name: 'Dr. Gupta', order_status: 'Pending', created_at: new Date().toISOString() },
    { id: 204, patient_name: 'Neha Gupta', age: 31, gender: 'Female', tests: 'Urine Routine', doctor_name: null, order_status: 'Completed', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 205, patient_name: 'Raj Malhotra', age: 52, gender: 'Male', tests: 'Liver Function Test', doctor_name: 'Dr. Mehta', order_status: 'Pending', created_at: new Date().toISOString() },
    { id: 206, patient_name: 'Sunita Devi', age: 60, gender: 'Female', tests: 'Complete Blood Count, KFT', doctor_name: 'Dr. Sharma', order_status: 'Processing', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
];

// --- Inventory ---
export const inventoryItems = [
    { id: 1, item_name: 'Blood Collection Tubes', sku: 'BCT-001', category: 'Consumable', current_stock: 250, min_reorder_level: 50, unit: 'pcs', batch_number: 'B2024-001', expiry_date: '2026-08-15' },
    { id: 2, item_name: 'Reagent Kit - Hematology', sku: 'RGT-002', category: 'Reagent', current_stock: 8, min_reorder_level: 10, unit: 'kits', batch_number: 'B2024-044', expiry_date: '2026-04-30' },
    { id: 3, item_name: 'Microscope Slides', sku: 'MCS-003', category: 'Consumable', current_stock: 500, min_reorder_level: 100, unit: 'pcs', batch_number: 'B2024-012', expiry_date: null },
    { id: 4, item_name: 'Urine Sample Cups', sku: 'USC-004', category: 'Consumable', current_stock: 180, min_reorder_level: 50, unit: 'pcs', batch_number: 'B2024-033', expiry_date: null },
    { id: 5, item_name: 'Reagent Kit - Biochemistry', sku: 'RGT-005', category: 'Reagent', current_stock: 12, min_reorder_level: 15, unit: 'kits', batch_number: 'B2024-055', expiry_date: '2026-03-20' },
    { id: 6, item_name: 'Disposable Gloves (Box)', sku: 'DGL-006', category: 'Safety', current_stock: 45, min_reorder_level: 20, unit: 'boxes', batch_number: 'B2024-078', expiry_date: '2027-01-01' },
    { id: 7, item_name: 'Centrifuge Tubes', sku: 'CTB-007', category: 'Equipment', current_stock: 120, min_reorder_level: 30, unit: 'pcs', batch_number: 'B2024-090', expiry_date: null },
    { id: 8, item_name: 'Pipette Tips (1000µL)', sku: 'PPT-008', category: 'Consumable', current_stock: 3, min_reorder_level: 50, unit: 'packs', batch_number: 'B2024-101', expiry_date: null },
    { id: 9, item_name: 'Reagent Kit - Thyroid', sku: 'RGT-009', category: 'Reagent', current_stock: 5, min_reorder_level: 10, unit: 'kits', batch_number: 'B2024-110', expiry_date: '2026-05-10' },
    { id: 10, item_name: 'Alcohol Swabs', sku: 'ALC-010', category: 'Consumable', current_stock: 300, min_reorder_level: 100, unit: 'pcs', batch_number: 'B2024-125', expiry_date: '2027-06-01' },
    { id: 11, item_name: 'Lancets (Sterile)', sku: 'LAN-011', category: 'Consumable', current_stock: 200, min_reorder_level: 50, unit: 'pcs', batch_number: 'B2024-140', expiry_date: '2026-12-31' },
    { id: 12, item_name: 'Staining Solution', sku: 'STN-012', category: 'Reagent', current_stock: 15, min_reorder_level: 5, unit: 'bottles', batch_number: 'B2024-155', expiry_date: '2026-09-01' },
];

// --- Financial Transactions ---
export const transactions = [
    { id: 1, patient_name: 'Ravi Sharma', doctor_name: 'Dr. Mehta', payment_mode: 'Cash', paid_amount: 1200, total_amount: 1200, status: 'Paid', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 2, patient_name: 'Priya Patel', doctor_name: 'Dr. Sharma', payment_mode: 'UPI', paid_amount: 800, total_amount: 1300, status: 'Partial', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 3, patient_name: 'Amit Singh', doctor_name: 'Dr. Gupta', payment_mode: 'Card', paid_amount: 2400, total_amount: 2400, status: 'Paid', created_at: new Date().toISOString() },
    { id: 4, patient_name: 'Neha Gupta', doctor_name: null, payment_mode: 'Cash', paid_amount: 600, total_amount: 1800, status: 'Partial', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 5, patient_name: 'Raj Malhotra', doctor_name: 'Dr. Mehta', payment_mode: 'UPI', paid_amount: 3500, total_amount: 3500, status: 'Paid', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
    { id: 6, patient_name: 'Sunita Devi', doctor_name: 'Dr. Sharma', payment_mode: 'Cash', paid_amount: 900, total_amount: 1700, status: 'Partial', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 7, patient_name: 'Vikram Joshi', doctor_name: 'Dr. Gupta', payment_mode: 'Card', paid_amount: 1800, total_amount: 1800, status: 'Paid', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
    { id: 8, patient_name: 'Ananya Reddy', doctor_name: null, payment_mode: 'UPI', paid_amount: 2200, total_amount: 2200, status: 'Paid', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
];

export const financialStats = {
    totalRevenue: 13400,
    totalDue: 2500,
    count: transactions.length,
    byMode: {
        Cash: 2700,
        UPI: 6500,
        Card: 4200,
    },
};

// --- Doctors (for Settings) ---
export const doctors = [
    { id: 1, name: 'Dr. Rajesh Mehta', clinic_name: 'Mehta Clinic', commission_rate: 10 },
    { id: 2, name: 'Dr. Sunita Sharma', clinic_name: 'City Hospital', commission_rate: 15 },
    { id: 3, name: 'Dr. Anil Gupta', clinic_name: 'Gupta Health Center', commission_rate: 12 },
];

// --- Lab Profile (for Settings) ---
export const labProfile = {
    labName: 'MICROLAB PRO DIAGNOSTICS',
    address: '123 Lab Street, Medical Complex, Mumbai - 400001',
    phone: '+91 98765 43210',
    email: 'info@microlabpro.com',
    license: 'MH-LAB-2024-00123',
    footerText: '*** End of Report ***',
};
