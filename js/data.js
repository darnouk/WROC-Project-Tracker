// Sample data for demonstration - replace with actual database queries
const SAMPLE_DATA = {
    // Wisconsin Counties GeoJSON (simplified for demo)
    wisconsinCounties: {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Dane County",
                    "state": "WI"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-89.9, 43.0], [-89.0, 43.0], [-89.0, 43.6], [-89.9, 43.6], [-89.9, 43.0]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Milwaukee County",
                    "state": "WI"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-88.3, 42.8], [-87.8, 42.8], [-87.8, 43.2], [-88.3, 43.2], [-88.3, 42.8]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Waukesha County",
                    "state": "WI"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-88.8, 42.9], [-88.1, 42.9], [-88.1, 43.4], [-88.8, 43.4], [-88.8, 42.9]
                    ]]
                }
            }
        ]
    },
    
    // Sample aerial mapping projects
    projects: [
        {
            id: 1,
            project_name: "Madison Metro Orthophotography 2023",
            project_type: "Ortho",
            client: "WROC",
            start_date: "2023-04-15",
            end_date: "2023-08-30",
            state: "WI",
            county: "Dane County",
            municipality: "Madison",
            budget: 125000,
            resolution: 6,
            internal_path: "R:/WROC/2023/Dane/Madison_Ortho",
            description: "High-resolution orthophotography for Madison metropolitan area covering 150 square miles at 6-inch pixel resolution.",
            is_public: true,
            geometry: {
                "type": "Polygon",
                "coordinates": [[
                    [-89.6, 43.0], [-89.2, 43.0], [-89.2, 43.3], [-89.6, 43.3], [-89.6, 43.0]
                ]]
            },
            files: [
                { name: "Madison_Ortho_2023.tif", type: "orthophoto", size: "2.5GB" },
                { name: "Project_Report.pdf", type: "report", size: "15MB" },
                { name: "Flight_Lines.shp", type: "vector", size: "500KB" }
            ]
        },
        {
            id: 2,
            project_name: "Milwaukee Harbor LiDAR Survey",
            project_type: "LiDAR",
            client: "SEWRPC",
            start_date: "2023-06-01",
            end_date: "2023-09-15",
            state: "WI",
            county: "Milwaukee County",
            municipality: "Milwaukee",
            budget: 275000,
            resolution: 3,
            internal_path: "R:/SEWRPC/2023/Milwaukee/Harbor_LiDAR",
            description: "Bathymetric and topographic LiDAR survey of Milwaukee Harbor and surrounding areas for flood modeling.",
            is_public: false,
            geometry: {
                "type": "Polygon",
                "coordinates": [[
                    [-87.9, 43.0], [-87.8, 43.0], [-87.8, 43.1], [-87.9, 43.1], [-87.9, 43.0]
                ]]
            },
            files: [
                { name: "Milwaukee_LiDAR_DEM.tif", type: "elevation", size: "1.8GB" },
                { name: "Point_Cloud.las", type: "lidar", size: "5.2GB" },
                { name: "Survey_Metadata.xml", type: "metadata", size: "25KB" }
            ]
        },
        {
            id: 3,
            project_name: "I-94 Corridor Mapping",
            project_type: "Ortho",
            client: "WISDOT",
            start_date: "2022-05-10",
            end_date: "2022-11-20",
            state: "WI",
            county: "Waukesha County",
            municipality: "Various",
            budget: 180000,
            resolution: 12,
            internal_path: "R:/WISDOT/2022/I94_Corridor",
            description: "Photogrammetric mapping of I-94 corridor for highway expansion planning and design.",
            is_public: true,
            geometry: {
                "type": "Polygon",
                "coordinates": [[
                    [-88.6, 43.0], [-88.2, 43.0], [-88.2, 43.2], [-88.6, 43.2], [-88.6, 43.0]
                ]]
            },
            files: [
                { name: "I94_Topographic_Map.dwg", type: "cad", size: "45MB" },
                { name: "Cross_Sections.pdf", type: "drawing", size: "12MB" },
                { name: "Control_Points.csv", type: "survey", size: "150KB" }
            ]
        },
        {
            id: 4,
            project_name: "Twin Cities Metro Aerial Survey",
            project_type: "Ortho",
            client: "MNDOT",
            start_date: "2023-03-20",
            end_date: "2023-07-30",
            state: "MN",
            county: "Hennepin County",
            municipality: "Minneapolis",
            budget: 320000,
            resolution: 18,
            internal_path: "R:/MNDOT/2023/Twin_Cities",
            description: "Comprehensive aerial survey of Twin Cities metropolitan area for transportation planning.",
            is_public: false,
            geometry: {
                "type": "Polygon",
                "coordinates": [[
                    [-93.4, 44.8], [-93.1, 44.8], [-93.1, 45.1], [-93.4, 45.1], [-93.4, 44.8]
                ]]
            },
            files: [
                { name: "TC_Aerial_Survey.tif", type: "image", size: "3.2GB" },
                { name: "Traffic_Analysis.pdf", type: "report", size: "28MB" },
                { name: "Ground_Control.shp", type: "vector", size: "2MB" }
            ]
        },
        {
            id: 5,
            project_name: "Lake Winnebago Shoreline Mapping",
            project_type: "LiDAR",
            client: "County",
            start_date: "2023-08-01",
            end_date: "2023-10-15",
            state: "WI",
            county: "Winnebago County",
            municipality: "Oshkosh",
            budget: 85000,
            resolution: 3,
            internal_path: "R:/Counties/2023/Winnebago/Shoreline",
            description: "Detailed shoreline mapping for erosion control and environmental monitoring.",
            is_public: true,
            geometry: {
                "type": "Polygon",
                "coordinates": [[
                    [-88.7, 44.0], [-88.4, 44.0], [-88.4, 44.2], [-88.7, 44.2], [-88.7, 44.0]
                ]]
            },
            files: [
                { name: "Shoreline_Vector.shp", type: "vector", size: "5MB" },
                { name: "Erosion_Analysis.pdf", type: "report", size: "18MB" },
                { name: "Water_Levels.csv", type: "data", size: "300KB" }
            ]
        }
    ],
    
    // Sample user data
    users: [
        {
            id: 1,
            email: "john.smith@ayresassociates.com",
            role: "admin",
            first_name: "John",
            last_name: "Smith",
            department: "Aerial Mapping"
        },
        {
            id: 2,
            email: "sarah.johnson@ayresassociates.com",
            role: "editor",
            first_name: "Sarah",
            last_name: "Johnson",
            department: "GIS Services"
        },
        {
            id: 3,
            email: "mike.wilson@ayresassociates.com",
            role: "viewer",
            first_name: "Mike",
            last_name: "Wilson",
            department: "Project Management"
        }
    ]
};

