const request = require('supertest');
const express = require('express');
const path = require('path');
const ClientModel = require('./src/db/clientModel');
const ProjectModel = require('./src/db/projectModel');
const InvoiceModel = require('./src/db/invoiceModel');

// Mock the database models
jest.mock('./src/db/clientModel');
jest.mock('./src/db/projectModel');
jest.mock('./src/db/invoiceModel');

// Create an instance of the Express app
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Import routes from server.js
// Clients
app.get('/api/clients', (req, res) => {
  try {
    const clients = ClientModel.getAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', (req, res) => {
  try {
    const client = ClientModel.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Projects
app.get('/api/projects', (req, res) => {
  try {
    const projects = ProjectModel.getAll();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invoices
app.get('/api/invoices', (req, res) => {
  try {
    const invoices = InvoiceModel.getAll();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

describe('API Endpoints', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/clients', () => {
    it('should return all clients', async () => {
      // Mock the getAll method to return sample data
      ClientModel.getAll.mockReturnValue([
        { id: 1, name: 'Client 1' },
        { id: 2, name: 'Client 2' }
      ]);

      const res = await request(app).get('/api/clients');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toEqual('Client 1');
      expect(ClientModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      // Mock the getAll method to throw an error
      ClientModel.getAll.mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get('/api/clients');
      
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Database error');
    });
  });

  describe('GET /api/projects', () => {
    it('should return all projects', async () => {
      // Mock the getAll method to return sample data
      ProjectModel.getAll.mockReturnValue([
        { id: 1, name: 'Project 1', client_id: 1 },
        { id: 2, name: 'Project 2', client_id: 2 }
      ]);

      const res = await request(app).get('/api/projects');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toEqual('Project 1');
      expect(ProjectModel.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/invoices', () => {
    it('should return all invoices', async () => {
      // Mock the getAll method to return sample data
      InvoiceModel.getAll.mockReturnValue([
        { id: 1, invoice_number: 'INV-001', client_id: 1, project_id: 1 },
        { id: 2, invoice_number: 'INV-002', client_id: 2, project_id: 2 }
      ]);

      const res = await request(app).get('/api/invoices');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].invoice_number).toEqual('INV-001');
      expect(InvoiceModel.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/clients', () => {
    it('should create a new client', async () => {
      // Mock the create method to return sample data
      const newClient = { id: 3, name: 'New Client' };
      ClientModel.create.mockReturnValue(newClient);

      const res = await request(app)
        .post('/api/clients')
        .send({ name: 'New Client' });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(newClient);
      expect(ClientModel.create).toHaveBeenCalledTimes(1);
      expect(ClientModel.create).toHaveBeenCalledWith({ name: 'New Client' });
    });
  });
});
