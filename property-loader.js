// property-loader.js - Adaptado para estructura en inglés de Casa Nuvera

class PropertyLoader {
    constructor() {
        this.properties = [];
        this.isLoading = false;
    }

    // Cargar propiedades desde Supabase (ADAPTADO A ESTRUCTURA INGLÉS)
    async loadProperties() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            console.log('🔄 Cargando propiedades desde Supabase...');
            
            if (!window.supabase) {
                throw new Error('Supabase no está disponible');
            }
            
            // Query adaptada a tu estructura en inglés
            const { data, error } = await window.supabase
                .from('properties')
                .select('*')
                .eq('published', true)  // published en lugar de activa
                .order('featured', { ascending: false })
                .order('created_at', { ascending: false }); // created_at en lugar de fecha_creacion

            if (error) {
                throw error;
            }

            this.properties = data || [];
            console.log(`✅ ${this.properties.length} propiedades cargadas`);
            
            return {
                success: true,
                data: this.properties
            };

        } catch (error) {
            console.error('❌ Error cargando propiedades:', error);
            return {
                success: false,
                error: error.message
            };
        } finally {
            this.isLoading = false;
        }
    }

    // Filtrar propiedades por tipo de operación (ADAPTADO)
    getPropertiesByType(tipo) {
        return this.properties.filter(property => {
            if (tipo === 'compra') {
                return property.property_type === 'venta'; // property_type en lugar de tipo_operacion
            } else if (tipo === 'arriendo') {
                return property.property_type === 'arriendo' || property.property_type === 'arriendo-temporal';
            }
            return false;
        });
    }

    // Obtener propiedades destacadas (ADAPTADO)
    getFeaturedProperties(limit = 6) {
        return this.properties
            .filter(p => p.featured) // featured en lugar de destacada
            .slice(0, limit);
    }

    // Generar HTML para una propiedad (ADAPTADO A ESTRUCTURA INGLÉS)
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

        const getBadgeClass = (tipo) => {
            switch(tipo) {
                case 'venta': return 'property-badge sale';
                case 'arriendo': return 'property-badge rent';
                case 'arriendo-temporal': return 'property-badge temp-rent';
                default: return 'property-badge';
            }
        };

        const getBadgeText = (tipo) => {
            switch(tipo) {
                case 'venta': return 'VENTA';
                case 'arriendo': return 'ARRIENDO';
                case 'arriendo-temporal': return 'ARRIENDO TEMPORAL';
                default: return 'DISPONIBLE';
            }
        };

        // Buscar imagen principal - adaptado a tu estructura
        const imageUrl = this.getPropertyMainImage(property);

        return `
            <div class="property-card" data-id="${property.id}">
                <div class="property-image ${imageUrl ? 'has-image' : 'no-image'}">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${property.title}" onerror="this.style.display='none'; this.parentNode.classList.add('no-image');">` : 
                        `<div class="placeholder-image">
                            <div class="placeholder-icon">🏠</div>
                            <div class="placeholder-text">Sin imagen</div>
                        </div>`
                    }
                    <div class="${getBadgeClass(property.property_type)} ${property.featured ? 'featured' : ''}">
                        ${property.featured ? '⭐ ' : ''}${getBadgeText(property.property_type)}
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
                    
                    <div class="property-contact">
                        <button class="contact-btn" onclick="contactProperty('${property.id}')">
                            💬 Contactar por WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Función para obtener imagen principal de la propiedad
    getPropertyMainImage(property) {
        // Si tienes una columna main_image
        if (property.main_image) {
            return property.main_image;
        }
        
        // Si guardas imágenes en un array JSON
        if (property.images && Array.isArray(property.images) && property.images.length > 0) {
            return property.images[0];
        }
        
        // Si necesitas obtener de la tabla property_images (requiere query separada)
        // Por ahora retornamos null, se puede implementar después
        return null;
    }

    // Cargar imagen principal desde tabla property_images
    async loadPropertyImages(propertyId) {
        try {
            const { data, error } = await window.supabase
                .from('property_images')
                .select('image_url')
                .eq('property_id', propertyId)
                .eq('is_main', true)
                .single();

            if (error) {
                console.warn('No se encontró imagen principal para propiedad:', propertyId);
                return null;
            }

            return data.image_url;
        } catch (error) {
            console.warn('Error cargando imagen principal:', error);
            return null;
        }
    }

    // Renderizar propiedades en un contenedor específico
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
            if (!result.success) {
                container.innerHTML = `
                    <div class="error-container">
                        <h3>❌ Error cargando propiedades</h3>
                        <p>${result.error}</p>
                        <div class="error-actions">
                            <button onclick="propertyLoader.renderProperties('${containerId}', '${tipo}', ${limit})" 
                                    class="retry-btn">
                                🔄 Reintentar
                            </button>
                            <button onclick="window.reconnectSupabase()" class="reconnect-btn">
                                🔌 Reconectar Base de Datos
                            </button>
                        </div>
                        <p class="error-hint">
                            💡 Si el problema persiste, verifica la tabla 'properties' en Supabase.
                        </p>
                    </div>
                `;
                return;
            }
        }

        // Filtrar propiedades según el tipo
        let propertiesToShow = tipo ? this.getPropertiesByType(tipo) : this.properties;
        
        // Aplicar límite si se especifica
        if (limit) {
            propertiesToShow = propertiesToShow.slice(0, limit);
        }

        // Renderizar propiedades
        if (propertiesToShow.length === 0) {
            const tipoTexto = tipo === 'compra' ? 'Propiedades en Venta' : 
                             tipo === 'arriendo' ? 'Propiedades en Arriendo' : 
                             'Propiedades Destacadas';
            
            container.innerHTML = `
                <div class="no-properties-container">
                    <div class="no-properties-icon">🏠</div>
                    <h3>${tipoTexto}</h3>
                    <p>No hay propiedades disponibles en este momento.</p>
                    <div class="no-properties-actions">
                        <a href="subir-propiedad.html" class="add-property-btn">
                            ➕ Agregar Nueva Propiedad
                        </a>
                        <button onclick="propertyLoader.refreshProperties()" class="refresh-btn">
                            🔄 Actualizar Lista
                        </button>
                    </div>
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

    // Función para búsqueda de propiedades (ADAPTADO)
    searchProperties(query, filters = {}) {
        let filteredProperties = [...this.properties];

        // Filtro por texto
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase().trim();
            filteredProperties = filteredProperties.filter(property => 
                property.title.toLowerCase().includes(searchTerm) ||
                property.description?.toLowerCase().includes(searchTerm) ||
                property.commune.toLowerCase().includes(searchTerm) ||
                property.address.toLowerCase().includes(searchTerm) ||
                property.neighborhood?.toLowerCase().includes(searchTerm)
            );
        }

        // Filtros adicionales (ADAPTADOS A ESTRUCTURA INGLÉS)
        if (filters.property_type) {
            filteredProperties = filteredProperties.filter(p => p.property_type === filters.property_type);
        }

        if (filters.category) {
            filteredProperties = filteredProperties.filter(p => p.category === filters.category);
        }

        if (filters.commune) {
            filteredProperties = filteredProperties.filter(p => p.commune === filters.commune);
        }

        if (filters.bedrooms_min) {
            filteredProperties = filteredProperties.filter(p => p.bedrooms >= filters.bedrooms_min);
        }

        if (filters.bedrooms_max) {
            filteredProperties = filteredProperties.filter(p => p.bedrooms <= filters.bedrooms_max);
        }

        if (filters.price_min) {
            filteredProperties = filteredProperties.filter(p => p.price >= filters.price_min);
        }

        if (filters.price_max) {
            filteredProperties = filteredProperties.filter(p => p.price <= filters.price_max);
        }

        return filteredProperties;
    }

    // Función para recargar propiedades
    async refreshProperties() {
        console.log('🔄 Refrescando propiedades...');
        this.properties = [];
        await this.loadProperties();
        
        // Re-renderizar todas las secciones activas
        const containers = ['featuredProperties', 'compraProperties', 'arriendoProperties'];
        
        for (const containerId of containers) {
            const container = document.getElementById(containerId);
            if (container) {
                if (containerId === 'featuredProperties') {
                    await this.renderProperties(containerId, null, 6);
                } else if (containerId === 'compraProperties') {
                    await this.renderProperties(containerId, 'compra');
                } else if (containerId === 'arriendoProperties') {
                    await this.renderProperties(containerId, 'arriendo');
                }
            }
        }
        
        console.log('✅ Propiedades refrescadas');
    }

    // Función para obtener estadísticas (ADAPTADO)
    getStats() {
        const stats = {
            total: this.properties.length,
            ventas: this.properties.filter(p => p.property_type === 'venta').length,
            arriendos: this.properties.filter(p => p.property_type === 'arriendo' || p.property_type === 'arriendo-temporal').length,
            destacadas: this.properties.filter(p => p.featured).length,
            promedioPrecio: 0
        };

        if (this.properties.length > 0) {
            const totalPrecios = this.properties.reduce((sum, p) => sum + p.price, 0);
            stats.promedioPrecio = Math.round(totalPrecios / this.properties.length);
        }

        return stats;
    }
}

// Funciones globales para interactuar con propiedades (ADAPTADO)
window.contactProperty = function(propertyId) {
    const property = window.propertyLoader.properties.find(p => p.id === propertyId);
    if (!property) {
        console.error('Propiedad no encontrada:', propertyId);
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

¿Podrías darme más información?`;

    // Limpiar número de teléfono
    const phoneNumber = property.contact_phone.replace(/[^0-9]/g, '');
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    console.log('📱 Abriendo WhatsApp para propiedad:', property.title);
    window.open(whatsappURL, '_blank');
};

