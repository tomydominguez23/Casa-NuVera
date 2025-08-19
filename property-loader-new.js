// Property Loader con nuevo diseño de cards como en las imágenes
class PropertyLoaderNew {
    constructor() {
        this.properties = [];
        this.loading = false;
        this.init();
    }

    async init() {
        try {
            await this.loadProperties();
            this.renderProperties();
        } catch (error) {
            console.error('Error inicializando PropertyLoader:', error);
            this.showError();
        }
    }

    async loadProperties() {
        if (this.loading) return;
        
        this.loading = true;
        this.showLoading();

        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false })
                .limit(6); // Mostrar solo 6 propiedades destacadas

            if (error) throw error;

            this.properties = data || [];
            console.log('Propiedades cargadas:', this.properties);
        } catch (error) {
            console.error('Error cargando propiedades:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    renderProperties() {
        const container = document.getElementById('featuredProperties');
        if (!container) {
            console.error('Container featuredProperties no encontrado');
            return;
        }

        if (this.properties.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        const gridHTML = `
            <div class="properties-grid-container">
                ${this.properties.map(property => this.generatePropertyCard(property)).join('')}
            </div>
        `;

        container.innerHTML = gridHTML;

        // Agregar event listeners para redirección
        this.addCardClickHandlers();
    }

    generatePropertyCard(property) {
        const images = this.parseImages(property.images);
        const firstImage = images.length > 0 ? images[0] : null;
        const formattedPrice = this.formatPrice(property.price);
        const bedrooms = property.bedrooms || 0;
        const bathrooms = property.bathrooms || 0;
        const area = property.area || 0;

        return `
            <div class="property-card" data-id="${property.id}" data-title="${this.createSlug(property.title)}" onclick="redirectToProperty('${property.id}', '${this.createSlug(property.title)}')">
                <div class="property-image">
                    ${firstImage ? 
                        `<img src="${firstImage}" alt="${property.title}" loading="lazy">` : 
                        `<div class="no-image-placeholder">Sin imagen disponible</div>`
                    }
                    <div class="property-price-badge">
                        ${formattedPrice}
                    </div>
                </div>
                <div class="property-content">
                    <h3 class="property-title">${property.title || 'Propiedad sin título'}</h3>
                    <p class="property-subtitle">${property.subtitle || property.property_type || ''}</p>
                    <div class="property-location">${property.location || 'Ubicación no especificada'}</div>
                    <div class="property-features">
                        <div class="property-feature">
                            <svg class="property-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7v10c0 5.55 3.84 9 9 9s9-3.45 9-9V7l-10-5zM12 4.5L19 8v9c0 4.45-3.55 8-8 8s-8-3.55-8-8V8l8-3.5z"/>
                                <path d="M8 14h8v2H8v-2zm0-3h8v2H8v-2z"/>
                            </svg>
                            ${bedrooms} hab
                        </div>
                        <div class="property-feature">
                            <svg class="property-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 14c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm4-6c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zM6 18h12v2H6v-2zm0-4h12v2H6v-2z"/>
                            </svg>
                            ${bathrooms} baños
                        </div>
                        <div class="property-feature">
                            <svg class="property-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                                <path d="M7 10h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
                            </svg>
                            ${area}m²
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    addCardClickHandlers() {
        const cards = document.querySelectorAll('.property-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const propertyId = card.dataset.id;
                const slug = card.dataset.title;
                this.redirectToProperty(propertyId, slug);
            });
        });
    }

    redirectToProperty(propertyId, slug) {
        // Crear URL única para cada propiedad
        const url = `property-detail.html?id=${propertyId}&slug=${slug}`;
        window.location.href = url;
    }

    createSlug(title) {
        if (!title) return 'propiedad';
        
        return title
            .toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/[ñ]/g, 'n')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    parseImages(imagesField) {
        if (!imagesField) return [];
        
        try {
            if (typeof imagesField === 'string') {
                return JSON.parse(imagesField);
            }
            if (Array.isArray(imagesField)) {
                return imagesField;
            }
        } catch (error) {
            console.error('Error parsing images:', error);
        }
        
        return [];
    }

    formatPrice(price) {
        if (!price) return 'Precio a consultar';
        
        const numPrice = parseInt(price);
        if (isNaN(numPrice)) return 'Precio a consultar';
        
        // Formato chileno con puntos como separadores de miles
        return `$${numPrice.toLocaleString('es-CL')}`;
    }

    showLoading() {
        const container = document.getElementById('featuredProperties');
        if (container) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Cargando propiedades destacadas...</p>
                </div>
            `;
        }
    }

    showError() {
        const container = document.getElementById('featuredProperties');
        if (container) {
            container.innerHTML = `
                <div class="loading-container">
                    <p style="color: #e74c3c;">Error al cargar las propiedades. Por favor, intenta nuevamente.</p>
                    <button onclick="window.propertyLoader.init()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    getEmptyState() {
        return `
            <div class="loading-container">
                <p style="color: #7f8c8d;">No hay propiedades destacadas disponibles en este momento.</p>
                <a href="compras.html" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; text-decoration: none; border-radius: 4px; display: inline-block;">
                    Ver todas las propiedades
                </a>
            </div>
        `;
    }

    // Método para aplicar filtros de búsqueda
    applySearchFilters(filters) {
        console.log('Aplicando filtros:', filters);
        
        let filteredProperties = [...this.properties];

        if (filters.type) {
            filteredProperties = filteredProperties.filter(property => 
                property.property_type?.toLowerCase().includes(filters.type.toLowerCase())
            );
        }

        if (filters.location) {
            filteredProperties = filteredProperties.filter(property => 
                property.location?.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        if (filters.operation) {
            filteredProperties = filteredProperties.filter(property => 
                property.operation_type?.toLowerCase() === filters.operation.toLowerCase()
            );
        }

        // Renderizar propiedades filtradas
        this.renderFilteredProperties(filteredProperties);
    }

    renderFilteredProperties(properties) {
        const container = document.getElementById('featuredProperties');
        if (!container) return;

        if (properties.length === 0) {
            container.innerHTML = `
                <div class="loading-container">
                    <p style="color: #7f8c8d;">No se encontraron propiedades que coincidan con los filtros seleccionados.</p>
                    <button onclick="window.propertyLoader.renderProperties()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Mostrar todas las propiedades
                    </button>
                </div>
            `;
            return;
        }

        const gridHTML = `
            <div class="properties-grid-container">
                ${properties.map(property => this.generatePropertyCard(property)).join('')}
            </div>
        `;

        container.innerHTML = gridHTML;
        this.addCardClickHandlers();
    }
}

// Función global para redirección (necesaria para onclick)
function redirectToProperty(propertyId, slug) {
    const url = `property-detail.html?id=${propertyId}&slug=${slug}`;
    window.location.href = url;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que Supabase esté disponible
    if (typeof supabase !== 'undefined') {
        window.propertyLoader = new PropertyLoaderNew();
    } else {
        console.error('Supabase no está disponible');
        setTimeout(() => {
            if (typeof supabase !== 'undefined') {
                window.propertyLoader = new PropertyLoaderNew();
            }
        }, 1000);
    }
});

// Export para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyLoaderNew;
}