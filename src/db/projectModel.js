const db = require('./database');

const ProjectModel = {
  // Get all projects
  getAll: () => {
    return db.prepare(`
      SELECT 
        p.*, 
        c.name as client_name 
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `).all();
  },

  // Get projects by client ID
  getByClientId: (clientId) => {
    return db.prepare(`
      SELECT 
        p.*, 
        c.name as client_name 
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE p.client_id = ?
      ORDER BY p.name
    `).all(clientId);
  },

  // Get a project by ID
  getById: (id) => {
    return db.prepare(`
      SELECT 
        p.*, 
        c.name as client_name 
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE p.id = ?
    `).get(id);
  },

  // Create a new project
  create: (project) => {
    const { client_id, name, description, hourly_rate, status } = project;
    const stmt = db.prepare(
      'INSERT INTO projects (client_id, name, description, hourly_rate, status) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(client_id, name, description, hourly_rate, status || 'active');
    return { id: result.lastInsertRowid, ...project };
  },

  // Update a project
  update: (id, project) => {
    const { client_id, name, description, hourly_rate, status } = project;
    const stmt = db.prepare(
      'UPDATE projects SET client_id = ?, name = ?, description = ?, hourly_rate = ?, status = ? WHERE id = ?'
    );
    stmt.run(client_id, name, description, hourly_rate, status, id);
    return { id, ...project };
  },

  // Delete a project
  delete: (id) => {
    return db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  }
};

module.exports = ProjectModel;