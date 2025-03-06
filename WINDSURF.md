# WINDSURF Guidelines for fasterInvoice Project

This document serves as a set of instructions and guidelines for AI assistants working with the fasterInvoice project. Follow these guidelines to ensure consistent and effective assistance.

## General Workflow

### Before Making Changes

1. **Always kill all running application processes first**
   ```bash
   # Kill main npm processes
   pkill -f "npm run dev" || true
   
   # Kill specific server processes
   pkill -f "node server.js" || true
   
   # Kill Vite processes
   pkill -f "vite" || true
   
   # Verify all processes are terminated
   ps aux | grep -E 'node|vite|npm' | grep -v grep | grep fasterInvoice
   ```

2. **Check current state of the application**
   - Review relevant files before making changes
   - Understand the impact of proposed changes

### Making Changes

1. **Implement changes systematically**
   - Make code changes in logical groups
   - Test changes incrementally when possible
   - Use clear commit messages if using version control

2. **Update documentation**
   - Update README.md if installation or usage instructions change
   - Update PROGRESS.md with details of changes made and testing performed
   - Add new documentation for significant features

### After Making Changes

1. **Prompt the user about restarting the application**
   - Ask if they want to run the application again
   - Provide the command to restart: `npm run dev`

2. **If restarting the application**
   - Start the application in non-blocking mode
   - Provide a browser preview when appropriate
   - Verify the application is running correctly

## Documentation Maintenance

### README.md

- Keep README.md concise and focused on:
  - Brief introduction
  - Key features
  - Tech stack
  - Installation instructions
  - Basic usage
  - References to other documentation

### PROGRESS.md

- Use PROGRESS.md for detailed documentation:
  - Setup process and configuration
  - Testing information and results
  - User workflow and journey
  - Feature verification
  - Next steps and improvements

## Application Structure

### Key Components

- **Frontend**: React application with Vite
  - Located in `/src` directory
  - Entry point: `src/main.jsx`

- **Backend**: Express.js server
  - Entry point: `server.js`
  - API routes for clients, projects, and invoices

- **Database**: SQLite
  - Located in `data/invoice.db`
  - Tables: clients, projects, invoices, invoice_items

## Testing

- Run tests with `npm test`
- Test files are located alongside the components they test
- Backend API tests are in `server.test.js`
- Model tests are in `src/db/*.test.js`

## User Workflow

Follow the established user workflow when implementing new features:
1. Client creation
2. Project setup
3. Invoice generation
4. Invoice management
5. Reporting and analysis

## Final Checklist Before Completion

- All application processes are terminated properly
- Documentation is updated (README.md and PROGRESS.md)
- User has been prompted about restarting the application
- Any new features align with the established user workflow
- Testing has been performed where appropriate

---

*This document was created on 2025-03-06 and should be updated as the project evolves.*
