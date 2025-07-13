// property-loader.js - Sistema simplificado de carga de propiedades para Casa Nuvera

class PropertyLoader {
    constructor() {
        this.properties = [];
        this.isLoading = false;
    }

    // Cargar propiedades desde Supabase SIN JOINs complejos
    async loadProperties() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            console.log('🔄 Cargando propiedades desde Supabase...');
            
            if (!window.supabase) {
                throw new Error('Supabase no está disponible');
            }
            
            // Primero intentar cargar propiedades SIN JOIN
            let { data, error } = await window.supabase
                .from('properties')
                .select('*')
                .eq('published', true)
                .order('featured', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('❌ Error con tabla "properties", intentando "propiedades"...', error);
                
                // Fallback: intentar con tabla en español
                const { data: dataEs, error: errorEs } = await window.supabase
                    .from('propiedades')
                    .select('*')
                    .eq('activa', true)
                    .order('destacada', { ascending: false })
                    .order('fecha_creacion', { ascending: false });

                if (errorEs) {
                    throw new Error(`Error en ambas tablas: ${error.message} | ${errorEs.message}`);
                }

                data = dataEs;
                this.properties = this.normalizeProperties(data || [], 'spanish');
            } else {
                this.properties = this.normalizeProperties(data || [], 'english');
            }

            // Cargar imágenes por separado para cada propiedad
            await this.loadPropertyImages();

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

    // Cargar imágenes por separado para evitar problemas de JOIN
    async loadPropertyImages() {
        for (let property of this.properties) {
            try {
                // Intentar cargar imágenes en inglés
                let { data: images, error } = await window.supabase
                    .from('property_images')
                    .select('*')
                    .eq('property_id', property.id)
                    .order('image_order', { ascending: true });

                if (error) {
                    // Intentar en español
                    const { data: imagesEs, error: errorEs } = await window.supabase
                        .from('imagenes_propiedades')
                        .select('*')
                        .eq('propiedad_id', property.id)
                        .order('orden_imagen', { ascending: true });

                    if (!errorEs && imagesEs) {
                        images = imagesEs.map(img => ({
                            image_url: img.url_imagen,
                            image_order: img.orden_imagen,
                            is_main: img.es_principal
                        }));
                    }
                }

                property.property_images = images || [];
                
            } catch (imgError) {
                console.warn(`⚠️ Error cargando imágenes para propiedad ${property.id}:`, imgError);
                property.property_images = [];
            }
        }
    }

    // Normalizar propiedades para usar nombres consistentes
    normalizeProperties(properties, sourceLanguage) {
        return properties.map(property => {
            if (sourceLanguage === 'spanish') {
                // Convertir nombres en español a inglés para consistencia interna
                return {
                    id: property.id,
                    title: property.titulo || property.title || 'Propiedad sin título',
                    description: property.descripcion || property.description || '',
                    address: property.direccion || property.address || 'Dirección no disponible',
                    commune: property.comuna || property.commune || 'Comuna no especificada',
                    region: property.region || property.region || 'Santiago',
                    neighborhood: property.barrio || property.neighborhood || '',
                    price: property.precio || property.price || 0,
                    currency: property.moneda || property.currency || 'CLP',
                    property_type: property.tipo_operacion || property.property_type || 'venta',
                    category: property.categoria || property.category || 'Casa',
                    bedrooms: property.dormitorios || property.bedrooms || 0,
                    bathrooms: property.banos || property.bathrooms || 0,
                    total_area: property.superficie_total || property.total_area || 0,
                    parking_spaces: property.estacionamientos || property.parking_spaces || 0,
                    expenses: property.gastos_comunes || property.expenses || 0,
                    contact_phone: property.telefono_contacto || property.contact_phone || '+56912345678',
                    contact_email: property.email_contacto || property.contact_email || 'contacto@casanuvera.cl',
                    featured: property.destacada || property.featured || false,
                    published: property.activa || property.published || true,
                    created_at: property.fecha_creacion || property.created_at || new Date().toISOString(),
                    main_image: property.imagen_principal || property.main_image || null,
                    property_images: []
                };
            } else {
                // Ya está en inglés, solo asegurar que tenga todos los campos
                return {
                    id: property.id,
                    title: property.title || 'Property without title',
                    description: property.description || '',
                    address: property.address || 'Address not available',
                    commune: property.commune || 'Commune not specified',
                    region: property.region || 'Santiago',
                    neighborhood: property.neighborhood || '',
                    price: property.price || 0,
                    currency: property.currency || 'CLP',
                    property_type: property.property_type || 'sale',
                    category: property.category || 'House',
                    bedrooms: property.bedrooms || 0,
                    bathrooms: property.bathrooms || 0,
                    total_area: property.total_area || 0,
                    parking_spaces: property.parking_spaces || 0,
                    expenses: property.expenses || 0,
                    contact_phone: property.contact_phone || '+56912345678',
                    contact_email: property.contact_email || 'contacto@casanuvera.cl',
                    featured: property.featured || false,
                    published: property.published || true,
                    created_at: property.created_at || new Date().toISOString(),
                    main_image: property.main_image || null,
                    property_images: []
                };
            }
        });
    }

