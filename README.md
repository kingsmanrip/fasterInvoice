# Simple Invoice App

A lightweight invoice management application built with React, Vite, Tailwind CSS, and SQLite.

## Features

- Client management
- Project tracking
- Invoice generation
- PDF download
- Status tracking for projects and invoices
- Responsive design

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

## Documentation

For detailed documentation including:
- Setup process
- Testing information
- User workflow
- Feature verification

Please refer to the [PROGRESS.md](./PROGRESS.md) file.

## Database

The application uses SQLite to store data locally. The database file is created at `data/invoice.db`.

## License

ISC