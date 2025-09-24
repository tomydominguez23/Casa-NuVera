// Property Detail Dynamic Loader - Compatible con property-detail.html actual
class PropertyDetailDynamic {
    constructor() {
        this.property = null;
        this.propertyImages = [];
        this.propertyTours = [];
        this.init();
    }

    async init() {
        try {
            console.log('🏠 Inicializando PropertyDetailDynamic...');
            
            // Esperar a que Supabase esté disponible
            if (!window.supabase) {
                console.error('❌ Supabase no está disponible');
                throw new Error('Error de conexión con la base de datos');
            }

            // Obtener ID de la propiedad desde URL
            const propertyId = this.getPropertyIdFromURL();
            if (!propertyId) {
                console.warn('⚠️ No se encontró ID de propiedad en la URL, usando datos por defecto');
                return;
            }

            console.log('🔍 Cargando propiedad con ID:', propertyId);
            
            // Cargar datos de la propiedad
            await this.loadProperty(propertyId);
            await this.loadPropertyImages(propertyId);
            await this.loadPropertyTours(propertyId);

            // Actualizar la página con los datos reales
            this.updatePropertyData();
            
        } catch (error) {
            console.error('💥 Error al inicializar PropertyDetailDynamic:', error);
            // No mostrar error al usuario, mantener datos por defecto
        }
    }

    getPropertyIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        console.log('🔗 ID desde URL:', id);
        return id;
    }

    async loadProperty(propertyId) {
        try {
            console.log('📥 Cargando datos de la propiedad...');
            
            const { data, error } = await window.supabase
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
                    availability,
                    contact_name,
                    contact_phone,
                    contact_email,
                    features,
                    featured,
                    published,
                    google_maps_url,
                    created_at
                `)
                .eq('id', propertyId)
                .eq('published', true)
                .single();

            if (error) {
                console.error('❌ Error al cargar propiedad:', error);
                return;
            }

            if (!data) {
                console.warn('⚠️ Propiedad no encontrada');
                return;
            }

            this.property = data;
            console.log('✅ Propiedad cargada:', this.property.title);
            
        } catch (error) {
            console.error('💥 Error en loadProperty:', error);
        }
    }

    async loadPropertyImages(propertyId) {
        try {
            console.log('🖼️ Cargando imágenes de la propiedad...');
            
            const { data, error } = await window.supabase
                .from('property_images')
                .select('image_url, image_order, is_main')
                .eq('property_id', propertyId)
                .order('image_order', { ascending: true });

            if (error) {
                console.error('⚠️ Error al cargar imágenes:', error);
                this.propertyImages = [];
                return;
            }

            this.propertyImages = data || [];
            console.log(`✅ ${this.propertyImages.length} imágenes cargadas`);
            
        } catch (error) {
            console.error('💥 Error en loadPropertyImages:', error);
            this.propertyImages = [];
        }
    }

    async loadPropertyTours(propertyId) {
        try {
            console.log('🌐 Cargando tours 360° de la propiedad...');
            
            const { data, error } = await window.supabase
                .from('property_tours')
                .select('id, tour_title, tour_name, tour_url, order_index, tour_order, is_active')
                .eq('property_id', propertyId)
                .or('is_active.is.null,is_active.eq.true');

            if (error) {
                console.error('⚠️ Error al cargar tours:', error);
                this.propertyTours = [];
                return;
            }

            const tours = (data || []).filter(t => t && t.tour_url);
            tours.sort((a, b) => {
                const aOrder = (typeof a.order_index === 'number' ? a.order_index : (typeof a.tour_order === 'number' ? a.tour_order : 9999));
                const bOrder = (typeof b.order_index === 'number' ? b.order_index : (typeof b.tour_order === 'number' ? b.tour_order : 9999));
                return aOrder - bOrder;
            });

            this.propertyTours = tours;
            console.log(`✅ ${this.propertyTours.length} tours 360° cargados`);
            
        } catch (error) {
            console.error('💥 Error en loadPropertyTours:', error);
            this.propertyTours = [];
        }
    }

    updatePropertyData() {
        if (!this.property) {
            console.log('ℹ️ No hay datos de propiedad para actualizar');
            return;
        }

        console.log('🔄 Actualizando datos de la propiedad en la página...');

        // Actualizar título de la página
        document.title = `${this.property.title} | Casa Nuvera`;

        // Actualizar título de la propiedad
        const titleElement = document.getElementById('propertyTitle');
        if (titleElement) {
            titleElement.textContent = this.property.title;
        }

        // Actualizar badge de tipo de propiedad
        const badgeElement = document.querySelector('.property-badge');
        if (badgeElement) {
            const typeText = this.property.property_type === 'arriendo' ? 'En Arriendo' : 'En Venta';
            badgeElement.textContent = `${this.property.category || 'Propiedad'} ${typeText}`;
        }

        // Actualizar ubicación
        const locationElement = document.querySelector('.property-location span');
        if (locationElement) {
            const location = this.formatLocation(this.property);
            locationElement.textContent = location;
        }

        // Actualizar características
        this.updatePropertyFeatures();

        // Actualizar descripción
        this.updatePropertyDescription();

        // Actualizar galería de imágenes
        this.updatePropertyGallery();

        // Actualizar tours 360°
        this.updatePropertyTours();

        // Actualizar Google Maps
        this.updateGoogleMaps();

        // Actualizar información de contacto
        this.updateContactInfo();

        // Actualizar precio en sidebar
        this.updatePriceInfo();

        // Actualizar características del sidebar
        this.updateSidebarFeatures();

        console.log('✅ Datos de la propiedad actualizados correctamente');
    }

    updatePropertyFeatures() {
        const featuresContainer = document.getElementById('propertyFeatures');
        if (!featuresContainer || !this.property) return;

        const area = this.property.total_area || this.property.built_area || 0;
        const bedrooms = this.property.bedrooms || 0;
        const bathrooms = this.property.bathrooms || 0;

        featuresContainer.innerHTML = `
            <div class="feature-item">
                <span class="feature-icon">📐</span>
                <span>${area}m² totales</span>
            </div>
            <div class="feature-item">
                <span class="feature-icon">🛏️</span>
                <span>${bedrooms} dormitorio${bedrooms !== 1 ? 's' : ''}</span>
            </div>
            <div class="feature-item">
                <span class="feature-icon">🚿</span>
                <span>${bathrooms} baño${bathrooms !== 1 ? 's' : ''}</span>
            </div>
        `;
    }

    updatePropertyDescription() {
        const descriptionElement = document.getElementById('propertyDescription');
        if (!descriptionElement || !this.property) return;

        const description = this.property.description || 'No hay descripción disponible para esta propiedad.';
        descriptionElement.innerHTML = `<p>${description}</p>`;
    }

    updatePropertyGallery() {
        if (this.propertyImages.length === 0) return;

        // Actualizar imagen principal
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
            const firstImage = this.propertyImages.find(img => img.is_main) || this.propertyImages[0];
            mainImage.src = firstImage.image_url;
            mainImage.alt = this.property.title;
            // Reiniciar índice de la galería principal
            if (typeof window.currentImageIndex !== 'undefined') {
                window.currentImageIndex = 0;
            }
        }

        // Actualizar contador de fotos
        const photoCountElement = document.getElementById('photoCount');
        if (photoCountElement) {
            photoCountElement.textContent = this.propertyImages.length;
        }

        // Actualizar array de imágenes para el modal
        if (window.propertyImages) {
            window.propertyImages.length = 0;
            window.propertyImages.push(...this.propertyImages.map(img => img.image_url));
        }
    }

    updatePropertyTours() {
        const tourBtn = document.getElementById('sidebarTourBtn');
        const tourSelect = document.getElementById('tourSelect');
        const stickyTourBtn = document.getElementById('stickyTourBtn');

        if (!tourBtn || !tourSelect) return;

        // Por defecto, ocultar todo
        tourBtn.style.display = 'none';
        tourSelect.style.display = 'none';
        if (stickyTourBtn) stickyTourBtn.style.display = 'none';

        // Sin tours: no mostrar nada
        if (!this.propertyTours || this.propertyTours.length === 0) {
            return;
        }

        // Con tours: mostrar botón y opcionalmente selector
        const tours = this.propertyTours.filter(t => t && t.tour_url);
        if (tours.length === 0) return;

        // Rellenar selector si hay más de uno
        if (tours.length > 1) {
            tourSelect.innerHTML = tours.map((t, i) => `
                <option value="${t.tour_url}">${t.tour_title || t.tour_name || `Tour ${i + 1}`}</option>
            `).join('');
            tourSelect.style.display = '';
        } else {
            tourSelect.innerHTML = '';
            tourSelect.style.display = 'none';
        }

        // Configurar botón para abrir el tour seleccionado (o el único)
        tourBtn.onclick = () => {
            const url = tourSelect && tourSelect.style.display !== 'none' && tourSelect.value
                ? tourSelect.value
                : tours[0].tour_url;
            this.openTour(url);
        };
        tourBtn.style.display = '';

        // Botón sticky en móvil
        if (stickyTourBtn) {
            stickyTourBtn.onclick = (e) => { e.preventDefault(); tourBtn.click(); };
            stickyTourBtn.style.display = '';
        }
    }

    updateGoogleMaps() {
        if (!this.property || !this.property.google_maps_url) {
            console.log('ℹ️ No hay URL de Google Maps para mostrar');
            return;
        }

        console.log('🗺️ Mostrando Google Maps:', this.property.google_maps_url);
        
        const mapSection = document.getElementById('propertyMapSection');
        const mapContainer = document.getElementById('propertyMapContainer');
        
        if (!mapSection || !mapContainer) {
            console.log('⚠️ Elementos de mapa no encontrados');
            return;
        }
        
        // Convertir URL a formato embed si es necesario
        const embedUrl = this.convertToEmbedUrl(this.property.google_maps_url);
        
        if (embedUrl) {
            mapContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
            mapSection.style.display = 'block';
            console.log('✅ Mapa mostrado correctamente');
        } else {
            console.log('⚠️ No se pudo convertir la URL del mapa');
        }
    }

    convertToEmbedUrl(url) {
        try {
            // Si ya es una URL de embed, devolverla tal como está
            if (url.includes('embed')) {
                return url;
            }

            // Convertir URL de Google Maps a embed
            if (url.includes('maps.google.com') || url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl')) {
                // Para URLs de compartir, usar directamente
                if (url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl')) {
                    return url; // Usar la URL original
                }
                
                // Si es una URL completa de Google Maps
                if (url.includes('maps.google.com')) {
                    // Convertir a formato embed básico
                    if (url.includes('@')) {
                        // URL con coordenadas
                        const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                        if (coordsMatch) {
                            const lat = coordsMatch[1];
                            const lng = coordsMatch[2];
                            return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.2!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM${lat}%2C${lng}!5e0!3m2!1ses!2scl!4v1234567890123!5m2!1ses!2scl`;
                        }
                    }
                }
                
                return url; // Fallback a la URL original
            }
            
            return null;
        } catch (error) {
            console.error('Error convirtiendo URL de mapa:', error);
            return null;
        }
    }

    updateContactInfo() {
        if (!this.property) return;

        // Actualizar información de contacto en sidebar
        const contactItems = document.querySelectorAll('.contact-item');
        if (contactItems.length >= 3) {
            // Teléfono
            const phoneItem = contactItems[0];
            const phoneLink = phoneItem.querySelector('a');
            if (phoneLink && this.property.contact_phone) {
                phoneLink.href = `tel:${this.property.contact_phone}`;
                phoneLink.textContent = this.property.contact_phone;
            }

            // Email
            const emailItem = contactItems[1];
            const emailLink = emailItem.querySelector('a');
            if (emailLink && this.property.contact_email) {
                emailLink.href = `mailto:${this.property.contact_email}`;
                emailLink.textContent = this.property.contact_email;
            }

            // Nombre del agente
            const agentItem = contactItems[2];
            if (agentItem && this.property.contact_name) {
                agentItem.querySelector('span').textContent = this.property.contact_name;
            }
        }
    }

    updatePriceInfo() {
        if (!this.property) return;

        // Actualizar tipo de propiedad en sidebar
        const typeElement = document.querySelector('.property-type');
        if (typeElement) {
            const typeText = this.property.property_type === 'arriendo' ? 'En Arriendo' : 'En Venta';
            typeElement.textContent = `${this.property.category || 'Propiedad'} ${typeText}`;
        }

        // Actualizar precio en sidebar
        const priceElement = document.querySelector('.property-price');
        if (priceElement) {
            const formattedPrice = this.formatPrice(this.property.price, this.property.currency);
            priceElement.textContent = formattedPrice;
        }

        // Actualizar subtítulo de precio
        const priceSubtitle = document.querySelector('.price-subtitle');
        if (priceSubtitle) {
            if (this.property.currency === 'UF') {
                const clpPrice = this.property.price * 40000; // Aproximación UF a CLP
                priceSubtitle.textContent = `$${clpPrice.toLocaleString('es-CL')}`;
            } else if (this.property.currency === 'USD') {
                const clpPrice = this.property.price * 900; // Aproximación USD a CLP
                priceSubtitle.textContent = `$${clpPrice.toLocaleString('es-CL')}`;
            } else {
                priceSubtitle.textContent = ''; // No mostrar subtítulo para CLP
            }
        }
    }

    updateSidebarFeatures() {
        if (!this.property) return;

        // Actualizar características del sidebar
        const sidebarFeatures = document.querySelector('.sidebar-features');
        if (!sidebarFeatures) return;

        const area = this.property.total_area || this.property.built_area || 0;
        const bedrooms = this.property.bedrooms || 0;
        const bathrooms = this.property.bathrooms || 0;

        sidebarFeatures.innerHTML = `
            <div class="sidebar-feature">
                <span class="sidebar-feature-label">Superficie total</span>
                <span class="sidebar-feature-value">${area} m²</span>
            </div>
            <div class="sidebar-feature">
                <span class="sidebar-feature-label">Dormitorios</span>
                <span class="sidebar-feature-value">${bedrooms}</span>
            </div>
            <div class="sidebar-feature">
                <span class="sidebar-feature-label">Baños</span>
                <span class="sidebar-feature-value">${bathrooms}</span>
            </div>
        `;

        console.log('✅ Características del sidebar actualizadas');
    }

    openTour(tourUrl) {
        if (!tourUrl) {
            alert('URL del tour no disponible');
            return;
        }

        console.log('🌐 Abriendo tour:', tourUrl);

        // Usar la función existente openTour360 pero con la URL real
        const modal = document.getElementById('tourModal');
        const iframe = document.getElementById('tourIframe');

        if (modal && iframe) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            iframe.src = tourUrl;
        } else {
            // Fallback: abrir en nueva ventana
            window.open(tourUrl, '_blank');
        }
    }

    formatLocation(property) {
        const parts = [];
        
        if (property.neighborhood) parts.push(property.neighborhood);
        if (property.commune) parts.push(property.commune);
        if (property.region && parts.length < 2) parts.push(property.region);
        
        return parts.length > 0 ? parts.join(', ') : (property.address || 'Ubicación no especificada');
    }

    formatPrice(price, currency = 'CLP') {
        if (!price) return 'Precio a consultar';
        
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return 'Precio a consultar';
        
        switch (currency) {
            case 'UF':
                return `${numPrice.toLocaleString('es-CL')} UF`;
            case 'USD':
                return `US$${numPrice.toLocaleString('en-US')}`;
            case 'CLP':
            default:
                return `$${numPrice.toLocaleString('es-CL')}`;
        }
    }
}

// Inicialización global
let propertyDetailDynamic;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Iniciando PropertyDetailDynamic...');
    
    propertyDetailDynamic = new PropertyDetailDynamic();
});

// Hacer disponible globalmente
window.propertyDetailDynamic = propertyDetailDynamic;