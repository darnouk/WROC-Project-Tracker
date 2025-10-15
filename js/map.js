// Map management class using Leaflet
class MapManager {
    constructor() {
        this.map = null;
        this.layers = {
            base: null,
            satellite: null,
            counties: null,
            projects: null
        };
        this.currentProjects = SAMPLE_DATA.projects;
        this.filteredProjects = SAMPLE_DATA.projects;
        this.userRole = null;
        
        this.init();
    }
    
    init() {
        this.createMap();
        this.addBaseLayers();
        this.addDataLayers();
        this.setupMapControls();
        this.setupEventListeners();
        
        // Listen for authentication changes
        window.addEventListener('userLoggedIn', (e) => {
            this.updateUserPermissions(e.detail.user.role);
        });
        
        window.addEventListener('userLoggedOut', () => {
            this.updateUserPermissions(null);
        });
    }
    
    createMap() {
        this.map = L.map('map', {
            center: CONFIG.map.center,
            zoom: CONFIG.map.zoom,
            minZoom: CONFIG.map.minZoom,
            maxZoom: CONFIG.map.maxZoom,
            maxBounds: CONFIG.map.maxBounds,
            zoomControl: true,
            attributionControl: true
        });
        
        // Add scale control
        L.control.scale({
            position: 'bottomleft',
            metric: true,
            imperial: true
        }).addTo(this.map);
    }
    
    addBaseLayers() {
        // OpenStreetMap base layer
        this.layers.base = L.tileLayer(CONFIG.layers.baseMap.url, {
            attribution: CONFIG.layers.baseMap.attribution,
            ...CONFIG.layers.baseMap.options
        }).addTo(this.map);
        
        // Satellite imagery layer
        this.layers.satellite = L.tileLayer(CONFIG.layers.satellite.url, {
            attribution: CONFIG.layers.satellite.attribution,
            ...CONFIG.layers.satellite.options
        });
        
        // Layer control
        const baseLayers = {
            "Street Map": this.layers.base,
            "Satellite": this.layers.satellite
        };
        
        L.control.layers(baseLayers, null, {
            position: 'topright',
            collapsed: true
        }).addTo(this.map);
    }
    
    addDataLayers() {
        this.loadCountyBoundaries();
        this.addProjectLayers();
    }
    
    async loadCountyBoundaries() {
        try {
            const geojsonData = await DataUtils.loadCountyBoundaries();
            if (geojsonData) {
                this.layers.counties = L.geoJSON(geojsonData, {
                    style: {
                        color: '#666666',
                        weight: 2,
                        opacity: 0.8,
                        fillColor: '#f0f0f0',
                        fillOpacity: 0.3
                    },
                    onEachFeature: (feature, layer) => {
                        const countyName = feature.properties.COUNTY_NAME;
                        layer.bindPopup(`
                            <div class="county-popup">
                                <h4>${countyName} County</h4>
                                <p>Year(s): </p>
                                <p>Ortho Resolution: </p>
                                <p>Lidar Resolution: </p>
                            </div>
                        `);
                        
                        layer.on({
                            mouseover: (e) => {
                                e.target.setStyle({
                                    weight: 3,
                                    fillOpacity: 0.5,
                                    color: '#1B4F8E'
                                });
                            },
                            mouseout: (e) => {
                                e.target.setStyle({
                                    weight: 2,
                                    fillOpacity: 0.3,
                                    color: '#666666'
                                });
                            }
                        });
                    }
                }).addTo(this.map);
            }
        } catch (error) {
            console.error('Error loading county boundaries:', error);
        }
    }
    
    addProjectLayers() {
        this.updateProjectLayers(this.filteredProjects);
    }
    
    updateProjectLayers(projects) {
        // Remove existing project layer
        if (this.layers.projects) {
            this.map.removeLayer(this.layers.projects);
        }
        
        // Create new project layer
        this.layers.projects = L.layerGroup();
        
        projects.forEach(project => {
            this.addProjectToMap(project);
        });
        
        this.layers.projects.addTo(this.map);
    }
    
