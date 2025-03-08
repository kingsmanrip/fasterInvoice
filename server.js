const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const ClientModel = require('./src/db/clientModel');
const ProjectModel = require('./src/db/projectModel');
const InvoiceModel = require('./src/db/invoiceModel');

const app = express();
const PORT = process.env.PORT || 7654;
const HTTP_PORT = 7655; // Non-privileged port for HTTP redirection

// SSL Certificate options
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/mauricioinvoice.site/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/mauricioinvoice.site/fullchain.pem'),
  minVersion: 'TLSv1.2', // Only allow TLS 1.2 and above
  ciphers: [
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305',
  ].join(':')
};

// Add security headers middleware
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
// Clients
app.get('/api/clients', (req, res) => {
  try {
    const clients = ClientModel.getAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clients/:id', (req, res) => {
  try {
    const client = ClientModel.getById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
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

app.put('/api/clients/:id', (req, res) => {
  try {
    const client = ClientModel.update(req.params.id, req.body);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clients/:id', (req, res) => {
  try {
    ClientModel.delete(req.params.id);
    res.json({ message: 'Client deleted successfully' });
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

app.get('/api/clients/:clientId/projects', (req, res) => {
  try {
    const projects = ProjectModel.getByClientId(req.params.clientId);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const project = ProjectModel.getById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const project = ProjectModel.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const project = ProjectModel.update(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    ProjectModel.delete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
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

app.get('/api/invoices/:id', (req, res) => {
  try {
    const invoice = InvoiceModel.getById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices', (req, res) => {
  try {
    const { invoice, items } = req.body;
    const createdInvoice = InvoiceModel.create(invoice, items);
    res.status(201).json(createdInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/invoices/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const invoice = InvoiceModel.updateStatus(req.params.id, status);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/invoices/:id', (req, res) => {
  try {
    InvoiceModel.delete(req.params.id);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// For direct access, create HTTPS server
if (process.env.NODE_ENV === 'production') {
  // Create HTTP server for redirecting to HTTPS
  const httpApp = express();
  httpApp.use((req, res) => {
    res.redirect(`https://${req.headers.host.split(':')[0]}:${PORT}${req.url}`);
  });

  // Start HTTP server (for redirects)
  http.createServer(httpApp).listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`HTTP Server running on port ${HTTP_PORT} (redirecting to HTTPS)`);
  });

  // Create HTTPS server for direct access
  https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
    console.log(`HTTPS Server running on port ${PORT}`);
    console.log(`Access the app at https://mauricioinvoice.site`);
  });
} else {
  // For development or when behind Nginx
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTP Server running on port ${PORT}`);
  });
}