/**
 * ===============================================
 * CASA-NUVERA: INTEGRACIÓN SISTEMA LEAD GENERATION
 * ===============================================
 * Archivo: js/lead-integration.js
 * Descripción: Integra el sistema de leads con las funcionalidades existentes
 * 
 * Este archivo:
 * - Modifica las funciones toggleFavorite existentes
 * - Conecta el tracking con los favoritos
 * - Mantiene compatibilidad con código existente
 * - Activa el pop-up en lugar de solo marcar favoritos
 * ===============================================
 */

// ===============================================
// CONFIGURACIÓN GLOBAL DEL SISTEMA
// ===============================================

window.LEAD_SYSTEM_CONFIG = {
    enabled: true,
    showPopupOnFirstFavorite: true,
    autoTrackInteractions: true,
    requireLeadForMultipleFavorites: false,
    maxFavoritesWithoutLead: 3,
    debugMode: false
};

// ===============================================
// SISTEMA DE GESTIÓN DE FAVORITOS CON LEADS
// ===============================================

class LeadFavoritesManager {
    constructor() {
        this.favorites = this.loadFavoritesFromStorage();
        this.hasShownPopup = false;
        this.tempFavorites = new Set(); // Para usuarios sin lead
        
        this.init();
    }
    
    init() {
        this.overrideFavoriteFunctions();
        this.loadExistingFavorites();
        
        console.log('🔗 LeadFavoritesManager iniciado');
    }
    
    /**
     * Cargar favoritos existentes del localStorage
     */
    loadFavoritesFromStorage() {
        try {
            const stored = localStorage.getItem('casaNuveraFavorites');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error cargando favoritos:', error);
            return [];
        }
    }
    
    /**
     * Cargar estado de favoritos existentes en la página
     */
    loadExistingFavorites() {
        this.favorites.forEach(propId => {
            const favoriteBtn = document.getElementById(`fav_${propId}`);
            if (favoriteBtn) {
                favoriteBtn.classList.add('active');
            }
        });
    }
    
    /**
     * Override de las funciones toggleFavorite existentes
     */
    overrideFavoriteFunctions() {
        // Backup original function if exists
        if (window.originalToggleFavorite) {
            console.log('⚠️ toggleFavorite ya fue modificada anteriormente');
            return;
        }
        
        // Save original function
        window.originalToggleFavorite = window.toggleFavorite || function() {};
        
        // Override global toggleFavorite
        window.toggleFavorite = (propertyId, event, propertyData) => {
            event?.stopPropagation?.();
            this.handleFavoriteClick(propertyId, propertyData);
        };
        
        console.log('✅ Función toggleFavorite modificada');
    }
    
    /**
     * Manejar clic en favorito - lógica principal
     */
    async handleFavoriteClick(propertyId, propertyData = null) {
        const favoriteBtn = document.getElementById(`fav_${propertyId}`);
        if (!favoriteBtn) {
            console.error('No se encontró botón de favorito:', propertyId);
            return;
        }
        
        const isCurrentlyFavorite = favoriteBtn.classList.contains('active');
        
        // Si ya es favorito, solo removemos
        if (isCurrentlyFavorite) {
            this.removeFavorite(propertyId, propertyData);
            return;
        }
        
        // Si no es favorito, verificamos si necesitamos mostrar popup
        const shouldShowPopup = this.shouldShowLeadPopup();
        
        if (shouldShowPopup && !this.hasShownPopup) {
            // Mostrar popup para capturar lead
            this.showLeadPopupForFavorite(propertyId, propertyData);
        } else {
            // Agregar a favoritos directamente
            this.addFavorite(propertyId, propertyData);
        }
    }
    
    /**
     * Determinar si debemos mostrar el popup de lead
     */
    shouldShowLeadPopup() {
        if (!window.LEAD_SYSTEM_CONFIG.enabled) return false;
        if (!window.LEAD_SYSTEM_CONFIG.showPopupOnFirstFavorite) return false;
        if (window.userTracker && window.userTracker.leadId) return false; // Ya tiene lead
        
        // Mostrar popup si es el primer favorito o ha alcanzado el límite
        const totalFavorites = this.favorites.length + this.tempFavorites.size;
        return totalFavorites === 0 || totalFavorites >= window.LEAD_SYSTEM_CONFIG.maxFavoritesWithoutLead;
    }
    
