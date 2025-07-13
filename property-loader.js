// property-loader.js - Sistema completo con filtros estilo PortalInmobiliario

class PropertyLoader {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.isLoading = false;
        this.useFallbackData = false;
        this.currentFilters = {};
    }

    // Datos de ejemplo completos
    getFallbackProperties() {
        return [
            {
                id: 1,
                title: "Casa Moderna Las Condes",
                description: "Hermosa casa moderna con acabados premium y excelente ubicación en sector exclusivo.",
                address: "Av. Las Condes 1234",
                commune: "Las Condes",
                region: "Santiago",
                neighborhood: "Sector exclusivo",
                price: 8500,
                currency: "UF",
                property_type: "venta",
                category: "Casa",
                bedrooms: 4,
                bathrooms: 3,
                total_area: 250,
                parking_spaces: 2,
                expenses: 150000,
                contact_phone: "+56912345678",
                contact_email: "contacto@casanuvera.cl",
                featured: true,
                published: true,
                created_at: new Date().toISOString(),
                main_image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop&crop=center"
            },
            {
                id: 2,
                title: "Departamento Providencia",
                description: "Departamento con vista panorámica en el corazón de Providencia, ubicación privilegiada.",
                address: "Av. Providencia 567",
                commune: "Providencia",
                region: "Santiago",
                neighborhood: "Centro Providencia",
                price: 5200,
                currency: "UF",
                property_type: "venta",
                category: "Departamento",
                bedrooms: 2,
                bathrooms: 2,
                total_area: 120,
                parking_spaces: 1,
                expenses: 80000,
                contact_phone: "+56912345678",
                contact_email: "contacto@casanuvera.cl",
                featured: true,
                published: true,
                created_at: new Date().toISOString(),
                main_image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center"
            },
            {
                id: 3,
                title: "Casa Familiar Vitacura",
                description: "Amplia casa familiar con jardín y piscina en sector exclusivo de Vitacura.",
                address: "Calle Los Almendros 890",
                commune: "Vitacura",
                region: "Santiago",
                neighborhood: "Sector residencial",
                price: 12000,
                currency: "UF",
                property_type: "venta",
                category: "Casa",
                bedrooms: 5,
                bathrooms: 4,
                total_area: 350,
                parking_spaces: 3,
                expenses: 200000,
                contact_phone: "+56912345678",
                contact_email: "contacto@casanuvera.cl",
                featured: true,
                published: true,
                created_at: new Date().toISOString(),
                main_image: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&h=600&fit=crop&crop=center"
            },
            {
                id: 4,
                title: "Departamento en Arriendo Ñuñoa",
                description: "Cómodo departamento para arriendo en excelente ubicación cerca de Plaza Ñuñoa.",
                address: "Av. Ñuñoa 345",
                commune: "Ñuñoa",
                region: "Santiago",
                neighborhood: "Plaza Ñuñoa",
                price: 650000,
                currency: "CLP",
                property_type: "arriendo",
                category: "Departamento",
                bedrooms: 2,
                bathrooms: 1,
                total_area: 80,
                parking_spaces: 1,
                expenses: 45000,
                contact_phone: "+56912345678",
                contact_email: "contacto@casanuvera.cl",
                featured: false,
                published: true,
                created_at: new Date().toISOString(),
                main_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center"
            },
            {
                id: 5,
                title: "Casa en Arriendo San Miguel",
                description: "Casa amplia para arriendo familiar en barrio tranquilo de San Miguel.",
                address: "Calle San Miguel 123",
                commune: "San Miguel",
                region: "Santiago",
                neighborhood: "Centro San Miguel",
                price: 850000,
                currency: "CLP",
                property_type: "arriendo",
                category: "Casa",
                bedrooms: 3,
                bathrooms: 2,
                total_area: 150,
                parking_spaces: 2,
                expenses: 0,
                contact_phone: "+56912345678",
                contact_email: "contacto@casanuvera.cl",
                featured: false,
                published: true,
                created_at: new Date().toISOString(),
                main_image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&crop=center"
            },
            {
                id: 6,
                title: "Oficina Las Condes",
                description: "Moderna oficina en edificio corporativo premium.",
                address: "Av. El Bosque Norte 500",
                commune: "Las Condes",
                region: "Santiago",
                neighborhood: "El Golf",
                price: 3500,
                currency: "UF",
                property_type: "venta",
                category: "Oficina",
                bedrooms: 0,
                bathrooms: 2,
                total_area: 95,
                parking_spaces: 2,
                expenses: 120000,
                contact_phone: "+56912345678",
                contact_email: "contacto@casanuvera.cl",
                featured: false,
                published: true,
                created_at: new Date().toISOString(),
                main_image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&crop=center"
            }
        ];
    }

    // Cargar propiedades con fallback robusto
    async loadProperties() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            console.log('🔄 Intentando cargar propiedades desde Supabase...');
            
            // Verificar si Supabase está disponible
            if (!window.supabase) {
                console.warn('⚠️ Supabase no disponible, usando datos de ejemplo');
                this.properties = this.getFallbackProperties();
                this.filteredProperties = [...this.properties];
                this.useFallbackData = true;
                return {
                    success: true,
                    data: this.properties,
                    fallback: true
                };
            }
            
            // Intentar cargar desde la base de datos
            let data = null;
            let error = null;

            try {
                // Intentar con tabla 'properties'
                const result = await window.supabase
                    .from('properties')
                    .select('*')
                    .limit(50);
                    
                data = result.data;
                error = result.error;
                
                if (error) throw error;
                
                console.log('✅ Datos cargados desde tabla "properties"');
                
            } catch (firstError) {
                console.warn('❌ Error con tabla "properties":', firstError.message);
                
                try {
                    // Intentar con tabla 'propiedades'
                    const result = await window.supabase
                        .from('propiedades')
                        .select('*')
                        .limit(50);
                        
                    data = result.data;
                    error = result.error;
                    
                    if (error) throw error;
                    
                    console.log('✅ Datos cargados desde tabla "propiedades"');
                    
                } catch (secondError) {
                    console.warn('❌ Error con ambas tablas:', secondError.message);
                    throw new Error('No se pueden cargar datos de la base de datos');
                }
            }

            // Si llegamos aquí, tenemos datos de la BD
            if (data && data.length > 0) {
                this.properties = this.normalizeProperties(data);
                console.log(`✅ ${this.properties.length} propiedades cargadas desde BD`);
            } else {
                // Si la BD está vacía, usar datos de ejemplo
                console.warn('⚠️ Base de datos vacía, usando datos de ejemplo');
                this.properties = this.getFallbackProperties();
                this.useFallbackData = true;
            }

            this.filteredProperties = [...this.properties];
            
            return {
                success: true,
                data: this.properties,
                fallback: this.useFallbackData
            };

        } catch (error) {
            console.error('❌ Error cargando propiedades:', error);
            
            // Usar datos de ejemplo como último recurso
            console.log('🔄 Usando datos de ejemplo como fallback');
            this.properties = this.getFallbackProperties();
            this.filteredProperties = [...this.properties];
            this.useFallbackData = true;
            
            return {
                success: true,
                data: this.properties,
                fallback: true,
                error: error.message
            };
        } finally {
            this.isLoading = false;
        }
    }

    // Normalizar propiedades desde BD
    normalizeProperties(properties) {
        return properties.map(property => ({
            id: property.id || Math.random(),
            title: property.title || property.titulo || 'Propiedad sin título',
            description: property.description || property.descripcion || '',
            address: property.address || property.direccion || 'Dirección no disponible',
            commune: property.commune || property.comuna || 'Comuna no especificada',
            region: property.region || 'Santiago',
            neighborhood: property.neighborhood || property.barrio || '',
            price: property.price || property.precio || 0,
            currency: property.currency || property.moneda || 'CLP',
            property_type: property.property_type || property.tipo_operacion || 'venta',
            category: property.category || property.categoria || 'Casa',
            bedrooms: property.bedrooms || property.dormitorios || 0,
            bathrooms: property.bathrooms || property.banos || 0,
            total_area: property.total_area || property.superficie_total || 0,
            parking_spaces: property.parking_spaces || property.estacionamientos || 0,
            expenses: property.expenses || property.gastos_comunes || 0,
            contact_phone: property.contact_phone || property.telefono_contacto || '+56912345678',
            contact_email: property.contact_email || property.email_contacto || 'contacto@casanuvera.cl',
            featured: property.featured || property.destacada || false,
            published: property.published || property.activa || true,
            created_at: property.created_at || property.fecha_creacion || new Date().toISOString(),
            main_image: property.main_image || property.imagen_principal || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 5) + 1505142468610}-359e7d316be0?w=800&h=600&fit=crop&crop=center`
        }));
    }

    // FILTROS ESTILO PORTAL INMOBILIARIO
    generateFiltersHTML(containerId) {
        const communes = [...new Set(this.properties.map(p => p.commune))].sort();
        const categories = [...new Set(this.properties.map(p => p.category))].sort();
        
        return `
            <div class="filters-section">
                <div class="filters-container">
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label class="filter-label">Tipo de Operación</label>
                            <select class="filter-select" id="filter-operation">
                                <option value="">Todas</option>
                                <option value="venta">Venta</option>
                                <option value="arriendo">Arriendo</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Tipo de Propiedad</label>
                            <select class="filter-select" id="filter-category">
                                <option value="">Todas</option>
                                ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Comuna</label>
                            <select class="filter-select" id="filter-commune">
                                <option value="">Todas las comunas</option>
                                ${communes.map(commune => `<option value="${commune}">${commune}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Dormitorios</label>
                            <select class="filter-select" id="filter-bedrooms">
                                <option value="">Cualquier cantidad</option>
                                <option value="1">1 dormitorio</option>
                                <option value="2">2 dormitorios</option>
                                <option value="3">3 dormitorios</option>
                                <option value="4">4 dormitorios</option>
                                <option value="5">5+ dormitorios</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Baños</label>
                            <select class="filter-select" id="filter-bathrooms">
                                <option value="">Cualquier cantidad</option>
                                <option value="1">1 baño</option>
                                <option value="2">2 baños</option>
                                <option value="3">3 baños</option>
                                <option value="4">4+ baños</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">Precio</label>
                            <div class="price-range">
                                <input type="number" class="filter-input" id="filter-price-min" placeholder="Mínimo">
                                <span class="price-separator">-</span>
                                <input type="number" class="filter-input" id="filter-price-max" placeholder="Máximo">
                            </div>
                        </div>
                    </div>
                    
                    <div class="filters-actions">
                        <button class="filter-btn secondary" onclick="propertyLoader.clearFilters('${containerId}')">
                            Limpiar Filtros
                        </button>
                        <button class="filter-btn primary" onclick="propertyLoader.applyFilters('${containerId}')">
                            Buscar Propiedades
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="results-count" id="results-count">
                <strong>${this.filteredProperties.length}</strong> propiedades encontradas
            </div>
        `;
    }

    // Aplicar filtros
    applyFilters(containerId) {
        const filters = {
            operation: document.getElementById('filter-operation')?.value || '',
            category: document.getElementById('filter-category')?.value || '',
            commune: document.getElementById('filter-commune')?.value || '',
            bedrooms: document.getElementById('filter-bedrooms')?.value || '',
            bathrooms: document.getElementById('filter-bathrooms')?.value || '',
            priceMin: document.getElementById('filter-price-min')?.value || '',
            priceMax: document.getElementById('filter-price-max')?.value || ''
        };

        this.currentFilters = filters;
        this.filteredProperties = this.properties.filter(property => {
            // Filtro por tipo de operación
            if (filters.operation && !property.property_type.includes(filters.operation)) {
                return false;
            }

            // Filtro por categoría
            if (filters.category && property.category !== filters.category) {
                return false;
            }

            // Filtro por comuna
            if (filters.commune && property.commune !== filters.commune) {
                return false;
            }

            // Filtro por dormitorios
            if (filters.bedrooms) {
                const bedroomsFilter = parseInt(filters.bedrooms);
                if (bedroomsFilter === 5 && property.bedrooms < 5) {
                    return false;
                } else if (bedroomsFilter < 5 && property.bedrooms !== bedroomsFilter) {
                    return false;
                }
            }

            // Filtro por baños
            if (filters.bathrooms) {
                const bathroomsFilter = parseInt(filters.bathrooms);
                if (bathroomsFilter === 4 && property.bathrooms < 4) {
                    return false;
                } else if (bathroomsFilter < 4 && property.bathrooms !== bathroomsFilter) {
                    return false;
                }
            }

            // Filtro por precio mínimo
            if (filters.priceMin && property.price < parseInt(filters.priceMin)) {
                return false;
            }

            // Filtro por precio máximo
            if (filters.priceMax && property.price > parseInt(filters.priceMax)) {
                return false;
            }

            return true;
        });

        // Actualizar contador de resultados
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.innerHTML = `<strong>${this.filteredProperties.length}</strong> propiedades encontradas`;
        }

        // Re-renderizar propiedades filtradas
        this.renderFilteredProperties(containerId);
    }

    // Limpiar filtros
    clearFilters(containerId) {
        // Limpiar campos
        const filterElements = [
            'filter-operation', 'filter-category', 'filter-commune',
            'filter-bedrooms', 'filter-bathrooms', 'filter-price-min', 'filter-price-max'
        ];

        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
            }
        });

        // Resetear filtros
        this.currentFilters = {};
        this.filteredProperties = [...this.properties];

        // Actualizar contador
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.innerHTML = `<strong>${this.filteredProperties.length}</strong> propiedades encontradas`;
        }

        // Re-renderizar todas las propiedades
        this.renderFilteredProperties(containerId);
    }

    // Filtrar propiedades por tipo
    getPropertiesByType(tipo) {
        return this.filteredProperties.filter(property => {
            if (tipo === 'compra') {
                return ['venta', 'compra', 'sale'].includes(property.property_type);
            } else if (tipo === 'arriendo') {
                return ['arriendo', 'rent', 'arriendo-temporal'].includes(property.property_type);
            }
            return false;
        });
    }

    // Obtener propiedades destacadas
    getFeaturedProperties(limit = 3) {
        return this.filteredProperties
            .filter(p => p.featured)
            .slice(0, limit);
    }

    // Generar HTML compacto para propiedades
    generatePropertyHTML(property) {
        const formatPrice = (precio, moneda) => {
            const formatted = new Intl.NumberFormat('es-CL').format(precio);
            switch(moneda) {
                case 'CLP': return `$${formatted}`;
                case 'UF': return `UF ${formatted}`;
                case 'USD': return `US$${formatted}`;
                default: return `${moneda} ${formatted}`;
            }
        };

        const getBadgeText = (tipo) => {
            switch(tipo) {
                case 'venta': 
                case 'compra': 
                case 'sale': return 'VENTA';
                case 'arriendo': 
                case 'rent': return 'ARRIENDO';
                default: return 'DISPONIBLE';
            }
        };

        const imageUrl = this.getPropertyMainImage(property);

        return `
            <div class="property-card" data-id="${property.id}" onclick="goToProperty(${property.id})">
                <div class="property-image">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${property.title}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=\\'placeholder-image\\'><div class=\\'placeholder-icon\\'>🏠</div><div class=\\'placeholder-text\\'>Sin imagen</div></div>'">` : 
                        `<div class="placeholder-image">
                            <div class="placeholder-icon">🏠</div>
                            <div class="placeholder-text">Sin imagen</div>
                        </div>`
                    }
                    
                    <div class="property-badge ${property.featured ? 'featured' : ''}">
                        ${property.featured ? '⭐ ' : ''}${getBadgeText(property.property_type)}
                    </div>
                    
                    <div class="property-overlay">
                        <div class="property-details-btn">👁️ Ver Detalles</div>
                    </div>
                </div>
                
                <div class="property-info">
                    <div class="property-price">${formatPrice(property.price, property.currency)}</div>
                    <div class="property-title">${property.title}</div>
                    <div class="property-location">📍 ${property.commune}</div>
                    
                    <div class="property-features">
                        ${property.bedrooms > 0 ? `🛏️ ${property.bedrooms} dorm` : ''} 
                        ${property.bathrooms > 0 ? ` • 🚿 ${property.bathrooms} baños` : ''}
                        ${property.total_area > 0 ? ` • 📐 ${property.total_area}m²` : ''}
                    </div>
                    
                    ${property.expenses ? 
                        `<div class="property-expenses">💰 G.C: $${new Intl.NumberFormat('es-CL').format(property.expenses)}</div>` : 
                        ''
                    }
                    
                    <div class="property-contact">
                        <button class="contact-btn" onclick="event.stopPropagation(); contactProperty('${property.id}')">
                            💬 WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Obtener imagen principal
    getPropertyMainImage(property) {
        if (property.main_image) {
            return property.main_image;
        }
        
        return `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center`;
    }

    // Renderizar propiedades filtradas
    renderFilteredProperties(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const propertiesHTML = `
            <div class="properties-grid">
                ${this.filteredProperties.map(property => this.generatePropertyHTML(property)).join('')}
            </div>
        `;

        // Solo actualizar la sección del grid, no los filtros
        const existingGrid = container.querySelector('.properties-grid');
        if (existingGrid) {
            existingGrid.outerHTML = propertiesHTML;
        } else {
            container.innerHTML += propertiesHTML;
        }

        console.log(`✅ ${this.filteredProperties.length} propiedades filtradas renderizadas`);
    }

    // Renderizar propiedades con filtros
    async renderProperties(containerId, tipo = null, limit = null, showFilters = false) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Contenedor ${containerId} no encontrado`);
            return;
        }

        // Mostrar loading
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando propiedades...</p>
            </div>
        `;

        // Cargar propiedades si no están cargadas
        if (this.properties.length === 0) {
            const result = await this.loadProperties();
            
            if (result.fallback) {
                console.log('📋 Usando datos de ejemplo');
            }
        }

        // Filtrar propiedades según el tipo
        let propertiesToShow = tipo ? this.getPropertiesByType(tipo) : this.filteredProperties;
        
        // Para propiedades destacadas, filtrar solo las destacadas
        if (containerId === 'featuredProperties') {
            propertiesToShow = this.getFeaturedProperties(limit || 3);
        }
        
        // Aplicar límite si se especifica
        if (limit && containerId !== 'featuredProperties') {
            propertiesToShow = propertiesToShow.slice(0, limit);
        }

        // Generar HTML
        let html = '';

        // Agregar filtros si se solicita
        if (showFilters) {
            html += this.generateFiltersHTML(containerId);
        }

        // Renderizar propiedades
        if (propertiesToShow.length === 0) {
            html += `
                <div class="no-properties-container">
                    <div class="no-properties-icon">🏠</div>
                    <h3>No se encontraron propiedades</h3>
                    <p>Intenta ajustar los filtros de búsqueda.</p>
                    <div class="no-properties-actions">
                        <button onclick="propertyLoader.clearFilters('${containerId}')" class="refresh-btn">🔄 Limpiar Filtros</button>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="properties-grid">
                    ${propertiesToShow.map(property => this.generatePropertyHTML(property)).join('')}
                </div>
            `;
        }

        container.innerHTML = html;

        console.log(`✅ ${propertiesToShow.length} propiedades renderizadas en ${containerId}`);
    }

    // Función para recargar propiedades
    async refreshProperties() {
        console.log('🔄 Refrescando propiedades...');
        this.properties = [];
        this.filteredProperties = [];
        this.useFallbackData = false;
        await this.loadProperties();
        
        // Re-renderizar todas las secciones
        const containers = ['featuredProperties', 'compraProperties', 'arriendoProperties', 'propertiesGrid'];
        
        for (const containerId of containers) {
            const container = document.getElementById(containerId);
            if (container) {
                if (containerId === 'featuredProperties') {
                    await this.renderProperties(containerId, null, 3, false);
                } else if (containerId === 'compraProperties') {
                    await this.renderProperties(containerId, 'compra', null, true);
                } else if (containerId === 'arriendoProperties') {
                    await this.renderProperties(containerId, 'arriendo', null, true);
                } else {
                    await this.renderProperties(containerId, null, null, true);
                }
            }
        }
        
        console.log('✅ Propiedades refrescadas');
    }
}