// Función para mostrar detalles de propiedad
window.showPropertyDetails = function(propertyId) {
    const property = window.propertyLoader.properties.find(p => p.id === propertyId);
    if (!property) return;

    // Implementar modal o página de detalles aquí
    console.log('🔍 Mostrar detalles de:', property.title);
};

// Crear instancia global
window.propertyLoader = new PropertyLoader();

// Auto-inicializar cuando el DOM y Supabase estén listos
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🏠 Inicializando Property Loader (Estructura Inglés)...');
    
    // Esperar a que Supabase esté listo
    if (window.supabase) {
        initializePropertyLoader();
    } else {
        console.log('⏳ Esperando Supabase...');
        window.addEventListener('supabaseReady', initializePropertyLoader);
        
        // Timeout de seguridad
        setTimeout(() => {
            if (!window.supabase) {
                console.warn('⚠️ Timeout esperando Supabase, intentando inicializar de todos modos...');
                initializePropertyLoader();
            }
        }, 5000);
    }
});

function initializePropertyLoader() {
    console.log('🚀 Inicializando Property Loader...');
    
    // Auto-cargar propiedades en las secciones correspondientes
    setTimeout(async () => {
        try {
            const featuredContainer = document.getElementById('featuredProperties');
            const compraContainer = document.getElementById('compraProperties');
            const arriendoContainer = document.getElementById('arriendoProperties');

            if (featuredContainer) {
                console.log('📋 Cargando propiedades destacadas...');
                await window.propertyLoader.renderProperties('featuredProperties', null, 6);
            }
            
            if (compraContainer) {
                console.log('🏠 Cargando propiedades en venta...');
                await window.propertyLoader.renderProperties('compraProperties', 'compra');
            }
            
            if (arriendoContainer) {
                console.log('🏘️ Cargando propiedades en arriendo...');
                await window.propertyLoader.renderProperties('arriendoProperties', 'arriendo');
            }

            // Mostrar estadísticas en consola
            const stats = window.propertyLoader.getStats();
            console.log('📊 Estadísticas de propiedades:', stats);
            
        } catch (error) {
            console.error('❌ Error inicializando Property Loader:', error);
        }
    }, 1000);
}

console.log('✅ Property Loader cargado correctamente - Casa Nuvera (Estructura Inglés)');
