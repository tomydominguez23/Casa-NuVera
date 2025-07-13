// property-loader.js - Diseño exacto como la imagen de referencia

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
                description: "Hermosa casa moderna con acabados premium",
                address: "Av. Las Condes 1234",
                commune: "Las Condes",
                region: "Santiago",
                price: 8500,
                currency: "UF",
                property_type: "venta",
                bedrooms: 4,
                bathrooms: 3,
                total_area: 250,
                parking_spaces: 2,
                contact_phone: "+56912345678",
                featured: true,
                main_image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop&crop=center"
            },
            {
                id: 2,
                title: "Departamento Providencia",
                description: "Departamento con vista panorámica",
                address: "Av. Providencia 567",
                commune: "Providencia",
                region: "Santiago",
                price: 5200,
                currency: "UF",
                property_type: "venta",
                bedrooms: 2,
                bathrooms: 2,
                total_area: 120,
                parking_spaces: 1,
                contact_phone: "+56912345678",
                featured: true,
                main_image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center"
            },
            {
                id: 3,
                title: "Casa Familiar Vitacura",
                description: "Amplia casa familiar con jardín y piscina",
                address: "Calle Los Almendros 890",
                commune: "Vitacura",
                region: "Santiago",
                price: 12000,
                currency: "UF",
                property_type: "venta",
                bedrooms: 5,
                bathrooms: 4,
                total_area: 350,
                parking_spaces: 3,
                contact_phone: "+56912345678",
                featured: true,
                main_image: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&h=600&fit=crop&crop=center"
            }
        ];
    }

    // Cargar propiedades con fallback robusto
    async loadProperties() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            // Verificar si Supabase está disponible
            if (!window.supabase) {
                this.properties = this.getFallbackProperties();
                this.useFallbackData = true;
                return { success: true, data: this.properties, fallback: true };
            }
            
            // Intentar cargar desde la base de datos
            let data = null;
            try {
                const result = await window.supabase.from('properties').select('*').limit(10);
                data = result.data;
                if (result.error) throw result.error;
            } catch (firstError) {
                try {
                    const result = await window.supabase.from('propiedades').select('*').limit(10);
                    data = result.data;
                    if (result.error) throw result.error;
                } catch (secondError) {
                    throw new Error('No se pueden cargar datos de la base de datos');
                }
            }

            if (data && data.length > 0) {
                this.properties = this.normalizeProperties(data);
            } else {
                this.properties = this.getFallbackProperties();
                this.useFallbackData = true;
            }
            
            return { success: true, data: this.properties, fallback: this.useFallbackData };

        } catch (error) {
            this.properties = this.getFallbackProperties();
            this.useFallbackData = true;
            return { success: true, data: this.properties, fallback: true, error: error.message };
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
            price: property.price || property.precio || 0,
            currency: property.currency || property.moneda || 'CLP',
            property_type: property.property_type || property.tipo_operacion || 'venta',
            bedrooms: property.bedrooms || property.dormitorios || 0,
            bathrooms: property.bathrooms || property.banos || 0,
            total_area: property.total_area || property.superficie_total || 0,
            parking_spaces: property.parking_spaces || property.estacionamientos || 0,
            contact_phone: property.contact_phone || property.telefono_contacto || '+56912345678',
            featured: property.featured || property.destacada || false,
            main_image: property.main_image || property.imagen_principal || `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center`
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
        return this.properties.filter(p => p.featured).slice(0, limit);
    }

    // Generar HTML SIMPLE como en la imagen
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

        const imageUrl = property.main_image || `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center`;

        return `
            <div class="property-card" onclick="goToProperty(${property.id})">
                <div class="property-image">
                    <img src="${imageUrl}" alt="${property.title}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=\\'placeholder-image\\'><div class=\\'placeholder-icon\\'>🏠</div><div class=\\'placeholder-text\\'>Sin imagen</div></div>'">
                </div>
                
                ${property.featured ? 
                    `<div class="property-badge featured">⭐ ${getBadgeText(property.property_type)}</div>` : 
                    `<div class="property-badge">${getBadgeText(property.property_type)}</div>`
                }
                
                <div class="property-overlay">
                    <div class="property-details-btn">👁️ Ver Detalles</div>
                </div>
                
                <div class="property-info">
                    <div class="property-price">${formatPrice(property.price, property.currency)}</div>
                    <div class="property-title">${property.title}</div>
                    <div class="property-location">${property.commune}, ${property.region}</div>
                    <div class="property-features">
                        ${property.bedrooms} dorm • ${property.bathrooms} baños • ${property.total_area}m²
                    </div>
                </div>
            </div>
        `;
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
            await this.loadProperties();
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
                </div>
            `;
            return;
        }

        // Generar HTML del grid - EXACTO como la imagen
        const propertiesHTML = `
            <div class="properties-grid">
                ${propertiesToShow.map(property => this.generatePropertyHTML(property)).join('')}
            </div>
        `;

        container.innerHTML = propertiesHTML;
        console.log(`✅ ${propertiesToShow.length} propiedades renderizadas en ${containerId}`);
    }

    // Función para recargar propiedades
    async refreshProperties() {
        this.properties = [];
        this.useFallbackData = false;
        await this.loadProperties();
        
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
    }
}

// Funciones globales
window.goToProperty = function(propertyId) {
    try {
        console.log('🔗 Navegando a propiedad:', propertyId);
        window.location.href = `propiedad.html?id=${propertyId}`;
    } catch (error) {
        console.error('❌ Error navegando a propiedad:', error);
    }
};

window.contactProperty = function(propertyId) {
    try {
        const property = window.propertyLoader.properties.find(p => p.id == propertyId);
        if (!property) return;

        const message = `Hola! Estoy interesado/a en la propiedad "${property.title}" en ${property.commune}. ¿Podrías darme más información?`;
        const phoneNumber = property.contact_phone.replace(/[^0-9]/g, '');
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappURL, '_blank');
    } catch (error) {
        console.error('❌ Error contactando propiedad:', error);
    }
};

// Crear instancia global
window.propertyLoader = new PropertyLoader();

// Auto-inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Inicializando Property Loader - diseño como imagen de referencia...');
    
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

console.log('✅ Property Loader simplificado - exacto como imagen de referencia');