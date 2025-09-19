// ===== GLOBAL SEARCH FUNCTIONALITY =====
// Optimized for mobile and tablet devices

class GlobalSearch {
    constructor() {
        this.isInitialized = false;
        this.currentPage = this.detectCurrentPage();
        this.searchResults = [];
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔍 Initializing Global Search on page:', this.currentPage);
        
        // Create search component
        this.createSearchComponent();
        
        // Bind events
        this.bindEvents();
        
        this.isInitialized = true;
        console.log('✅ Global Search initialized successfully');
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        if (filename === 'index.html' || filename === '') return 'home';
        if (filename === 'compras.html') return 'compras';
        if (filename === 'arriendos.html' || filename === 'arriendos-nuevo.html') return 'arriendos';
        if (filename === 'contacto.html') return 'contacto';
        if (filename === 'property-detail.html' || filename === 'propiedad.html') return 'property-detail';
        
        return 'other';
    }

    createSearchComponent() {
        // Don't add search to home page (already has it) or property detail pages
        if (this.currentPage === 'home' || this.currentPage === 'property-detail') {
            console.log('⏭️ Skipping search component creation for', this.currentPage);
            return;
        }

        const searchHTML = this.getSearchHTML();
        const targetElement = this.getTargetElement();
        
        if (targetElement) {
            targetElement.insertAdjacentHTML('afterend', searchHTML);
            console.log('✅ Search component added to', this.currentPage);
        } else {
            console.warn('⚠️ Could not find target element for search component');
        }
    }

    getTargetElement() {
        // Try to find header or main navigation
        const header = document.querySelector('header, .header');
        if (header) return header;
        
        // Fallback to body's first child
        return document.body.firstElementChild;
    }

    getSearchHTML() {
        const compactClass = this.currentPage !== 'home' ? 'compact' : '';
        const operationDefault = this.getOperationDefault();
        const placeholderText = this.getPlaceholderText();
        
        return `
        <div class="global-search-container ${compactClass}" id="globalSearchContainer">
            <div class="global-search-wrapper">
                <div class="global-search-bar">
                    <div class="search-filters">
                        <div class="search-group">
                            <label for="global-operation-filter">Operación</label>
                            <select class="search-select" id="global-operation-filter">
                                <option value="">${operationDefault}</option>
                                <option value="venta">Venta</option>
                                <option value="arriendo">Arriendo</option>
                            </select>
                        </div>
                        <div class="search-group">
                            <label for="global-type-filter">Tipo</label>
                            <select class="search-select" id="global-type-filter">
                                <option value="">Todos los tipos</option>
                                <option value="Casa">Casa</option>
                                <option value="Departamento">Departamento</option>
                                <option value="Oficina">Oficina</option>
                                <option value="Local">Local Comercial</option>
                                <option value="Terreno">Terreno</option>
                            </select>
                        </div>
                        <div class="search-group">
                            <label for="global-location-filter">Ubicación</label>
                            <input type="text" class="search-input" placeholder="${placeholderText}" id="global-location-filter">
                        </div>
                        <div class="search-group">
                            <div class="search-checkbox-group">
                                <input type="checkbox" class="search-checkbox" id="global-projects-filter">
                                <label for="global-projects-filter" class="search-checkbox-label">Solo proyectos</label>
                            </div>
                        </div>
                        <div class="search-group">
                            <button class="search-btn search-btn-primary" onclick="globalSearch.executeSearch()">
                                <span class="search-btn-text">Buscar</span>
                            </button>
                        </div>
                        <div class="search-group">
                            <button class="search-btn search-btn-secondary" onclick="globalSearch.searchOnMap()">
                                Ver en Mapa
                            </button>
                        </div>
                    </div>
                    
                    <div class="search-loading" id="globalSearchLoading">
                        <div class="search-loading-spinner"></div>
                        <span>Buscando propiedades...</span>
                    </div>
                    
                    <div class="search-results-indicator" id="globalSearchResults">
                        <!-- Results info will appear here -->
                    </div>
                    
                    <a href="#" class="search-link" onclick="globalSearch.searchByCode()">
                        Buscar por código de propiedad
                    </a>
                </div>
            </div>
        </div>
        `;
    }

    getOperationDefault() {
        switch (this.currentPage) {
            case 'compras': return 'Venta';
            case 'arriendos': return 'Arriendo';
            default: return 'Venta/Arriendo';
        }
    }

    getPlaceholderText() {
        return 'Las Condes, Providencia, Vitacura...';
    }

