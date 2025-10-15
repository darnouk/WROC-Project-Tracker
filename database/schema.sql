-- PostgreSQL Database Schema for Aerial Mapping Project Tracker
-- Ayres Associates - GEOG 778 Project
-- Created for academic demonstration purposes

-- Enable PostGIS extension for spatial data support
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- Stores user information and role-based access control
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for performance
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for users table
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- =====================================================
-- AERIAL PROJECTS TABLE
-- Main table storing all aerial mapping project information
-- =====================================================
CREATE TABLE aerial_projects (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL CHECK (project_type IN (
        'orthophotography', 'lidar', 'photogrammetry', 'aerial-survey', 'mapping'
    )),
    client VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    state VARCHAR(2) CHECK (state IN ('WI', 'MN', 'IA', 'IL', 'MI')),
    county VARCHAR(100),
    municipality VARCHAR(100),
    
    -- Spatial geometry column (PostGIS)
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    
    -- Project details
    budget DECIMAL(12,2) CHECK (budget >= 0),
    internal_path VARCHAR(500),
    description TEXT,
    
    -- Access control
    is_public BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT valid_year_range CHECK (
        EXTRACT(YEAR FROM start_date) >= 1995 AND 
        EXTRACT(YEAR FROM start_date) <= EXTRACT(YEAR FROM CURRENT_DATE) + 5
    )
);

-- Indexes for aerial_projects table
CREATE INDEX idx_projects_type ON aerial_projects(project_type);
CREATE INDEX idx_projects_client ON aerial_projects(client);
CREATE INDEX idx_projects_state ON aerial_projects(state);
CREATE INDEX idx_projects_county ON aerial_projects(county);
CREATE INDEX idx_projects_dates ON aerial_projects(start_date, end_date);
CREATE INDEX idx_projects_public ON aerial_projects(is_public);
CREATE INDEX idx_projects_created ON aerial_projects(created_at);

-- Spatial index for geometry
CREATE INDEX idx_projects_geometry ON aerial_projects USING GIST(geometry);

-- Full-text search index for project names and descriptions
CREATE INDEX idx_projects_text_search ON aerial_projects USING gin(
    to_tsvector('english', project_name || ' ' || COALESCE(description, ''))
);

-- =====================================================
-- PROJECT FILES TABLE
-- Stores information about files associated with projects
-- =====================================================
CREATE TABLE project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES aerial_projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_type VARCHAR(50),
    file_size BIGINT CHECK (file_size >= 0),
    mime_type VARCHAR(100),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER REFERENCES users(id),
    
    -- File metadata
    checksum VARCHAR(64), -- For file integrity
    is_active BOOLEAN DEFAULT true
);

-- Indexes for project_files table
CREATE INDEX idx_files_project ON project_files(project_id);
CREATE INDEX idx_files_type ON project_files(file_type);
CREATE INDEX idx_files_upload_date ON project_files(upload_date);

-- =====================================================
-- PROJECT BOUNDARIES TABLE
-- Administrative boundaries for geographic filtering
-- =====================================================
CREATE TABLE administrative_boundaries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    boundary_type VARCHAR(50) NOT NULL CHECK (boundary_type IN (
        'state', 'county', 'municipality', 'township', 'district'
    )),
    state VARCHAR(2),
    parent_id INTEGER REFERENCES administrative_boundaries(id),
    
    -- Spatial geometry
    geometry GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
    
    -- Metadata
    area_sq_miles DECIMAL(10,2),
    population INTEGER,
    fips_code VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for administrative_boundaries
CREATE INDEX idx_boundaries_type ON administrative_boundaries(boundary_type);
CREATE INDEX idx_boundaries_state ON administrative_boundaries(state);
CREATE INDEX idx_boundaries_parent ON administrative_boundaries(parent_id);
CREATE INDEX idx_boundaries_geometry ON administrative_boundaries USING GIST(geometry);
CREATE INDEX idx_boundaries_fips ON administrative_boundaries(fips_code);

