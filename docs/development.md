# Development and Deployment Guide

## Quick Start for Development

### Option 1: Python HTTP Server (Simplest)
If you have Python installed:

```bash
# Python 3.x
python -m http.server 3000

# Python 2.x  
python -m SimpleHTTPServer 3000
```

Then open: http://localhost:3000

### Option 2: Live Server Extension for VS Code
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 3: Node.js Live Server (If npm works)
```bash
npm install
npm run dev
```

## Demo Login Credentials

For testing different user roles:

- **Admin**: `admin@ayresassociates.com` / `demo123`
- **Editor**: `editor@ayresassociates.com` / `demo123`  
- **Viewer**: `viewer@ayresassociates.com` / `demo123`
- **Quick Demo**: Click the "Demo Login" button

## Key Features to Demonstrate

### 1. Interactive Mapping
- **Base layer switching**: Street map vs. Satellite
- **County boundaries**: Toggle visibility with map controls
- **Project visualization**: Color-coded by project type
- **Responsive design**: Test on different screen sizes

### 2. Advanced Filtering
- **Multi-select filters**: Use Ctrl+Click to select multiple options
- **Real-time updates**: Map updates as you change filters
- **Date ranges**: Filter projects by year (1995-2025)
- **Geographic filtering**: Filter by state, county, or municipality
- **Filter combinations**: Test various filter combinations

### 3. Role-Based Access
- **Public view**: Limited project information, only public projects
- **Authenticated view**: Full project details, budgets, file links
- **Admin features**: Data management tools, export capabilities
- **Permission levels**: Different access for Admin/Editor/Viewer roles

### 4. Project Details
- **Interactive popups**: Click on project polygons
- **Detailed modals**: Click popup content for full project details
- **File management**: View associated project files (demo links)
- **Internal paths**: Direct links to project directories (for authenticated users)

### 5. Data Export
- **CSV export**: Export filtered project data
- **Role-based export**: Different data based on user permissions
- **Filter preservation**: Exported data respects current filters

## Database Integration (Production)

### PostgreSQL Setup
1. **Create database**: `createdb aerial_mapping_db`
2. **Run schema**: `psql -d aerial_mapping_db -f database/schema.sql`
3. **Enable PostGIS**: Install PostGIS extension
4. **Configure connection**: Update connection strings in application

### Firebase Setup (Production)
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password provider
3. Update `js/config.js` with your Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### Data Integration
1. **Import your Excel data** into PostgreSQL using the provided schema
2. **Convert geographic data** to GeoJSON format
3. **Update data.js** to fetch from your API endpoints instead of sample data
4. **Configure authentication** to work with your user management system

## Customization Guide

### Branding
- **Logo**: Replace placeholder in `index.html` header
- **Colors**: Update CSS variables in `styles/main.css`
- **Company info**: Update text and contact information

### Map Configuration
- **Geographic extent**: Update `CONFIG.map.center` and `maxBounds` in `config.js`
- **Base layers**: Add or modify tile layer URLs
- **Project symbology**: Customize colors in `CONFIG.projectColors`

### Data Structure
- **Additional fields**: Extend the database schema as needed
- **New project types**: Add to project type enum and color configuration
- **Custom clients**: Update client list and color coding

### User Interface
- **Filter options**: Modify filter dropdowns in `index.html`
- **Additional statistics**: Extend the summary panel
- **Custom reports**: Add new export formats or report types

## Deployment Options

### Static Hosting (GitHub Pages, Netlify)
1. Build static version with sample data
2. Configure Firebase for authentication
3. Deploy to static hosting service
4. Set up custom domain (optional)

### Full Web Application
1. Set up web server (Apache, Nginx)
2. Configure PostgreSQL database
3. Implement API endpoints for data access
4. Set up HTTPS certificates
5. Configure domain and DNS

### Cloud Deployment (AWS, Azure, GCP)
1. Set up cloud database (RDS, Cloud SQL)
2. Deploy application to cloud hosting
3. Configure authentication and security
4. Set up monitoring and backups

## Testing Checklist

### Functionality Testing
- [ ] Map loads correctly with sample data
- [ ] User authentication (login/logout) works
- [ ] All filter combinations work as expected
- [ ] Project popups and details display correctly
- [ ] Role-based access control functions properly
- [ ] Data export produces correct CSV files
- [ ] Map controls (reset, layer toggle) work
- [ ] Responsive design works on mobile

### Performance Testing
- [ ] Map renders smoothly with all projects
- [ ] Filtering updates occur without delays
- [ ] No memory leaks during extended use
- [ ] Authentication state persists across sessions

### Browser Compatibility
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Common Issues

**Map not loading**: Check browser console for JavaScript errors, ensure Leaflet CSS/JS loaded

**Firebase authentication errors**: Verify Firebase configuration, check API keys

**Filter not working**: Check browser console, ensure sample data is loaded

**Layout issues on mobile**: Test responsive breakpoints, check CSS media queries

**CORS errors**: Use proper development server (not file:// protocol)

### Development Tips
- Use browser developer tools for debugging
- Check console for JavaScript errors
- Test with different user roles
- Validate data structures match expected format
- Use responsive design testing tools

## Support and Documentation

### Technical Documentation
- **Leaflet**: https://leafletjs.com/reference.html
- **Firebase Auth**: https://firebase.google.com/docs/auth
- **PostGIS**: https://postgis.net/documentation
- **GeoJSON**: https://geojson.org/

### Academic Context
- **Course**: GEOG 778 - Advanced GIS Programming
- **Purpose**: Demonstration project for Ayres Associates
- **Focus**: Interactive web mapping with user authentication

For questions about implementation or customization, refer to the comprehensive code comments and the `copilot-instructions.md` file for development guidelines.
