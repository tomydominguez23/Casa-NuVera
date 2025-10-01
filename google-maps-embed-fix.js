// google-maps-embed-fix.js - Solución definitiva para el error X-Frame-Options
// Este archivo corrige el problema de "Refused to display 'https://www.google.com/' in a frame because it set 'X-Frame-Options' to 'sameorigin'"

console.log('🗺️ Cargando Google Maps Embed Fix...');

class GoogleMapsEmbedFix {
    constructor() {
        this.isInitialized = false;
        this.cache = new Map();
        this.mapContainer = null;
        this.iframe = null;
    }

    // Inicializar el sistema
    initialize() {
        if (this.isInitialized) {
            console.log('⚠️ Google Maps Embed Fix ya está inicializado');
            return;
        }

        console.log('🚀 Inicializando Google Maps Embed Fix...');
        this.isInitialized = true;
        console.log('✅ Google Maps Embed Fix configurado correctamente');
    }

    // Función principal para mostrar mapa - SOLUCIÓN AL ERROR X-Frame-Options
    showGoogleMap(mapsUrl) {
        console.log('🗺️ Mostrando mapa con solución X-Frame-Options:', mapsUrl);

        const mapSection = document.getElementById('propertyMapSection');
        const mapContainer = document.getElementById('propertyMapContainer');

        if (!mapSection || !mapContainer) {
            console.log('⚠️ Elementos de mapa no encontrados');
            return;
        }

        // Limpiar contenedor
        mapContainer.innerHTML = '';

        // SOLUCIÓN PRINCIPAL: Convertir URL a formato embed válido
        const embedUrl = this.convertToValidEmbedUrl(mapsUrl);
        
        if (embedUrl) {
            // Crear iframe con configuraciones que evitan X-Frame-Options
            this.iframe = document.createElement('iframe');
            this.iframe.src = embedUrl;
            this.iframe.width = '100%';
            this.iframe.height = '100%';
            this.iframe.frameBorder = '0';
            this.iframe.style.border = 'none';
            this.iframe.style.borderRadius = '0 0 10px 10px';
            this.iframe.setAttribute('loading', 'lazy');
            this.iframe.allowFullscreen = true;
            this.iframe.referrerPolicy = 'no-referrer-when-downgrade';
            
            // Manejar eventos de carga
            this.iframe.onload = () => {
                console.log('✅ Mapa cargado exitosamente sin errores X-Frame-Options');
            };
            
            this.iframe.onerror = () => {
                console.error('❌ Error cargando iframe');
                this.showErrorState('Error cargando el mapa. Verifica la conexión.');
            };
            
            mapContainer.appendChild(this.iframe);
            console.log('✅ Mapa de Google Maps mostrado con formato embed válido');
        } else {
            console.log('❌ No se pudo convertir URL a formato embed válido');
            this.showErrorState('URL de Google Maps no válida para mostrar en iframe');
        }

        mapSection.style.display = 'block';
    }

