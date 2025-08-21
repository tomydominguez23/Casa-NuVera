// Property Detail Loader - COMPATIBLE CON ESTRUCTURA REAL DE BD
class PropertyDetailLoader {
    constructor() {
        this.property = null;
        this.propertyImages = [];
        this.similarProperties = [];
        this.propertyTours = [];
    }

    async initialize() {
        try {
            console.log('🏠 Inicializando PropertyDetailLoader...');
            
            // Esperar a que Supabase esté disponible
            if (!window.supabase) {
                console.error('❌ Supabase no está disponible');
                throw new Error('Error de conexión con la base de datos');
            }

            console.log('✅ Supabase configurado correctamente');
            
            // Obtener ID de la propiedad desde URL
            const propertyId = this.getPropertyIdFromURL();
            if (!propertyId) {
                throw new Error('ID de propiedad no especificado en la URL');
            }

            console.log('🔍 Cargando propiedad con ID:', propertyId);
            
            // Cargar datos en paralelo
            await Promise.all([
                this.loadProperty(propertyId),
                this.loadPropertyImages(propertyId),
                this.loadPropertyTours(propertyId)
            ]);

            // Cargar propiedades similares después de tener la propiedad principal
            if (this.property) {
                await this.loadSimilarProperties();
            }

            this.renderPropertyDetail();
            
        } catch (error) {
            console.error('💥 Error al inicializar PropertyDetailLoader:', error);
            this.showError(error.message);
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
            
            // Query con la estructura REAL de tu BD
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
                    created_at
                `)
                .eq('id', propertyId)
                .eq('published', true)
                .single();

            if (error) {
                console.error('❌ Error al cargar propiedad:', error);
                throw new Error(`No se pudo cargar la propiedad: ${error.message}`);
            }

            if (!data) {
                throw new Error('Propiedad no encontrada o no está publicada');
            }

            this.property = data;
            console.log('✅ Propiedad cargada:', this.property.title);
            
        } catch (error) {
            console.error('💥 Error en loadProperty:', error);
            throw error;
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
                .select('id, tour_name, tour_url, tour_order')
                .eq('property_id', propertyId)
                .order('tour_order', { ascending: true });

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

    async loadSimilarProperties() {
        try {
            console.log('🔍 Cargando propiedades similares...');
            
            // Primero buscar en la misma comuna
            let query = window.supabase
                .from('properties')
                .select(`
                    id,
                    title,
                    property_type,
                    category,
                    commune,
                    region,
                    price,
                    currency,
                    bedrooms,
                    bathrooms,
                    total_area,
                    built_area
                `)
                .eq('published', true)
                .neq('id', this.property.id);

            // Filtrar por comuna si existe
            if (this.property.commune) {
                query = query.eq('commune', this.property.commune);
            }

            const { data, error } = await query
                .limit(3)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('⚠️ Error al cargar propiedades similares:', error);
                this.similarProperties = [];
                return;
            }

            this.similarProperties = data || [];
            
            // Si no hay suficientes en la misma comuna, buscar en la región
            if (this.similarProperties.length < 3 && this.property.region) {
                console.log('🔍 Buscando más propiedades en la misma región...');
                
                const { data: moreProperties } = await window.supabase
                    .from('properties')
                    .select(`
                        id,
                        title,
                        property_type,
                        category,
                        commune,
                        region,
                        price,
                        currency,
                        bedrooms,
                        bathrooms,
                        total_area,
                        built_area
                    `)
                    .eq('published', true)
                    .eq('region', this.property.region)
                    .neq('id', this.property.id)
                    .not('id', 'in', `(${this.similarProperties.map(p => p.id).join(',')})`)
                    .limit(3 - this.similarProperties.length)
                    .order('created_at', { ascending: false });

                if (moreProperties) {
                    this.similarProperties = [...this.similarProperties, ...moreProperties];
                }
            }

            // Cargar imágenes para propiedades similares
            await this.loadSimilarPropertiesImages();
            
            console.log(`✅ ${this.similarProperties.length} propiedades similares cargadas`);
            
        } catch (error) {
            console.error('💥 Error en loadSimilarProperties:', error);
            this.similarProperties = [];
        }
    }

    async loadSimilarPropertiesImages() {
        for (let property of this.similarProperties) {
            try {
                const { data: images } = await window.supabase
                    .from('property_images')
                    .select('image_url, is_main')
                    .eq('property_id', property.id)
                    .order('image_order', { ascending: true })
                    .limit(1);

                if (images && images.length > 0) {
                    const mainImage = images.find(img => img.is_main) || images[0];
                    property.main_image = mainImage.image_url;
                } else {
                    property.main_image = null;
                }
            } catch (error) {
                console.error(`Error cargando imagen para propiedad ${property.id}:`, error);
                property.main_image = null;
            }
        }
    }

    renderPropertyDetail() {
        this.updatePageTitle();
        this.renderPropertyHeader();
        this.renderPropertyGallery();
        this.renderPropertyInfo();
        this.renderPropertyFeatures();
        this.renderPropertyTours();
        this.renderContactInfo();
        this.renderSimilarProperties();
    }

    updatePageTitle() {
        if (this.property) {
            document.title = `${this.property.title} | Casa Nuvera`;
        }
    }

    renderPropertyHeader() {
        const headerElement = document.getElementById('propertyHeader');
        if (!headerElement || !this.property) return;

        const location = this.formatLocation(this.property);
        const price = this.formatPrice(this.property.price, this.property.currency);

        headerElement.innerHTML = `
            <h1 class="property-title">${this.property.title}</h1>
            <div class="property-meta">
                <div class="property-location">
                    <i class="location-icon">📍</i>
                    ${location}
                </div>
                <div class="property-price">${price}</div>
            </div>
        `;
    }

    renderPropertyGallery() {
        const galleryElement = document.getElementById('propertyGallery');
        if (!galleryElement) return;

        if (this.propertyImages.length === 0) {
            galleryElement.innerHTML = `
                <div class="no-images-placeholder">
                    <i class="placeholder-icon">🏠</i>
                    <p>No hay imágenes disponibles para esta propiedad</p>
                </div>
            `;
            return;
        }

        // Imagen principal y thumbnails
        const mainImage = this.propertyImages.find(img => img.is_main) || this.propertyImages[0];
        
        galleryElement.innerHTML = `
            <div class="main-image-container">
                <img src="${mainImage.image_url}" alt="${this.property.title}" class="main-image" id="mainImage">
                <div class="image-counter">${this.propertyImages.length} foto${this.propertyImages.length > 1 ? 's' : ''}</div>
            </div>
            <div class="thumbnails-container">
                ${this.propertyImages.map((image, index) => `
                    <img src="${image.image_url}" 
                         alt="Imagen ${index + 1}" 
                         class="thumbnail ${image === mainImage ? 'active' : ''}"
                         onclick="propertyDetailLoader.setMainImage('${image.image_url}', this)">
                `).join('')}
            </div>
        `;
    }

    setMainImage(imageUrl, thumbnailElement) {
        // Actualizar imagen principal
        document.getElementById('mainImage').src = imageUrl;
        
        // Actualizar thumbnails activos
        document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
        thumbnailElement.classList.add('active');
    }

    renderPropertyInfo() {
        const infoElement = document.getElementById('propertyInfo');
        if (!infoElement || !this.property) return;

        infoElement.innerHTML = `
            <div class="property-description">
                <h3>Descripción</h3>
                <p>${this.property.description || 'No hay descripción disponible.'}</p>
            </div>
            
            <div class="property-details">
                <h3>Detalles de la propiedad</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Tipo:</span>
                        <span class="detail-value">${this.property.property_type || 'No especificado'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Categoría:</span>
                        <span class="detail-value">${this.property.category || 'No especificado'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Área total:</span>
                        <span class="detail-value">${this.property.total_area || 'No especificado'}${this.property.total_area ? ' m²' : ''}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Área construida:</span>
                        <span class="detail-value">${this.property.built_area || 'No especificado'}${this.property.built_area ? ' m²' : ''}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Estacionamientos:</span>
                        <span class="detail-value">${this.property.parking_spaces || 0}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Disponibilidad:</span>
                        <span class="detail-value">${this.property.availability || 'Inmediata'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderPropertyFeatures() {
        const featuresElement = document.getElementById('propertyFeatures');
        if (!featuresElement || !this.property) return;

        featuresElement.innerHTML = `
            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon">🛏️</div>
                    <div class="feature-text">
                        <span class="feature-number">${this.property.bedrooms || 0}</span>
                        <span class="feature-label">Dormitorios</span>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🚿</div>
                    <div class="feature-text">
                        <span class="feature-number">${this.property.bathrooms || 0}</span>
                        <span class="feature-label">Baños</span>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">📐</div>
                    <div class="feature-text">
                        <span class="feature-number">${this.property.total_area || this.property.built_area || 0}</span>
                        <span class="feature-label">m² totales</span>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🚗</div>
                    <div class="feature-text">
                        <span class="feature-number">${this.property.parking_spaces || 0}</span>
                        <span class="feature-label">Estacionamientos</span>
                    </div>
                </div>
            </div>
        `;

        // Agregar características adicionales si existen
        if (this.property.features && Array.isArray(this.property.features) && this.property.features.length > 0) {
            const additionalFeatures = document.createElement('div');
            additionalFeatures.className = 'additional-features';
            additionalFeatures.innerHTML = `
                <h4>Características adicionales</h4>
                <ul class="features-list">
                    ${this.property.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            `;
            featuresElement.appendChild(additionalFeatures);
        }
    }

    renderPropertyTours() {
        const toursElement = document.getElementById('propertyTours');
        if (!toursElement) return;

        if (this.propertyTours.length === 0) {
            toursElement.innerHTML = `
                <div class="no-tours-message">
                    <p>No hay tours virtuales disponibles para esta propiedad.</p>
                </div>
            `;
            return;
        }

        toursElement.innerHTML = `
            <h3>Tours Virtuales 360°</h3>
            <div class="tours-grid">
                ${this.propertyTours.map(tour => `
                    <div class="tour-item">
                        <button class="tour-btn" onclick="propertyDetailLoader.openTour('${tour.tour_url}')">
                            <div class="tour-icon">🌐</div>
                            <div class="tour-info">
                                <span class="tour-name">${tour.tour_name || 'Tour Virtual'}</span>
                                <span class="tour-label">Hacer recorrido virtual</span>
                            </div>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    openTour(tourUrl) {
        if (!tourUrl) {
            alert('URL del tour no disponible');
            return;
        }

        // Abrir tour en modal o nueva ventana
        const modal = document.createElement('div');
        modal.className = 'tour-modal';
        modal.innerHTML = `
            <div class="tour-modal-content">
                <div class="tour-modal-header">
                    <h3>Tour Virtual 360°</h3>
                    <button class="tour-modal-close" onclick="this.closest('.tour-modal').remove()">&times;</button>
                </div>
                <div class="tour-modal-body">
                    <iframe src="${tourUrl}" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    renderContactInfo() {
        const contactElement = document.getElementById('contactInfo');
        if (!contactElement || !this.property) return;

        contactElement.innerHTML = `
            <div class="contact-card">
                <h3>Información de contacto</h3>
                <div class="contact-details">
                    <div class="contact-item">
                        <i class="contact-icon">👤</i>
                        <span>${this.property.contact_name || 'Agente no especificado'}</span>
                    </div>
                    <div class="contact-item">
                        <i class="contact-icon">📞</i>
                        <a href="tel:${this.property.contact_phone || ''}">${this.property.contact_phone || 'Teléfono no disponible'}</a>
                    </div>
                    <div class="contact-item">
                        <i class="contact-icon">✉️</i>
                        <a href="mailto:${this.property.contact_email || ''}">${this.property.contact_email || 'Email no disponible'}</a>
                    </div>
                </div>
                <button class="contact-btn" onclick="propertyDetailLoader.contactAgent()">
                    Contactar Agente
                </button>
            </div>
        `;
    }

    contactAgent() {
        if (this.property.contact_phone) {
            const message = `Hola, estoy interesado en la propiedad: ${this.property.title}`;
            const whatsappUrl = `https://wa.me/${this.property.contact_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        } else {
            alert('Información de contacto no disponible');
        }
    }

    renderSimilarProperties() {
        const similarElement = document.getElementById('similarProperties');
        if (!similarElement) return;

        if (this.similarProperties.length === 0) {
            similarElement.innerHTML = `
                <div class="no-similar-message">
                    <p>No hay propiedades similares disponibles.</p>
                </div>
            `;
            return;
        }

        similarElement.innerHTML = `
            <h3>Propiedades similares en ${this.property.commune || this.property.region}</h3>
            <div class="similar-properties-grid">
                ${this.similarProperties.map(property => `
                    <div class="similar-property-card" onclick="window.location.href='property-detail.html?id=${property.id}&slug=${this.createSlug(property.title)}'">
                        <div class="similar-property-image">
                            ${property.main_image ? 
                                `<img src="${property.main_image}" alt="${property.title}">` :
                                `<div class="no-image-placeholder">Sin imagen</div>`
                            }
                        </div>
                        <div class="similar-property-content">
                            <h4 class="similar-property-title">${property.title}</h4>
                            <p class="similar-property-location">${property.commune || property.region}</p>
                            <p class="similar-property-price">${this.formatPrice(property.price, property.currency)}</p>
                            <div class="similar-property-features">
                                ${property.bedrooms || 0} hab • ${property.bathrooms || 0} baños • ${property.total_area || property.built_area || 0}m²
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createSlug(title) {
        if (!title) return 'propiedad';
        
        return title
            .toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/[ñ]/g, 'n')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
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

    showError(message) {
        const mainContainer = document.querySelector('.property-detail-container');
        if (mainContainer) {
            mainContainer.innerHTML = `
                <div class="error-container">
                    <h2>❌ Error al cargar la propiedad</h2>
                    <p>${message}</p>
                    <div class="error-actions">
                        <button onclick="window.location.reload()" class="btn btn-primary">🔄 Recargar página</button>
                        <button onclick="window.location.href='compras.html'" class="btn btn-secondary">🏠 Ver todas las propiedades</button>
                    </div>
                </div>
            `;
        }
    }
}

// Inicialización global
let propertyDetailLoader;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Iniciando página de detalle de propiedad...');
    
    propertyDetailLoader = new PropertyDetailLoader();
    
    // Esperar a que Supabase esté listo
    if (window.supabase) {
        propertyDetailLoader.initialize();
    } else {
        window.addEventListener('supabaseReady', () => {
            propertyDetailLoader.initialize();
        });
        
        // Timeout de seguridad
        setTimeout(() => {
            if (!window.supabase) {
                propertyDetailLoader.showError('No se pudo conectar con la base de datos');
            }
        }, 5000);
    }
});