    addProjectToMap(project) {
        const color = DataUtils.getProjectColor(project.project_type);
        
        // Create polygon from project geometry
        const polygon = L.polygon(project.geometry.coordinates[0], {
            color: color,
            weight: 2,
            opacity: 0.8,
            fillColor: color,
            fillOpacity: 0.4
        });
        
        // Add popup with project information
        const popupContent = this.createProjectPopup(project);
        polygon.bindPopup(popupContent, {
            maxWidth: 400,
            className: 'project-popup'
        });
        
        // Add click event for detailed view
        polygon.on('click', () => {
            this.showProjectDetails(project);
        });
        
        // Add hover effects
        polygon.on({
            mouseover: (e) => {
                e.target.setStyle({
                    weight: 3,
                    fillOpacity: 0.6
                });
            },
            mouseout: (e) => {
                e.target.setStyle({
                    weight: 2,
                    fillOpacity: 0.4
                });
            }
        });
        
        this.layers.projects.addLayer(polygon);
    }
    
    createProjectPopup(project) {
        const isPublic = project.is_public || this.userRole;
        const canViewDetails = isPublic || (this.userRole && ['admin', 'editor', 'viewer'].includes(this.userRole));
        
        let popup = `
            <div class="popup-content">
                <h3>${project.project_name}</h3>
                <div class="popup-field"><strong>Type:</strong> ${this.formatProjectType(project.project_type)}</div>
                <div class="popup-field"><strong>Client:</strong> ${project.client}</div>
                <div class="popup-field"><strong>Date:</strong> ${DataUtils.formatDate(project.start_date)} - ${DataUtils.formatDate(project.end_date)}</div>
                <div class="popup-field"><strong>Location:</strong> ${project.municipality}, ${project.county}, ${project.state}</div>
        `;
        
        if (canViewDetails) {
            popup += `
                <div class="popup-field"><strong>Budget:</strong> ${DataUtils.formatCurrency(project.budget)}</div>
                <div class="popup-field"><strong>Description:</strong> ${project.description}</div>
            `;
            
            if (this.userRole && project.internal_path) {
                popup += `
                    <div class="popup-links">
                        <a href="#" onclick="alert('Would open: ${project.internal_path}')">📁 Open Project Files</a>
                    </div>
                `;
            }
        }
        
        popup += `</div>`;
        return popup;
    }
    
    showProjectDetails(project) {
        const modal = document.getElementById('projectModal');
        const title = document.getElementById('projectTitle');
        const details = document.getElementById('projectDetails');
        
        title.textContent = project.project_name;
        
        const isPublic = project.is_public || this.userRole;
        const canEdit = this.userRole && ['admin', 'editor'].includes(this.userRole);
        
        let detailsHTML = `
            <div class="project-detail-section">
                <h4>Project Information</h4>
                <p><strong>Type:</strong> ${this.formatProjectType(project.project_type)}</p>
                <p><strong>Client:</strong> ${project.client}</p>
                <p><strong>Duration:</strong> ${DataUtils.formatDate(project.start_date)} to ${DataUtils.formatDate(project.end_date)}</p>
                <p><strong>Location:</strong> ${project.municipality}, ${project.county}, ${project.state}</p>
        `;
        
        if (isPublic || this.userRole) {
            detailsHTML += `
                <p><strong>Budget:</strong> ${DataUtils.formatCurrency(project.budget)}</p>
                <p><strong>Description:</strong> ${project.description}</p>
            `;
        }
        
        detailsHTML += `</div>`;
        
        if (this.userRole && project.files) {
            detailsHTML += `
                <div class="project-detail-section">
                    <h4>Project Files</h4>
                    <ul>
            `;
            
            project.files.forEach(file => {
                detailsHTML += `<li>${file.name} (${file.size})</li>`;
            });
            
            detailsHTML += `</ul></div>`;
        }
        
        if (canEdit) {
            detailsHTML += `
                <div class="project-detail-section">
                    <h4>Actions</h4>
                    <button class="btn btn-primary" onclick="alert('Edit project functionality would go here')">Edit Project</button>
                    <button class="btn btn-info" onclick="alert('Would open: ${project.internal_path}')">Open Files</button>
                </div>
            `;
        }
        
        details.innerHTML = detailsHTML;
        modal.style.display = 'block';
    }
    
    setupMapControls() {
        // Reset view button
        document.getElementById('resetView').addEventListener('click', () => {
            this.resetMapView();
        });
        
        // Toggle layers button
        document.getElementById('toggleLayers').addEventListener('click', () => {
            this.toggleCountyLayer();
        });
    }
    
