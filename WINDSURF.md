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

## VPS Deployment Management

### Service Management

1. **Checking Service Status**
   ```bash
   systemctl status fasterinvoice.service
   ```

2. **Restarting the Service**
   ```bash
   systemctl restart fasterinvoice.service
   ```

3. **Stopping the Service**
   ```bash
   systemctl stop fasterinvoice.service
   ```

4. **Viewing Service Logs**
   ```bash
   journalctl -u fasterinvoice.service
   # For real-time logs
   journalctl -u fasterinvoice.service -f
   ```

### Making Changes on VPS

1. **Before making changes to deployed application**
   - Stop the service: `systemctl stop fasterinvoice.service`
   - Make necessary code changes
   - Rebuild the frontend if needed: `npm run build`
   - Restart the service: `systemctl restart fasterinvoice.service`

2. **Updating the application**
   ```bash
   # Navigate to the application directory
   cd /root/fasterInvoice
   
   # Pull latest changes
   git pull
   
   # If there are local changes that might conflict
   git stash
   
   # Install any new dependencies
   npm install
   
   # Rebuild the frontend
   npm run build
   
   # Restart the service
   systemctl restart fasterinvoice.service
   ```

3. **Port Configuration**
   - The application is configured to run on port 54321 in development mode and port 7654 in production mode
   - Configuration in server.js:
     ```javascript
     const PORT = process.env.NODE_ENV === 'production' ? 7654 : 54321;
     ```
   - To change the port:
     - Edit the server.js file to update the PORT constant
     - If using systemd, edit the service file: `/etc/systemd/system/fasterinvoice.service`
     - Update the `Environment=PORT=7654` line if needed
     - Run `systemctl daemon-reload` to reload the configuration
     - Restart the service: `systemctl restart fasterinvoice.service`

### HTTPS Configuration

1. **SSL Certificate Management**
   - The application uses a trusted Let's Encrypt SSL certificate for the domain mauricioinvoice.site
   - Certificate and key are stored in `/etc/letsencrypt/live/mauricioinvoice.site/`
   - Certificate is valid until June 6, 2025 and will auto-renew via Certbot's scheduled tasks
   - If you need to manually renew the certificate:
   ```bash
   # Stop services temporarily
   systemctl stop nginx
   systemctl stop fasterinvoice.service
   
   # Renew certificate
   certbot renew
   
   # Start services again
   systemctl start nginx
   systemctl start fasterinvoice.service
   ```

2. **Nginx Configuration**
   - Nginx is configured as a reverse proxy to provide a clean URL without port number
   - Configuration files:
     - `/etc/nginx/sites-available/fasterinvoice`
     - `/etc/nginx/sites-available/mauricioinvoice.site`
   - Both configuration files should be enabled via symbolic links in `/etc/nginx/sites-enabled/`
   - The application is accessible at `https://mauricioinvoice.site` (no port number needed)
   - Both www and non-www domain versions are supported
   - To modify the Nginx configuration:
   ```bash
   # Edit the configuration
   nano /etc/nginx/sites-available/fasterinvoice
   
   # Test configuration
   nginx -t
   
   # Apply changes
   systemctl reload nginx
   ```
   - The current configuration:
     - Redirects HTTP to HTTPS
     - Forwards HTTPS traffic to the application on port 54321
     - Handles SSL termination with Let's Encrypt certificates

3. **Static File Serving**
   - The application serves static files from the `dist` directory
   - Configuration in server.js:
     ```javascript
     app.use(express.static(path.join(__dirname, 'dist')));
     ```
   - The catch-all route serves the React app from the dist directory:
     ```javascript
     app.get('*', (req, res) => {
       // Exclude API routes from this catch-all handler
       if (req.url.startsWith('/api/')) {
         return res.status(404).json({ error: 'API endpoint not found' });
       }
       
       // For all other routes, serve the React app
       res.sendFile(path.join(__dirname, 'dist', 'index.html'));
     });
     ```
   - After making changes to the frontend, always rebuild with `npm run build`

4. **Security Headers**
   - The application implements several security headers:
   ```javascript
   app.use((req, res, next) => {
     res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
     res.setHeader('X-Content-Type-Options', 'nosniff');
     res.setHeader('X-Frame-Options', 'DENY');
     res.setHeader('X-XSS-Protection', '1; mode=block');
     res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
     next();
   });
   ```
   - These headers enhance security by preventing common web vulnerabilities

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

## Mobile Optimization Guidelines

When making changes to the application, ensure they follow these mobile-first principles:

1. **Touch Targets**
   - All interactive elements should be at least 44x44 pixels
   - Provide adequate spacing between touch targets
   - Use padding rather than margins for touch areas

2. **Form Inputs**
   - Input fields should have sufficient height (minimum 44px)
   - Use appropriate input types (tel, email, number, etc.)
   - Ensure labels are clearly associated with inputs

3. **Layout**
   - Use single column layouts where possible
   - Limit horizontal scrolling
   - Ensure content fits within the viewport width
   - Use appropriate spacing between elements

4. **API Integration**
   - Ensure field names in forms match database schema exactly
   - Verify API endpoints and HTTP methods match server expectations
   - Format request bodies correctly according to API requirements

5. **Recent Fixes Reference**
   - When working with the Invoices component, note these important fixes:
     - Form field names should use `issue_date` (not `invoice_date`)
     - Amount field should use `total_amount` (not `amount`)
     - Status updates use PUT to `/api/invoices/:id/status`
     - Invoice creation requires both invoice data and items array

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
- Mobile optimization guidelines have been followed

---

*This document was last updated on 2025-03-06 and should be updated as the project evolves.*