    bindEvents() {
        // Bind search form events
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.matches('.search-input, .search-select')) {
                e.preventDefault();
                this.executeSearch();
            }
        });

        // Auto-complete for location input
        const locationInput = document.getElementById('global-location-filter');
        if (locationInput) {
            locationInput.addEventListener('input', this.debounce((e) => {
                this.handleLocationInput(e.target.value);
            }, 300));
        }

        // Responsive behavior
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    executeSearch() {
        const searchData = this.getSearchData();
        console.log('🔍 Executing global search:', searchData);

        // Show loading
        this.showLoading(true);

        // Determine target page based on operation
        const targetPage = this.getTargetPage(searchData.operation);
        
        // Build search URL with parameters
        const searchURL = this.buildSearchURL(targetPage, searchData);
        
        // Navigate to results page
        setTimeout(() => {
            window.location.href = searchURL;
        }, 500);
    }

    getSearchData() {
        return {
            operation: document.getElementById('global-operation-filter')?.value || '',
            type: document.getElementById('global-type-filter')?.value || '',
            location: document.getElementById('global-location-filter')?.value || '',
            projects: document.getElementById('global-projects-filter')?.checked || false
        };
    }

    getTargetPage(operation) {
        if (operation === 'arriendo') {
            return 'arriendos-nuevo.html';
        } else if (operation === 'venta') {
            return 'compras.html';
        } else {
            // Default based on current page or go to general search
            return this.currentPage === 'arriendos' ? 'arriendos-nuevo.html' : 'compras.html';
        }
    }

    buildSearchURL(targetPage, searchData) {
        const params = new URLSearchParams();
        
        if (searchData.operation) params.append('operation', searchData.operation);
        if (searchData.type) params.append('type', searchData.type);
        if (searchData.location) params.append('location', searchData.location);
        if (searchData.projects) params.append('projects', 'true');
        
        const queryString = params.toString();
        return queryString ? `${targetPage}?${queryString}` : targetPage;
    }

    searchOnMap() {
        const searchData = this.getSearchData();
        console.log('🗺️ Opening map search:', searchData);
        
        // For now, show a message - in the future this would open a map view
        this.showMapSearchModal(searchData);
    }

    searchByCode() {
        const code = prompt('Ingresa el código de la propiedad:');
        if (code && code.trim()) {
            console.log('🔢 Searching by code:', code.trim());
            // Navigate to property detail with code
            window.location.href = `property-detail.html?code=${encodeURIComponent(code.trim())}`;
        }
    }

    showMapSearchModal(searchData) {
        const message = `
🗺️ BÚSQUEDA EN MAPA

Próximamente podrás explorar propiedades en un mapa interactivo con:
• Filtros avanzados en tiempo real
• Vista satelital y street view
• Información de barrio y servicios
• Tours virtuales integrados

Filtros actuales:
${searchData.operation ? `• Operación: ${searchData.operation}` : ''}
${searchData.type ? `• Tipo: ${searchData.type}` : ''}
${searchData.location ? `• Ubicación: ${searchData.location}` : ''}
${searchData.projects ? '• Solo proyectos: Sí' : ''}

¿Te gustaría que te contactemos cuando esté disponible?
        `;
        
        if (confirm(message)) {
            // Redirect to contact form
            window.location.href = 'contacto.html?action=contact&service=map-search';
        }
    }

    handleLocationInput(value) {
        // In a real implementation, this would show location suggestions
        console.log('📍 Location input:', value);
        
        // For now, just log the input
        if (value.length > 2) {
            // Could fetch location suggestions from an API
        }
    }

    showLoading(show) {
        const loading = document.getElementById('globalSearchLoading');
        const button = document.querySelector('.search-btn-primary .search-btn-text');
        
        if (loading) {
            loading.classList.toggle('active', show);
        }
        
        if (button) {
            button.textContent = show ? 'Buscando...' : 'Buscar';
        }
    }

    handleResize() {
        // Adjust search component for different screen sizes
        const container = document.getElementById('globalSearchContainer');
        if (!container) return;

        const width = window.innerWidth;
        
        if (width <= 768) {
            container.classList.add('mobile');
        } else {
            container.classList.remove('mobile');
        }
    }

    // Utility function for debouncing
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

    // Method to handle URL parameters on page load
    handleURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        const operation = urlParams.get('operation');
        const type = urlParams.get('type');
        const location = urlParams.get('location');
        const projects = urlParams.get('projects') === 'true';
        
        // Fill the search form with URL parameters
        if (operation) {
            const operationSelect = document.getElementById('global-operation-filter');
            if (operationSelect) operationSelect.value = operation;
        }
        
        if (type) {
            const typeSelect = document.getElementById('global-type-filter');
            if (typeSelect) typeSelect.value = type;
        }
        
        if (location) {
            const locationInput = document.getElementById('global-location-filter');
            if (locationInput) locationInput.value = location;
        }
        
        if (projects) {
            const projectsCheckbox = document.getElementById('global-projects-filter');
            if (projectsCheckbox) projectsCheckbox.checked = projects;
        }
        
        console.log('🔗 Applied URL parameters to search form');
    }
}

// Initialize global search when script loads
const globalSearch = new GlobalSearch();

// Handle URL parameters after initialization
window.addEventListener('load', () => {
    if (globalSearch.isInitialized) {
        globalSearch.handleURLParameters();
    }
});

// Export for use in other scripts
window.globalSearch = globalSearch;