    setupEventListeners() {
        // Project modal close
        const projectModal = document.getElementById('projectModal');
        const closeBtn = projectModal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            projectModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                projectModal.style.display = 'none';
            }
        });
    }
    
    // Filter projects and update map
    filterProjects(filters) {
        this.filteredProjects = DataUtils.filterProjects(this.currentProjects, filters);
        this.updateProjectLayers(this.filteredProjects);
        
        // Filter county boundaries based on location selection
        this.filterCountyBoundaries(filters.location || []);
        
        // Update statistics
        this.updateProjectStats();
        
        // Fit map to filtered projects if needed
        if (this.filteredProjects.length > 0) {
            this.fitMapToProjects();
        }
    }
    
    updateProjectStats() {
        const totalElement = document.getElementById('filteredProjects');
        if (totalElement) {
            totalElement.textContent = this.filteredProjects.length;
        }
    }
    
    fitMapToProjects() {
        if (this.filteredProjects.length === 0) return;
        
        const group = new L.featureGroup();
        
        this.filteredProjects.forEach(project => {
            const polygon = L.polygon(project.geometry.coordinates[0]);
            group.addLayer(polygon);
        });
        
        this.map.fitBounds(group.getBounds(), {
            padding: [20, 20]
        });
    }
    
    resetMapView() {
        this.map.setView(CONFIG.map.center, CONFIG.map.zoom);
    }
    
    toggleCountyLayer() {
        if (this.map.hasLayer(this.layers.counties)) {
            this.map.removeLayer(this.layers.counties);
        } else {
            this.map.addLayer(this.layers.counties);
        }
    }
    
    updateUserPermissions(role) {
        this.userRole = role;
        
        // Update project layers to reflect new permissions
        this.updateProjectLayers(this.filteredProjects);
        
        // Update any role-specific map features
        if (role) {
            console.log(`Map updated for user role: ${role}`);
        } else {
            console.log('Map updated for public access');
        }
    }
    
    formatProjectType(type) {
        return type.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    getFilteredProjects() {
        return this.filteredProjects;
    }

    // Filter county boundaries based on selected locations
    filterCountyBoundaries(selectedLocations) {
        if (!this.layers.counties) {
            console.log('County layer not loaded yet');
            return;
        }

        this.layers.counties.eachLayer((layer) => {
            const feature = layer.feature;
            const countyName = feature.properties.COUNTY_NAME;
            
            // Show all counties if Statewide is selected or no specific counties selected
            if (selectedLocations.includes('Statewide') || selectedLocations.length === 0) {
                layer.setStyle({ opacity: 0.8, fillOpacity: 0.3 });
                return;
            }
            
            // Check if this county is in the selected locations
            const isSelected = selectedLocations.some(location => {
                // Match county name without "County" suffix
                return countyName === location;
            });
            
            if (isSelected) {
                layer.setStyle({ 
                    opacity: 0.8, 
                    fillOpacity: 0.3,
                    color: '#1B4F8E',
                    weight: 3
                });
            } else {
                layer.setStyle({ 
                    opacity: 0.3, 
                    fillOpacity: 0.1,
                    color: '#999999',
                    weight: 1
                });
            }
        });
        
        // Fit map to filtered counties if specific counties are selected
        if (selectedLocations.length > 0 && !selectedLocations.includes('Statewide')) {
            this.fitMapToFilteredCounties(selectedLocations);
        }
    }

    // Fit map to selected counties
    fitMapToFilteredCounties(selectedLocations) {
        if (!this.layers.counties) return;
        
        const selectedLayers = [];
        this.layers.counties.eachLayer((layer) => {
            const countyName = layer.feature.properties.COUNTY_NAME;
            if (selectedLocations.includes(countyName)) {
                selectedLayers.push(layer);
            }
        });
        
        if (selectedLayers.length > 0) {
            const group = new L.featureGroup(selectedLayers);
            this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
    }
}

// Initialize map manager when DOM is loaded
let mapManager;
document.addEventListener('DOMContentLoaded', () => {
    mapManager = new MapManager();
    
    // Make it globally available
    window.mapManager = mapManager;
});
