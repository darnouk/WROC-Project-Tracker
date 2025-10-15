// Authentication module using Firebase Auth
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.init();
    }
    
    init() {
        // Initialize authentication UI
        this.setupEventListeners();
        this.setupModal();
        
        // For demo purposes, we'll simulate Firebase auth
        // In production, you would use actual Firebase Auth
        this.simulateAuthState();
    }
    
    setupEventListeners() {
        // Login button
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showLoginModal();
        });
        
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
        
        // Login form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Demo login button
        document.getElementById('demoLogin').addEventListener('click', () => {
            this.demoLogin();
        });
    }
    
    setupModal() {
        const modal = document.getElementById('loginModal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            this.hideLoginModal();
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideLoginModal();
            }
        });
    }
    
    showLoginModal() {
        document.getElementById('loginModal').style.display = 'block';
    }
    
    hideLoginModal() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('loginForm').reset();
    }
    
    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            // In production, use Firebase Auth
            // const userCredential = await signInWithEmailAndPassword(firebase.auth, email, password);
            
            // For demo, simulate login
            const user = this.simulateLogin(email, password);
            
            if (user) {
                this.onLoginSuccess(user);
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            this.showError('Login failed: ' + error.message);
        }
    }
    
    simulateLogin(email, password) {
        // Demo users with different roles
        const demoUsers = {
            'admin@ayresassociates.com': { 
                role: 'admin', 
                name: 'John Smith',
                email: 'admin@ayresassociates.com'
            },
            'editor@ayresassociates.com': { 
                role: 'editor', 
                name: 'Sarah Johnson',
                email: 'editor@ayresassociates.com'
            },
            'viewer@ayresassociates.com': { 
                role: 'viewer', 
                name: 'Mike Wilson',
                email: 'viewer@ayresassociates.com'
            }
        };
        
        // Simple validation for demo
        if (demoUsers[email] && password === 'demo123') {
            return demoUsers[email];
        }
        
        return null;
    }
    
    demoLogin() {
        // Quick demo login as admin
        const demoUser = {
            role: 'admin',
            name: 'Demo Admin',
            email: 'demo@ayresassociates.com'
        };
        
        this.onLoginSuccess(demoUser);
    }
    
    onLoginSuccess(user) {
        this.currentUser = user;
        this.userRole = user.role;
        
        // Update UI
        this.updateAuthUI(true);
        this.hideLoginModal();
        
        // Show admin features if applicable
        this.updateRoleBasedFeatures();
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
            detail: { user: user } 
        }));
        
        console.log('User logged in:', user);
    }
    
    logout() {
        // In production, use Firebase Auth
        // await signOut(firebase.auth);
        
        this.currentUser = null;
        this.userRole = null;
        
        // Update UI
        this.updateAuthUI(false);
        this.updateRoleBasedFeatures();
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
        
        console.log('User logged out');
    }
    
    updateAuthUI(isLoggedIn) {
        const loginContainer = document.getElementById('loginContainer');
        const userContainer = document.getElementById('userContainer');
        const userEmail = document.getElementById('userEmail');
        
        if (isLoggedIn && this.currentUser) {
            loginContainer.style.display = 'none';
            userContainer.style.display = 'flex';
            userEmail.textContent = this.currentUser.name || this.currentUser.email;
        } else {
            loginContainer.style.display = 'block';
            userContainer.style.display = 'none';
        }
    }
    
    updateRoleBasedFeatures() {
        const adminSection = document.getElementById('adminSection');
        
        if (this.currentUser && (this.userRole === 'admin' || this.userRole === 'editor')) {
            adminSection.style.display = 'block';
        } else {
            adminSection.style.display = 'none';
        }
        
        // Update map features based on role
        if (window.mapManager) {
            window.mapManager.updateUserPermissions(this.userRole);
        }
    }
    
    simulateAuthState() {
        // For demo purposes, simulate a persisted login state
        // In production, Firebase Auth would handle this automatically
        
        // Check if there's a demo session
        const savedUser = localStorage.getItem('demoUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            this.onLoginSuccess(user);
        }
    }
    
    // Utility methods
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    hasPermission(permission) {
        if (!this.isLoggedIn()) return false;
        
        const rolePermissions = CONFIG.roles[this.userRole];
        return rolePermissions && rolePermissions.permissions.includes(permission);
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    getUserRole() {
        return this.userRole;
    }
    
    showError(message) {
        // Simple error display - you could enhance this with a toast notification
        alert('Error: ' + message);
    }
    
    showSuccess(message) {
        // Simple success display - you could enhance this with a toast notification
        alert('Success: ' + message);
    }
}

// Initialize authentication manager when DOM is loaded
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    
    // Make it globally available
    window.authManager = authManager;
    
    // Set up admin panel event listeners
    setupAdminFeatures();
});

function setupAdminFeatures() {
    // Add Project button
    document.getElementById('addProjectBtn').addEventListener('click', () => {
        if (authManager.hasPermission('write')) {
            showAddProjectModal();
        } else {
            authManager.showError('You do not have permission to add projects');
        }
    });
    
    // Export Data button
    document.getElementById('exportDataBtn').addEventListener('click', () => {
        if (authManager.hasPermission('read')) {
            exportProjectData();
        } else {
            authManager.showError('You do not have permission to export data');
        }
    });
}

function showAddProjectModal() {
    // This would open a modal for adding new projects
    // For demo purposes, just show an alert
    alert('Add Project Modal would open here\\n\\nThis feature would include:\\n- Project name and details\\n- Geographic boundary selection\\n- File upload capabilities\\n- Client and budget information');
}

function exportProjectData() {
    // Export filtered project data as CSV or JSON
    const projects = window.mapManager ? window.mapManager.getFilteredProjects() : SAMPLE_DATA.projects;
    
    const csvData = convertToCSV(projects);
    downloadCSV(csvData, 'aerial_projects_export.csv');
    
    authManager.showSuccess('Project data exported successfully');
}

function convertToCSV(projects) {
    const headers = [
        'Project Name', 'Type', 'Client', 'Start Date', 'End Date', 
        'State', 'County', 'Municipality', 'Budget', 'Internal Path'
    ];
    
    const rows = projects.map(project => [
        project.project_name,
        project.project_type,
        project.client,
        project.start_date,
        project.end_date,
        project.state,
        project.county,
        project.municipality,
        project.budget || '',
        project.internal_path
    ]);
    
    return [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\\n');
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
