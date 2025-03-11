const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'invoice.db');
const db = new Database(dbPath);

// Initialize database with tables
function initDb() {
  // Clients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      hourly_rate REAL,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
    );
  `);

  // Invoices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL UNIQUE,
      client_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      notes TEXT,
      total_amount REAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );
  `);

  // Invoice items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
    );
  `);
}

// Initialize the database
initDb();

// Add new fields to invoices table
try {
  // Check if columns already exist to avoid errors
  const tableInfo = db.prepare("PRAGMA table_info(invoices)").all();
  const columns = tableInfo.map(col => col.name);
  
  if (!columns.includes('tax_rate')) {
    db.exec(`
      ALTER TABLE invoices 
      ADD COLUMN tax_rate REAL DEFAULT 0;
    `);
  }
  
  if (!columns.includes('tax_amount')) {
    db.exec(`
      ALTER TABLE invoices 
      ADD COLUMN tax_amount REAL DEFAULT 0;
    `);
  }
  
  if (!columns.includes('subtotal')) {
    db.exec(`
      ALTER TABLE invoices 
      ADD COLUMN subtotal REAL DEFAULT 0;
    `);
  }
  
  if (!columns.includes('po_number')) {
    db.exec(`
      ALTER TABLE invoices 
      ADD COLUMN po_number TEXT;
    `);
  }
  
  if (!columns.includes('terms')) {
    db.exec(`
      ALTER TABLE invoices 
      ADD COLUMN terms TEXT DEFAULT 'Net 30';
    `);
  }
} catch (error) {
  console.error('Error adding new columns to invoices table:', error);
}

module.exports = db;