// property-loader.js - Sistema completo de carga de propiedades para Casa Nuvera con efectos hover premium

class PropertyLoader {
    constructor() {
        this.properties = [];
        this.isLoading = false;
    }

    // Cargar propiedades desde Supabase con nombres de columnas correctos
    async loadProperties() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            console.log('🔄 Cargando propiedades desde Supabase...');
            
            if (!window.supabase) {
                throw new Error('Supabase no está disponible');
            }
            
            // Query con nombres de columnas en español (ajustado a tu estructura real)
            const { data, error } = await window.supabase
                .from('propiedades')  // Tabla en español
                .select(`
                    *,
                    imagenes_propiedades (
                        url_imagen,
                        orden_imagen,
                        es_principal
                    )
                `)
                .eq('activa', true)  // activa en lugar de published
                .order('destacada', { ascending: false })
                .order('fecha_creacion', { ascending: false });

            if (error) {
                console.warn('❌ Error con nombres en español, intentando nombres en inglés...', error);
                
                // Fallback: intentar con nombres en inglés
                const { data: dataEn, error: errorEn } = await window.supabase
                    .from('properties')
                    .select(`
                        *,
                        property_images (
                            image_url,
                            image_order,
                            is_main
                        )
                    `)
                    .eq('published', true)
                    .order('featured', { ascending: false })
                    .order('created_at', { ascending: false });

                if (errorEn) {
                    throw errorEn;
                }

                this.properties = this.normalizeProperties(dataEn || [], 'english');
            } else {
                this.properties = this.normalizeProperties(data || [], 'spanish');
            }

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

    // Normalizar propiedades para usar nombres consistentes
    normalizeProperties(properties, sourceLanguage) {
        return properties.map(property => {
            if (sourceLanguage === 'spanish') {
                // Convertir nombres en español a inglés para consistencia interna
                return {
                    id: property.id,
                    title: property.titulo || property.title,
                    description: property.descripcion || property.description,
                    address: property.direccion || property.address,
                    commune: property.comuna || property.commune,
                    region: property.region || property.region,
                    neighborhood: property.barrio || property.neighborhood,
                    price: property.precio || property.price,
                    currency: property.moneda || property.currency,
                    property_type: property.tipo_operacion || property.property_type,
                    category: property.categoria || property.category,
                    bedrooms: property.dormitorios || property.bedrooms,
                    bathrooms: property.banos || property.bathrooms,
                    total_area: property.superficie_total || property.total_area,
                    parking_spaces: property.estacionamientos || property.parking_spaces,
                    expenses: property.gastos_comunes || property.expenses,
                    contact_phone: property.telefono_contacto || property.contact_phone,
                    contact_email: property.email_contacto || property.contact_email,
                    featured: property.destacada || property.featured,
                    published: property.activa || property.published,
                    created_at: property.fecha_creacion || property.created_at,
                    main_image: property.imagen_principal || property.main_image,
                    images: property.imagenes || property.images,
                    property_images: (property.imagenes_propiedades || property.property_images || []).map(img => ({
                        image_url: img.url_imagen || img.image_url,
                        image_order: img.orden_imagen || img.image_order,
                        is_main: img.es_principal || img.is_main
                    }))
                };
            } else {
                // Ya está en inglés, solo asegurar que tenga todos los campos
                return {
                    ...property,
                    property_images: (property.property_images || []).map(img => ({
                        image_url: img.image_url,
                        image_order: img.image_order,
                        is_main: img.is_main
                    }))
                };
            }
        });
    }

