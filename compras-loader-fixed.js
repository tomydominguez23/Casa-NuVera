// Compras Page Loader - Compatible con BD real
class ComprasPageLoader {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.loading = false;
        this.currentPage = 1;
        this.propertiesPerPage = 12;
        this.totalProperties = 0;
        this.currentFilters = {};
        this.init();
    }

    async init() {
        try {
            await this.loadProperties();
            this.renderProperties();
            this.setupFilters();
            this.setupPagination();
        } catch (error) {
            console.error('Error inicializando ComprasPageLoader:', error);
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

            console.log('📥 Cargando todas las propiedades...');

            // Query con la estructura REAL de tu BD
            const { data, error, count } = await window.supabase
                .from('properties')
                .select(`
                    id,
                    title,
                    property_type,
                    category,
                    bedrooms,
                    bathrooms,
                    description,
                    region,
                    commune,
                    address,
                    neighborhood,
                    total_area,
                    built_area,
                    parking_spaces,
                    currency,
                    price,
                    expenses,
                    features,
                    featured,
                    published,
                    created_at
                `, { count: 'exact' })
                .eq('published', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error de Supabase:', error);
                throw error;
            }

            this.properties = data || [];
            this.filteredProperties = [...this.properties];
            this.totalProperties = count || this.properties.length;

            console.log(`✅ ${this.properties.length} propiedades cargadas`);
            
            // Cargar imágenes para todas las propiedades
            await this.loadAllPropertyImages();
            
        } catch (error) {
            console.error('💥 Error cargando propiedades:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    async loadAllPropertyImages() {
        console.log('🖼️ Cargando imágenes para todas las propiedades...');
        
        for (let property of this.properties) {
            try {
                const { data: images, error } = await window.supabase
                    .from('property_images')
                    .select('image_url, image_order, is_main')
                    .eq('property_id', property.id)
                    .order('image_order', { ascending: true });

                if (!error && images && images.length > 0) {
                    // Buscar imagen principal o tomar la primera
                    const mainImage = images.find(img => img.is_main) || images[0];
                    property.main_image = mainImage.image_url;
                    property.all_images = images.map(img => img.image_url);
                } else {
                    property.main_image = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop';
                    property.all_images = [];
                }
            } catch (imgError) {
                console.warn(`No se pudieron cargar imágenes para propiedad ${property.id}:`, imgError);
                property.main_image = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop';
                property.all_images = [];
            }
        }
        
        console.log('✅ Imágenes cargadas para todas las propiedades');
    }

    renderProperties() {
        const container = document.getElementById('propertiesGrid');
        if (!container) {
            console.error('Container propertiesGrid no encontrado');
            return;
        }

        const startIndex = (this.currentPage - 1) * this.propertiesPerPage;
        const endIndex = startIndex + this.propertiesPerPage;
        const propertiesToShow = this.filteredProperties.slice(startIndex, endIndex);

        if (propertiesToShow.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        const gridHTML = `
            <div class="properties-grid-container">
                ${propertiesToShow.map(property => this.generatePropertyCard(property)).join('')}
            </div>
        `;

        container.innerHTML = gridHTML;
        this.updateResultsCounter();
        this.renderPagination();
    }

    generatePropertyCard(property) {
        // Usar imagen principal o fallback
        const firstImage = property.main_image || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop';
        
        // Usar los campos reales de tu BD
        const title = property.title || 'Propiedad sin título';
        const subtitle = property.description || `${property.property_type} en ${property.commune}` || 'Ver detalles';
        const location = this.formatLocation(property.commune, property.neighborhood, property.region);
        const formattedPrice = this.formatPrice(property.price, property.currency);
        const bedrooms = property.bedrooms || 0;
        const bathrooms = property.bathrooms || 0;
        const area = property.total_area || property.built_area || 0;
        const slug = this.createSlug(title);

        return `
            <div class="property-card" data-id="${property.id}" data-title="${slug}"
                 data-operacion="${(property.category || '').toLowerCase().includes('arriendo') ? 'arriendo' : 'venta'}"
                 data-tipo="${(property.property_type || property.category || '').toLowerCase()}"
                 data-ubicacion="${(property.commune || property.neighborhood || property.region || '').toLowerCase()}"
                 data-precio="${Number(property.price) || 0}"
                 onclick="redirectToProperty('${property.id}', '${slug}')">
                <div class="property-image">
                    <img src="${firstImage}" alt="${title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop'">
                    <div class="property-price-badge">
                        ${formattedPrice}
                    </div>
                    ${property.featured ? '<div class="property-featured-badge">Destacada</div>' : ''}
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
                            ${area ? `${area}m²` : 'Ver detalles'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatLocation(commune, neighborhood, region) {
        const parts = [];
        if (neighborhood) parts.push(neighborhood);
        if (commune) parts.push(commune);
        if (region && region !== commune) parts.push(region);
        
        return parts.length > 0 ? parts.join(', ') : 'Ubicación no especificada';
    }

    formatPrice(price, currency = 'CLP') {
        if (!price || price === 0) return 'Precio a consultar';
        
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return 'Precio a consultar';
        
        // Formato según moneda
        switch(currency) {
            case 'CLP':
                return `$${numPrice.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`;
            case 'UF':
                return `${numPrice.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} UF`;
            case 'USD':
                return `US$ ${numPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            default:
                return `${currency} ${numPrice.toLocaleString('es-CL')}`;
        }
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

    setupFilters() {
        // Configurar filtros dinámicos basados en datos reales
        this.populateFilterOptions();
        
        // Event listeners para filtros
        document.getElementById('propertyTypeFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('locationFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('priceFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('bedroomsFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('bathroomsFilter')?.addEventListener('change', () => this.applyFilters());
        
        // Botón limpiar filtros
        document.getElementById('clearFilters')?.addEventListener('click', () => this.clearFilters());
    }

    populateFilterOptions() {
        // Poblar filtro de tipos de propiedad
        const propertyTypes = [...new Set(this.properties.map(p => p.property_type).filter(Boolean))];
        const propertyTypeFilter = document.getElementById('propertyTypeFilter');
        if (propertyTypeFilter) {
            propertyTypeFilter.innerHTML = '<option value="">Todos los tipos</option>' +
                propertyTypes.map(type => `<option value="${type}">${type}</option>`).join('');
        }

        // Poblar filtro de ubicaciones (comunas)
        const locations = [...new Set(this.properties.map(p => p.commune).filter(Boolean))];
        const locationFilter = document.getElementById('locationFilter');
        if (locationFilter) {
            locationFilter.innerHTML = '<option value="">Todas las ubicaciones</option>' +
                locations.map(location => `<option value="${location}">${location}</option>`).join('');
        }
    }

    applyFilters() {
        const propertyType = document.getElementById('propertyTypeFilter')?.value || '';
        const location = document.getElementById('locationFilter')?.value || '';
        const priceRange = document.getElementById('priceFilter')?.value || '';
        const bedrooms = document.getElementById('bedroomsFilter')?.value || '';
        const bathrooms = document.getElementById('bathroomsFilter')?.value || '';

        this.currentFilters = {
            propertyType,
            location,
            priceRange,
            bedrooms,
            bathrooms
        };

        this.filteredProperties = this.properties.filter(property => {
            // Filtro por tipo de propiedad
            if (propertyType && property.property_type !== propertyType) return false;

            // Filtro por ubicación (comuna)
            if (location && property.commune !== location) return false;

            // Filtro por dormitorios
            if (bedrooms && property.bedrooms != bedrooms) return false;

            // Filtro por baños
            if (bathrooms && property.bathrooms != bathrooms) return false;

            // Filtro por rango de precio
            if (priceRange && property.price) {
                const price = parseFloat(property.price);
                switch(priceRange) {
                    case 'under-50':
                        if (price >= 50000000) return false;
                        break;
                    case '50-100':
                        if (price < 50000000 || price >= 100000000) return false;
                        break;
                    case '100-200':
                        if (price < 100000000 || price >= 200000000) return false;
                        break;
                    case 'over-200':
                        if (price < 200000000) return false;
                        break;
                }
            }

            return true;
        });

        this.currentPage = 1; // Reset a primera página
        this.renderProperties();
    }

    clearFilters() {
        document.getElementById('propertyTypeFilter').value = '';
        document.getElementById('locationFilter').value = '';
        document.getElementById('priceFilter').value = '';
        document.getElementById('bedroomsFilter').value = '';
        document.getElementById('bathroomsFilter').value = '';

        this.currentFilters = {};
        this.filteredProperties = [...this.properties];
        this.currentPage = 1;
        this.renderProperties();
    }

    setupPagination() {
        // Event listeners para paginación
        document.getElementById('prevPage')?.addEventListener('click', () => this.previousPage());
        document.getElementById('nextPage')?.addEventListener('click', () => this.nextPage());
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderProperties();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredProperties.length / this.propertiesPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderProperties();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredProperties.length / this.propertiesPerPage);
        const paginationContainer = document.getElementById('pagination');
        
        if (!paginationContainer) return;

        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';
        
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');

        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
        if (pageInfo) pageInfo.textContent = `Página ${this.currentPage} de ${totalPages}`;
    }

    updateResultsCounter() {
        const counter = document.getElementById('resultsCounter');
        if (counter) {
            const startIndex = (this.currentPage - 1) * this.propertiesPerPage + 1;
            const endIndex = Math.min(this.currentPage * this.propertiesPerPage, this.filteredProperties.length);
            
            counter.textContent = `Mostrando ${startIndex}-${endIndex} de ${this.filteredProperties.length} propiedades`;
        }
    }

    showLoading() {
        const container = document.getElementById('propertiesGrid');
        if (container) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Cargando propiedades...</p>
                </div>
            `;
        }
    }

    showError() {
        const container = document.getElementById('propertiesGrid');
        if (container) {
            container.innerHTML = `
                <div class="loading-container">
                    <p style="color: #e74c3c;">❌ Error al cargar las propiedades</p>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 1rem;">Problema de conexión con la base de datos</p>
                    <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🔄 Recargar página
                    </button>
                </div>
            `;
        }
    }

    getEmptyState() {
        return `
            <div class="loading-container">
                <p style="color: #7f8c8d;">No se encontraron propiedades que coincidan con los filtros seleccionados.</p>
                <button onclick="window.comprasLoader.clearFilters()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Limpiar filtros
                </button>
            </div>
        `;
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
    
    function initComprasLoader() {
        if (window.supabase) {
            console.log('✅ Inicializando ComprasPageLoader...');
            window.comprasLoader = new ComprasPageLoader();
        } else {
            console.log('⏳ Esperando Supabase...');
            setTimeout(initComprasLoader, 500);
        }
    }

    // Escuchar evento de Supabase listo
    window.addEventListener('supabaseReady', () => {
        console.log('🚀 Supabase listo, inicializando ComprasPageLoader...');
        window.comprasLoader = new ComprasPageLoader();
    });

    // Iniciar inmediatamente si Supabase ya está disponible
    initComprasLoader();
});

// Export para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComprasPageLoader;
}