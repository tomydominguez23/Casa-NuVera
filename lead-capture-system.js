/* ==============================================
   📊 SISTEMA DE CAPTURA DE LEADS - CASA NUVERA
   Sistema inteligente para capturar y gestionar leads
   ============================================== */

class LeadCaptureSystem {
    constructor(config = {}) {
        this.config = {
            supabaseUrl: config.supabaseUrl || null,
            supabaseKey: config.supabaseKey || null,
            webhookUrl: config.webhookUrl || null,
            enableAnalytics: config.enableAnalytics !== false,
            debugMode: config.debugMode || false,
            ...config
        };
        
        this.leads = new Map();
        this.sessions = new Map();
        this.analytics = {
            totalVisitors: 0,
            totalLeads: 0,
            conversionRate: 0,
            topPages: {},
            leadSources: {}
        };
        
        this.init();
    }

    /* ================================
       🚀 INICIALIZACIÓN
       ================================ */
    init() {
        this.setupSessionTracking();
        this.loadStoredData();
        this.startAnalyticsTracking();
        
        if (this.config.debugMode) {
            console.log('📊 Lead Capture System iniciado');
            this.createDebugPanel();
        }
        
        // Hacer disponible globalmente
        window.leadSystem = this;
    }

    /* ================================
       👤 GESTIÓN DE SESIONES
       ================================ */
    setupSessionTracking() {
        this.sessionId = this.generateSessionId();
        this.visitStart = Date.now();
        this.pageViews = [];
        this.events = [];
        
        // Trackear página actual
        this.trackPageView(window.location.pathname);
        
        // Eventos de salida
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
        
        // Trackear cambios de página (para SPAs)
        let currentPath = window.location.pathname;
        setInterval(() => {
            if (window.location.pathname !== currentPath) {
                currentPath = window.location.pathname;
                this.trackPageView(currentPath);
            }
        }, 1000);
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    trackPageView(path) {
        const pageView = {
            path: path,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || null,
            userAgent: navigator.userAgent
        };
        
        this.pageViews.push(pageView);
        this.analytics.topPages[path] = (this.analytics.topPages[path] || 0) + 1;
        
        if (this.config.debugMode) {
            console.log('📄 Página visitada:', path);
        }
    }

    /* ================================
       🎯 CAPTURA DE LEADS
       ================================ */
    async handleNewLead(leadData) {
        const lead = this.createLeadObject(leadData);
        
        // Guardar en memoria y localStorage
        this.leads.set(lead.id, lead);
        this.saveToLocalStorage();
        
        // Actualizar analytics
        this.analytics.totalLeads++;
        this.updateConversionRate();
        
        // Enviar a servicios externos
        await this.sendToExternalServices(lead);
        
        // Disparar eventos personalizados
        this.dispatchLeadEvent('new_lead', lead);
        
        if (this.config.debugMode) {
            console.log('🎯 Nuevo lead capturado:', lead);
        }
        
        return lead;
    }

    createLeadObject(data) {
        const leadId = this.generateLeadId();
        
        return {
            id: leadId,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            
            // Información personal
            name: data.name || null,
            email: data.email || null,
            phone: data.phone || null,
            
            // Información de búsqueda
            interest: data.interest || null, // 'buy', 'rent', 'invest', 'sell'
            budget: data.budget || null,
            preferredAreas: data.preferredAreas || [],
            requirements: {
                bedrooms: data.requirements?.bedrooms || null,
                bathrooms: data.requirements?.bathrooms || null,
                propertyType: data.requirements?.propertyType || null,
                minSurface: data.requirements?.minSurface || null,
                parking: data.requirements?.parking || null,
                furnished: data.requirements?.furnished || null
            },
            
            // Estado del lead
            stage: data.stage || 'discovery',
            leadScore: data.leadScore || 0,
            quality: this.calculateLeadQuality(data),
            
            // Información de comportamiento
            source: this.detectLeadSource(),
            visitedProperties: data.visitedProperties || [],
            pageViews: [...this.pageViews],
            events: [...this.events],
            timeOnSite: Date.now() - this.visitStart,
            
            // Información técnica
            userAgent: navigator.userAgent,
            referrer: document.referrer || null,
            utmParams: this.getUtmParameters(),
            location: this.getGeolocation(),
            
            // Metadatos
            notes: [],
            tags: this.generateLeadTags(data),
            lastInteraction: new Date().toISOString(),
            followUpDate: this.calculateFollowUpDate(data)
        };
    }

    generateLeadId() {
        return 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    calculateLeadQuality(data) {
        let quality = 'cold';
        let score = data.leadScore || 0;
        
        // Factores de calidad
        if (data.phone) score += 25;
        if (data.email) score += 20;
        if (data.budget) score += 20;
        if (data.interest) score += 15;
        if (data.preferredAreas?.length > 0) score += 10;
        if (data.requirements?.bedrooms) score += 10;
        
        // Comportamiento
        if (this.pageViews.length > 3) score += 10;
        if (this.events.length > 5) score += 10;
        
        // Clasificar
        if (score >= 70) quality = 'hot';
        else if (score >= 40) quality = 'warm';
        else quality = 'cold';
        
        return { score, quality };
    }

    detectLeadSource() {
        const referrer = document.referrer;
        const utm = this.getUtmParameters();
        
        if (utm.source) return utm.source;
        if (referrer.includes('google')) return 'google';
        if (referrer.includes('facebook')) return 'facebook';
        if (referrer.includes('instagram')) return 'instagram';
        if (referrer.includes('whatsapp')) return 'whatsapp';
        if (referrer) return 'referral';
        return 'direct';
    }

    getUtmParameters() {
        const params = new URLSearchParams(window.location.search);
        return {
            source: params.get('utm_source'),
            medium: params.get('utm_medium'),
            campaign: params.get('utm_campaign'),
            term: params.get('utm_term'),
            content: params.get('utm_content')
        };
    }

    getGeolocation() {
        // Implementar con API de geolocalización o IP
        return {
            country: null,
            region: null,
            city: null,
            coordinates: null
        };
    }

    generateLeadTags(data) {
        const tags = [];
        
        if (data.interest) tags.push(data.interest);
        if (data.budget) tags.push('has-budget');
        if (data.phone) tags.push('has-contact');
        if (data.leadScore > 50) tags.push('high-intent');
        if (this.pageViews.length > 5) tags.push('engaged');
        
        const source = this.detectLeadSource();
        if (source !== 'direct') tags.push(`source-${source}`);
        
        return tags;
    }

    calculateFollowUpDate(data) {
        const now = new Date();
        const quality = this.calculateLeadQuality(data).quality;
        
        switch (quality) {
            case 'hot': 
                // Contactar inmediatamente
                return new Date(now.getTime() + 5 * 60 * 1000); // 5 minutos
            case 'warm': 
                // Contactar en las próximas 2 horas
                return new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 horas
            case 'cold': 
            default: 
                // Contactar al día siguiente
                return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas
        }
    }

    /* ================================
       📊 TRACKING DE EVENTOS
       ================================ */
    trackEvent(eventType, eventData = {}) {
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            data: eventData
        };
        
        this.events.push(event);
        
        // Eventos especiales que podrían generar leads
        if (this.isLeadGeneratingEvent(eventType, eventData)) {
            this.considerLeadGeneration(event);
        }
        
        if (this.config.debugMode) {
            console.log('📊 Evento:', eventType, eventData);
        }
    }

    trackWidgetEvent(eventType, eventData = {}) {
        this.trackEvent(`widget_${eventType}`, eventData);
    }

    isLeadGeneratingEvent(eventType, eventData) {
        const leadEvents = [
            'whatsapp_direct',
            'contact_form_submit',
            'phone_click',
            'email_click',
            'property_inquiry',
            'visit_request',
            'financing_inquiry'
        ];
        
        return leadEvents.includes(eventType) || eventData.leadScore > 30;
    }

    considerLeadGeneration(event) {
        // Si el evento sugiere interés alto, intentar generar lead
        const syntheticLeadData = {
            leadScore: event.data.leadScore || 30,
            interest: event.data.interest,
            stage: 'qualification',
            source: event.type
        };
        
        // Solo crear lead si no existe ya uno para esta sesión
        if (!this.hasLeadForSession()) {
            this.handleNewLead(syntheticLeadData);
        }
    }

    hasLeadForSession() {
        return Array.from(this.leads.values())
            .some(lead => lead.sessionId === this.sessionId);
    }

    /* ================================
       💾 PERSISTENCIA DE DATOS
       ================================ */
    saveToLocalStorage() {
        try {
            const data = {
                leads: Array.from(this.leads.entries()),
                analytics: this.analytics,
                lastUpdate: new Date().toISOString()
            };
            
            localStorage.setItem('casa_nuvera_leads', JSON.stringify(data));
        } catch (error) {
            console.warn('Error guardando datos localmente:', error);
        }
    }

    loadStoredData() {
        try {
            const stored = localStorage.getItem('casa_nuvera_leads');
            if (stored) {
                const data = JSON.parse(stored);
                
                // Restaurar leads
                if (data.leads) {
                    this.leads = new Map(data.leads);
                }
                
                // Restaurar analytics
                if (data.analytics) {
                    this.analytics = { ...this.analytics, ...data.analytics };
                }
            }
        } catch (error) {
            console.warn('Error cargando datos almacenados:', error);
        }
    }

    /* ================================
       🌐 INTEGRACIÓN CON SERVICIOS EXTERNOS
       ================================ */
    async sendToExternalServices(lead) {
        // Supabase
        if (this.config.supabaseUrl && this.config.supabaseKey) {
            await this.sendToSupabase(lead);
        }
        
        // Webhook genérico
        if (this.config.webhookUrl) {
            await this.sendToWebhook(lead);
        }
        
        // Email notification
        await this.sendEmailNotification(lead);
    }

    async sendToSupabase(lead) {
        try {
            const { createClient } = supabase;
            const supabaseClient = createClient(
                this.config.supabaseUrl, 
                this.config.supabaseKey
            );
            
            const { data, error } = await supabaseClient
                .from('leads')
                .insert([lead]);
                
            if (error) throw error;
            
            console.log('✅ Lead enviado a Supabase');
        } catch (error) {
            console.warn('❌ Error enviando a Supabase:', error);
        }
    }

    async sendToWebhook(lead) {
        try {
            const response = await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'new_lead',
                    timestamp: new Date().toISOString(),
                    lead: lead
                })
            });
            
            if (response.ok) {
                console.log('✅ Lead enviado a webhook');
            }
        } catch (error) {
            console.warn('❌ Error enviando a webhook:', error);
        }
    }

    async sendEmailNotification(lead) {
        // Implementar con servicio de email (EmailJS, etc.)
        if (lead.quality.quality === 'hot' && window.emailjs) {
            try {
                await window.emailjs.send(
                    'casa_nuvera_service',
                    'new_lead_template',
                    {
                        lead_name: lead.name || 'Sin nombre',
                        lead_email: lead.email || 'Sin email',
                        lead_phone: lead.phone || 'Sin teléfono',
                        lead_score: lead.leadScore,
                        lead_interest: lead.interest || 'No especificado',
                        lead_source: lead.source
                    }
                );
                console.log('📧 Notificación de lead enviada');
            } catch (error) {
                console.warn('❌ Error enviando email:', error);
            }
        }
    }

    /* ================================
       📈 ANALYTICS Y REPORTES
       ================================ */
    updateConversionRate() {
        this.analytics.totalVisitors = this.analytics.totalVisitors || 0;
        if (this.analytics.totalVisitors > 0) {
            this.analytics.conversionRate = 
                (this.analytics.totalLeads / this.analytics.totalVisitors) * 100;
        }
    }

    startAnalyticsTracking() {
        // Incrementar visitantes únicos
        if (!sessionStorage.getItem('casa_nuvera_visitor_counted')) {
            this.analytics.totalVisitors++;
            sessionStorage.setItem('casa_nuvera_visitor_counted', 'true');
        }
        
        // Actualizar métricas cada 30 segundos
        setInterval(() => {
            this.updateAnalytics();
            this.saveToLocalStorage();
        }, 30000);
    }

    updateAnalytics() {
        // Calcular métricas en tiempo real
        this.updateConversionRate();
        
        // Fuentes de leads
        this.analytics.leadSources = {};
        for (const lead of this.leads.values()) {
            const source = lead.source || 'unknown';
            this.analytics.leadSources[source] = 
                (this.analytics.leadSources[source] || 0) + 1;
        }
    }

    getAnalyticsReport() {
        const leads = Array.from(this.leads.values());
        
        return {
            summary: {
                totalVisitors: this.analytics.totalVisitors,
                totalLeads: this.analytics.totalLeads,
                conversionRate: this.analytics.conversionRate.toFixed(2) + '%',
                avgLeadScore: leads.length > 0 
                    ? (leads.reduce((sum, lead) => sum + lead.leadScore, 0) / leads.length).toFixed(1)
                    : 0
            },
            leadQuality: {
                hot: leads.filter(l => l.quality.quality === 'hot').length,
                warm: leads.filter(l => l.quality.quality === 'warm').length,
                cold: leads.filter(l => l.quality.quality === 'cold').length
            },
            sources: this.analytics.leadSources,
            topPages: this.analytics.topPages,
            recentLeads: leads
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10)
        };
    }

    /* ================================
       🎨 PANEL DE DEBUG
       ================================ */
    createDebugPanel() {
        if (document.getElementById('leadSystemDebug')) return;
        
        const panel = document.createElement('div');
        panel.id = 'leadSystemDebug';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            width: 300px;
            max-height: 400px;
            background: white;
            border: 2px solid #25d366;
            border-radius: 8px;
            padding: 16px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        `;
        
        this.updateDebugPanel();
        document.body.appendChild(panel);
        
        // Actualizar cada 5 segundos
        setInterval(() => {
            this.updateDebugPanel();
        }, 5000);
    }

    updateDebugPanel() {
        const panel = document.getElementById('leadSystemDebug');
        if (!panel) return;
        
        const report = this.getAnalyticsReport();
        
        panel.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #25d366;">📊 Lead System Debug</h4>
            <div><strong>Sesión:</strong> ${this.sessionId}</div>
            <div><strong>Páginas vistas:</strong> ${this.pageViews.length}</div>
            <div><strong>Eventos:</strong> ${this.events.length}</div>
            <div><strong>Leads:</strong> ${report.summary.totalLeads}</div>
            <div><strong>Conversión:</strong> ${report.summary.conversionRate}</div>
            <hr style="margin: 10px 0;">
            <div><strong>Calidad de leads:</strong></div>
            <div>🔥 Hot: ${report.leadQuality.hot}</div>
            <div>🔥 Warm: ${report.leadQuality.warm}</div>
            <div>❄️ Cold: ${report.leadQuality.cold}</div>
            <hr style="margin: 10px 0;">
            <div><strong>Últimos eventos:</strong></div>
            ${this.events.slice(-3).map(event => `
                <div style="font-size: 10px; margin: 2px 0;">
                    ${event.type} - ${new Date(event.timestamp).toLocaleTimeString()}
                </div>
            `).join('')}
        `;
    }

    /* ================================
       🎪 EVENTOS PERSONALIZADOS
       ================================ */
    dispatchLeadEvent(eventType, leadData) {
        const event = new CustomEvent(`casa_nuvera_${eventType}`, {
            detail: leadData
        });
        
        window.dispatchEvent(event);
    }

    /* ================================
       🔧 UTILIDADES
       ================================ */
    endSession() {
        this.trackEvent('session_end', {
            duration: Date.now() - this.visitStart,
            pageViews: this.pageViews.length,
            events: this.events.length
        });
        
        this.saveToLocalStorage();
    }

    // Método público para obtener leads
    getAllLeads() {
        return Array.from(this.leads.values());
    }

    // Método público para obtener un lead específico
    getLead(leadId) {
        return this.leads.get(leadId);
    }

    // Método público para actualizar un lead
    updateLead(leadId, updates) {
        const lead = this.leads.get(leadId);
        if (lead) {
            const updatedLead = { ...lead, ...updates, lastInteraction: new Date().toISOString() };
            this.leads.set(leadId, updatedLead);
            this.saveToLocalStorage();
            this.dispatchLeadEvent('lead_updated', updatedLead);
            return updatedLead;
        }
        return null;
    }
}

/* ================================
   🚀 INICIALIZACIÓN AUTOMÁTICA
   ================================ */
function initLeadCaptureSystem(config = {}) {
    if (window.leadSystem) return window.leadSystem;
    
    // Configuración por defecto para Casa Nuvera
    const defaultConfig = {
        enableAnalytics: true,
        debugMode: localStorage.getItem('casa_nuvera_debug') === 'true',
        webhookUrl: null, // Configurar con tu webhook
        supabaseUrl: null, // Configurar con tu Supabase URL
        supabaseKey: null  // Configurar con tu Supabase key
    };
    
    return new LeadCaptureSystem({ ...defaultConfig, ...config });
}

// Auto-inicializar si no está en modo manual
if (typeof window !== 'undefined' && !window.leadSystemManualInit) {
    document.addEventListener('DOMContentLoaded', () => {
        initLeadCaptureSystem();
    });
}

// Exportar para uso manual
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LeadCaptureSystem, initLeadCaptureSystem };
}