    /**
     * Mostrar popup de lead para favorito
     */
    showLeadPopupForFavorite(propertyId, propertyData) {
        if (!propertyData) {
            propertyData = this.extractPropertyDataFromDOM(propertyId);
        }
        
        // Marcar que el popup se mostrará
        this.hasShownPopup = true;
        
        // Agregar temporalmente a favoritos para UX inmediata
        this.addFavoriteVisually(propertyId);
        this.tempFavorites.add(propertyId);
        
        // Track que se va a mostrar el popup
        if (window.userTracker) {
            window.userTracker.track('favorite_trigger_popup', {
                property_id: propertyId,
                total_favorites: this.favorites.length,
                temp_favorites: this.tempFavorites.size
            });
        }
        
        // Mostrar popup con callback para cuando se complete
        if (window.leadPopup) {
            // Override del método close del popup para manejar cancelación
            const originalClose = window.leadPopup.close;
            window.leadPopup.close = () => {
                // Si cierra sin completar, remover de temporales
                if (this.tempFavorites.has(propertyId)) {
                    this.removeFavoriteVisually(propertyId);
                    this.tempFavorites.delete(propertyId);
                }
                originalClose.call(window.leadPopup);
                // Restaurar función original
                window.leadPopup.close = originalClose;
            };
            
            // Mostrar popup
            window.leadPopup.show(propertyData);
            
            // Escuchar cuando se complete el lead
            this.waitForLeadCompletion(propertyId, propertyData);
        }
    }
    
    /**
     * Esperar a que se complete el lead
     */
    waitForLeadCompletion(propertyId, propertyData) {
        const checkInterval = setInterval(() => {
            // Verificar si el usuario ahora tiene un leadId
            if (window.userTracker && window.userTracker.leadId) {
                clearInterval(checkInterval);
                
                // Mover de temporal a permanente
                this.tempFavorites.delete(propertyId);
                this.addFavorite(propertyId, propertyData, false); // false = no mostrar visualmente (ya está)
                
                console.log('✅ Lead completado, favorito confirmado:', propertyId);
            }
        }, 1000);
        
        // Timeout después de 5 minutos
        setTimeout(() => clearInterval(checkInterval), 300000);
    }
    
    /**
     * Agregar favorito
     */
    addFavorite(propertyId, propertyData, updateVisual = true) {
        if (this.favorites.includes(propertyId)) return;
        
        // Agregar a la lista
        this.favorites.push(propertyId);
        this.saveFavoritesToStorage();
        
        // Actualizar visual si es necesario
        if (updateVisual) {
            this.addFavoriteVisually(propertyId);
        }
        
        // Track la acción
        if (window.userTracker) {
            if (window.userTracker.leadId && propertyData) {
                // Usuario con lead - guardar en BD
                window.userTracker.trackFavorite(propertyId, propertyData, 'add');
            } else {
                // Usuario sin lead - solo tracking
                window.userTracker.track('property_favorite_temp', {
                    property_id: propertyId,
                    has_lead: false
                });
            }
        }
        
        console.log('❤️ Favorito agregado:', propertyId);
        this.showFavoriteNotification('Propiedad agregada a favoritos');
    }
    
    /**
     * Remover favorito
     */
    removeFavorite(propertyId, propertyData) {
        // Remover de lista permanente
        this.favorites = this.favorites.filter(id => id !== propertyId);
        this.saveFavoritesToStorage();
        
        // Remover de temporales si existe
        this.tempFavorites.delete(propertyId);
        
        // Actualizar visual
        this.removeFavoriteVisually(propertyId);
        
        // Track la acción
        if (window.userTracker) {
            if (window.userTracker.leadId && propertyData) {
                // Usuario con lead - remover de BD
                window.userTracker.trackFavorite(propertyId, propertyData, 'remove');
            } else {
                // Usuario sin lead - solo tracking
                window.userTracker.track('property_unfavorite_temp', {
                    property_id: propertyId,
                    has_lead: false
                });
            }
        }
        
        console.log('💔 Favorito removido:', propertyId);
        this.showFavoriteNotification('Propiedad removida de favoritos');
    }
    
