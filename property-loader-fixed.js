// Property Loader CORREGIDO - Compatible con estructura real de BD
class PropertyLoaderFixed {
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
            // Verificar si Supabase está disponible
            if (!window.supabase) {
                throw new Error('Supabase no está disponible');
            }

            console.log('📥 Cargando propiedades...');

            // Query MUY SIMPLE - solo las columnas básicas que seguro existen
            const { data, error } = await window.supabase
                .from('properties')
                .select('*')
                .eq('published', true)
                .order('created_at', { ascending: false })
                .limit(6);

            if (error) {
                console.error('❌ Error de Supabase:', error);
                throw error;
            }

            this.properties = data || [];
            console.log(`✅ ${this.properties.length} propiedades cargadas`);
            console.log('📊 Estructura de propiedades:', this.properties[0]); // Debug: ver la estructura real
            
        } catch (error) {
            console.error('💥 Error cargando propiedades:', error);
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
        // Usar los nombres de campo que realmente existen en tu BD
        const images = this.parseImages(property.images);
        const firstImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop';
        
        // Adaptarse a los nombres reales de las columnas
        const title = property.title || property.name || property.property_title || 'Propiedad sin título';
        const subtitle = property.subtitle || property.description || property.property_type || '';
        const location = property.location || property.address || property.comuna || 'Ubicación no especificada';
        const price = property.price || property.precio || 0;
        const currency = property.currency || property.moneda || 'CLP';
        
        const formattedPrice = this.formatPrice(price, currency);
        const bedrooms = property.bedrooms || property.dormitorios || property.habitaciones || 0;
        const bathrooms = property.bathrooms || property.baños || property.banos || 0;
        const area = property.area || property.superficie || property.metros || 0;
        const slug = this.createSlug(title);

        return `
            <div class="property-card" data-id="${property.id}" data-title="${slug}" onclick="redirectToProperty('${property.id}', '${slug}')">
                <div class="property-image">
                    <img src="${firstImage}" alt="${title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop'">
                    <div class="property-price-badge">
                        ${formattedPrice}
                    </div>
                </div>
                <div class="property-content">
                    <h3 class="property-title">${title}</h3>
                    <p class="property-subtitle">${subtitle}</p>
                    <div class="property-location">${location}</div>
                    <div class="property-features">
                        <div class="property-feature">
                            <svg class="property-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7v10c0 5.55 3.84 9 9 9s9-3.45 9-9V7l-10-5z"/>
                            </svg>
                            ${bedrooms} hab
                        </div>
                        <div class="property-feature">
                            <svg class="property-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 14c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/>
                            </svg>
                            ${bathrooms} baños
                        </div>
                        <div class="property-feature">
                            <svg class="property-feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
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
                // Si es string, intentar parsear como JSON
                const parsed = JSON.parse(imagesField);
                return Array.isArray(parsed) ? parsed : [];
            }
            if (Array.isArray(imagesField)) {
                return imagesField;
            }
        } catch (error) {
            console.warn('Error parsing images:', error);
            console.log('Images field:', imagesField);
        }
        
        return [];
    }

    formatPrice(price, currency = 'CLP') {
        if (!price) return 'Precio a consultar';
        
        const numPrice = parseInt(price);
        if (isNaN(numPrice)) return 'Precio a consultar';
        
        // Formato según moneda
        switch(currency) {
            case 'CLP':
                return `$${numPrice.toLocaleString('es-CL')}`;
            case 'UF':
                return `UF ${numPrice.toLocaleString('es-CL')}`;
            case 'USD':
                return `US$ ${numPrice.toLocaleString('en-US')}`;
            default:
                return `$${numPrice.toLocaleString('es-CL')}`;
        }
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
                    <p style="color: #e74c3c;">❌ Error al cargar las propiedades</p>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 1rem;">Problema de conexión con la base de datos</p>
                    <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🔄 Recargar página
                    </button>
                    <br>
                    <a href="compras.html" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #27ae60; color: white; text-decoration: none; border-radius: 4px; display: inline-block;">
                        📋 Ver todas las propiedades
                    </a>
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
                (property.property_type && property.property_type.toLowerCase().includes(filters.type.toLowerCase())) ||
                (property.tipo && property.tipo.toLowerCase().includes(filters.type.toLowerCase()))
            );
        }

        if (filters.location) {
            filteredProperties = filteredProperties.filter(property => 
                (property.location && property.location.toLowerCase().includes(filters.location.toLowerCase())) ||
                (property.address && property.address.toLowerCase().includes(filters.location.toLowerCase())) ||
                (property.comuna && property.comuna.toLowerCase().includes(filters.location.toLowerCase()))
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

// Inicializar cuando Supabase esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏠 DOM cargado, esperando Supabase...');
    
    function initPropertyLoader() {
        if (window.supabase) {
            console.log('✅ Inicializando PropertyLoader...');
            window.propertyLoader = new PropertyLoaderFixed();
        } else {
            console.log('⏳ Esperando Supabase...');
            setTimeout(initPropertyLoader, 500);
        }
    }

    // Escuchar evento de Supabase listo
    window.addEventListener('supabaseReady', () => {
        console.log('🚀 Supabase listo, inicializando PropertyLoader...');
        window.propertyLoader = new PropertyLoaderFixed();
    });

    // Iniciar inmediatamente si Supabase ya está disponible
    initPropertyLoader();
});

// Export para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyLoaderFixed;
}