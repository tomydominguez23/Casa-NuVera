// Property Detail Dynamic Loader - Compatible con property-detail.html actual
class PropertyDetailDynamic {
    constructor() {
        this.property = null;
        this.propertyImages = [];
        this.propertyTours = [];
        this.propertyVideos = [];
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
            await this.loadPropertyVideos(propertyId);

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
                .select('id, tour_title, tour_url, order_index, is_active')
                .eq('property_id', propertyId)
                .eq('is_active', true)
                .order('order_index', { ascending: true });

            if (error) {
                console.error('⚠️ Error al cargar tours:', error);
                this.propertyTours = [];
                return;
            }

            this.propertyTours = data || [];
            console.log(`✅ ${this.propertyTours.length} tours 360° cargados`);
            
        } catch (error) {
            console.error('💥 Error en loadPropertyTours:', error);
            this.propertyTours = [];
        }
    }

    async loadPropertyVideos(propertyId) {
        try {
            console.log('🎬 Cargando videos de la propiedad...');
            const { data, error } = await window.supabase
                .from('property_videos')
                .select('video_url, video_title, video_order')
                .eq('property_id', propertyId)
                .order('video_order', { ascending: true });
            if (error) {
                console.error('⚠️ Error al cargar videos:', error);
                this.propertyVideos = [];
                return;
            }
            this.propertyVideos = data || [];
            console.log(`✅ ${this.propertyVideos.length} videos cargados`);
        } catch (error) {
            console.error('💥 Error en loadPropertyVideos:', error);
            this.propertyVideos = [];
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
        this.updatePropertyVideos();
            this.updatePropertyVideos();

        // Actualizar mapa (Google Maps)
        this.updateGoogleMaps();

        // Actualizar información de contacto
        this.updateContactInfo();

        // Actualizar precio en sidebar
        this.updatePriceInfo();

        // Actualizar características del sidebar
        this.updateSidebarFeatures();

        console.log('✅ Datos de la propiedad actualizados correctamente');
        
        // 🎯 OCULTAR PANTALLA DE CARGA CUANDO TODO ESTÉ LISTO
        this.hideLoadingScreen();
    }

    updatePropertyVideos() {
        const container = document.getElementById('propertyVideosSection');
        if (!container) return;
        container.style.display = 'none';

        if (!this.propertyVideos || this.propertyVideos.length === 0) {
            container.innerHTML = '';
            return;
        }

        const items = this.propertyVideos.map((v, idx) => `
            <div class="video-item">
                <div class="video-wrapper">
                    <video controls preload="metadata" src="${v.video_url}"></video>
                </div>
                <div class="video-caption">${v.video_title || `Video ${idx + 1}`}</div>
            </div>
        `).join('');

        container.innerHTML = `
            <h3 style="margin-bottom: 1rem;">🎬 Videos de la Propiedad</h3>
            <div class="videos-grid">${items}</div>
        `;
        container.style.display = '';
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
            ${this.property.built_area ? `
            <div class="feature-item">
                <span class="feature-icon">🏠</span>
                <span>${this.property.built_area}m² construidos</span>
            </div>
            ` : ''}
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
            console.log('ℹ️ No hay URL de mapa para mostrar');
            return;
        }

        console.log('🗺️ Mostrando mapa con Google Maps (iframe embed):', this.property.google_maps_url);

        const mapSection = document.getElementById('propertyMapSection');
        const mapContainer = document.getElementById('propertyMapContainer');
        if (!mapSection || !mapContainer) {
            console.log('⚠️ Elementos de mapa no encontrados');
            return;
        }

        // Limpiar contenedor
        mapContainer.innerHTML = '';

        // Convertir URL a embed si es necesario (igual que en subir-propiedades)
        const embedUrl = this.convertToEmbedUrl(this.property.google_maps_url);
        
        if (embedUrl) {
            // Usar iframe de Google Maps (igual que en subir-propiedades)
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.frameBorder = '0';
            iframe.style.border = 'none';
            iframe.setAttribute('loading', 'lazy');
            iframe.allowFullscreen = true;
            iframe.referrerPolicy = 'no-referrer-when-downgrade';
            
            mapContainer.appendChild(iframe);
            console.log('✅ Mapa de Google Maps mostrado con iframe');
        } else {
            // SOLUCIÓN: Siempre usar Google Maps, nunca OpenStreetMap
            console.log('⚠️ No se pudo convertir URL, usando Google Maps con URL original');
            
            // Usar la URL original directamente en un iframe
            const iframe = document.createElement('iframe');
            iframe.src = this.property.google_maps_url;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.frameBorder = '0';
            iframe.style.border = 'none';
            iframe.setAttribute('loading', 'lazy');
            iframe.allowFullscreen = true;
            iframe.referrerPolicy = 'no-referrer-when-downgrade';
            
            mapContainer.appendChild(iframe);
            console.log('✅ Mapa de Google Maps mostrado con URL original');
        }

        mapSection.style.display = 'block';
    }

    convertToEmbedUrl(url) {
        try {
            console.log('🔄 Convirtiendo URL de mapa:', url);
            
            // Si ya es una URL de embed válida, devolverla
            if (url.includes('maps/embed')) {
                console.log('✅ URL ya es de embed');
                return url;
            }
            
            // SOLUCIÓN MEJORADA: Usar el URL real del usuario para mantener la ubicación correcta
            if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps') || url.includes('maps.google.com')) {
                console.log('✅ Detectada URL de Google Maps - manteniendo ubicación real');
                
                // Si ya es un URL de embed, usarlo directamente
                if (url.includes('/maps/embed')) {
                    console.log('✅ URL ya es de embed, usando directamente');
                    return url;
                }
                
                // Convertir URL compartido a embed manteniendo la ubicación original
                let embedUrl = url.replace(/^https:\/\/(www\.)?(maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.com)/, 'https://www.google.com/maps/embed');
                
                // Si no se pudo convertir con el reemplazo simple, usar el método de búsqueda
                if (embedUrl === url) {
                    embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.2!2d-70.6693!3d-33.4489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDI2JzU2LjAiUyA3MMKwNDAnMDkuNSJX!5e0!3m2!1ses!2scl!4v1234567890123!5m2!1ses!2scl&q=${encodeURIComponent(url)}`;
                }
                
                console.log('✅ URL de embed generada con ubicación real:', embedUrl);
                return embedUrl;
            }
            
            console.log('❌ URL no reconocida como Google Maps');
            return null;
        } catch (error) {
            console.error('❌ Error convirtiendo URL de mapa:', error);
            return null;
        }
    }

    extractLatLng(url) {
        try {
            if (!url) return null;
            let m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
            m = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
            if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
            m = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
            // OpenStreetMap mlat/mlon
            let qLat = url.match(/[?&]mlat=(-?\d+\.\d+)/);
            let qLon = url.match(/[?&]mlon=(-?\d+\.\d+)/);
            if (qLat && qLon) return { lat: parseFloat(qLat[1]), lng: parseFloat(qLon[1]) };
            // OpenStreetMap #map=zoom/lat/lon
            m = url.match(/#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/);
            if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
            return null;
        } catch (_) {
            return null;
        }
    }

    updateContactInfo() {
        if (!this.property) return;

        console.log('📞 Actualizando información de contacto:', this.property.contact_name, this.property.contact_phone, this.property.contact_email);

        // Actualizar información de contacto en sidebar
        const contactItems = document.querySelectorAll('.contact-item');
        if (contactItems.length >= 3) {
            // Teléfono
            const phoneItem = contactItems[0];
            if (phoneItem && this.property.contact_phone) {
                // Buscar el span dentro del contact-item
                const phoneSpan = phoneItem.querySelector('span:last-child');
                if (phoneSpan) {
                    phoneSpan.textContent = this.property.contact_phone;
                }
            }

            // Email
            const emailItem = contactItems[1];
            if (emailItem && this.property.contact_email) {
                // Buscar el span dentro del contact-item
                const emailSpan = emailItem.querySelector('span:last-child');
                if (emailSpan) {
                    emailSpan.textContent = this.property.contact_email;
                }
            }

            // Nombre del agente
            const agentItem = contactItems[2];
            if (agentItem && this.property.contact_name) {
                // Buscar el span dentro del contact-item
                const agentSpan = agentItem.querySelector('span:last-child');
                if (agentSpan) {
                    agentSpan.textContent = this.property.contact_name;
                }
            }
        }

        // Actualizar enlaces de los botones de contacto
        this.updateContactButtons();
    }

    updateContactButtons() {
        if (!this.property) return;

        console.log('🔗 Actualizando botones de contacto...');

        // Actualizar enlace de WhatsApp
        const whatsappBtn = document.querySelector('a[onclick*="contactViaWhatsApp"]');
        if (whatsappBtn) {
            // El botón ya tiene la función contactViaWhatsApp que usa los datos dinámicos
            console.log('✅ Botón de WhatsApp actualizado');
        }

        // Actualizar enlace de email
        const emailBtn = document.querySelector('a[href^="mailto:"]');
        if (emailBtn && this.property.contact_email) {
            emailBtn.href = `mailto:${this.property.contact_email}`;
            console.log('✅ Botón de email actualizado:', this.property.contact_email);
        }

        // Actualizar enlace de teléfono
        const phoneBtn = document.querySelector('a[href^="tel:"]');
        if (phoneBtn && this.property.contact_phone) {
            phoneBtn.href = `tel:${this.property.contact_phone}`;
            console.log('✅ Botón de teléfono actualizado:', this.property.contact_phone);
        }

        // Actualizar también los botones sticky en móvil
        const stickyPhoneBtn = document.querySelector('.sticky-cta a[href^="tel:"]');
        if (stickyPhoneBtn && this.property.contact_phone) {
            stickyPhoneBtn.href = `tel:${this.property.contact_phone}`;
            console.log('✅ Botón sticky de teléfono actualizado:', this.property.contact_phone);
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
                return `US$ ${numPrice.toLocaleString('en-US')}`;
            case 'CLP':
            default:
                return `$${numPrice.toLocaleString('es-CL')}`;
        }
    }

    // 🎯 FUNCIÓN PARA OCULTAR PANTALLA DE CARGA
    hideLoadingScreen() {
        console.log('🎯 PropertyDetailDynamic: Ocultando pantalla de carga');
        const loadingModal = document.getElementById('propertyLoadingModal');
        const mainContent = document.getElementById('mainContent');
        
        if (loadingModal) {
            loadingModal.classList.remove('active');
        }
        
        if (mainContent) {
            mainContent.style.display = 'block';
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