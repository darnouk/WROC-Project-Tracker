// Main application initialization and coordination
class AerialMappingTracker {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
        
        this.init();
    }
    
    init() {
        console.log('Initializing Aerial Mapping Project Tracker v' + this.version);
        
        // Wait for all components to be ready
        this.waitForComponents().then(() => {
            this.setupGlobalEventListeners();
            this.setupKeyboardShortcuts();
            this.setupErrorHandling();
            this.finalizeInitialization();
        });
    }
    
    async waitForComponents() {
        // Wait for all essential components to be loaded
        const checkComponent = (componentName, globalVar) => {
            return new Promise((resolve) => {
                const check = () => {
                    if (window[globalVar]) {
                        console.log(`✓ ${componentName} loaded`);
                        resolve();
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        };
        
        await Promise.all([
            checkComponent('Authentication Manager', 'authManager'),
            checkComponent('Map Manager', 'mapManager'),
            checkComponent('Filter Manager', 'filterManager')
        ]);
    }
    
    setupGlobalEventListeners() {
        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            if (window.mapManager && window.mapManager.map) {
                window.mapManager.map.invalidateSize();
            }
        }, 250));
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && window.mapManager && window.mapManager.map) {
                setTimeout(() => {
                    window.mapManager.map.invalidateSize();
                }, 100);
            }
        });
        
        // Handle authentication state changes
        window.addEventListener('userLoggedIn', (e) => {
            this.onUserLogin(e.detail.user);
        });
        
        window.addEventListener('userLoggedOut', () => {
            this.onUserLogout();
        });
        
        // Handle print requests
        window.addEventListener('beforeprint', () => {
            this.preparePrintView();
        });
        
        window.addEventListener('afterprint', () => {
            this.restoreNormalView();
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + L: Focus on login
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                if (!window.authManager.isLoggedIn()) {
                    document.getElementById('loginBtn').click();
                }
            }
            
            // Ctrl/Cmd + F: Focus on filters
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const firstFilter = document.getElementById('projectType');
                if (firstFilter) firstFilter.focus();
            }
            
            // Ctrl/Cmd + R: Reset map view
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                if (window.mapManager) {
                    window.mapManager.resetMapView();
                }
            }
            
            // Ctrl/Cmd + E: Export data (if logged in)
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (window.authManager.isLoggedIn()) {
                    const exportBtn = document.getElementById('exportDataBtn');
                    if (exportBtn && exportBtn.style.display !== 'none') {
                        exportBtn.click();
                    }
                }
            }
            
            // Escape: Close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showNotification('An error occurred. Please refresh the page if problems persist.', 'error');
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showNotification('A network error occurred. Please check your connection.', 'warning');
        });
        
        // Custom error reporting
        window.reportError = (message, context) => {
            console.error(`Application Error: ${message}`, context);
            this.showNotification(message, 'error');
        };
    }
    
    onUserLogin(user) {
        console.log('User logged in globally:', user);
        
        // Save demo session
        localStorage.setItem('demoUser', JSON.stringify(user));
        
        // Show welcome message
        this.showNotification(`Welcome, ${user.name || user.email}!`, 'success');
        
        // Update application state based on user role
        this.updateAppForUser(user);
        
        // Refresh data if needed
        this.refreshUserSpecificData(user);
    }
    
    onUserLogout() {
        console.log('User logged out globally');
        
        // Clear demo session
        localStorage.removeItem('demoUser');
        
        // Show logout message
        this.showNotification('You have been logged out.', 'info');
        
        // Reset application to public state
        this.resetAppToPublicState();
    }
    
    updateAppForUser(user) {
        // Update any user-specific UI elements
        const body = document.body;
        body.classList.add('user-authenticated');
        body.classList.add(`role-${user.role}`);
        
        // Update map display for user permissions
        if (window.mapManager) {
            window.mapManager.updateUserPermissions(user.role);
        }
        
        // Update filters for user access
        if (window.filterManager) {
            window.filterManager.applyFilters();
        }
    }
    
    resetAppToPublicState() {
        // Remove user-specific classes
        const body = document.body;
        body.classList.remove('user-authenticated');
        body.className = body.className.replace(/role-\w+/g, '');
        
        // Reset map to public view
        if (window.mapManager) {
            window.mapManager.updateUserPermissions(null);
        }
        
        // Reset filters to public data
        if (window.filterManager) {
            window.filterManager.applyFilters();
        }
    }
    
    refreshUserSpecificData(user) {
        // In a real application, this would fetch user-specific data
        console.log('Refreshing data for user role:', user.role);
        
        // For demo, just trigger a filter refresh
        setTimeout(() => {
            if (window.filterManager) {
                window.filterManager.applyFilters();
            }
        }, 500);
    }
    
    preparePrintView() {
        // Optimize layout for printing
        document.body.classList.add('print-mode');
        
        // Hide interactive elements
        const hideForPrint = [
            '.sidebar',
            '.map-controls',
            '.modal',
            'header .auth-section'
        ];
        
        hideForPrint.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.classList.add('print-hidden'));
        });
        
        // Expand map for print
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.classList.add('print-expanded');
        }
        
        // Refresh map size
        if (window.mapManager && window.mapManager.map) {
            setTimeout(() => {
                window.mapManager.map.invalidateSize();
            }, 100);
        }
    }
    
    restoreNormalView() {
        // Restore normal layout
        document.body.classList.remove('print-mode');
        
        // Show hidden elements
        const printHidden = document.querySelectorAll('.print-hidden');
        printHidden.forEach(el => el.classList.remove('print-hidden'));
        
        // Restore map size
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.classList.remove('print-expanded');
        }
        
        // Refresh map size
        if (window.mapManager && window.mapManager.map) {
            setTimeout(() => {
                window.mapManager.map.invalidateSize();
            }, 100);
        }
    }
    
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    showNotification(message, type = 'info') {
        // Create notification system
        let container = document.getElementById('notificationContainer');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        container.appendChild(notification);
        
        // Add click handler for close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        // Auto-remove after delay
        setTimeout(() => {
            this.removeNotification(notification);
        }, type === 'error' ? 8000 : 4000);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('notification-show');
        });
    }
    
    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.classList.add('notification-hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    finalizeInitialization() {
        this.initialized = true;
        
        // Add version info to console
        console.log(`
        ╔════════════════════════════════════════════════════════════════╗
        ║                                                                ║
        ║         Ayres Associates Aerial Mapping Tracker v1.0          ║
        ║                                                                ║
        ║  🗺️  Interactive project mapping and tracking system          ║
        ║  🔐  Firebase authentication integration                       ║
        ║  📊  PostgreSQL backend ready                                  ║
        ║  🎛️  Advanced filtering and search capabilities               ║
        ║                                                                ║
        ║  Ready for deployment and customization!                      ║
        ║                                                                ║
        ╚════════════════════════════════════════════════════════════════╝
        `);
        
        // Show initialization complete notification
        this.showNotification('Application loaded successfully!', 'success');
        
        // Fire custom event
        window.dispatchEvent(new CustomEvent('applicationReady', {
            detail: { version: this.version }
        }));
    }
    
    // Public API methods
    getVersion() {
        return this.version;
    }
    
    isInitialized() {
        return this.initialized;
    }
    
    exportAppState() {
        return {
            filters: window.filterManager ? window.filterManager.exportFilters() : null,
            mapCenter: window.mapManager && window.mapManager.map ? 
                window.mapManager.map.getCenter() : null,
            mapZoom: window.mapManager && window.mapManager.map ? 
                window.mapManager.map.getZoom() : null,
            user: window.authManager ? window.authManager.getCurrentUser() : null
        };
    }
    
    importAppState(state) {
        if (state.filters && window.filterManager) {
            window.filterManager.importFilters(state.filters);
        }
        
        if (state.mapCenter && state.mapZoom && window.mapManager && window.mapManager.map) {
            window.mapManager.map.setView([state.mapCenter.lat, state.mapCenter.lng], state.mapZoom);
        }
    }
}

