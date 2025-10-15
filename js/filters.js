// Filter management class
class FilterManager {
    constructor() {
        this.currentFilters = {
            projectType: [],
            yearFrom: null,
            yearTo: null,
            location: [],
            resolution: []
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDefaultFilters();
        this.updateProjectStats();
    }
    
    setupEventListeners() {
        // Apply filters button
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });
        
        // Clear filters button
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearAllFilters();
        });
        
        // Real-time filtering on select changes
        const filterElements = [
            'projectType', 'location'
        ];
        
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateFiltersFromForm();
                    this.applyFilters();
                });
            }
        });
        
        // Year range inputs
        document.getElementById('yearFrom').addEventListener('change', () => {
            this.updateFiltersFromForm();
            this.applyFilters();
        });
        
        document.getElementById('yearTo').addEventListener('change', () => {
            this.updateFiltersFromForm();
            this.applyFilters();
        });
        
        // Enable multi-select with Ctrl+Click information
        this.setupMultiSelectHelpers();
    }
    
    setupMultiSelectHelpers() {
        const multiSelects = document.querySelectorAll('select[multiple]');
        
        multiSelects.forEach(select => {
            // Improve multi-select UX
            select.addEventListener('mousedown', (e) => {
                e.preventDefault();
                
                const option = e.target;
                if (option.tagName === 'OPTION') {
                    if (e.ctrlKey || e.metaKey) {
                        option.selected = !option.selected;
                    } else {
                        // Clear other selections if no Ctrl key
                        Array.from(select.options).forEach(opt => opt.selected = false);
                        option.selected = true;
                    }
                    
                    // Trigger change event
                    select.dispatchEvent(new Event('change'));
                }
            });
        });
    }
    
    loadDefaultFilters() {
        // Set default values
        const currentYear = new Date().getFullYear();
        document.getElementById('yearFrom').value = currentYear - 5;
        document.getElementById('yearTo').value = currentYear;
        
        // Update filters object
        this.updateFiltersFromForm();
    }
    
    updateFiltersFromForm() {
        // Project type filter
        const projectTypeSelect = document.getElementById('projectType');
        this.currentFilters.projectType = Array.from(projectTypeSelect.selectedOptions)
            .map(option => option.value);
        
        // Year range
        this.currentFilters.yearFrom = parseInt(document.getElementById('yearFrom').value) || null;
        this.currentFilters.yearTo = parseInt(document.getElementById('yearTo').value) || null;
        
        // Location filter
        const locationSelect = document.getElementById('location');
        this.currentFilters.location = Array.from(locationSelect.selectedOptions)
            .map(option => option.value);
            
        // Resolution filter
        const resolutionSelect = document.getElementById('resolution');
        this.currentFilters.resolution = Array.from(resolutionSelect.selectedOptions)
            .map(option => option.value);
    }
    
    applyFilters() {
        this.updateFiltersFromForm();
        
        // Validate year range
        if (!this.validateFilters()) {
            return;
        }
        
        // Apply filters through map manager
        if (window.mapManager) {
            window.mapManager.filterProjects(this.currentFilters);
        }
        
        // Update filter summary
        this.updateFilterSummary();
        
        // Update statistics
        this.updateProjectStats();
        
        console.log('Filters applied:', this.currentFilters);
    }
    
    validateFilters() {
        const yearFrom = this.currentFilters.yearFrom;
        const yearTo = this.currentFilters.yearTo;
        
        if (yearFrom && yearTo && yearFrom > yearTo) {
            alert('Start year cannot be greater than end year');
            return false;
        }
        
        const currentYear = new Date().getFullYear();
        if (yearFrom && (yearFrom < 1995 || yearFrom > currentYear)) {
            alert('Start year must be between 1995 and ' + currentYear);
            return false;
        }
        
        if (yearTo && (yearTo < 1995 || yearTo > currentYear)) {
            alert('End year must be between 1995 and ' + currentYear);
            return false;
        }
        
        return true;
    }
    
    clearAllFilters() {
        // Reset form elements
        document.getElementById('projectType').selectedIndex = -1;
        document.getElementById('location').selectedIndex = -1;
        document.getElementById('resolution').selectedIndex = -1;
        
        const currentYear = new Date().getFullYear();
        document.getElementById('yearFrom').value = 1995;
        document.getElementById('yearTo').value = currentYear;
        
        // Reset filters object
        this.currentFilters = {
            projectType: [],
            yearFrom: null,
            yearTo: null,
            location: [],
            resolution: []
        };
        
        // Apply cleared filters
        this.applyFilters();
        
        // Clear filter summary
        this.clearFilterSummary();
    }
    
    updateFilterSummary() {
        // Create or update a filter summary display
        let summaryElement = document.getElementById('filterSummary');
        
        if (!summaryElement) {
            summaryElement = document.createElement('div');
            summaryElement.id = 'filterSummary';
            summaryElement.className = 'filter-summary';
            
            const filtersSection = document.querySelector('.filters-section');
            filtersSection.appendChild(summaryElement);
        }
        
        const activeSummary = this.getActiveFiltersSummary();
        
        if (activeSummary.length > 0) {
            summaryElement.innerHTML = `
                <h4>Active Filters:</h4>
                <div class="active-filters">
                    ${activeSummary.map(filter => `
                        <span class="filter-tag">${filter}</span>
                    `).join('')}
                </div>
            `;
            summaryElement.style.display = 'block';
        } else {
            summaryElement.style.display = 'none';
        }
    }
    
    getActiveFiltersSummary() {
        const summary = [];
        
        if (this.currentFilters.projectType.length > 0) {
            summary.push(`Types: ${this.currentFilters.projectType.join(', ')}`);
        }
        
        if (this.currentFilters.client.length > 0) {
            summary.push(`Clients: ${this.currentFilters.client.join(', ')}`);
        }
        
        if (this.currentFilters.yearFrom || this.currentFilters.yearTo) {
            const from = this.currentFilters.yearFrom || '1995';
            const to = this.currentFilters.yearTo || new Date().getFullYear();
            summary.push(`Years: ${from}-${to}`);
        }
        
        if (this.currentFilters.location.length > 0) {
            summary.push(`Locations: ${this.currentFilters.location.join(', ')}`);
        }
        
        return summary;
    }
    
    clearFilterSummary() {
        const summaryElement = document.getElementById('filterSummary');
        if (summaryElement) {
            summaryElement.style.display = 'none';
        }
    }
    
    updateProjectStats() {
        const filteredProjects = window.mapManager ? 
            window.mapManager.getFilteredProjects() : 
            SAMPLE_DATA.projects;
        
        // Update total projects count
        const totalElement = document.getElementById('totalProjects');
        if (totalElement) {
            totalElement.textContent = SAMPLE_DATA.projects.length;
        }
        
        // Update filtered projects count
        const filteredElement = document.getElementById('filteredProjects');
        if (filteredElement) {
            filteredElement.textContent = filteredProjects.length;
        }
        
        // Update year span
        const yearSpanElement = document.getElementById('yearSpan');
        if (yearSpanElement && filteredProjects.length > 0) {
            const years = filteredProjects.map(p => new Date(p.start_date).getFullYear());
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);
            yearSpanElement.textContent = maxYear - minYear + 1;
        }
        
        // Update statistics breakdown
        this.updateDetailedStats(filteredProjects);
    }
    
    updateDetailedStats(projects) {
        // Create or update detailed statistics
        let statsElement = document.getElementById('detailedStats');
        
        if (!statsElement) {
            statsElement = document.createElement('div');
            statsElement.id = 'detailedStats';
            statsElement.className = 'detailed-stats';
            
            const summarySection = document.querySelector('.summary-section');
            summarySection.appendChild(statsElement);
        }
        
        const stats = DataUtils.getProjectStats(projects);
        
        let statsHTML = '';
        
        if (projects.length > 0 && window.authManager && window.authManager.isLoggedIn()) {
            const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
            statsHTML += `
                <h4>Total Budget:</h4>
                <div class="budget-total">${DataUtils.formatCurrency(totalBudget)}</div>
            `;
        }
        
        statsElement.innerHTML = statsHTML;
    }
    
    formatProjectType(type) {
        return type.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    // Export current filters
    exportFilters() {
        return { ...this.currentFilters };
    }
    
    // Import filters
    importFilters(filters) {
        this.currentFilters = { ...filters };
        this.updateFormFromFilters();
        this.applyFilters();
    }
    
    updateFormFromFilters() {
        // Update project type select
        const projectTypeSelect = document.getElementById('projectType');
        Array.from(projectTypeSelect.options).forEach(option => {
            option.selected = this.currentFilters.projectType.includes(option.value);
        });
        
        // Update year inputs
        document.getElementById('yearFrom').value = this.currentFilters.yearFrom || '';
        document.getElementById('yearTo').value = this.currentFilters.yearTo || '';
        
        // Update location select
        const locationSelect = document.getElementById('location');
        Array.from(locationSelect.options).forEach(option => {
            option.selected = this.currentFilters.location.includes(option.value);
        });
    }
}

// Initialize filter manager when DOM is loaded
let filterManager;
document.addEventListener('DOMContentLoaded', () => {
    filterManager = new FilterManager();
    
    // Make it globally available
    window.filterManager = filterManager;
});

// Add CSS for filter enhancements
const filterCSS = `
.filter-summary {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #0066CC;
}

.filter-summary h4 {
    margin: 0 0 0.5rem 0;
    color: #0066CC;
    font-size: 0.9rem;
}

.active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.filter-tag {
    background: #0066CC;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
}

.detailed-stats {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e9ecef;
}

.detailed-stats h4 {
    margin: 1rem 0 0.5rem 0;
    color: #343a40;
    font-size: 0.9rem;
}

.stats-grid {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.stat-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
}

.stat-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
}

.stat-type, .stat-client {
    flex: 1;
}

.stat-count {
    font-weight: bold;
    color: #0066CC;
}

.budget-total {
    font-size: 1.2rem;
    font-weight: bold;
    color: #28a745;
    text-align: center;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 4px;
}

.filter-help {
    display: block;
    margin-top: 0.3rem;
}
`;

// Inject CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = filterCSS;
document.head.appendChild(styleSheet);
