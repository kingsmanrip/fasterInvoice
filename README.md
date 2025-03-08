# Mauricio Paint and DW Invoice App

A lightweight invoice management application built with React, Vite, Tailwind CSS, and SQLite. Optimized for iPhone usage with a mobile-first design approach.

## Features

- Client management
- Project tracking
- Invoice generation with PDF download capabilities
- Status tracking for projects and invoices (draft, pending, paid, overdue)
- Mobile-optimized interface with bottom tab navigation
- Responsive design with touch-friendly controls
- Financial summary and statistics dashboard

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Express.js
- **Database**: SQLite with better-sqlite3
- **PDF Generation**: jsPDF
- **Bundler**: Vite

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/fasterInvoice.git
cd fasterInvoice
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Express) servers concurrently.

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Deployment

The application is deployed on a Hostinger Ubuntu VPS and configured to run as a systemd service with Nginx as a reverse proxy.

### Accessing the Application

The application is accessible at:

```
https://mauricioinvoice.site
```

The application uses a trusted SSL certificate from Let's Encrypt, ensuring secure access without browser warnings. The certificate is configured to automatically renew before expiration (current expiration: June 6, 2025).

### Deployment Process

1. Clone the repository:
   ```bash
   git clone https://github.com/kingsmanrip/fasterInvoice.git
   ```

2. Install dependencies:
   ```bash
   cd fasterInvoice
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Configure the systemd service:
   Create a file at `/etc/systemd/system/fasterinvoice.service` with the following content:
   ```
   [Unit]
   Description=FasterInvoice Application
   After=network.target

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/path/to/fasterInvoice
   ExecStart=/usr/bin/npm start
   Restart=on-failure
   Environment=PORT=7654
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

5. Enable and start the service:
   ```bash
   systemctl daemon-reload
   systemctl enable fasterinvoice.service
   systemctl start fasterinvoice.service
   ```

## Mobile Optimization

The application is designed primarily for iPhone usage with:

- Bottom tab navigation for easy access to Home, Clients, Projects, and Invoices
- Large touch targets for all interactive elements (following iOS design guidelines)
- Simplified layouts optimized for smaller screens
- Vertical button layout with larger icons for easier tapping
- Compact status indicators and redesigned cards with better spacing
- Maximum width container to ensure proper display on iPhone screens
- Increased padding and spacing for better touch interaction

## Performance

The application has been tested and demonstrates excellent performance:

- API response times under 3ms for all endpoints
- Fast frontend loading (under 20ms)
- Proper data relationships and integrity
- Well-structured database with appropriate foreign key constraints

## Documentation

For detailed documentation including:
- Setup process
- Testing information
- User workflow
- Feature verification
- Mobile optimization details
- Recent fixes and improvements

Please refer to the [PROGRESS.md](./PROGRESS.md) file.

## Database

The application uses SQLite to store data locally. The database file is created at `data/invoice.db` with the following structure:

- `clients`: Stores client information
- `projects`: Stores project information with references to clients
- `invoices`: Stores invoice information with references to clients and projects
- `invoice_items`: Stores line items for invoices

## License

ISC