// Add notification styles
const notificationCSS = `
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
}

.notification {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.5rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-left: 4px solid #0066CC;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
}

.notification-show {
    transform: translateX(0);
    opacity: 1;
}

.notification-hide {
    transform: translateX(100%);
    opacity: 0;
}

.notification-success { border-left-color: #28a745; }
.notification-error { border-left-color: #dc3545; }
.notification-warning { border-left-color: #ffc107; }
.notification-info { border-left-color: #17a2b8; }

.notification-message {
    flex: 1;
    font-size: 0.9rem;
}

.notification-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    margin-left: 1rem;
}

.notification-close:hover {
    color: #000;
}

/* Print styles */
@media print {
    .print-hidden {
        display: none !important;
    }
    
    .print-expanded {
        width: 100% !important;
        height: 600px !important;
    }
    
    .notification-container {
        display: none;
    }
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .notification-container {
        left: 10px;
        right: 10px;
        max-width: none;
    }
}
`;

// Inject notification styles
const notificationStyleSheet = document.createElement("style");
notificationStyleSheet.textContent = notificationCSS;
document.head.appendChild(notificationStyleSheet);

// Initialize the main application when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AerialMappingTracker();
    
    // Make it globally available
    window.app = app;
});

// Add some utility functions to window
window.utils = {
    formatCurrency: DataUtils.formatCurrency,
    formatDate: DataUtils.formatDate,
    debounce: (func, wait) => app.debounce(func, wait)
};
