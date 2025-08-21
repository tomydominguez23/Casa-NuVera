// Simple Property Detail Loader
class PropertyDetailLoader {
    constructor() {
        this.property = null;
        this.propertyImages = [];
        this.similarProperties = [];
        this.propertyTours = [];
    }

    async initialize() {
        try {
            console.log('Inicializando loader básico...');
            
            // Obtener ID de la propiedad desde URL
            const propertyId = this.getPropertyIdFromURL();
            if (!propertyId) {
                console.log('No hay ID en la URL');
                return;
            }

            console.log('ID encontrado:', propertyId);
            
            // Esperar a que Supabase esté disponible
            if (!window.supabase) {
                console.log('Esperando Supabase...');
                setTimeout(() => this.initialize(), 1000);
                return;
            }

            // Cargar datos básicos
            await this.loadProperty(propertyId);
            await this.loadPropertyImages(propertyId);
            
            this.renderPropertyDetail();
            
        } catch (error) {
            console.error('Error:', error);
        }
    }

    getPropertyIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadProperty(propertyId) {
        try {
            const { data, error } = await window.supabase
                .from('properties')
                .select('*')
                .eq('id', propertyId)
                .eq('published', true)
                .single();

            if (error) throw error;
            this.property = data;
            console.log('Propiedad cargada:', data);
        } catch (error) {
            console.error('Error al cargar propiedad:', error);
        }
    }

    async loadPropertyImages(propertyId) {
        try {
            const { data, error } = await window.supabase
                .from('property_images')
                .select('*')
                .eq('property_id', propertyId);

            if (error) throw error;
            this.propertyImages = data || [];
            console.log('Imágenes cargadas:', data);
        } catch (error) {
            console.error('Error al cargar imágenes:', error);
            this.propertyImages = [];
        }
    }

    renderPropertyDetail() {
        if (!this.property) return;
        
        // Renderizar título
        const headerElement = document.getElementById('propertyHeader');
        if (headerElement) {
            headerElement.innerHTML = `
                <h1 class="property-title">${this.property.title || 'Sin título'}</h1>
                <div class="property-meta">
                    <div class="property-location">📍 ${this.property.commune || this.property.region || 'Ubicación'}</div>
                    <div class="property-price">$${(this.property.price || 0).toLocaleString()} ${this.property.currency || 'CLP'}</div>
                </div>
            `;
        }

        // Renderizar galería básica
        const galleryElement = document.getElementById('propertyGallery');
        if (galleryElement && this.propertyImages.length > 0) {
            const mainImage = this.propertyImages[0];
            galleryElement.innerHTML = `
                <div class="main-image-container">
                    <img src="${mainImage.image_url}" alt="${this.property.title}" class="main-image">
                    <div class="image-counter">${this.propertyImages.length} foto${this.propertyImages.length > 1 ? 's' : ''}</div>
                </div>
            `;
        }

        // Renderizar características básicas
        const featuresElement = document.getElementById('propertyFeatures');
        if (featuresElement) {
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
                </div>
            `;
        }

        // Renderizar información básica
        const infoElement = document.getElementById('propertyInfo');
        if (infoElement) {
            infoElement.innerHTML = `
                <div class="property-description">
                    <h3>Descripción</h3>
                    <p>${this.property.description || 'Sin descripción disponible.'}</p>
                </div>
            `;
        }

        // Renderizar tours (básico)
        const toursElement = document.getElementById('propertyTours');
        if (toursElement) {
            toursElement.innerHTML = `
                <div class="no-tours-message">
                    <p>Tours virtuales próximamente...</p>
                </div>
            `;
        }

        // Renderizar contacto básico
        const contactElement = document.getElementById('contactInfo');
        if (contactElement) {
            contactElement.innerHTML = `
                <div class="contact-card">
                    <h3>Información de contacto</h3>
                    <div class="contact-details">
                        <div class="contact-item">👤 ${this.property.contact_name || 'Contacto no disponible'}</div>
                        <div class="contact-item">📞 ${this.property.contact_phone || 'Teléfono no disponible'}</div>
                    </div>
                </div>
            `;
        }

        console.log('Renderizado completo');
    }
}

// Inicialización
let propertyDetailLoader;

document.addEventListener('DOMContentLoaded', function() {
    propertyDetailLoader = new PropertyDetailLoader();
    propertyDetailLoader.initialize();
});