-- =====================================================
-- PROJECT AUDIT LOG
-- Tracks changes to projects for accountability
-- =====================================================
CREATE TABLE project_audit_log (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES aerial_projects(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    old_values JSONB,
    new_values JSONB
);

-- Indexes for audit log
CREATE INDEX idx_audit_project ON project_audit_log(project_id);
CREATE INDEX idx_audit_date ON project_audit_log(changed_at);
CREATE INDEX idx_audit_user ON project_audit_log(changed_by);

-- =====================================================
-- USER SESSIONS TABLE
-- Track user sessions and activity
-- =====================================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    firebase_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Indexes for user sessions
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_active ON user_sessions(is_active, expires_at);
CREATE INDEX idx_sessions_activity ON user_sessions(last_activity);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON aerial_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boundaries_updated_at 
    BEFORE UPDATE ON administrative_boundaries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUDIT TRIGGER FOR PROJECT CHANGES
-- =====================================================

-- Function to log project changes
CREATE OR REPLACE FUNCTION log_project_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO project_audit_log (project_id, action, changed_by, new_values)
        VALUES (NEW.id, 'INSERT', NEW.created_by, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO project_audit_log (project_id, action, changed_by, old_values, new_values)
        VALUES (NEW.id, 'UPDATE', NEW.updated_by, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO project_audit_log (project_id, action, old_values)
        VALUES (OLD.id, 'DELETE', to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to projects table
CREATE TRIGGER project_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON aerial_projects
    FOR EACH ROW EXECUTE FUNCTION log_project_changes();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for public projects (accessible to unauthenticated users)
CREATE VIEW public_projects AS
SELECT 
    id, project_name, project_type, client, start_date, end_date,
    state, county, municipality, geometry, description, created_at
FROM aerial_projects 
WHERE is_public = true;

-- View for project summary statistics
CREATE VIEW project_statistics AS
SELECT 
    COUNT(*) as total_projects,
    COUNT(DISTINCT client) as unique_clients,
    COUNT(DISTINCT project_type) as project_types,
    MIN(start_date) as earliest_project,
    MAX(end_date) as latest_project,
    SUM(budget) as total_budget,
    AVG(budget) as average_budget,
    COUNT(CASE WHEN is_public THEN 1 END) as public_projects
FROM aerial_projects;

-- View for projects with file counts
CREATE VIEW projects_with_files AS
SELECT 
    p.*,
    COALESCE(f.file_count, 0) as file_count,
    COALESCE(f.total_file_size, 0) as total_file_size
FROM aerial_projects p
LEFT JOIN (
    SELECT 
        project_id,
        COUNT(*) as file_count,
        SUM(file_size) as total_file_size
    FROM project_files 
    WHERE is_active = true
    GROUP BY project_id
) f ON p.id = f.project_id;

-- =====================================================
-- FUNCTIONS FOR SPATIAL QUERIES
-- =====================================================

-- Function to find projects within a geographic boundary
CREATE OR REPLACE FUNCTION projects_in_boundary(boundary_geom GEOMETRY)
RETURNS TABLE(
    project_id INTEGER,
    project_name VARCHAR(255),
    overlap_area DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.project_name,
        ROUND(ST_Area(ST_Intersection(p.geometry, boundary_geom))::DECIMAL, 2) as overlap_area
    FROM aerial_projects p
    WHERE ST_Intersects(p.geometry, boundary_geom)
    ORDER BY overlap_area DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get projects within distance of a point
CREATE OR REPLACE FUNCTION projects_near_point(
    point_lat DECIMAL, 
    point_lon DECIMAL, 
    distance_meters INTEGER
)
RETURNS TABLE(
    project_id INTEGER,
    project_name VARCHAR(255),
    distance DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.project_name,
        ROUND(ST_Distance(p.geometry::geography, ST_Point(point_lon, point_lat)::geography)::DECIMAL, 2) as distance
    FROM aerial_projects p
    WHERE ST_DWithin(p.geometry::geography, ST_Point(point_lon, point_lat)::geography, distance_meters)
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample users (for development/demo)
INSERT INTO users (firebase_uid, email, role, first_name, last_name, department) VALUES
('demo-admin-uid', 'admin@ayresassociates.com', 'admin', 'John', 'Smith', 'Aerial Mapping'),
('demo-editor-uid', 'editor@ayresassociates.com', 'editor', 'Sarah', 'Johnson', 'GIS Services'),
('demo-viewer-uid', 'viewer@ayresassociates.com', 'viewer', 'Mike', 'Wilson', 'Project Management');

-- Insert sample Wisconsin counties
INSERT INTO administrative_boundaries (name, boundary_type, state, geometry, fips_code) VALUES
('Dane County', 'county', 'WI', ST_GeomFromText('MULTIPOLYGON(((-89.9 43.0, -89.0 43.0, -89.0 43.6, -89.9 43.6, -89.9 43.0)))', 4326), '55025'),
('Milwaukee County', 'county', 'WI', ST_GeomFromText('MULTIPOLYGON(((-88.3 42.8, -87.8 42.8, -87.8 43.2, -88.3 43.2, -88.3 42.8)))', 4326), '55079'),
('Waukesha County', 'county', 'WI', ST_GeomFromText('MULTIPOLYGON(((-88.8 42.9, -88.1 42.9, -88.1 43.4, -88.8 43.4, -88.8 42.9)))', 4326), '55133');

-- Insert sample projects
INSERT INTO aerial_projects (
    project_name, project_type, client, start_date, end_date, 
    state, county, municipality, geometry, budget, internal_path, 
    description, is_public, created_by
) VALUES
(
    'Madison Metro Orthophotography 2023', 
    'orthophotography', 
    'WROC', 
    '2023-04-15', 
    '2023-08-30',
    'WI', 
    'Dane County', 
    'Madison',
    ST_GeomFromText('MULTIPOLYGON(((-89.6 43.0, -89.2 43.0, -89.2 43.3, -89.6 43.3, -89.6 43.0)))', 4326),
    125000.00,
    'R:/WROC/2023/Dane/Madison_Ortho',
    'High-resolution orthophotography for Madison metropolitan area covering 150 square miles at 6-inch pixel resolution.',
    true,
    1
),
(
    'Milwaukee Harbor LiDAR Survey', 
    'lidar', 
    'SEWRPC', 
    '2023-06-01', 
    '2023-09-15',
    'WI', 
    'Milwaukee County', 
    'Milwaukee',
    ST_GeomFromText('MULTIPOLYGON(((-87.9 43.0, -87.8 43.0, -87.8 43.1, -87.9 43.1, -87.9 43.0)))', 4326),
    275000.00,
    'R:/SEWRPC/2023/Milwaukee/Harbor_LiDAR',
    'Bathymetric and topographic LiDAR survey of Milwaukee Harbor and surrounding areas for flood modeling.',
    false,
    1
),
(
    'I-94 Corridor Mapping', 
    'photogrammetry', 
    'WISDOT', 
    '2022-05-10', 
    '2022-11-20',
    'WI', 
    'Waukesha County', 
    'Various',
    ST_GeomFromText('MULTIPOLYGON(((-88.6 43.0, -88.2 43.0, -88.2 43.2, -88.6 43.2, -88.6 43.0)))', 4326),
    180000.00,
    'R:/WISDOT/2022/I94_Corridor',
    'Photogrammetric mapping of I-94 corridor for highway expansion planning and design.',
    true,
    2
);

-- Insert sample project files
INSERT INTO project_files (project_id, file_name, file_path, file_type, file_size, mime_type, uploaded_by) VALUES
(1, 'Madison_Ortho_2023.tif', 'R:/WROC/2023/Dane/Madison_Ortho/Madison_Ortho_2023.tif', 'orthophoto', 2684354560, 'image/tiff', 1),
(1, 'Project_Report.pdf', 'R:/WROC/2023/Dane/Madison_Ortho/Project_Report.pdf', 'report', 15728640, 'application/pdf', 1),
(2, 'Milwaukee_LiDAR_DEM.tif', 'R:/SEWRPC/2023/Milwaukee/Harbor_LiDAR/Milwaukee_LiDAR_DEM.tif', 'elevation', 1932735283, 'image/tiff', 1),
(2, 'Point_Cloud.las', 'R:/SEWRPC/2023/Milwaukee/Harbor_LiDAR/Point_Cloud.las', 'lidar', 5590139904, 'application/octet-stream', 1);

-- =====================================================
-- DATABASE MAINTENANCE AND OPTIMIZATION
-- =====================================================

-- Create maintenance function for cleaning old sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP OR last_activity < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to update project statistics
CREATE OR REPLACE FUNCTION update_project_statistics()
RETURNS VOID AS $$
BEGIN
    -- This could update a materialized view or cache table
    REFRESH MATERIALIZED VIEW IF EXISTS project_stats_cache;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECURITY AND PERMISSIONS
-- =====================================================

-- Create roles for different access levels
CREATE ROLE aerial_mapping_admin;
CREATE ROLE aerial_mapping_editor;
CREATE ROLE aerial_mapping_viewer;
CREATE ROLE aerial_mapping_public;

-- Grant permissions to admin role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aerial_mapping_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aerial_mapping_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO aerial_mapping_admin;

-- Grant permissions to editor role
GRANT SELECT, INSERT, UPDATE ON aerial_projects TO aerial_mapping_editor;
GRANT SELECT, INSERT, UPDATE ON project_files TO aerial_mapping_editor;
GRANT SELECT ON users, administrative_boundaries TO aerial_mapping_editor;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO aerial_mapping_editor;

-- Grant permissions to viewer role
GRANT SELECT ON aerial_projects, project_files, administrative_boundaries TO aerial_mapping_viewer;
GRANT SELECT ON users TO aerial_mapping_viewer; -- Limited to own record

-- Grant permissions to public role
GRANT SELECT ON public_projects TO aerial_mapping_public;
GRANT SELECT ON administrative_boundaries TO aerial_mapping_public;

-- Row Level Security (RLS) for data protection
ALTER TABLE aerial_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Public projects accessible to all" ON aerial_projects
    FOR SELECT TO aerial_mapping_public
    USING (is_public = true);

CREATE POLICY "Authenticated users see all projects" ON aerial_projects
    FOR SELECT TO aerial_mapping_viewer, aerial_mapping_editor, aerial_mapping_admin
    USING (true);

CREATE POLICY "Users can only see their own user record" ON users
    FOR SELECT TO aerial_mapping_viewer
    USING (firebase_uid = current_setting('app.current_user_uid', true));

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Create materialized view for expensive statistics
CREATE MATERIALIZED VIEW project_stats_cache AS
SELECT 
    date_trunc('month', start_date) as month,
    project_type,
    client,
    state,
    COUNT(*) as project_count,
    SUM(budget) as total_budget,
    AVG(ST_Area(geometry::geography)) as avg_area_sqm
FROM aerial_projects
WHERE start_date >= '2020-01-01'
GROUP BY date_trunc('month', start_date), project_type, client, state;

-- Create unique index on materialized view
CREATE UNIQUE INDEX idx_project_stats_cache_unique 
ON project_stats_cache (month, project_type, client, state);

-- Schedule materialized view refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-project-stats', '0 2 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY project_stats_cache;');

-- =====================================================
-- BACKUP AND RECOVERY NOTES
-- =====================================================

-- Regular backup command (run from shell):
-- pg_dump -h localhost -U postgres -d aerial_mapping_db -f aerial_mapping_backup.sql

-- Point-in-time recovery setup:
-- Enable WAL archiving in postgresql.conf:
-- wal_level = replica
-- archive_mode = on  
-- archive_command = 'cp %p /path/to/archive/%f'

COMMIT;
