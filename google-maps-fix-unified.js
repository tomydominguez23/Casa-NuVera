// google-maps-fix-unified.js - Solución unificada para Google Maps
// Este archivo reemplaza todas las funciones de Google Maps dispersas

console.log('🗺️ Cargando Google Maps Fix Unificado...');

class GoogleMapsUnified {
    constructor() {
        this.isInitialized = false;
        this.cache = new Map();
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    // Inicializar el sistema
    initialize() {
        if (this.isInitialized) {
            console.log('⚠️ Google Maps ya está inicializado');
            return;
        }

        console.log('🚀 Inicializando Google Maps Unificado...');
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    // Configurar el sistema
    setup() {
        try {
            this.setupEventListeners();
            this.setupValidation();
            this.isInitialized = true;
            console.log('✅ Google Maps Unificado configurado correctamente');
        } catch (error) {
            console.error('❌ Error configurando Google Maps:', error);
            this.handleError('Error de configuración', error);
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        const mapsUrlInput = document.getElementById('googleMapsUrl');
        if (!mapsUrlInput) {
            console.log('⚠️ Campo de Google Maps no encontrado');
            return;
        }

        // Debounce para evitar muchas llamadas
        let timeout;
        mapsUrlInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.handleUrlInput(e.target.value.trim());
            }, 300);
        });

        // Validación en tiempo real
        mapsUrlInput.addEventListener('blur', (e) => {
            this.validateUrl(e.target.value.trim());
        });

        // Limpiar al hacer clic
        mapsUrlInput.addEventListener('focus', (e) => {
            if (e.target.value) {
                e.target.select();
            }
        });

        console.log('✅ Event listeners configurados');
    }

    // Manejar entrada de URL
    async handleUrlInput(url) {
        if (!url) {
            this.hideMapPreview();
            return;
        }

        // Verificar cache
        if (this.cache.has(url)) {
            console.log('📋 URL encontrada en cache');
            this.updateMapPreview(this.cache.get(url));
            return;
        }

        // Mostrar loading
        this.showLoadingState();

        try {
            // Validar y convertir URL
            const embedUrl = await this.convertToEmbedUrl(url);
            
            if (embedUrl) {
                // Guardar en cache
                this.cache.set(url, embedUrl);
                
                // Actualizar vista previa
                this.updateMapPreview(embedUrl);
                
                console.log('✅ Mapa cargado exitosamente');
            } else {
                this.showErrorState('URL de Google Maps no válida');
            }
        } catch (error) {
            console.error('❌ Error procesando URL:', error);
            this.showErrorState('Error procesando la URL del mapa');
        }
    }

    // Convertir URL mejorada
    async convertToEmbedUrl(url) {
        try {
            console.log('🔄 Convirtiendo URL:', url);

            // Limpiar URL
            url = this.cleanUrl(url);

            // Validar URL básica
            if (!this.isValidGoogleMapsUrl(url)) {
                console.log('❌ URL no es de Google Maps');
                return null;
            }

            // Si ya es embed, validar y devolver
            if (url.includes('embed')) {
                console.log('✅ URL ya es embed');
                return this.validateEmbedUrl(url);
            }

            // Detectar tipo y convertir
            if (url.includes('maps.app.goo.gl')) {
                return this.handleAppGooGlUrl(url);
            } else if (url.includes('goo.gl/maps')) {
                return this.handleGooGlUrl(url);
            } else if (url.includes('maps.google.com') || url.includes('google.com/maps')) {
                return this.handleGoogleMapsUrl(url);
            }

            console.log('❌ Tipo de URL no reconocido');
            return null;

        } catch (error) {
            console.error('❌ Error convirtiendo URL:', error);
            return null;
        }
    }

    // Limpiar URL
    cleanUrl(url) {
        return url
            .replace(/\s+/g, '')
            .replace(/['"]/g, '')
            .trim();
    }

    // Validar si es URL de Google Maps
    isValidGoogleMapsUrl(url) {
        const patterns = [
            /^https:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.com|google\.com\/maps)/,
            /^https:\/\/www\.google\.com\/maps\/embed/
        ];
        
        return patterns.some(pattern => pattern.test(url));
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

    // Mostrar estado de carga
    showLoadingState() {
        const container = document.getElementById('mapPreviewContainer');
        const preview = document.getElementById('mapPreview');
        
        if (!container || !preview) return;
        
        preview.innerHTML = `
            <div class="map-preview-placeholder">
                <div class="loading-spinner" style="
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #3498db;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                "></div>
                <div>
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
        
        // Crear iframe con configuraciones optimizadas
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
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
            <div class="map-preview-placeholder">
                <div class="icon" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">⚠️</div>
                <div>
                    <strong>${message}</strong><br>
                    <small>Por favor, usa una URL de Google Maps válida</small>
                </div>
                <div style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
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

    // Validar URL con indicador visual
    validateUrl(url) {
        const mapsUrlInput = document.getElementById('googleMapsUrl');
        if (!mapsUrlInput) return;

        // Buscar o crear indicador de validación
        let validationIcon = mapsUrlInput.parentNode.querySelector('.url-validation-icon');
        if (!validationIcon) {
            validationIcon = document.createElement('span');
            validationIcon.className = 'url-validation-icon';
            validationIcon.style.marginLeft = '10px';
            validationIcon.style.fontSize = '1.2em';
            mapsUrlInput.parentNode.appendChild(validationIcon);
        }

        if (!url) {
            validationIcon.textContent = '';
            validationIcon.style.color = '';
            return;
        }

        if (this.isValidGoogleMapsUrl(url)) {
            validationIcon.textContent = '✅';
            validationIcon.style.color = '#27ae60';
        } else {
            validationIcon.textContent = '❌';
            validationIcon.style.color = '#e74c3c';
        }
    }

    // Manejar errores
    handleError(message, error) {
        console.error(`❌ ${message}:`, error);
        
        // Mostrar error al usuario si es posible
        const container = document.getElementById('mapPreviewContainer');
        if (container) {
            this.showErrorState(message);
        }
    }

    // Obtener estadísticas
    getStats() {
        return {
            isInitialized: this.isInitialized,
            cacheSize: this.cache.size,
            retryCount: this.retryCount
        };
    }

    // Limpiar cache
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache de mapas limpiado');
    }
}

// Crear instancia global
window.googleMapsUnified = new GoogleMapsUnified();

// Función global para remover mapa (compatibilidad)
window.removeMapPreview = function() {
    const mapsUrlInput = document.getElementById('googleMapsUrl');
    if (mapsUrlInput) {
        mapsUrlInput.value = '';
    }
    window.googleMapsUnified.hideMapPreview();
    console.log('🗑️ Mapa removido');
};

// Auto-inicializar
window.googleMapsUnified.initialize();

console.log('✅ Google Maps Fix Unificado cargado correctamente');