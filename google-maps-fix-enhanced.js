// google-maps-fix-enhanced.js - Solución mejorada para Google Maps
// Este archivo contiene mejoras adicionales para la integración de Google Maps

console.log('🗺️ Cargando Google Maps Enhanced Fix...');

class GoogleMapsEnhanced {
    constructor() {
        this.apiKey = null; // Se puede configurar si se tiene API key
        this.cache = new Map();
        this.isInitialized = false;
    }

    // Inicializar el sistema mejorado
    initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 Inicializando Google Maps Enhanced...');
        this.setupEventListeners();
        this.setupValidation();
        this.isInitialized = true;
        
        console.log('✅ Google Maps Enhanced inicializado');
    }

    // Configurar event listeners mejorados
    setupEventListeners() {
        const mapsUrlInput = document.getElementById('googleMapsUrl');
        if (!mapsUrlInput) return;

        // Debounce para evitar muchas llamadas
        let timeout;
        mapsUrlInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.handleUrlInput(e.target.value.trim());
            }, 500);
        });

        // Validación en tiempo real
        mapsUrlInput.addEventListener('blur', (e) => {
            this.validateUrl(e.target.value.trim());
        });
    }

    // Manejar entrada de URL con mejoras
    async handleUrlInput(url) {
        if (!url) {
            this.hideMapPreview();
            return;
        }

        // Verificar cache primero
        if (this.cache.has(url)) {
            console.log('📋 URL encontrada en cache');
            this.updateMapPreview(this.cache.get(url));
            return;
        }

        // Mostrar loading mejorado
        this.showLoadingState();

        try {
            // Validar y convertir URL
            const embedUrl = await this.convertToEmbedUrl(url);
            
            if (embedUrl) {
                // Guardar en cache
                this.cache.set(url, embedUrl);
                
                // Actualizar vista previa
                this.updateMapPreview(embedUrl);
                
                // Log de éxito
                console.log('✅ Mapa cargado exitosamente:', embedUrl);
            } else {
                this.showErrorState('URL de Google Maps no válida');
            }
        } catch (error) {
            console.error('❌ Error procesando URL:', error);
            this.showErrorState('Error procesando la URL del mapa');
        }
    }

    // Convertir URL mejorada con más formatos
    async convertToEmbedUrl(url) {
        try {
            console.log('🔄 Convirtiendo URL de mapa:', url);

            // Limpiar URL
            url = this.cleanUrl(url);

            // Verificar si ya es embed
            if (url.includes('embed')) {
                console.log('✅ URL ya es embed');
                return this.validateEmbedUrl(url);
            }

            // Detectar tipo de URL y convertir
            if (url.includes('maps.app.goo.gl')) {
                return this.handleAppGooGlUrl(url);
            } else if (url.includes('goo.gl/maps')) {
                return this.handleGooGlUrl(url);
            } else if (url.includes('maps.google.com')) {
                return this.handleGoogleMapsUrl(url);
            } else if (url.includes('google.com/maps')) {
                return this.handleGoogleMapsUrl(url);
            } else {
                console.log('❌ URL no reconocida como Google Maps');
                return null;
            }
        } catch (error) {
            console.error('❌ Error convirtiendo URL:', error);
            return null;
        }
    }

    // Limpiar URL de caracteres problemáticos
    cleanUrl(url) {
        return url
            .replace(/\s+/g, '')
            .replace(/['"]/g, '')
            .trim();
    }

    // Manejar URLs de maps.app.goo.gl
    handleAppGooGlUrl(url) {
        console.log('✅ URL de maps.app.goo.gl detectada');
        
        // Estas URLs funcionan directamente en iframes
        return this.validateEmbedUrl(url);
    }

    // Manejar URLs de goo.gl/maps
    handleGooGlUrl(url) {
        console.log('✅ URL de goo.gl/maps detectada');
        
        // Estas URLs también funcionan directamente
        return this.validateEmbedUrl(url);
    }

    // Manejar URLs completas de Google Maps
    handleGoogleMapsUrl(url) {
        console.log('✅ URL de Google Maps detectada');
        
        // Extraer coordenadas si existen
        const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordsMatch) {
            const [, lat, lng] = coordsMatch;
            const embedUrl = this.generateEmbedUrl(lat, lng);
            console.log('✅ URL generada con coordenadas');
            return embedUrl;
        }
        
        // Usar URL original si no tiene coordenadas
        console.log('✅ Usando URL original');
        return this.validateEmbedUrl(url);
    }

    // Generar URL de embed con coordenadas
    generateEmbedUrl(lat, lng) {
        return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.2!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM${lat}%2C${lng}!5e0!3m2!1ses!2scl!4v1234567890123!5m2!1ses!2scl`;
    }

    // Validar URL de embed
    validateEmbedUrl(url) {
        try {
            new URL(url);
            return url;
        } catch {
            console.log('❌ URL inválida');
            return null;
        }
    }

    // Mostrar estado de carga mejorado
    showLoadingState() {
        const container = document.getElementById('mapPreviewContainer');
        const preview = document.getElementById('mapPreview');
        
        if (!container || !preview) return;
        
        preview.innerHTML = `
            <div class="map-preview-placeholder">
                <div class="loading-spinner"></div>
                <div class="loading-text">
                    <strong>🔄 Cargando mapa...</strong><br>
                    <small>Procesando ubicación...</small>
                </div>
            </div>
        `;
        
        container.style.display = 'block';
    }

    // Actualizar vista previa del mapa
    updateMapPreview(embedUrl) {
        const container = document.getElementById('mapPreviewContainer');
        const preview = document.getElementById('mapPreview');
        
        if (!container || !preview) return;
        
        // Crear iframe con mejores configuraciones
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy'; // Lazy loading
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        
        // Manejar eventos de carga
        iframe.onload = () => {
            console.log('✅ Mapa cargado exitosamente');
            this.hideLoadingState();
        };
        
        iframe.onerror = () => {
            console.error('❌ Error cargando iframe');
            this.showErrorState('Error cargando el mapa. Verifica la conexión.');
        };
        
        // Limpiar y agregar iframe
        preview.innerHTML = '';
        preview.appendChild(iframe);
        
        container.style.display = 'block';
    }

    // Mostrar estado de error
    showErrorState(message) {
        const container = document.getElementById('mapPreviewContainer');
        const preview = document.getElementById('mapPreview');
        
        if (!container || !preview) return;
        
        preview.innerHTML = `
            <div class="map-preview-placeholder error">
                <div class="error-icon">⚠️</div>
                <div class="error-text">
                    <strong>${message}</strong><br>
                    <small>Por favor, usa una URL de Google Maps válida</small>
                </div>
                <div class="error-help">
                    <strong>💡 URLs válidas:</strong><br>
                    • maps.app.goo.gl/...<br>
                    • goo.gl/maps/...<br>
                    • maps.google.com/...
                </div>
            </div>
        `;
        
        container.style.display = 'block';
    }

    // Ocultar estado de carga
    hideLoadingState() {
        const preview = document.getElementById('mapPreview');
        if (preview) {
            const loadingElement = preview.querySelector('.loading-spinner');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }
    }

    // Ocultar vista previa del mapa
    hideMapPreview() {
        const container = document.getElementById('mapPreviewContainer');
        if (container) {
            container.style.display = 'none';
        }
    }

    // Validar URL con regex mejorado
    validateUrl(url) {
        const patterns = [
            /^https:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.com|google\.com\/maps)/,
            /^https:\/\/www\.google\.com\/maps\/embed/
        ];
        
        return patterns.some(pattern => pattern.test(url));
    }

    // Configurar validación visual
    setupValidation() {
        const mapsUrlInput = document.getElementById('googleMapsUrl');
        if (!mapsUrlInput) return;

        // Agregar indicador visual de validación
        const validationIcon = document.createElement('span');
        validationIcon.className = 'url-validation-icon';
        validationIcon.style.marginLeft = '10px';
        validationIcon.style.fontSize = '1.2em';
        
        mapsUrlInput.parentNode.appendChild(validationIcon);

        // Validar en tiempo real
        mapsUrlInput.addEventListener('input', () => {
            const url = mapsUrlInput.value.trim();
            if (!url) {
                validationIcon.textContent = '';
                validationIcon.style.color = '';
                return;
            }

            if (this.validateUrl(url)) {
                validationIcon.textContent = '✅';
                validationIcon.style.color = '#27ae60';
            } else {
                validationIcon.textContent = '❌';
                validationIcon.style.color = '#e74c3c';
            }
        });
    }

    // Obtener estadísticas del mapa
    getMapStats() {
        return {
            cacheSize: this.cache.size,
            isInitialized: this.isInitialized,
            supportedFormats: [
                'maps.app.goo.gl',
                'goo.gl/maps',
                'maps.google.com',
                'google.com/maps'
            ]
        };
    }
}

// Crear instancia global
window.googleMapsEnhanced = new GoogleMapsEnhanced();

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.googleMapsEnhanced.initialize();
});

// Exponer funciones globales para compatibilidad
window.removeMapPreview = function() {
    const mapsUrlInput = document.getElementById('googleMapsUrl');
    if (mapsUrlInput) {
        mapsUrlInput.value = '';
    }
    window.googleMapsEnhanced.hideMapPreview();
    console.log('🗑️ Mapa removido');
};

console.log('✅ Google Maps Enhanced Fix cargado correctamente');