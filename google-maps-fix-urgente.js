// google-maps-fix-urgente.js - Solución urgente para el problema de mapas
console.log('🚨 Cargando Google Maps Fix Urgente...');

class GoogleMapsUrgente {
    constructor() {
        this.isInitialized = false;
    }

    // Función principal para convertir URLs de Google Maps
    convertToEmbedUrl(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }

        console.log('🔄 Convirtiendo URL:', url);

        // Si ya es una URL de embed, usarla directamente
        if (url.includes('/maps/embed')) {
            console.log('✅ Ya es URL de embed');
            return url;
        }

        // URLs de maps.app.goo.gl - estos funcionan directamente como embed
        if (url.includes('maps.app.goo.gl')) {
            console.log('✅ URL de maps.app.goo.gl - usando directamente');
            return url;
        }

        // URLs de goo.gl/maps - estos también funcionan directamente
        if (url.includes('goo.gl/maps')) {
            console.log('✅ URL de goo.gl/maps - usando directamente');
            return url;
        }

        // URLs de maps.google.com - extraer coordenadas y crear embed
        if (url.includes('maps.google.com') || url.includes('google.com/maps')) {
            console.log('✅ URL de Google Maps detectada');
            
            // Intentar extraer coordenadas
            const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coordsMatch) {
                const [, lat, lng] = coordsMatch;
                const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.2!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat}%2C${lng}!5e0!3m2!1ses!2scl!4v1234567890123!5m2!1ses!2scl`;
                console.log('✅ URL generada con coordenadas:', embedUrl);
                return embedUrl;
            }
            
            // Si no tiene coordenadas, usar búsqueda
            const searchQuery = encodeURIComponent(url);
            const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.2!2d-70.6693!3d-33.4489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDI2JzU2LjAiUyA3MMKwNDAnMDkuNSJX!5e0!3m2!1ses!2scl!4v1234567890123!5m2!1ses!2scl&q=${searchQuery}`;
            console.log('✅ URL convertida para búsqueda:', embedUrl);
            return embedUrl;
        }

        console.log('❌ URL no reconocida como Google Maps válida');
        return null;
    }

    // Función para mostrar mapa en preview
    showMapPreview(url) {
        console.log('🗺️ Mostrando preview del mapa:', url);
        
        const embedUrl = this.convertToEmbedUrl(url);
        if (!embedUrl) {
            this.showMapError('URL de Google Maps no válida');
            return;
        }

        // Buscar contenedor de preview
        let container = document.getElementById('mapPreviewContainer');
        if (!container) {
            // Crear contenedor si no existe
            container = document.createElement('div');
            container.id = 'mapPreviewContainer';
            container.style.cssText = `
                margin-top: 1rem;
                padding: 1rem;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                background: #f9f9f9;
            `;
            
            // Insertar después del campo de mapa
            const mapsInput = document.getElementById('googleMapsUrl');
            if (mapsInput && mapsInput.parentNode) {
                mapsInput.parentNode.insertBefore(container, mapsInput.nextSibling);
            }
        }

        // Limpiar contenido anterior
        container.innerHTML = '';

        // Crear iframe
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.width = '100%';
        iframe.height = '300';
        iframe.frameBorder = '0';
        iframe.style.border = '0';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';

        // Agregar título
        const title = document.createElement('h4');
        title.textContent = '🗺️ Vista Previa del Mapa';
        title.style.margin = '0 0 1rem 0';
        title.style.color = '#333';

        // Agregar información de la URL
        const info = document.createElement('p');
        info.textContent = `📍 Ubicación: ${url}`;
        info.style.margin = '0.5rem 0';
        info.style.fontSize = '0.9rem';
        info.style.color = '#666';

        container.appendChild(title);
        container.appendChild(info);
        container.appendChild(iframe);
        container.style.display = 'block';

        console.log('✅ Mapa mostrado correctamente');
    }

    // Función para mostrar error
    showMapError(message) {
        console.error('❌ Error en mapa:', message);
        
        let container = document.getElementById('mapPreviewContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'mapPreviewContainer';
            container.style.cssText = `
                margin-top: 1rem;
                padding: 1rem;
                border: 2px solid #ffcdd2;
                border-radius: 8px;
                background: #ffebee;
            `;
            
            const mapsInput = document.getElementById('googleMapsUrl');
            if (mapsInput && mapsInput.parentNode) {
                mapsInput.parentNode.insertBefore(container, mapsInput.nextSibling);
            }
        }

        container.innerHTML = `
            <div style="color: #d32f2f; font-weight: bold;">
                ❌ ${message}
            </div>
            <div style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">
                Usa una URL de Google Maps válida (maps.app.goo.gl, goo.gl/maps, o maps.google.com)
            </div>
        `;
        container.style.display = 'block';
    }

    // Función para ocultar preview
    hideMapPreview() {
        const container = document.getElementById('mapPreviewContainer');
        if (container) {
            container.style.display = 'none';
        }
    }

    // Inicializar el sistema
    initialize() {
        if (this.isInitialized) {
            console.log('⚠️ Google Maps Urgente ya está inicializado');
            return;
        }

        console.log('🚀 Inicializando Google Maps Urgente...');

        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    // Configurar event listeners
    setup() {
        try {
            const mapsUrlInput = document.getElementById('googleMapsUrl');
            if (!mapsUrlInput) {
                console.log('⚠️ Campo de Google Maps no encontrado');
                return;
            }

            // Event listener para cambios en el input
            mapsUrlInput.addEventListener('input', (e) => {
                const url = e.target.value.trim();
                if (url) {
                    this.showMapPreview(url);
                } else {
                    this.hideMapPreview();
                }
            });

            // Event listener para blur (cuando pierde el foco)
            mapsUrlInput.addEventListener('blur', (e) => {
                const url = e.target.value.trim();
                if (url) {
                    this.showMapPreview(url);
                }
            });

            this.isInitialized = true;
            console.log('✅ Google Maps Urgente configurado correctamente');

        } catch (error) {
            console.error('❌ Error configurando Google Maps Urgente:', error);
        }
    }

    // Función para obtener URL procesada (para enviar al servidor)
    getProcessedUrl() {
        const input = document.getElementById('googleMapsUrl');
        if (!input) return null;
        
        const url = input.value.trim();
        return this.convertToEmbedUrl(url);
    }
}

// Crear instancia global
window.googleMapsUrgente = new GoogleMapsUrgente();

// Función global para obtener URL procesada
window.getGoogleMapsUrl = function() {
    return window.googleMapsUrgente.getProcessedUrl();
};

// Inicializar automáticamente
window.googleMapsUrgente.initialize();

console.log('✅ Google Maps Fix Urgente cargado - Listo para usar');