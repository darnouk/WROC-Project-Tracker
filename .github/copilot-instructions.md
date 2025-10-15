<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Aerial Mapping Project Tracker - Copilot Instructions

This is a web-based interactive mapping application for Ayres Associates' aerial mapping project tracking system. 

## Project Context
- **Purpose**: Track 30+ years of aerial mapping projects (1995-2025)
- **Target Users**: Geospatial project managers, supervisors, and team leaders
- **Technology Stack**: HTML5, CSS3, JavaScript ES6+, Leaflet.js, Firebase Auth
- **Database**: Designed for PostgreSQL with PostGIS extension
- **Geographic Focus**: Wisconsin and Minnesota projects

## Key Components

### Architecture
- **Frontend**: Modern vanilla JavaScript with ES6+ features
- **Mapping**: Leaflet.js for interactive maps
- **Authentication**: Firebase Authentication
- **Styling**: CSS3 with CSS variables for theming
- **Data**: Sample GeoJSON and JSON data for demonstration

### Core Classes
- `AuthManager`: Handles Firebase authentication and user roles
- `MapManager`: Manages Leaflet map, layers, and interactions  
- `FilterManager`: Controls project filtering and search
- `AerialMappingTracker`: Main application coordinator

### Data Structure
- **Projects**: Aerial mapping projects with geometry, metadata, budgets
- **Users**: Role-based access (admin, editor, viewer)
- **Geographic**: County boundaries and administrative regions
- **Files**: Project file references and internal paths

## Coding Standards

### JavaScript
- Use ES6+ features (classes, arrow functions, async/await)
- Follow camelCase naming convention
- Use const/let instead of var
- Implement proper error handling with try/catch
- Use JSDoc comments for complex functions

### CSS
- Use CSS custom properties (variables) for theming
- Follow BEM methodology for class naming where appropriate
- Implement responsive design with mobile-first approach
- Use flexbox and grid for layouts
- Maintain consistent spacing and typography scales

### HTML
- Use semantic HTML5 elements
- Implement proper ARIA attributes for accessibility
- Ensure keyboard navigation support
- Use data attributes for JavaScript hooks

## Specific Guidelines

### Map Development
- Always use Leaflet best practices for performance
- Implement proper layer management and cleanup
- Use appropriate zoom levels and bounds for Wisconsin/Minnesota region
- Handle map resize events properly for responsive layouts

### Authentication
- Follow Firebase Auth best practices
- Implement proper role-based access control
- Handle authentication state changes gracefully
- Provide fallback for demo/development environments

### Data Management
- Structure data for PostgreSQL compatibility
- Use PostGIS standards for spatial data
- Implement proper data validation and sanitization
- Handle large datasets efficiently with filtering and pagination

### UI/UX
- Follow Ayres Associates branding guidelines
- Implement consistent loading states and error messages
- Provide clear user feedback for all actions
- Ensure accessibility compliance (WCAG 2.1)

## Common Patterns

### Error Handling
```javascript
try {
    // Operation
} catch (error) {
    console.error('Specific error context:', error);
    this.showNotification('User-friendly message', 'error');
}
```

### Event Listeners
```javascript
document.getElementById('element').addEventListener('click', (e) => {
    e.preventDefault();
    // Handle event
});
```

### Async Operations
```javascript
async someMethod() {
    try {
        const result = await someAsyncOperation();
        return result;
    } catch (error) {
        this.handleError(error);
    }
}
```

## File Organization
- `/js/config.js`: Application configuration and constants
- `/js/data.js`: Sample data and utility functions
- `/js/auth.js`: Authentication management
- `/js/map.js`: Map functionality and layer management
- `/js/filters.js`: Filtering and search capabilities
- `/js/main.js`: Application initialization and coordination
- `/styles/main.css`: All application styles

## Dependencies
- **Leaflet**: Interactive mapping library
- **Firebase**: Authentication and hosting
- **Live Server**: Development server (npm)

## Performance Considerations
- Debounce user input for filtering
- Use efficient map rendering techniques
- Minimize DOM manipulations
- Implement lazy loading for large datasets
- Optimize images and assets

## Security Notes
- Never expose Firebase API keys in production
- Implement proper input validation
- Use role-based access control consistently
- Sanitize all user inputs
- Follow HTTPS-only policies

## Testing Approach
- Include demo/sample data for testing
- Test all user roles and permissions
- Verify responsive design across devices  
- Test map interactions and performance
- Validate filter combinations and edge cases

When making changes or additions, ensure they align with these guidelines and maintain consistency with the existing codebase.
