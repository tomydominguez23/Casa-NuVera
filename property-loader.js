// property-loader.js - Sistema con scroll horizontal adaptado a tu estructura de BD

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
                title: "Casa Prueba 1",
                description: "casa hermosa en venta en las condes",
                property_type: "venta",
                category: "casa",
                bedrooms: 3,
                bathrooms: 2,
                region: "Región Metropolitana",
                price: 18000,
                currency: "UF",
                featured: true,
                published: true,
                created_at: new Date().toISOString(),
                image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center"
            },
            {
                id: 2,
                title: "Casa Moderna Las Condes",
                description: "Increíble casa en las condes",
                property_type: "venta",
                category: "casa",
                bedrooms: 2,
                bathrooms: 1,
                region: "Región Metropolitana",
                price: 15000,
                currency: "UF",
                featured: true,
                published: true,
                created_at: new Date().toISOString(),
                image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center"
            },
            {
                id: 3,
                title: "Casa Moderna Las Condes",
                description: "Casa Prueba En San Carlos",
                property_type: "venta",
                category: "casa",
                bedrooms: 2,
                bathrooms: 2,
                region: "Región Metropolitana",
                price: 15000,
                currency: "UF",
                featured: true,
                published: true,
                created_at: new Date().toISOString(),
                image_url: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&h=600&fit=crop&crop=center"
            },
            {
                id: 4,
                title: "Casa Prueba 1",
                description: "casa",
                property_type: "arriendo",
                category: "casa",
                bedrooms: 2,
                bathrooms: 3,
                region: "Región Metropolitana",
                price: 2000,
                currency: "UF",
                featured: true,
                published: true,
                created_at: new Date().toISOString(),
                image_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&crop=center"
            },
            {
                id: 5,
                title: "Casa Moderna Las Condes",
                description: "casa 3",
                property_type: "arriendo",
                category: "casa",
                bedrooms: 3,
                bathrooms: 3,
                region: "Región Metropolitana",
                price: 1800,
                currency: "UF",
                featured: true,
                published: true,
                created_at: new Date().toISOString(),
                image_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center"
            }
        ];
    }

    // Cargar propiedades desde Supabase
    async loadProperties() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            console.log('🔄 Cargando propiedades desde Supabase...');
            
            // Esperar hasta que Supabase esté disponible
            if (!window.supabaseClient) {
                console.log('⏳ Esperando conexión Supabase...');
                
                // Usar datos de ejemplo temporalmente
                this.properties = this.getFallbackProperties();
                this.filteredProperties = [...this.properties];
                this.useFallbackData = true;
                
                return {
                    success: true,
                    data: this.properties,
                    fallback: true
                };
            }
            
            // Intentar cargar desde la base de datos con tu estructura
            const { data, error } = await window.supabaseClient
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error cargando desde BD:', error);
                throw error;
            }

            if (data && data.length > 0) {
                console.log('✅ Datos cargados desde BD:', data.length);
                console.log('📋 Estructura detectada:', data[0]);
                
                this.properties = data.map(property => ({
                    // Mapear tu estructura actual
                    id: property.id,
                    title: property.title || 'Propiedad sin título',
                    description: property.description || '',
                    property_type: property.property_type || 'venta',
                    category: property.category || 'casa',
                    bedrooms: property.bedrooms || 0,
                    bathrooms: property.bathrooms || 0,
                    region: property.region || 'Región Metropolitana',
                    price: this.extractPrice(property),
                    currency: 'UF', // Asumir UF por defecto
                    featured: true, // Marcar todas como destacadas por ahora
                    published: true,
                    created_at: property.created_at || new Date().toISOString(),
                    image_url: property.image_url || this.getRandomImage()
                }));
                
                this.useFallbackData = false;
            } else {
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
            
            // Usar datos de ejemplo como fallback
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

    // Extraer precio de los diferentes campos posibles
    extractPrice(property) {
        // Intentar varios campos de precio que vi en tu BD
        if (property.price) return property.price;
        if (property.precio) return property.precio;
        if (property.valor) return property.valor;
        
        // Si no hay precio, generar uno de ejemplo
        return Math.floor(Math.random() * 20000) + 10000;
    }

    // Obtener imagen aleatoria de placeholder
    getRandomImage() {
        const images = [
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center'
        ];
        
        return images[Math.floor(Math.random() * images.length)];
    }

    // Obtener propiedades destacadas
    getFeaturedProperties(limit = 5) {
        return this.filteredProperties
            .filter(p => p.featured)
            .slice(0, limit);
    }

    // Generar HTML con scroll horizontal como en la imagen
    generatePropertyHTML(property) {
        const formatPrice = (precio, moneda) => {
            if (!precio) return 'Precio a consultar';
            
            const formatted = new Intl.NumberFormat('es-CL').format(precio);
            switch(moneda) {
                case 'CLP': return `$ ${formatted}`;
                case 'UF': return `UF ${formatted}`;
                case 'USD': return `US$ ${formatted}`;
                default: return `UF ${formatted}`;
            }
        };

        const imageUrl = property.image_url || this.getRandomImage();
        const bedBathInfo = [];
        
        if (property.bedrooms > 0) bedBathInfo.push(`${property.bedrooms} dorm`);
        if (property.bathrooms > 0) bedBathInfo.push(`${property.bathrooms} baños`);
        
        const details = bedBathInfo.length > 0 ? bedBathInfo.join(' • ') : '';

        return `
            <div class="portal-property-card" data-id="${property.id}" onclick="window.goToProperty(${property.id})">
                <div class="portal-property-image">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${property.title}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=\\'no-image-placeholder\\'>Sin imagen</div>'">` : 
                        `<div class="no-image-placeholder">Sin imagen</div>`
                    }
                </div>
                
                <div class="portal-property-content">
                    <div class="portal-property-price">${formatPrice(property.price, property.currency)}</div>
                    <div class="portal-property-title">${property.title}</div>
                    <div class="portal-property-subtitle">${property.description}</div>
                    ${details ? `<div class="portal-property-details" style="font-size: 0.8rem; color: #666; margin: 0.2rem 0;">${details}</div>` : ''}
                    <div class="portal-property-location">📍 ${property.region}</div>
                </div>
            </div>
        `;
    }

    // Aplicar filtros de búsqueda
    applySearchFilters(filters) {
        this.currentFilters = filters;
        
        this.filteredProperties = this.properties.filter(property => {
            // Filtro por tipo de operación
            if (filters.operation && filters.operation !== '') {
                if (property.property_type !== filters.operation.toLowerCase()) {
                    return false;
                }
            }
            
            // Filtro por tipo de propiedad
            if (filters.type && filters.type !== '') {
                if (property.category && !property.category.toLowerCase().includes(filters.type.toLowerCase())) {
                    return false;
                }
            }
            
            // Filtro por ubicación
            if (filters.location && filters.location !== '') {
                const searchLocation = filters.location.toLowerCase();
                const propertyRegion = (property.region || '').toLowerCase();
                const propertyDescription = (property.description || '').toLowerCase();
                const propertyTitle = (property.title || '').toLowerCase();
                
                if (!propertyRegion.includes(searchLocation) && 
                    !propertyDescription.includes(searchLocation) &&
                    !propertyTitle.includes(searchLocation)) {
                    return false;
                }
            }
            
            return true;
        });

        console.log(`🔍 Filtros aplicados: ${this.filteredProperties.length} de ${this.properties.length} propiedades`);
        
        // Re-renderizar propiedades filtradas
        this.renderProperties('featuredProperties', null, 5, false);
    }

    // Renderizar propiedades con scroll horizontal
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
                <p>Cargando propiedades destacadas...</p>
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

        // Generar HTML con scroll horizontal
        let html = '';

        // Renderizar propiedades
        if (propertiesToShow.length === 0) {
            html += `
                <div class="no-properties-container" style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.8);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🏠</div>
                    <h3 style="color: white; margin-bottom: 1rem;">No se encontraron propiedades</h3>
                    <p>Intenta ajustar los filtros de búsqueda.</p>
                </div>
            `;
        } else {
            html += `
                <div class="properties-scroll-container">
                    <div class="portal-properties-horizontal">
                        ${propertiesToShow.map(property => this.generatePropertyHTML(property)).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;

        console.log(`✅ ${propertiesToShow.length} propiedades renderizadas en ${containerId}`);
        
        // Log de debug para ver qué propiedades se están mostrando
        if (this.useFallbackData) {
            console.log('ℹ️ Usando datos de ejemplo - La BD no está disponible o vacía');
        } else {
            console.log('ℹ️ Datos cargados desde Supabase');
        }
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

// FUNCIONES GLOBALES CORREGIDAS
window.goToProperty = function(propertyId) {
    try {
        console.log('🔗 Navegando a propiedad:', propertyId);
        // Navegar a la página de detalle
        window.location.href = `propiedad.html?id=${propertyId}`;
    } catch (error) {
        console.error('❌ Error navegando a propiedad:', error);
        alert('Error al abrir la propiedad. Por favor, intenta nuevamente.');
    }
};

window.contactProperty = function(propertyId) {
    try {
        // Buscar la propiedad
        let property = null;
        if (window.propertyLoader && window.propertyLoader.properties) {
            property = window.propertyLoader.properties.find(p => p.id == propertyId);
        }
        
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
                default: return `UF ${formatted}`;
            }
        };

        const message = `Hola! Estoy interesado/a en la propiedad "${property.title}".\n\n💰 Precio: ${formatPrice(property.price, property.currency)}\n🏠 ${property.bedrooms} dormitorios, ${property.bathrooms} baños\n📍 ${property.region}\n\n¿Podrías darme más información?`;

        const phoneNumber = '+56912345678'; // Número por defecto
        const whatsappURL = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        
        console.log('📱 Abriendo WhatsApp para propiedad:', property.title);
        window.open(whatsappURL, '_blank');
    } catch (error) {
        console.error('❌ Error contactando propiedad:', error);
        alert('Error al contactar. Por favor, intenta nuevamente.');
    }
};

// Crear instancia global
window.propertyLoader = new PropertyLoader();

// Auto-inicializar cuando Supabase esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Property Loader iniciando...');
    
    // Función para inicializar cuando Supabase esté listo
    const initializeWhenReady = async () => {
        try {
            // Esperar un poco para que Supabase se inicialice
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const featuredContainer = document.getElementById('featuredProperties');
            if (featuredContainer) {
                console.log('📋 Cargando propiedades destacadas...');
                await window.propertyLoader.renderProperties('featuredProperties', null, 5, false);
            }
            
        } catch (error) {
            console.error('❌ Error inicializando:', error);
        }
    };

    // Escuchar el evento de Supabase listo
    if (window.addEventListener) {
        window.addEventListener('supabaseReady', initializeWhenReady);
    }
    
    // También inicializar con timeout como backup
    setTimeout(initializeWhenReady, 3000);
});

console.log('✅ Property Loader con estructura BD real cargado - Casa Nuvera');