// Funciones globales
window.goToProperty = function(propertyId) {
    try {
        console.log('🔗 Navegando a propiedad:', propertyId);
        window.location.href = `propiedad.html?id=${propertyId}`;
    } catch (error) {
        console.error('❌ Error navegando a propiedad:', error);
        alert('Error al abrir la propiedad. Por favor, intenta nuevamente.');
    }
};

window.contactProperty = function(propertyId) {
    try {
        const property = window.propertyLoader.properties.find(p => p.id == propertyId);
        if (!property) {
            console.error('❌ Propiedad no encontrada:', propertyId);
            alert('Propiedad no encontrada');
            return;
        }

        const formatPrice = (precio, moneda) => {
            const formatted = new Intl.NumberFormat('es-CL').format(precio);
            switch(moneda) {
                case 'CLP': return `$${formatted}`;
                case 'UF': return `UF ${formatted}`;
                case 'USD': return `US$${formatted}`;
                default: return `${moneda} ${formatted}`;
            }
        };

        const message = `Hola! Estoy interesado/a en la propiedad "${property.title}" ubicada en ${property.commune}.

📍 Dirección: ${property.address}
💰 Precio: ${formatPrice(property.price, property.currency)}
🏠 ${property.bedrooms} dormitorios, ${property.bathrooms} baños
${property.total_area ? `📐 Superficie: ${property.total_area}m²` : ''}
${property.expenses ? `💸 Gastos comunes: $${property.expenses.toLocaleString()}` : ''}

¿Podrías darme más información?`;

        const phoneNumber = property.contact_phone.replace(/[^0-9]/g, '');
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        console.log('📱 Abriendo WhatsApp para propiedad:', property.title);
        window.open(whatsappURL, '_blank');
    } catch (error) {
        console.error('❌ Error contactando propiedad:', error);
        alert('Error al contactar. Por favor, intenta nuevamente.');
    }
};