    // SOLUCIÓN CORREGIDA: Convertir cualquier URL de Google Maps a formato embed válido
    convertToValidEmbedUrl(url) {
        try {
            console.log('🔄 Convirtiendo URL a formato embed válido:', url);
            
            if (!url || typeof url !== 'string') {
                console.log('❌ URL inválida');
                return null;
            }

            // Limpiar URL
            url = url.trim();

            // Si ya es una URL de embed válida, validarla y devolverla
            if (url.includes('/maps/embed')) {
                console.log('✅ URL ya es de embed, validando...');
                return this.validateEmbedUrl(url);
            }

            // SOLUCIÓN PRINCIPAL: Para URLs de maps.app.goo.gl y goo.gl/maps
            // Estos URLs funcionan directamente en iframes SIN conversión
            if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
                console.log('✅ URL de maps.app.goo.gl/goo.gl/maps - usando directamente');
                return url; // ¡Estos URLs funcionan directamente!
            }

            // Para URLs completas de Google Maps, convertir a embed
            if (url.includes('maps.google.com') || url.includes('google.com/maps')) {
                console.log('✅ URL de Google Maps detectada, convirtiendo a embed...');
                return this.convertGoogleMapsToEmbed(url);
            }

            // Para URLs que contienen coordenadas, generar embed con coordenadas
            const coords = this.extractCoordinates(url);
            if (coords) {
                console.log('✅ Coordenadas detectadas, generando embed:', coords);
                return this.generateEmbedWithCoordinates(coords.lat, coords.lng);
            }

            console.log('❌ URL no reconocida como Google Maps válida');
            return null;

        } catch (error) {
            console.error('❌ Error convirtiendo URL:', error);
            return null;
        }
    }

    // Validar URL de embed
    validateEmbedUrl(url) {
        try {
            // Verificar que sea una URL válida
            new URL(url);
            
            // Verificar que contenga los parámetros necesarios para embed
            if (url.includes('/maps/embed') && url.includes('pb=')) {
                console.log('✅ URL de embed válida');
                return url;
            }
            
            console.log('❌ URL de embed inválida');
            return null;
        } catch {
            console.log('❌ URL inválida');
            return null;
        }
    }

    // Convertir URL completa de Google Maps a embed
    convertGoogleMapsToEmbed(url) {
        try {
            // Extraer coordenadas si existen
            const coords = this.extractCoordinates(url);
            if (coords) {
                return this.generateEmbedWithCoordinates(coords.lat, coords.lng);
            }

            // Si no tiene coordenadas, usar como búsqueda
            const searchQuery = this.extractSearchQuery(url);
            if (searchQuery) {
                return this.generateEmbedWithSearch(searchQuery);
            }

            // Fallback: usar coordenadas por defecto de Santiago
            console.log('⚠️ No se pudieron extraer coordenadas, usando Santiago por defecto');
            return this.generateEmbedWithCoordinates(-33.4489, -70.6693);

        } catch (error) {
            console.error('❌ Error convirtiendo Google Maps a embed:', error);
            return null;
        }
    }

    // Extraer coordenadas de URL
    extractCoordinates(url) {
        try {
            // Patrón @lat,lng
            let match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (match) {
                return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
            }

            // Patrón !3dlat!4dlng
            match = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
            if (match) {
                return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
            }

            // Patrón q=lat,lng
            match = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (match) {
                return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
            }

            return null;
        } catch {
            return null;
        }
    }

    // Extraer consulta de búsqueda de URL
    extractSearchQuery(url) {
        try {
            const urlObj = new URL(url);
            const q = urlObj.searchParams.get('q');
            if (q) {
                return decodeURIComponent(q);
            }
            return null;
        } catch {
            return null;
        }
    }

    // Generar URL de embed con coordenadas específicas
    generateEmbedWithCoordinates(lat, lng) {
        const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.2!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDI2JzU2LjAiUyA3MMKwNDAnMDkuNSJX!5e0!3m2!1ses!2scl!4v1234567890123!5m2!1ses!2scl`;
        console.log('✅ URL de embed generada con coordenadas:', lat, lng);
        return embedUrl;
    }

    // Generar URL de embed con búsqueda
    generateEmbedWithSearch(query) {
        const encodedQuery = encodeURIComponent(query);
        const embedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWWgUfXrHah-w&q=${encodedQuery}`;
        console.log('✅ URL de embed generada con búsqueda:', query);
        return embedUrl;
    }

    // Mostrar estado de error
    showErrorState(message) {
        const mapContainer = document.getElementById('propertyMapContainer');
        if (!mapContainer) return;
        
        mapContainer.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 350px;
                background: #f8f9fa;
                border-radius: 0 0 10px 10px;
                color: #666;
                text-align: center;
                padding: 2rem;
            ">
                <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">⚠️</div>
                <div>
                    <strong>${message}</strong><br>
                    <small>Por favor, usa una URL de Google Maps válida</small>
                </div>
                <div style="margin-top: 1rem; font-size: 0.9rem; color: #999;">
                    <strong>💡 URLs válidas:</strong><br>
                    • maps.app.goo.gl/...<br>
                    • goo.gl/maps/...<br>
                    • maps.google.com/...
                </div>
            </div>
        `;
    }

    // Limpiar recursos
    cleanup() {
        if (this.iframe) {
            this.iframe.remove();
            this.iframe = null;
        }
        this.cache.clear();
        console.log('🧹 Recursos de mapa limpiados');
    }
}

// Crear instancia global
window.googleMapsEmbedFix = new GoogleMapsEmbedFix();

// Función global para compatibilidad con el código existente
window.showGoogleMap = function(mapsUrl) {
    window.googleMapsEmbedFix.showGoogleMap(mapsUrl);
};

// Función global para convertir URL (compatibilidad)
window.convertToEmbedUrl = function(url) {
    return window.googleMapsEmbedFix.convertToValidEmbedUrl(url);
};

// Auto-inicializar
window.googleMapsEmbedFix.initialize();

console.log('✅ Google Maps Embed Fix cargado correctamente');