    /**
     * Actualización visual - agregar
     */
    addFavoriteVisually(propertyId) {
        const favoriteBtn = document.getElementById(`fav_${propertyId}`);
        if (favoriteBtn) {
            favoriteBtn.classList.add('active');
            
            // Animación de corazón
            favoriteBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                favoriteBtn.style.transform = 'scale(1)';
            }, 150);
        }
    }
    
    /**
     * Actualización visual - remover
     */
    removeFavoriteVisually(propertyId) {
        const favoriteBtn = document.getElementById(`fav_${propertyId}`);
        if (favoriteBtn) {
            favoriteBtn.classList.remove('active');
            
            // Animación de desvanecimiento
            favoriteBtn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                favoriteBtn.style.transform = 'scale(1)';
            }, 150);
        }
    }
    
    /**
     * Extraer datos de propiedad desde el DOM
     */
    extractPropertyDataFromDOM(propertyId) {
        // Buscar la card de la propiedad
        const propertyCard = document.querySelector(`[onclick*="${propertyId}"], [data-property-id="${propertyId}"]`);
        if (!propertyCard) {
            console.warn('No se pudo encontrar datos de propiedad para:', propertyId);
            return { id: propertyId };
        }
        
        // Extraer información básica
        const title = propertyCard.querySelector('.property-title')?.textContent?.trim() || 'Propiedad';
        const location = propertyCard.querySelector('.property-subtitle')?.textContent?.trim() || '';
        const priceElement = propertyCard.querySelector('.property-price-badge');
        const imageElement = propertyCard.querySelector('.property-image img');
        
        // Extraer precio
        let price = null;
        let currency = 'CLP';
        if (priceElement) {
            const priceText = priceElement.textContent.trim();
            const priceMatch = priceText.match(/([0-9.,]+)\s*(UF|CLP|$)?/);
            if (priceMatch) {
                price = parseInt(priceMatch[1].replace(/[.,]/g, ''));
                currency = priceMatch[2] === 'UF' ? 'UF' : 'CLP';
            }
        }
        
        // Extraer características
        const bedroomsElement = propertyCard.querySelector('.property-feature:nth-child(1)');
        const bathroomsElement = propertyCard.querySelector('.property-feature:nth-child(2)');
        const areaElement = propertyCard.querySelector('.property-feature:nth-child(3)');
        
        const bedrooms = bedroomsElement ? parseInt(bedroomsElement.textContent.match(/\d+/)?.[0] || 0) : 0;
        const bathrooms = bathroomsElement ? parseInt(bathroomsElement.textContent.match(/\d+/)?.[0] || 0) : 0;
        const area = areaElement ? parseInt(areaElement.textContent.match(/\d+/)?.[0] || 0) : 0;
        
        return {
            id: propertyId,
            title,
            location,
            price,
            currency,
            bedrooms,
            bathrooms,
            area,
            image: imageElement?.src || null,
            type: window.location.pathname.includes('arriendo') ? 'arriendo' : 'compra'
        };
    }
    
    /**
     * Mostrar notificación de favorito
     */
    showFavoriteNotification(message) {
        // Crear notificación toast
        const notification = document.createElement('div');
        notification.className = 'favorite-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                ${message}
            </div>
        `;
        
        // Estilos inline para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            font-size: 0.9rem;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Animación de entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto-remove después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * Guardar favoritos en localStorage
     */
    saveFavoritesToStorage() {
        try {
            localStorage.setItem('casaNuveraFavorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Error guardando favoritos:', error);
        }
    }
    
    /**
     * API pública
     */
    getFavorites() {
        return [...this.favorites];
    }
    
    isFavorite(propertyId) {
        return this.favorites.includes(propertyId) || this.tempFavorites.has(propertyId);
    }
    
    getTotalFavorites() {
        return this.favorites.length + this.tempFavorites.size;
    }
}

// ===============================================
// MEJORAS EN LA INTEGRACIÓN CON PÁGINAS
// ===============================================

/**
 * Mejorar las funciones renderProperties existentes
 */
function enhancePropertyRendering() {
    // Interceptar y mejorar funciones renderProperties existentes
    if (window.renderProperties) {
        const originalRenderProperties = window.renderProperties;
        
        window.renderProperties = function(...args) {
            // Llamar función original
            const result = originalRenderProperties.apply(this, args);
            
            // Mejorar después del render
            setTimeout(() => {
                enhanceRenderedProperties();
            }, 100);
            
            return result;
        };
    }
}

/**
 * Mejorar propiedades ya renderizadas
 */
function enhanceRenderedProperties() {
    // Agregar data-property-id a las cards que no lo tengan
    document.querySelectorAll('.property-card').forEach((card, index) => {
        if (!card.hasAttribute('data-property-id')) {
            // Intentar extraer ID del onclick o generar uno
            const onclick = card.getAttribute('onclick');
            let propertyId = null;
            
            if (onclick) {
                const match = onclick.match(/goToProperty\((\d+)\)/);
                propertyId = match ? match[1] : `prop_${index}`;
            } else {
                propertyId = `prop_${index}`;
            }
            
            card.setAttribute('data-property-id', propertyId);
        }
    });
    
    // Verificar que los botones de favorito tengan el onclick correcto
    document.querySelectorAll('.property-favorite').forEach(btn => {
        if (!btn.onclick) {
            const propertyId = btn.id?.replace('fav_', '') || 'unknown';
            btn.setAttribute('onclick', `toggleFavorite('${propertyId}', event)`);
        }
    });
}

// ===============================================
// INICIALIZACIÓN DEL SISTEMA
// ===============================================

// Variables globales
window.leadFavoritesManager = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar dependencias
    if (typeof supabase === 'undefined') {
        console.error('⚠️ Supabase no está disponible. Sistema de leads no se iniciará.');
        return;
    }
    
    // Inicializar sistema de favoritos con leads
    window.leadFavoritesManager = new LeadFavoritesManager();
    
    // Mejorar rendering de propiedades
    enhancePropertyRendering();
    
    // Mejorar propiedades ya renderizadas
    setTimeout(enhanceRenderedProperties, 500);
    
    console.log('🚀 Sistema de Lead Generation completamente integrado');
});

// ===============================================
// API PÚBLICA PARA USO EXTERNO
// ===============================================

/**
 * Funciones helper para uso en el sitio
 */

// Forzar mostrar popup para una propiedad
window.showLeadPopupForProperty = function(propertyData) {
    if (window.leadPopup) {
        window.leadPopup.show(propertyData);
    }
};

// Verificar si usuario tiene lead
window.userHasLead = function() {
    return window.userTracker && window.userTracker.leadId;
};

// Obtener información del usuario actual
window.getCurrentUserInfo = function() {
    if (!window.userTracker) return null;
    
    return {
        sessionId: window.userTracker.sessionId,
        leadId: window.userTracker.leadId,
        sessionInfo: window.userTracker.getSessionInfo(),
        favorites: window.leadFavoritesManager?.getFavorites() || []
    };
};

// Activar/desactivar sistema
window.toggleLeadSystem = function(enabled) {
    window.LEAD_SYSTEM_CONFIG.enabled = enabled;
    console.log(`🎯 Sistema de leads ${enabled ? 'activado' : 'desactivado'}`);
};

// Debug del sistema
window.debugLeadSystem = function() {
    console.log('🔍 Estado del sistema de leads:', {
        config: window.LEAD_SYSTEM_CONFIG,
        userTracker: window.userTracker?.getSessionInfo(),
        favorites: window.leadFavoritesManager?.getFavorites(),
        hasLead: window.userHasLead()
    });
};

console.log('🔗 Lead Integration System loaded successfully');
