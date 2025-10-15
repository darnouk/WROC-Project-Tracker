# Ayres Associates Aerial Mapping Project Tracker

A modern, interactive web mapping application for tracking and managing 30+ years of aerial mapping projects. Built with Leaflet, Firebase Authentication, and designed for PostgreSQL backend integration.

## 🎯 Project Overview

This application serves as a comprehensive project tracking system for Ayres Associates' aerial mapping team, providing:

- **Interactive mapping** of project locations across Wisconsin and Minnesota
- **Advanced filtering** by project type, client, date ranges, and geographic regions
- **Role-based access control** with Firebase authentication
- **Dual-access design** (public and authenticated user views)
- **Direct integration** with internal file systems and project directories

## ✨ Key Features

### 🗺️ Interactive Map
- **Leaflet-based mapping** with multiple base layers (street map, satellite)
- **Geographic visualization** of project boundaries
- **County and municipal boundaries** overlay
- **Click interactions** for detailed project information
- **Responsive design** optimized for desktop and mobile

### 🔐 Authentication & Authorization
- **Firebase Authentication** integration
- **Role-based permissions** (Admin, Editor, Viewer)
- **Demo login capabilities** for presentations
- **Secure data access** based on user roles

### 🎛️ Advanced Filtering
- **Multi-criteria filtering**:
  - Project type (Orthophotography, LiDAR, Photogrammetry, etc.)
  - Client organizations (WROC, SEWRPC, WISDOT, MNDOT, etc.)
  - Date ranges (1995-2025)
  - Geographic locations (State, County, Municipality)
- **Real-time filter updates** with visual feedback
- **Filter combination** support with Ctrl+Click selection
- **Export filtered results** to CSV

### 📊 Data Management
- **PostgreSQL schema** ready for production deployment
- **Sample data** included for demonstration
- **Data validation** and integrity checks
- **File system integration** with direct links to project directories

### 🎨 Professional UI/UX
- **Modern design** with Ayres Associates branding
- **Responsive layout** adapting to different screen sizes
- **Keyboard shortcuts** for power users
- **Print-friendly** views for reports
- **Notification system** for user feedback

## 🚀 Quick Start

### Demo Access
The application includes demo login credentials for testing:

- **Admin User**: `admin@ayresassociates.com` / `demo123`
- **Editor User**: `editor@ayresassociates.com` / `demo123`
- **Viewer User**: `viewer@ayresassociates.com` / `demo123`
- **Quick Demo**: Click "Demo Login" button

### Local Development
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**: http://localhost:3000

## 📁 Project Structure

```
aerial-mapping-tracker/
├── index.html                 # Main application page
├── styles/
│   └── main.css              # Application styles
├── js/
│   ├── config.js             # Configuration and constants
│   ├── data.js               # Sample data and utilities
│   ├── auth.js               # Authentication management
│   ├── map.js                # Leaflet map functionality
│   ├── filters.js            # Filtering system
│   └── main.js               # Application coordination
├── database/
│   └── schema.sql            # PostgreSQL database schema
├── docs/
│   └── deployment.md         # Deployment documentation
└── package.json              # Node.js dependencies
```

## 🗄️ Database Integration

### PostgreSQL Schema
The application is designed to work with PostgreSQL and includes:

- **`aerial_projects`** table for project data
- **`users`** table for authentication integration
- **`project_files`** table for file management
- **Spatial data support** with PostGIS extension
- **Full-text search** capabilities

### Sample Data
Includes realistic sample data representing:
- 5 sample projects across Wisconsin and Minnesota
- Various project types and clients
- Geographic boundaries for counties
- Budget and timeline information

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication
3. Update `js/config.js` with your Firebase configuration
4. Configure authentication providers (email/password)

### Map Configuration
- **Base layers**: OpenStreetMap and Satellite imagery
- **Geographic extent**: Focused on Wisconsin/Minnesota
- **Zoom levels**: 6-18 for appropriate detail levels
- **Coordinate system**: WGS84 (EPSG:4326)

## 🎯 User Roles & Permissions

### Administrator
- Full read/write access to all project data
- User management capabilities
- Data export and system administration
- Access to budget and internal file paths

### Editor
- Read/write access to project data
- Can add, edit, and update projects
- Access to internal information
- Cannot manage users

### Viewer
- Read-only access to internal projects
- Can view detailed project information
- Export capabilities for assigned projects
- No editing permissions

### Public (Unauthenticated)
- Limited access to public projects only
- Basic project information visible
- No budget or internal file access
- Read-only map interactions

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop computers** (1200px+)
- **Tablets** (768px - 1199px)
- **Mobile devices** (< 768px)

Mobile-specific features:
- Collapsible sidebar for more map space
- Touch-optimized map controls
- Simplified filter interface
- Modal dialogs adapted for small screens

## 🎨 Customization

### Branding
- Update logo placeholder in `index.html`
- Modify color scheme in `:root` CSS variables
- Customize header and footer content

### Data Sources
- Replace sample data with actual project database
- Update county/boundary GeoJSON files
- Configure API endpoints for live data

### Map Styling
- Customize project symbols and colors
- Add additional base layers
- Modify popup content templates

## 🚀 Deployment

### Requirements
- **Web server** (Apache, Nginx, or similar)
- **HTTPS support** (required for Firebase Auth)
- **PostgreSQL database** (optional, for live data)
- **Node.js** (for build process)

### Production Setup
1. Update Firebase configuration
2. Configure database connections
3. Set up HTTPS certificates
4. Deploy to web server
5. Configure domain and DNS

## 🔒 Security Considerations

- **Firebase Authentication** handles user security
- **Role-based access control** restricts sensitive data
- **HTTPS required** for production deployment
- **Data validation** on both client and server
- **No sensitive data** in client-side code

## 🔍 Testing

### Demo Features
- **Sample data** for immediate testing
- **Mock authentication** for role testing
- **Responsive design** testing across devices
- **Filter functionality** with various combinations

### User Testing
- **Role-based access** testing with demo accounts
- **Map interaction** and performance testing
- **Filter combinations** and edge cases
- **Export functionality** validation

## 📊 Performance

### Optimization Features
- **Debounced filtering** to prevent excessive updates
- **Efficient map rendering** with Leaflet optimizations
- **Lazy loading** of detailed project information
- **Compressed assets** and minimal dependencies

### Monitoring
- **Error handling** with global error capture
- **Performance metrics** via browser dev tools
- **User interaction** tracking (optional)

## 🛠️ Development

### Adding New Features
1. **Project types**: Update `CONFIG.projectColors` in `config.js`
2. **Clients**: Add to `CONFIG.clientColors` and sample data
3. **Geographic regions**: Update boundary GeoJSON files
4. **User roles**: Extend `CONFIG.roles` configuration

### Custom Filters
1. Add new filter UI elements to `index.html`
2. Update `FilterManager` class in `filters.js`
3. Modify `DataUtils.filterProjects` function
4. Test with sample data

## 📝 License

This project is created for Ayres Associates as part of GEOG 778 coursework. All rights reserved.

## 🤝 Contributing

This is a demonstration project created for academic purposes. For production use:

1. Replace demo Firebase configuration
2. Implement actual database connections
3. Add comprehensive error handling
4. Implement data validation
5. Add automated testing
6. Set up continuous integration

## 📞 Support

For questions about this demonstration project or implementation:

- **Course**: GEOG 778
- **Institution**: University of Wisconsin
- **Purpose**: Academic demonstration and proposal

---

**Built with** ❤️ **for Ayres Associates aerial mapping team**
