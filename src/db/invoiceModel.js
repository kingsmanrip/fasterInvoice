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
      const { client_id, project_id, issue_date, due_date, notes, total_amount, status,
              tax_rate, tax_amount, subtotal, po_number, terms } = invoice;
      
      const insertInvoice = db.prepare(`
        INSERT INTO invoices (
          invoice_number, client_id, project_id, issue_date, due_date, 
          notes, total_amount, status, tax_rate, tax_amount, subtotal,
          po_number, terms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertInvoice.run(
        invoiceNumber, client_id, project_id, issue_date, due_date,
        notes, total_amount, status || 'draft', tax_rate || 0, tax_amount || 0, 
        subtotal || total_amount, po_number || null, terms || 'Net 30'
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
    const transaction = db.transaction((id) => {
      db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(id);
      db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
    });
    
    return transaction(id);
  },

  // Get invoices by client ID
  getByClientId: (clientId) => {
    return db.prepare(`
      SELECT 
        i.*,
        c.name as client_name,
        p.name as project_name
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      JOIN projects p ON i.project_id = p.id
      WHERE i.client_id = ?
      ORDER BY i.created_at DESC
    `).all(clientId);
  },

  // Get invoices by project ID
  getByProjectId: (projectId) => {
    return db.prepare(`
      SELECT 
        i.*,
        c.name as client_name,
        p.name as project_name
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      JOIN projects p ON i.project_id = p.id
      WHERE i.project_id = ?
      ORDER BY i.created_at DESC
    `).all(projectId);
  },

  // Update an invoice and its items
  update: (id, invoice, items) => {
    // Begin transaction
    const transaction = db.transaction((id, invoice, items) => {
      // Update the invoice
      const { client_id, project_id, issue_date, due_date, notes, total_amount, status, 
              tax_rate, tax_amount, subtotal, po_number, terms } = invoice;
      
      db.prepare(`
        UPDATE invoices 
        SET client_id = ?, project_id = ?, issue_date = ?, due_date = ?, 
            notes = ?, total_amount = ?, status = ?, tax_rate = ?, 
            tax_amount = ?, subtotal = ?, po_number = ?, terms = ?
        WHERE id = ?
      `).run(
        client_id, project_id, issue_date, due_date, notes, total_amount, status,
        tax_rate || 0, tax_amount || 0, subtotal || total_amount, po_number, terms || 'Net 30',
        id
      );
      
      // Delete existing items
      db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(id);
      
      // Insert updated items
      const insertItem = db.prepare(`
        INSERT INTO invoice_items (
          invoice_id, description, quantity, rate, amount
        ) VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const item of items) {
        insertItem.run(
          id, 
          item.description, 
          item.quantity, 
          item.rate, 
          item.amount
        );
      }
      
      // Get the updated invoice with items
      return InvoiceModel.getById(id);
    });
    
    // Execute transaction
    return transaction(id, invoice, items);
  }
};

module.exports = InvoiceModel;