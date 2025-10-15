// Configuration file for the Aerial Mapping Project Tracker
const CONFIG = {
    // Map Configuration
    map: {
        center: [44.5, -89.5], // Wisconsin center
        zoom: 7,
        minZoom: 6,
        maxZoom: 18,
        maxBounds: [
            [40.0, -98.0], // Southwest corner
            [49.0, -82.0]  // Northeast corner
        ]
    },
    
    // Layer Configuration
    layers: {
        baseMap: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors',
            options: {
                maxZoom: 18
            }
        },
        satellite: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: '© Esri, DigitalGlobe, GeoEye, Earthstar Geographics',
            options: {
                maxZoom: 18
            }
        }
    },
    
    // Project Type Colors
    projectColors: {
        'orthophotography': '#1B4F8E',
        'lidar': '#2E6BB0',
        'photogrammetry': '#4A90E2',
        'aerial-survey': '#6BB6FF',
        'mapping': '#85C1FF'
    },
    
    // Client Colors
    clientColors: {
        'WROC': '#1B4F8E',
        'SEWRPC': '#2E6BB0',
        'WISDOT': '#4A90E2',
        'MNDOT': '#6BB6FF',
        'County': '#85C1FF',
        'Municipal': '#28a745',
        'Private': '#17a2b8'
    },
    
    // Database Configuration (for PostgreSQL setup documentation)
    database: {
        tables: {
            projects: {
                name: 'aerial_projects',
                fields: [
                    'id SERIAL PRIMARY KEY',
                    'project_name VARCHAR(255) NOT NULL',
                    'project_type VARCHAR(100) NOT NULL',
                    'client VARCHAR(100) NOT NULL',
                    'start_date DATE',
                    'end_date DATE',
                    'state VARCHAR(2)',
                    'county VARCHAR(100)',
                    'municipality VARCHAR(100)',
                    'geometry GEOMETRY(MULTIPOLYGON, 4326)',
                    'budget DECIMAL(10,2)',
                    'internal_path VARCHAR(500)',
                    'description TEXT',
                    'is_public BOOLEAN DEFAULT false',
                    'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
                    'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
                ]
            },
            users: {
                name: 'users',
                fields: [
                    'id SERIAL PRIMARY KEY',
                    'firebase_uid VARCHAR(128) UNIQUE NOT NULL',
                    'email VARCHAR(255) UNIQUE NOT NULL',
                    'role VARCHAR(50) DEFAULT \'viewer\'',
                    'first_name VARCHAR(100)',
                    'last_name VARCHAR(100)',
                    'department VARCHAR(100)',
                    'is_active BOOLEAN DEFAULT true',
                    'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
                    'last_login TIMESTAMP'
                ]
            },
            project_files: {
                name: 'project_files',
                fields: [
                    'id SERIAL PRIMARY KEY',
                    'project_id INTEGER REFERENCES aerial_projects(id)',
                    'file_name VARCHAR(255)',
                    'file_path VARCHAR(500)',
                    'file_type VARCHAR(50)',
                    'file_size BIGINT',
                    'upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
                ]
            }
        }
    },
    
    // API Endpoints (for future backend integration)
    api: {
        baseUrl: '/api/v1',
        endpoints: {
            projects: '/projects',
            users: '/users',
            files: '/files',
            auth: '/auth'
        }
    },
    
    // User Roles and Permissions
    roles: {
        admin: {
            name: 'Administrator',
            permissions: ['read', 'write', 'delete', 'manage_users']
        },
        editor: {
            name: 'Editor',
            permissions: ['read', 'write']
        },
        viewer: {
            name: 'Viewer',
            permissions: ['read']
        }
    }
};