// Crear instancia global
window.propertyLoader = new PropertyLoader();

// Auto-inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Inicializando Property Loader con filtros estilo PortalInmobiliario...');
    
    setTimeout(async () => {
        try {
            const featuredContainer = document.getElementById('featuredProperties');
            const compraContainer = document.getElementById('compraProperties');
            const arriendoContainer = document.getElementById('arriendoProperties');
            const propertiesGrid = document.getElementById('propertiesGrid');

            if (featuredContainer) {
                console.log('📋 Cargando propiedades destacadas...');
                await window.propertyLoader.renderProperties('featuredProperties', null, 3, false);
            }
            
            if (compraContainer) {
                console.log('🏠 Cargando propiedades en venta con filtros...');
                await window.propertyLoader.renderProperties('compraProperties', 'compra', null, true);
            }
            
            if (arriendoContainer) {
                console.log('🏘️ Cargando propiedades en arriendo con filtros...');
                await window.propertyLoader.renderProperties('arriendoProperties', 'arriendo', null, true);
            }

            if (propertiesGrid) {
                console.log('🏘️ Cargando todas las propiedades con filtros...');
                await window.propertyLoader.renderProperties('propertiesGrid', null, null, true);
            }
            
        } catch (error) {
            console.error('❌ Error inicializando:', error);
        }
    }, 1000);
});

console.log('✅ Property Loader con filtros PortalInmobiliario cargado - Casa Nuvera');