    // Filtrar propiedades por tipo de operación
    getPropertiesByType(tipo) {
        return this.properties.filter(property => {
            if (tipo === 'compra') {
                return property.property_type === 'venta' || property.property_type === 'compra' || property.property_type === 'sale';
            } else if (tipo === 'arriendo') {
                return property.property_type === 'arriendo' || property.property_type === 'arriendo-temporal' || property.property_type === 'rent';
            }
            return false;
        });
    }

    // Obtener propiedades destacadas
    getFeaturedProperties(limit = 6) {
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
                case 'arriendo-temporal': return 'ARRIENDO TEMPORAL';
                default: return 'DISPONIBLE';
            }
        };

        // Buscar imagen principal
        const imageUrl = this.getPropertyMainImage(property);

        return `
            <div class="property-card" data-id="${property.id}" onclick="goToProperty(${property.id})">
                <div class="property-image">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${property.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/f0f0f0/666?text=Sin+Imagen'">` : 
                        `<div class="placeholder-image">
                            <div class="placeholder-icon">🏠</div>
                            <div class="placeholder-text">Sin imagen</div>
                        </div>`
                    }
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

    // Función para obtener imagen principal de la propiedad
    getPropertyMainImage(property) {
        // Si tienes imágenes relacionadas de property_images
        if (property.property_images && property.property_images.length > 0) {
            // Buscar imagen principal primero
            const mainImage = property.property_images.find(img => img.is_main);
            if (mainImage && mainImage.image_url) {
                return mainImage.image_url;
            }
            // Si no hay imagen marcada como principal, usar la primera
            return property.property_images[0].image_url;
        }
        
        // Si tienes una columna main_image
        if (property.main_image) {
            return property.main_image;
        }
        
        // Fallback a imagen por defecto de unsplash
        const randomImageId = Math.floor(Math.random() * 1000);
        return `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&crop=center&auto=format&q=80&sig=${randomImageId}`;
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
                            <button onclick="window.location.reload()" class="reconnect-btn">
                                🔌 Recargar Página
                            </button>
                        </div>
                        <p class="error-hint">
                            💡 Si el problema persiste, verifica la configuración de la base de datos.
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
                        <a href="subir-propiedades.html" class="add-property-btn">
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

    // Función para recargar propiedades
    async refreshProperties() {
        console.log('🔄 Refrescando propiedades...');
        this.properties = [];
        await this.loadProperties();
        
        // Re-renderizar todas las secciones activas
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
                } else if (containerId === 'propertiesGrid') {
                    await this.renderProperties(containerId);
                }
            }
        }
        
        console.log('✅ Propiedades refrescadas');
    }

    // Función para obtener estadísticas
    getStats() {
        const stats = {
            total: this.properties.length,
            ventas: this.properties.filter(p => p.property_type === 'venta' || p.property_type === 'compra' || p.property_type === 'sale').length,
            arriendos: this.properties.filter(p => p.property_type === 'arriendo' || p.property_type === 'rent').length,
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

// Función global para navegar a la página individual de propiedad
window.goToProperty = function(propertyId) {
    window.location.href = `propiedad.html?id=${propertyId}`;
};

// Función global para contactar por WhatsApp
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
${property.total_area ? `📐 Superficie: ${property.total_area}m²` : ''}
${property.expenses ? `💸 Gastos comunes: $${property.expenses.toLocaleString()}` : ''}

¿Podrías darme más información?`;

    const phoneNumber = property.contact_phone.replace(/[^0-9]/g, '');
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    console.log('📱 Abriendo WhatsApp para propiedad:', property.title);
    window.open(whatsappURL, '_blank');
};

// Crear instancia global
window.propertyLoader = new PropertyLoader();

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🏠 Inicializando Property Loader...');
    
    // Esperar a que Supabase esté listo
    setTimeout(async () => {
        try {
            const featuredContainer = document.getElementById('featuredProperties');
            const compraContainer = document.getElementById('compraProperties');
            const arriendoContainer = document.getElementById('arriendoProperties');
            const propertiesGrid = document.getElementById('propertiesGrid');

            if (featuredContainer) {
                console.log('📋 Cargando propiedades destacadas...');
                await window.propertyLoader.renderProperties('featuredProperties', null, 3);
            }
            
            if (compraContainer) {
                console.log('🏠 Cargando propiedades en venta...');
                await window.propertyLoader.renderProperties('compraProperties', 'compra');
            }
            
            if (arriendoContainer) {
                console.log('🏘️ Cargando propiedades en arriendo...');
                await window.propertyLoader.renderProperties('arriendoProperties', 'arriendo');
            }

            if (propertiesGrid) {
                console.log('🏘️ Cargando todas las propiedades...');
                await window.propertyLoader.renderProperties('propertiesGrid');
            }

            // Mostrar estadísticas en consola
            const stats = window.propertyLoader.getStats();
            console.log('📊 Estadísticas de propiedades:', stats);
            
        } catch (error) {
            console.error('❌ Error inicializando Property Loader:', error);
        }
    }, 2000);
});

console.log('✅ Property Loader simplificado cargado - Casa Nuvera');