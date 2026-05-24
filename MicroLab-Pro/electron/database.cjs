/**
 * database.cjs — SQLite Database Schema & Initialization
 * 
 * Creates and manages the local SQLite database using better-sqlite3.
 * 
 * Storage Location:
 * - Development: ./microlab.db (project root)
 * - Production: app.getPath('userData')/microlab.db (survives app updates)
 * 
 * Tables: users, patients, doctors, inventory, invoices, lab_tests, settings
 * Seeds default owner (admin/admin123) and staff (staff/staff123) accounts.
 * 
 * Uses WAL journal mode for better read/write concurrency.
 */
const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Ensure database is stored in the User Data directory (persists across updates)
// In development, you might want it in the project root, but for prod:
const dbPath = process.env.NODE_ENV === 'development'
  ? './microlab.db'
  : path.join(app.getPath('userData'), 'microlab.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // Better concurrency for SQLite

// Initialize Database Schema
function initDatabase() {
  // 1. Users (Owner & Employees)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, -- In real app, hash this!
      role TEXT CHECK(role IN ('owner', 'employee')) NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // 2. Patients
  db.prepare(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uhid TEXT UNIQUE, -- Unique Health ID (e.g., P-2024-001)
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      phone TEXT,
      address TEXT,
      total_due REAL DEFAULT 0,
      last_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_vip BOOLEAN DEFAULT 0
    )
  `).run();

  // 3. Doctors (Referrals)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      clinic_name TEXT,
      phone TEXT,
      commission_rate REAL DEFAULT 0
    )
  `).run();

  // 4. Inventory
  db.prepare(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      sku TEXT UNIQUE,
      category TEXT,
      current_stock INTEGER DEFAULT 0,
      min_reorder_level INTEGER DEFAULT 10,
      unit TEXT, -- e.g., 'kits', 'vials'
      batch_number TEXT,
      expiry_date DATE,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // 5. Invoices / Financials
  db.prepare(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      doctor_id INTEGER,
      total_amount REAL,
      paid_amount REAL,
      payment_mode TEXT, -- Cash, UPI, Card
      status TEXT, -- Paid, Partial, Due
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(patient_id) REFERENCES patients(id),
      FOREIGN KEY(doctor_id) REFERENCES doctors(id)
    )
  `).run();

  // 6. Lab Tests (The actual work)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS lab_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER,
      test_name TEXT,
      status TEXT DEFAULT 'Pending', -- Pending, Processing, Completed
      result_data JSON, -- Stores the specific parameters (e.g., Hemoglobin: 12.5)
      FOREIGN KEY(invoice_id) REFERENCES invoices(id)
    )
  `).run();

  // 7. Settings (Lab Profile)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `).run();

  seedData();
  runMigrations();
}

/**
 * runMigrations — Safely adds new columns to existing tables.
 * Each ALTER TABLE is wrapped in try/catch so it won't fail
 * if the column already exists (idempotent).
 */
function runMigrations() {
  // Feature 1: Add remarks column to patients
  try {
    db.prepare('ALTER TABLE patients ADD COLUMN remarks TEXT').run();
  } catch (e) { /* Column already exists */ }

  // Feature 4: Add cost_per_unit column to inventory
  try {
    db.prepare('ALTER TABLE inventory ADD COLUMN cost_per_unit REAL DEFAULT 0').run();
  } catch (e) { /* Column already exists */ }
}

// Seed Initial Data (Owner Account)
function seedData() {
  const userCount = db.prepare('SELECT count(*) as count FROM users').get();
  if (userCount.count === 0) {
    console.log('Seeding default users...');
    const insert = db.prepare('INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)');
    insert.run('admin', 'admin123', 'owner', 'Dr. Owner'); // Default Owner
    insert.run('staff', 'staff123', 'employee', 'Receptionist'); // Default Staff
  }
}

// Export the db instance and init function
module.exports = {
  db,
  initDatabase
};