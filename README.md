# Simple Invoice App

A lightweight invoice management application built with React, Vite, Tailwind CSS, and SQLite. Optimized for iPhone usage with a mobile-first design approach.

## Features

- Client management
- Project tracking
- Invoice generation
- PDF download
- Status tracking for projects and invoices
- Mobile-optimized interface with bottom tab navigation
- Responsive design with touch-friendly controls

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

## Mobile Optimization

The application is designed primarily for iPhone usage with:

- Bottom tab navigation for easy access to key sections
- Large touch targets for all interactive elements
- Simplified layouts optimized for smaller screens
- Improved form inputs for mobile interaction
- Status indicators and action buttons sized for touch

## Documentation

For detailed documentation including:
- Setup process
- Testing information
- User workflow
- Feature verification
- Mobile optimization details
- Recent fixes and improvements

Please refer to the [PROGRESS.md](./PROGRESS.md) file.

For development guidelines, refer to [WINDSURF.md](./WINDSURF.md).

## Database

The application uses SQLite to store data locally. The database file is created at `data/invoice.db`.

## License

ISC