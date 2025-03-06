const db = require('./database');

const ClientModel = {
  // Get all clients
  getAll: () => {
    return db.prepare('SELECT * FROM clients ORDER BY name').all();
  },

  // Get a client by ID
  getById: (id) => {
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
  },

  // Create a new client
  create: (client) => {
    const { name, email, phone, address } = client;
    const stmt = db.prepare(
      'INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(name, email, phone, address);
    return { id: result.lastInsertRowid, ...client };
  },

  // Update a client
  update: (id, client) => {
    const { name, email, phone, address } = client;
    const stmt = db.prepare(
      'UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?'
    );
    stmt.run(name, email, phone, address, id);
    return { id, ...client };
  },

  // Delete a client
  delete: (id) => {
    return db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  }
};

module.exports = ClientModel;