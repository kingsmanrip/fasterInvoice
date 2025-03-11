# Mauricio Paint and DW Invoice App

A lightweight invoice management application built with React, Vite, Tailwind CSS, and SQLite. Optimized for iPhone usage with a mobile-first design approach.

## Features

- Secure authentication with JWT tokens
- Restricted access for authorized users only
- Client management
- Project tracking
- Invoice generation with PDF download capabilities
- **Invoice editing** with dynamic calculations for tax rates, subtotals, and totals
- Status tracking for projects and invoices (draft, pending, paid, overdue)
- Mobile-optimized interface with bottom tab navigation
- Responsive design with touch-friendly controls
- Financial summary and statistics dashboard
- 24/7 uptime with automatic recovery from failures

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Express.js
- **Database**: SQLite with better-sqlite3
- **Authentication**: JSON Web Tokens (JWT)
- **PDF Generation**: jsPDF
- **Bundler**: Vite
- **Server**: Nginx, systemd, Let's Encrypt SSL

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

The application is deployed on a Hostinger Ubuntu VPS and configured to run as a systemd service with Nginx as a reverse proxy. The service is configured for 24/7 uptime with automatic restart capabilities.

### Accessing the Application

The application is accessible at:

```
https://mauricioinvoice.site
```

The application uses a trusted SSL certificate from Let's Encrypt, ensuring secure access without browser warnings. The certificate is configured to automatically renew before expiration (current expiration: June 6, 2025).

### Authentication

The application implements a secure authentication system with the following features:

- **Login Page**: A user-friendly login interface with a paint-related logo
- **Protected Routes**: All application routes are protected and require authentication
- **JWT Authentication**: Secure token-based authentication using JSON Web Tokens
- **Authorized User**: Access is restricted to a single user (Mauricio)
- **Logout Functionality**: Users can securely log out from the application

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
   Wants=network-online.target
   StartLimitIntervalSec=500
   StartLimitBurst=5

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/path/to/fasterInvoice
   ExecStart=/usr/bin/npm start
   Restart=always
   RestartSec=5s
   Environment=PORT=7654
   Environment=NODE_ENV=production
   ReadWritePaths=/etc/letsencrypt/live/mauricioinvoice.site/
   ReadWritePaths=/etc/letsencrypt/archive/mauricioinvoice.site/

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
- Reliable 24/7 operation with automatic recovery from failures

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