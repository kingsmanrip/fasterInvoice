const db = require('./database');

const InvoiceModel = {
  // Get all invoices with client and project info
  getAll: () => {
    return db.prepare(`
      SELECT 
        i.*,
        c.name as client_name,
        p.name as project_name
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      JOIN projects p ON i.project_id = p.id
      ORDER BY i.created_at DESC
    `).all();
  },

  // Get invoice by ID with items
  getById: (id) => {
    const invoice = db.prepare(`
      SELECT 
        i.*,
        c.name as client_name,
        c.address as client_address,
        c.email as client_email,
        c.phone as client_phone,
        p.name as project_name
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      JOIN projects p ON i.project_id = p.id
      WHERE i.id = ?
    `).get(id);
    
    if (invoice) {
      invoice.items = db.prepare(`
        SELECT * FROM invoice_items WHERE invoice_id = ?
      `).all(id);
    }
    
    return invoice;
  },

  // Create a new invoice
  create: (invoice, items) => {
    // Begin transaction
    const transaction = db.transaction((invoice, items) => {
      // Generate invoice number
      const date = new Date();
      const year = date.getFullYear().toString().substr(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      
      // Get the next invoice count for this month
      const countResult = db.prepare(`
        SELECT COUNT(*) as count FROM invoices 
        WHERE invoice_number LIKE ?
      `).get(`INV-${year}${month}%`);
      
      const count = (countResult.count + 1).toString().padStart(3, '0');
      const invoiceNumber = `INV-${year}${month}-${count}`;
      
      // Insert the invoice
      const { client_id, project_id, issue_date, due_date, notes, total_amount, status } = invoice;
      
      const insertInvoice = db.prepare(`
        INSERT INTO invoices (
          invoice_number, client_id, project_id, issue_date, due_date, 
          notes, total_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertInvoice.run(
        invoiceNumber, client_id, project_id, issue_date, due_date,
        notes, total_amount, status || 'draft'
      );
      
      const invoiceId = result.lastInsertRowid;
      
      // Insert invoice items
      const insertItem = db.prepare(`
        INSERT INTO invoice_items (
          invoice_id, description, quantity, rate, amount
        ) VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const item of items) {
        insertItem.run(
          invoiceId, 
          item.description, 
          item.quantity, 
          item.rate, 
          item.amount
        );
      }
      
      return { id: invoiceId, invoice_number: invoiceNumber, ...invoice, items };
    });
    
    // Execute transaction
    return transaction(invoice, items);
  },

  // Update invoice status
  updateStatus: (id, status) => {
    const stmt = db.prepare('UPDATE invoices SET status = ? WHERE id = ?');
    stmt.run(status, id);
    return { id, status };
  },

  // Delete an invoice and its items
  delete: (id) => {
    return db.transaction(() => {
      db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(id);
      db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
    })();
  }
};

module.exports = InvoiceModel;