    // Filtrar propiedades por tipo de operación
    getPropertiesByType(tipo) {
        return this.properties.filter(property => {
            if (tipo === 'compra') {
                return property.property_type === 'venta' || property.property_type === 'compra';
            } else if (tipo === 'arriendo') {
                return property.property_type === 'arriendo' || property.property_type === 'arriendo-temporal';
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

    // Generar HTML para una propiedad con efectos hover premium
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
                case 'venta': 
                case 'compra': return 'property-badge sale';
                case 'arriendo': return 'property-badge rent';
                case 'arriendo-temporal': return 'property-badge temp-rent';
                default: return 'property-badge';
            }
        };

        const getBadgeText = (tipo) => {
            switch(tipo) {
                case 'venta': 
                case 'compra': return 'VENTA';
                case 'arriendo': return 'ARRIENDO';
                case 'arriendo-temporal': return 'ARRIENDO TEMPORAL';
                default: return 'DISPONIBLE';
            }
        };

        // Buscar imagen principal
        const imageUrl = this.getPropertyMainImage(property);

        // Generar características para el hover
        const features = [];
        if (property.bedrooms !== null && property.bedrooms !== undefined) {
            features.push(`${property.bedrooms === 0 ? 'Studio' : property.bedrooms + ' dormitorios'}`);
        }
        if (property.bathrooms) features.push(`${property.bathrooms} baños`);
        if (property.total_area) features.push(`${property.total_area}m²`);
        if (property.parking_spaces > 0) features.push(`${property.parking_spaces} estacionamientos`);

        // Información de contacto para el hover
        const contactInfo = property.contact_phone || property.contact_email || 'Contactar para más información';

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
                    
                    <!-- Información adicional que aparece en hover -->
                    <div class="property-hover-info">
                        <h4>${property.title}</h4>
                        <div class="hover-price">${formatPrice(property.price, property.currency)}</div>
                        <p>📍 ${property.address}, ${property.commune}</p>
                        <div class="hover-features">${features.join(' • ')}</div>
                        ${property.expenses ? 
                            `<p>💰 Gastos comunes: $${new Intl.NumberFormat('es-CL').format(property.expenses)}</p>` : 
                            ''
                        }
                        <div class="hover-contact">📞 ${contactInfo}</div>
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
        
        // Si guardas imágenes en un array JSON
        if (property.images && Array.isArray(property.images) && property.images.length > 0) {
            return property.images[0];
        }
        
        return null;
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
        
        // Configurar eventos hover después de renderizar
        this.setupHoverEvents(container);
    }

    // Configurar eventos hover para efectos premium
    setupHoverEvents(container) {
        const propertyCards = container.querySelectorAll('.property-card');
        
        propertyCards.forEach(card => {
            const hoverInfo = card.querySelector('.property-hover-info');
            
            if (hoverInfo) {
                // Agregar delay para evitar activación accidental
                let hoverTimeout;
                
                card.addEventListener('mouseenter', () => {
                    hoverTimeout = setTimeout(() => {
                        hoverInfo.style.opacity = '1';
                        hoverInfo.style.pointerEvents = 'all';
                    }, 300); // 300ms de delay
                });
                
                card.addEventListener('mouseleave', () => {
                    clearTimeout(hoverTimeout);
                    hoverInfo.style.opacity = '0';
                    hoverInfo.style.pointerEvents = 'none';
                });
            }
        });
    }

    // Función para búsqueda de propiedades
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

        // Filtros adicionales
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
        const containers = ['featuredProperties', 'compraProperties', 'arriendoProperties', 'propertiesGrid'];
        
        for (const containerId of containers) {
            const container = document.getElementById(containerId);
            if (container) {
                if (containerId === 'featuredProperties') {
                    await this.renderProperties(containerId, null, 6);
                } else if (containerId === 'compraProperties') {
                    await this.renderProperties(containerId, 'compra');
                } else if (containerId === 'arriendoProperties') {
                    await this.renderProperties(containerId, 'arriendo');
                } else if (containerId === 'propertiesGrid') {
                    // Renderizar todas las propiedades si es una página de listado
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
            ventas: this.properties.filter(p => p.property_type === 'venta' || p.property_type === 'compra').length,
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

// Funciones globales para interactuar con propiedades
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
    console.log('🏠 Inicializando Property Loader con efectos hover premium...');
    
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
            const propertiesGrid = document.getElementById('propertiesGrid');

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
    }, 1000);
}

console.log('✅ Property Loader con efectos hover premium cargado correctamente - Casa Nuvera');
