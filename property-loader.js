// property-loader.js - Sistema IDÉNTICO a PortalInmobiliario.com

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
                title: "Departamento en Arriendo",
                description: "Departamento En Arriendo En Chicureo",
                address: "Chicureo",
                commune: "Chicureo",
                region: "Santiago",
                neighborhood: "Chicureo",
                price: 63,
                currency: "UF",
                property_type: "arriendo",
                category: "Departamento",
                bedrooms: 0,
                bathrooms: 0,
                total_area: 0,
                parking_spaces: 0,
                expenses: 0,
                contact_phone: "+56912345678",
                contact_email: "contacto@casanuvera.cl",
                featured: true,
                published: true,
                created_at: new Date().toISOString(),
                main_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center"
            },
            {
                id: 5,
                title: "Impecable Departamento E...",
                description: "Impecable Departamento En Arriendo",
                address: "Chicureo",
                commune: "Chicureo",
                region: "Santiago",
                neighborhood: "Chicureo",
                price: 1450000,
                currency: "CLP",
                property_type: "arriendo",
                category: "Departamento",
                bedrooms: 0,
                bathrooms: 0,
                total_area: 0,
                parking_spaces: 0,
                expenses: 0,
                contact_phone: "+56912345678",
                contact_email: "contacto@casanuvera.cl",
                featured: true,
                published: true,
                created_at: new Date().toISOString(),
                main_image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center"
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

    // Obtener propiedades destacadas
    getFeaturedProperties(limit = 5) {
        return this.filteredProperties
            .filter(p => p.featured)
            .slice(0, limit);
    }

    // Generar HTML IDÉNTICO a PortalInmobiliario.com
    generatePropertyHTML(property) {
        const formatPrice = (precio, moneda) => {
            const formatted = new Intl.NumberFormat('es-CL').format(precio);
            switch(moneda) {
                case 'CLP': return `$ ${formatted}`;
                case 'UF': return `UF ${formatted}`;
                case 'USD': return `US$ ${formatted}`;
                default: return `${moneda} ${formatted}`;
            }
        };

        const imageUrl = this.getPropertyMainImage(property);

        return `
            <div class="portal-property-card" data-id="${property.id}" onclick="goToProperty(${property.id})">
                <div class="portal-property-image">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${property.title}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=\\'no-image-placeholder\\'>Sin imagen</div>'">` : 
                        `<div class="no-image-placeholder">Sin imagen</div>`
                    }
                </div>
                
                <div class="portal-property-content">
                    <div class="portal-property-price">${formatPrice(property.price, property.currency)}</div>
                    <div class="portal-property-title">${property.title}</div>
                    <div class="portal-property-subtitle">${property.description || property.address}</div>
                    <div class="portal-property-location">${property.commune}</div>
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

    // Renderizar propiedades destacadas con el estilo exacto de PortalInmobiliario
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

        // Para propiedades destacadas, filtrar solo las destacadas
        let propertiesToShow = [];
        if (containerId === 'featuredProperties') {
            propertiesToShow = this.getFeaturedProperties(limit || 5);
        } else {
            propertiesToShow = this.filteredProperties;
        }
        
        // Aplicar límite si se especifica
        if (limit && containerId !== 'featuredProperties') {
            propertiesToShow = propertiesToShow.slice(0, limit);
        }

        // Generar HTML
        let html = '';

        // Renderizar propiedades
        if (propertiesToShow.length === 0) {
            html += `
                <div class="no-properties-container">
                    <div class="no-properties-icon">🏠</div>
                    <h3>No se encontraron propiedades</h3>
                    <p>Intenta ajustar los filtros de búsqueda.</p>
                </div>
            `;
        } else {
            html += `
                <div class="portal-properties-grid">
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
        
        // Re-renderizar propiedades destacadas
        const featuredContainer = document.getElementById('featuredProperties');
        if (featuredContainer) {
            await this.renderProperties('featuredProperties', null, 5, false);
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
    console.log('🏠 Inicializando Property Loader IDÉNTICO a PortalInmobiliario...');
    
    setTimeout(async () => {
        try {
            const featuredContainer = document.getElementById('featuredProperties');

            if (featuredContainer) {
                console.log('📋 Cargando propiedades destacadas...');
                await window.propertyLoader.renderProperties('featuredProperties', null, 5, false);
            }
            
        } catch (error) {
            console.error('❌ Error inicializando:', error);
        }
    }, 1000);
});

console.log('✅ Property Loader IDÉNTICO a PortalInmobiliario.com cargado - Casa Nuvera');