/**
 * ===============================================
 * CASA-NUVERA: USER TRACKING & ANALYTICS SYSTEM
 * ===============================================
 * Archivo: js/user-tracking.js
 * Descripción: Sistema completo de tracking de usuarios y lead generation
 * Funcionalidades:
 * - Tracking automático de sesiones
 * - Análisis de comportamiento
 * - Lead scoring en tiempo real
 * - Integración con Supabase
 * ===============================================
 */

class UserTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.leadId = null;
        this.startTime = Date.now();
        this.interactions = [];
        this.pageStartTime = Date.now();
        this.maxScroll = 0;
        this.clickCount = 0;
        this.isActive = true;
        this.inactivityTimer = null;
        this.currentPage = window.location.pathname;
        
        // Configuración
        this.config = {
            inactivityTimeout: 300000, // 5 minutos
            heartbeatInterval: 30000,   // 30 segundos
            saveInterval: 60000,        // 1 minuto
            maxScrollThreshold: 80      // % de scroll para considerar "lectura profunda"
        };
        
        this.init();
    }
    
    /**
     * Inicializar sistema de tracking
     */
    init() {
        this.detectDevice();
        this.createSession();
        this.setupEventListeners();
        this.startHeartbeat();
        this.trackPageView();
        
        console.log('🔥 UserTracker iniciado:', {
            sessionId: this.sessionId,
            page: this.currentPage,
            device: this.deviceInfo
        });
    }
    
    /**
     * Generar ID único de sesión
     */
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Detectar información del dispositivo
     */
    detectDevice() {
        const ua = navigator.userAgent;
        
        this.deviceInfo = {
            userAgent: ua,
            dispositivo: this.getDeviceType(),
            navegador: this.getBrowser(),
            sistemaOperativo: this.getOS(),
            resolucion: `${screen.width}x${screen.height}`,
            idioma: navigator.language,
            zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
    
    getDeviceType() {
        const ua = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
        return 'desktop';
    }
    
    getBrowser() {
        const ua = navigator.userAgent;
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
        if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
        if (ua.includes('Edge')) return 'Edge';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        return 'Unknown';
    }
    
    getOS() {
        const ua = navigator.userAgent;
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        return 'Unknown';
    }
    
    /**
     * Crear sesión inicial en la base de datos
     */
    async createSession() {
        try {
            const sessionData = {
                session_id: this.sessionId,
                inicio_sesion: new Date().toISOString(),
                dispositivo: this.deviceInfo.dispositivo,
                navegador: this.deviceInfo.navegador,
                sistema_operativo: this.deviceInfo.sistemaOperativo,
                resolucion_pantalla: this.deviceInfo.resolucion,
                user_agent: this.deviceInfo.userAgent,
                paginas_visitadas: 1,
                clicks_total: 0,
                scroll_maximo: 0
            };
            
            // Intentar obtener ubicación (opcional)
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        this.location = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        this.updateSessionWithLocation();
                    },
                    error => console.log('Geolocation not available')
                );
            }
            
            const { data, error } = await supabase
                .from('user_sessions')
                .insert([sessionData])
                .select()
                .single();
            
            if (error) {
                console.error('Error creando sesión:', error);
                return;
            }
            
            this.sessionData = data;
            console.log('✅ Sesión creada:', data.id);
            
        } catch (error) {
            console.error('Error en createSession:', error);
        }
    }
    
    /**
     * Actualizar sesión con información de ubicación
     */
    async updateSessionWithLocation() {
        if (!this.sessionData || !this.location) return;
        
        try {
            // Usar API de geocoding para obtener ciudad/país
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${this.location.lat}&longitude=${this.location.lng}&localityLanguage=es`);
            const locationData = await response.json();
            
            await supabase
                .from('user_sessions')
                .update({
                    pais: locationData.countryName || null,
                    ciudad: locationData.city || null,
                    region: locationData.principalSubdivision || null
                })
                .eq('id', this.sessionData.id);
                
        } catch (error) {
            console.log('Error updating location:', error);
        }
    }
    
    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Tracking de scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                if (scrollPercent > this.maxScroll) {
                    this.maxScroll = scrollPercent;
                    this.trackInteraction('scroll_deep', {
                        scroll_percent: scrollPercent,
                        tiempo_en_pagina: Date.now() - this.pageStartTime
                    });
                }
            }, 150);
        });
        
        // Tracking de clicks
        document.addEventListener('click', (e) => {
            this.clickCount++;
            this.trackClick(e);
            this.resetInactivityTimer();
        });
        
        // Tracking de movimiento del mouse (actividad)
        document.addEventListener('mousemove', () => {
            this.resetInactivityTimer();
        });
        
        // Tracking de teclado
        document.addEventListener('keypress', () => {
            this.resetInactivityTimer();
        });
        
        // Cuando el usuario sale de la página
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
        
        // Cuando la página se oculta/muestra
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isActive = false;
            } else {
                this.isActive = true;
                this.resetInactivityTimer();
            }
        });
        
        // Tracking de cambios de página (SPA)
        let currentUrl = location.href;
        new MutationObserver(() => {
            if (location.href !== currentUrl) {
                currentUrl = location.href;
                this.trackPageChange();
            }
        }).observe(document, { subtree: true, childList: true });
    }
    
    /**
     * Tracking de clicks específicos
     */
    trackClick(event) {
        const element = event.target;
        const elementData = {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            textContent: element.textContent?.substring(0, 50) || '',
            href: element.href || null
        };
        
        // Clicks especiales que generan más puntos
        if (element.classList.contains('property-favorite')) {
            this.trackInteraction('property_favorite_click', elementData);
        } else if (element.href && element.href.includes('wa.me')) {
            this.trackInteraction('whatsapp_click', elementData);
        } else if (element.type === 'submit') {
            this.trackInteraction('form_submit', elementData);
        } else {
            this.trackInteraction('click', elementData);
        }
    }
    
    /**
     * Tracking de interacciones específicas
     */
    async trackInteraction(tipo, data = {}) {
        const interaction = {
            session_id: this.sessionData?.id,
            lead_id: this.leadId,
            tipo_interaccion: tipo,
            pagina: this.currentPage,
            timestamp_interaccion: new Date().toISOString(),
            tiempo_en_pagina: Math.round((Date.now() - this.pageStartTime) / 1000),
            posicion_scroll: this.maxScroll,
            datos_adicionales: data
        };
        
        this.interactions.push(interaction);
        
        // Guardar importante inmediatamente
        if (['whatsapp_click', 'form_submit', 'property_favorite'].includes(tipo)) {
            await this.saveInteraction(interaction);
        }
        
        console.log('📊 Interacción tracked:', tipo, data);
    }
    
    /**
     * Guardar interacción en base de datos
     */
    async saveInteraction(interaction) {
        try {
            const { error } = await supabase
                .from('user_interactions')
                .insert([interaction]);
            
            if (error) {
                console.error('Error guardando interacción:', error);
            }
        } catch (error) {
            console.error('Error en saveInteraction:', error);
        }
    }
    
    /**
     * Tracking de visualización de página
     */
    trackPageView() {
        this.trackInteraction('page_view', {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer || null,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Tracking de cambio de página
     */
    trackPageChange() {
        // Finalizar tracking de página anterior
        this.trackInteraction('page_exit', {
            tiempo_total: Math.round((Date.now() - this.pageStartTime) / 1000),
            scroll_maximo: this.maxScroll
        });
        
        // Iniciar tracking de nueva página
        this.currentPage = window.location.pathname;
        this.pageStartTime = Date.now();
        this.maxScroll = 0;
        this.trackPageView();
        
        // Actualizar contador de páginas en sesión
        this.updatePageCount();
    }
    
    /**
     * Actualizar contador de páginas visitadas
     */
    async updatePageCount() {
        if (!this.sessionData) return;
        
        try {
            const { error } = await supabase
                .from('user_sessions')
                .update({ 
                    paginas_visitadas: supabase.raw('paginas_visitadas + 1')
                })
                .eq('id', this.sessionData.id);
                
            if (error) {
                console.error('Error actualizando páginas visitadas:', error);
            }
        } catch (error) {
            console.error('Error en updatePageCount:', error);
        }
    }
    
    /**
     * Timer de inactividad
     */
    resetInactivityTimer() {
        if (!this.isActive) return;
        
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => {
            this.trackInteraction('user_inactive', {
                tiempo_inactivo: this.config.inactivityTimeout / 1000
            });
        }, this.config.inactivityTimeout);
    }
    
    /**
     * Heartbeat para mantener sesión activa
     */
    startHeartbeat() {
        setInterval(() => {
            if (this.isActive && this.sessionData) {
                this.updateSessionStats();
            }
        }, this.config.heartbeatInterval);
        
        // Guardar interacciones pendientes
        setInterval(() => {
            this.saveQueuedInteractions();
        }, this.config.saveInterval);
    }
    
    /**
     * Actualizar estadísticas de sesión
     */
    async updateSessionStats() {
        if (!this.sessionData) return;
        
        try {
            const duracionSegundos = Math.round((Date.now() - this.startTime) / 1000);
            
            const { error } = await supabase
                .from('user_sessions')
                .update({
                    duracion_segundos: duracionSegundos,
                    clicks_total: this.clickCount,
                    scroll_maximo: this.maxScroll,
                    tiempo_inactivo: this.getTotalInactiveTime()
                })
                .eq('id', this.sessionData.id);
                
            if (error) {
                console.error('Error actualizando estadísticas:', error);
            }
        } catch (error) {
            console.error('Error en updateSessionStats:', error);
        }
    }
    
    /**
     * Guardar interacciones en cola
     */
    async saveQueuedInteractions() {
        if (this.interactions.length === 0) return;
        
        try {
            const { error } = await supabase
                .from('user_interactions')
                .insert(this.interactions);
            
            if (error) {
                console.error('Error guardando interacciones en lote:', error);
                return;
            }
            
            // Limpiar cola después de guardado exitoso
            this.interactions = [];
            
        } catch (error) {
            console.error('Error en saveQueuedInteractions:', error);
        }
    }
    
    /**
     * Asociar sesión con lead
     */
    async associateWithLead(leadId) {
        this.leadId = leadId;
        
        if (!this.sessionData) return;
        
        try {
            const { error } = await supabase
                .from('user_sessions')
                .update({ lead_id: leadId })
                .eq('id', this.sessionData.id);
                
            if (error) {
                console.error('Error asociando lead:', error);
                return;
            }
            
            // Actualizar todas las interacciones de esta sesión
            await supabase
                .from('user_interactions')
                .update({ lead_id: leadId })
                .eq('session_id', this.sessionData.id);
                
            console.log('✅ Sesión asociada con lead:', leadId);
            
        } catch (error) {
            console.error('Error en associateWithLead:', error);
        }
    }
    
    /**
     * Tracking específico para favoritos
     */
    async trackFavorite(propertyId, propertyData, action = 'add') {
        if (!this.leadId) {
            console.log('No hay lead asociado para favoritos');
            return;
        }
        
        try {
            if (action === 'add') {
                // Agregar a favoritos
                await supabase
                    .from('property_favorites')
                    .upsert([{
                        lead_id: this.leadId,
                        property_id: propertyId,
                        property_title: propertyData.title,
                        property_price: propertyData.price,
                        property_location: propertyData.location,
                        property_type: propertyData.type,
                        property_bedrooms: propertyData.bedrooms,
                        property_bathrooms: propertyData.bathrooms,
                        property_area: propertyData.area,
                        is_active: true,
                        fecha_agregado: new Date().toISOString()
                    }]);
                    
                this.trackInteraction('property_favorite', {
                    property_id: propertyId,
                    action: 'add',
                    property_data: propertyData
                });
                
            } else {
                // Remover de favoritos
                await supabase
                    .from('property_favorites')
                    .update({
                        is_active: false,
                        fecha_removido: new Date().toISOString()
                    })
                    .eq('lead_id', this.leadId)
                    .eq('property_id', propertyId);
                    
                this.trackInteraction('property_unfavorite', {
                    property_id: propertyId,
                    action: 'remove'
                });
            }
            
            console.log(`✅ Favorito ${action}:`, propertyId);
            
        } catch (error) {
            console.error('Error en trackFavorite:', error);
        }
    }
    
    /**
     * Finalizar sesión
     */
    endSession() {
        if (!this.sessionData) return;
        
        const duracionSegundos = Math.round((Date.now() - this.startTime) / 1000);
        
        // Guardar datos finales de sesión
        navigator.sendBeacon('/api/end-session', JSON.stringify({
            sessionId: this.sessionData.id,
            duracion_segundos: duracionSegundos,
            fin_sesion: new Date().toISOString(),
            clicks_total: this.clickCount,
            scroll_maximo: this.maxScroll,
            interactions: this.interactions
        }));
        
        console.log('🔚 Sesión finalizada:', {
            duracion: duracionSegundos + 's',
            clicks: this.clickCount,
            scroll: this.maxScroll + '%'
        });
    }
    
    /**
     * Obtener tiempo total de inactividad
     */
    getTotalInactiveTime() {
        // Esta es una implementación simplificada
        // En una implementación completa, se llevaría un registro preciso
        return 0;
    }
    
    /**
     * API pública para uso externo
     */
    
    // Método para tracking manual de eventos
    track(eventName, eventData = {}) {
        this.trackInteraction(eventName, eventData);
    }
    
    // Obtener información de sesión actual
    getSessionInfo() {
        return {
            sessionId: this.sessionId,
            leadId: this.leadId,
            duration: Math.round((Date.now() - this.startTime) / 1000),
            pageViews: this.sessionData?.paginas_visitadas || 0,
            clicks: this.clickCount,
            maxScroll: this.maxScroll
        };
    }
    
    // Verificar si el usuario está activo
    isUserActive() {
        return this.isActive;
    }
}

// ===============================================
// INICIALIZACIÓN AUTOMÁTICA
// ===============================================

// Variable global para acceso
window.userTracker = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que Supabase esté disponible
    if (typeof supabase === 'undefined') {
        console.error('⚠️ Supabase no está disponible. UserTracker no se iniciará.');
        return;
    }
    
    // Inicializar tracker
    window.userTracker = new UserTracker();
});

// ===============================================
// UTILIDADES PARA INTEGRACIÓN
// ===============================================

/**
 * Función helper para tracking de favoritos
 * Usar en los botones de favoritos existentes
 */
function trackPropertyFavorite(propertyId, propertyData, isAdding = true) {
    if (window.userTracker && window.userTracker.leadId) {
        window.userTracker.trackFavorite(
            propertyId, 
            propertyData, 
            isAdding ? 'add' : 'remove'
        );
    }
}

/**
 * Función helper para asociar con lead
 * Usar después de que el usuario llene el formulario
 */
function associateUserWithLead(leadId) {
    if (window.userTracker) {
        window.userTracker.associateWithLead(leadId);
    }
}

/**
 * Función helper para tracking manual
 */
function trackUserAction(actionName, actionData = {}) {
    if (window.userTracker) {
        window.userTracker.track(actionName, actionData);
    }
}

console.log('🔥 UserTracker script loaded successfully');