// Data utility functions
const DataUtils = {
    // Filter projects based on criteria
    filterProjects: function(projects, filters) {
        return projects.filter(project => {
            // Project type filter
            if (filters.projectType.length > 0 && 
                !filters.projectType.includes(project.project_type)) {
                return false;
            }
            
            // Year filter
            const projectYear = new Date(project.start_date).getFullYear();
            if (filters.yearFrom && projectYear < filters.yearFrom) {
                return false;
            }
            if (filters.yearTo && projectYear > filters.yearTo) {
                return false;
            }
            
            // Location filter
            if (filters.location.length > 0) {
                const hasMatch = filters.location.some(loc => 
                    project.state === loc || 
                    project.county.includes(loc) ||
                    project.municipality.includes(loc)
                );
                if (!hasMatch) return false;
            }
            
            // Resolution filter
            if (filters.resolution.length > 0) {
                // Check if project has a resolution that matches any selected resolution
                const projectResolution = project.resolution ? project.resolution.toString() : null;
                if (!projectResolution || !filters.resolution.includes(projectResolution)) {
                    return false;
                }
            }
            
            return true;
        });
    },
    
    // Get project by ID
    getProjectById: function(id) {
        return SAMPLE_DATA.projects.find(project => project.id === id);
    },
    
    // Get projects summary statistics
    getProjectStats: function(projects = SAMPLE_DATA.projects) {
        return {
            total: projects.length,
            byType: this.groupBy(projects, 'project_type'),
            byYear: this.groupBy(projects, p => new Date(p.start_date).getFullYear()),
            totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0)
        };
    },
    
    // Group array by property
    groupBy: function(array, keyOrFn) {
        return array.reduce((groups, item) => {
            const key = typeof keyOrFn === 'function' ? keyOrFn(item) : item[keyOrFn];
            groups[key] = (groups[key] || 0) + 1;
            return groups;
        }, {});
    },
    
    // Format currency
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },
    
    // Format date
    formatDate: function(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Get color for project type
    getProjectColor: function(projectType) {
        return CONFIG.projectColors[projectType] || '#666666';
    },
    
    // Get color for client
    getClientColor: function(client) {
        return CONFIG.clientColors[client] || '#666666';
    },

    // Load Wisconsin county boundaries
    loadCountyBoundaries: async function() {
        try {
            const response = await fetch('assets/wisconsin_counties.geojson');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const geojsonData = await response.json();
            return geojsonData;
        } catch (error) {
            console.error('Error loading county boundaries:', error);
            return null;
        }
    }
};
