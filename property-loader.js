// property-loader.js - Sistema robusto con propiedades de ejemplo para Casa Nuvera

class PropertyLoader {
    constructor() {
        this.properties = [];
        this.isLoading = false;
        this.useFallbackData = false;
    }

    // Datos de ejemplo para cuando no hay conexión a BD
    getFallbackProperties() {
        return [
            {
                id: 1,
                title: "Casa Moderna Las Condes",
                description: "Hermosa casa moderna con acabados premium y excelente ubicación.",
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
                main_image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600&h=400&fit=crop&crop=center",
                property_images: [
                    {
                        image_url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600&h=400&fit=crop&crop=center",
                        image_order: 1,
                        is_main: true
                    }
                ]
            },
            {
                id: 2,
                title: "Departamento Providencia",
                description: "Departamento con vista panorámica en el corazón de Providencia.",
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
                main_image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop&crop=center",
                property_images: [
                    {
                        image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop&crop=center",
                        image_order: 1,
                        is_main: true
                    }
                ]
            },
            {
                id: 3,
                title: "Casa Familiar Vitacura",
                description: "Amplia casa familiar con jardín y piscina en sector exclusivo.",
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
                main_image: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=600&h=400&fit=crop&crop=center",
                property_images: [
                    {
                        image_url: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=600&h=400&fit=crop&crop=center",
                        image_order: 1,
                        is_main: true
                    }
                ]
            },
            {
                id: 4,
                title: "Departamento en Arriendo Ñuñoa",
                description: "Cómodo departamento para arriendo en excelente ubicación.",
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
                main_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop&crop=center",
                property_images: [
                    {
                        image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop&crop=center",
                        image_order: 1,
                        is_main: true
                    }
                ]
            },
            {
                id: 5,
                title: "Casa en Arriendo San Miguel",
                description: "Casa amplia para arriendo familiar en barrio tranquilo.",
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
                main_image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop&crop=center",
                property_images: [
                    {
                        image_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop&crop=center",
                        image_order: 1,
                        is_main: true
                    }
                ]
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
                    .limit(10);
                    
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
                        .limit(10);
                        
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
            main_image: property.main_image || property.imagen_principal || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 5) + 1505142468610}-359e7d316be0?w=600&h=400&fit=crop&crop=center`,
            property_images: [{
                image_url: property.main_image || property.imagen_principal || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 5) + 1505142468610}-359e7d316be0?w=600&h=400&fit=crop&crop=center`,
                image_order: 1,
                is_main: true
            }]
        }));
    }

    // Filtrar propiedades por tipo
    getPropertiesByType(tipo) {
        return this.properties.filter(property => {
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
        return this.properties
            .filter(p => p.featured)
            .slice(0, limit);
    }

    // Generar HTML para una propiedad
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
                    <img src="${imageUrl}" alt="${property.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop&crop=center'">
                    <div class="property-badge ${property.featured ? 'featured' : ''}">
                        ${property.featured ? '⭐ ' : ''}${getBadgeText(property.property_type)}
                    </div>
                    <div class="property-overlay">
                        <div class="property-details-btn">Ver Detalles</div>
                    </div>
                </div>
                
                <div class="property-info">
                    <div class="property-price">${formatPrice(property.price, property.currency)}</div>
                    <div class="property-title">${property.title}</div>
                    <div class="property-location">📍 ${property.commune}, ${property.region}</div>
                    
                    <div class="property-features">
                        🛏️ ${property.bedrooms} dorm. • 🚿 ${property.bathrooms} baños
                        ${property.total_area ? ` • 📐 ${property.total_area}m²` : ''}
                        ${property.parking_spaces > 0 ? ` • 🚗 ${property.parking_spaces} est.` : ''}
                    </div>
                    
                    ${property.expenses ? 
                        `<div class="property-expenses">💰 Gastos comunes: $${new Intl.NumberFormat('es-CL').format(property.expenses)}</div>` : 
                        ''
                    }
                </div>
            </div>
        `;
    }

    // Obtener imagen principal
    getPropertyMainImage(property) {
        if (property.property_images && property.property_images.length > 0) {
            const mainImage = property.property_images.find(img => img.is_main);
            if (mainImage && mainImage.image_url) {
                return mainImage.image_url;
            }
            return property.property_images[0].image_url;
        }
        
        if (property.main_image) {
            return property.main_image;
        }
        
        return `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop&crop=center`;
    }

    // Renderizar propiedades
    async renderProperties(containerId, tipo = null, limit = null) {
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
        let propertiesToShow = tipo ? this.getPropertiesByType(tipo) : this.properties;
        
        // Para propiedades destacadas, filtrar solo las destacadas
        if (containerId === 'featuredProperties') {
            propertiesToShow = this.getFeaturedProperties(limit || 3);
        }
        
        // Aplicar límite si se especifica
        if (limit && containerId !== 'featuredProperties') {
            propertiesToShow = propertiesToShow.slice(0, limit);
        }

        // Renderizar propiedades
        if (propertiesToShow.length === 0) {
            container.innerHTML = `
                <div class="no-properties-container">
                    <div class="no-properties-icon">🏠</div>
                    <h3>No hay propiedades disponibles</h3>
                    <p>Pronto tendremos nuevas propiedades para ti.</p>
                    ${this.useFallbackData ? 
                        '<p><small>📡 Mostrando datos de ejemplo - verifica la conexión a la base de datos</small></p>' : 
                        ''
                    }
                </div>
            `;
            return;
        }

        const propertiesHTML = propertiesToShow
            .map(property => this.generatePropertyHTML(property))
            .join('');

        container.innerHTML = propertiesHTML;

        console.log(`✅ ${propertiesToShow.length} propiedades renderizadas en ${containerId}`);
    }

    // Función para recargar propiedades
    async refreshProperties() {
        console.log('🔄 Refrescando propiedades...');
        this.properties = [];
        this.useFallbackData = false;
        await this.loadProperties();
        
        // Re-renderizar todas las secciones
        const containers = ['featuredProperties', 'compraProperties', 'arriendoProperties', 'propertiesGrid'];
        
        for (const containerId of containers) {
            const container = document.getElementById(containerId);
            if (container) {
                if (containerId === 'featuredProperties') {
                    await this.renderProperties(containerId, null, 3);
                } else if (containerId === 'compraProperties') {
                    await this.renderProperties(containerId, 'compra');
                } else if (containerId === 'arriendoProperties') {
                    await this.renderProperties(containerId, 'arriendo');
                } else {
                    await this.renderProperties(containerId);
                }
            }
        }
        
        console.log('✅ Propiedades refrescadas');
    }
}

// Funciones globales
window.goToProperty = function(propertyId) {
    window.location.href = `propiedad.html?id=${propertyId}`;
};

window.contactProperty = function(propertyId) {
    const property = window.propertyLoader.properties.find(p => p.id == propertyId);
    if (!property) return;

    const message = `Hola! Estoy interesado/a en la propiedad "${property.title}" en ${property.commune}. ¿Podrías darme más información?`;
    const phoneNumber = property.contact_phone.replace(/[^0-9]/g, '');
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappURL, '_blank');
};

// Crear instancia global
window.propertyLoader = new PropertyLoader();

// Auto-inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Inicializando Property Loader con datos garantizados...');
    
    setTimeout(async () => {
        try {
            const featuredContainer = document.getElementById('featuredProperties');
            const compraContainer = document.getElementById('compraProperties');
            const arriendoContainer = document.getElementById('arriendoProperties');
            const propertiesGrid = document.getElementById('propertiesGrid');

            if (featuredContainer) {
                await window.propertyLoader.renderProperties('featuredProperties', null, 3);
            }
            
            if (compraContainer) {
                await window.propertyLoader.renderProperties('compraProperties', 'compra');
            }
            
            if (arriendoContainer) {
                await window.propertyLoader.renderProperties('arriendoProperties', 'arriendo');
            }

            if (propertiesGrid) {
                await window.propertyLoader.renderProperties('propertiesGrid');
            }
            
        } catch (error) {
            console.error('❌ Error inicializando:', error);
        }
    }, 1000);
});

console.log('✅ Property Loader con datos garantizados cargado - Casa Nuvera');