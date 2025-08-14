/* ==============================================
   🤖 WIDGET WHATSAPP CASA NUVERA - AUTOMATIZACIÓN
   Sistema inteligente de chat automatizado
   ============================================== */

class WhatsAppWidget {
    constructor(config = {}) {
        // Configuración por defecto
        this.config = {
            phoneNumber: '+56912345678',
            companyName: 'Casa Nuvera',
            agentName: 'Equipo Casa Nuvera',
            businessHours: {
                start: 9,
                end: 19,
                timezone: 'America/Santiago'
            },
            autoShowDelay: 15000, // 15 segundos
            tooltipDelay: 8000,   // 8 segundos
            ...config
        };

        // Estado del widget
        this.isOpen = false;
        this.hasBeenOpened = false;
        this.currentPage = this.detectPageType();
        this.visitStartTime = Date.now();
        
        // Templates de mensajes por página
        this.messageTemplates = this.getMessageTemplates();
        
        // Inicializar
        this.init();
    }

    /* ================================
       INICIALIZACIÓN DEL WIDGET
       ================================ */
    init() {
        this.createWidget();
        this.attachEventListeners();
        this.startAutomation();
        
        // Marcar como cargado
        setTimeout(() => {
            const widget = document.querySelector('.whatsapp-widget');
            if (widget) widget.classList.add('loaded');
        }, 500);
        
        console.log('🤖 Widget WhatsApp inicializado para página:', this.currentPage);
    }

    /* ================================
       DETECCIÓN AUTOMÁTICA DE PÁGINA
       ================================ */
    detectPageType() {
        const path = window.location.pathname;
        const url = window.location.href;
        
        if (path.includes('propiedad.html') || url.includes('propiedad.html')) {
            return 'property';
        } else if (path.includes('compras.html')) {
            return 'buy';
        } else if (path.includes('arriendos.html')) {
            return 'rent';
        } else if (path.includes('servicios.html')) {
            return 'services';
        } else if (path.includes('contacto.html')) {
            return 'contact';
        } else if (path.includes('nosotros.html')) {
            return 'about';
        } else if (path.includes('index.html') || path === '/' || path === '') {
            return 'home';
        }
        return 'other';
    }

    /* ================================
       TEMPLATES DE MENSAJES AUTOMÁTICOS
       ================================ */
    getMessageTemplates() {
        return {
            home: {
                welcome: '¡Hola! 👋 Bienvenido a Casa Nuvera',
                intro: 'Somos expertos en propiedades en Santiago. ¿En qué te podemos ayudar hoy?',
                quickActions: [
                    '🏠 Ver propiedades en venta',
                    '🏢 Propiedades en arriendo',
                    '💰 Solicitar tasación',
                    '📞 Hablar con un asesor'
                ]
            },
            buy: {
                welcome: '¡Perfecto! 🏠 Veo que estás buscando comprar',
                intro: 'Te ayudamos a encontrar tu hogar ideal. ¿Qué tipo de propiedad te interesa?',
                quickActions: [
                    '🏘️ Casas en venta',
                    '🏢 Departamentos',
                    '💰 Consultar financiamiento',
                    '📊 Ver todas las opciones'
                ]
            },
            rent: {
                welcome: '🏢 ¡Genial! Te ayudamos con arriendos',
                intro: '¿Buscas una propiedad para arrendar? Tenemos excelentes opciones disponibles.',
                quickActions: [
                    '🏠 Ver arriendos disponibles',
                    '📋 Requisitos para arrendar',
                    '💭 Consultar garantías',
                    '📞 Asesoría personalizada'
                ]
            },
            property: {
                welcome: '👀 Veo que estás viendo una propiedad específica',
                intro: '¿Te interesa esta propiedad? Puedo darte más información al instante.',
                quickActions: [
                    '📋 Más detalles de esta propiedad',
                    '📅 Agendar visita',
                    '💰 Consultar precio',
                    '📞 Hablar con asesor'
                ]
            },
            services: {
                welcome: '🔧 ¡Interesado en nuestros servicios!',
                intro: 'Ofrecemos tasaciones, asesorías y gestión inmobiliaria completa.',
                quickActions: [
                    '📊 Solicitar tasación',
                    '🏗️ Asesoría en inversiones',
                    '📋 Gestión de propiedades',
                    '💬 Consulta personalizada'
                ]
            },
            contact: {
                welcome: '📞 ¡Excelente! Quieres contactarnos',
                intro: 'Estoy aquí para ayudarte de inmediato. ¿Cuál es tu consulta?',
                quickActions: [
                    '📱 Llamada inmediata',
                    '📧 Enviar email',
                    '📅 Agendar reunión',
                    '💬 Chatear ahora'
                ]
            },
            about: {
                welcome: '🏢 Conociendo más sobre Casa Nuvera',
                intro: 'Somos una corredora innovadora con años de experiencia. ¿Te ayudamos con algo específico?',
                quickActions: [
                    '🏠 Ver nuestras propiedades',
                    '👥 Conocer al equipo',
                    '📈 Nuestros resultados',
                    '💬 Hacer una consulta'
                ]
            },
            other: {
                welcome: '👋 ¡Hola! Bienvenido a Casa Nuvera',
                intro: '¿En qué podemos ayudarte hoy?',
                quickActions: [
                    '🏠 Ver propiedades',
                    '💰 Solicitar tasación',
                    '📞 Contactar asesor',
                    '❓ Hacer consulta'
                ]
            }
        };
    }

    /* ================================
       CREACIÓN DEL HTML DEL WIDGET
       ================================ */
    createWidget() {
        const widgetHTML = `
            <div class="whatsapp-widget" id="whatsappWidget">
                <!-- Tooltip de bienvenida -->
                <div class="whatsapp-tooltip" id="whatsappTooltip">
                    <button class="tooltip-close" onclick="whatsappWidget.hideTooltip()">×</button>
                    <p class="tooltip-text">💬 ¡Hola! ¿Necesitas ayuda? Estamos aquí para ti</p>
                </div>

                <!-- Chat emergente -->
                <div class="whatsapp-chat" id="whatsappChat">
                    <!-- Header -->
                    <div class="whatsapp-header">
                        <div class="whatsapp-avatar">CN</div>
                        <div class="whatsapp-info">
                            <h4 class="whatsapp-name">${this.config.agentName}</h4>
                            <p class="whatsapp-status">
                                <span class="online-indicator"></span>
                                ${this.getBusinessStatus()}
                            </p>
                        </div>
                        <button class="whatsapp-close" onclick="whatsappWidget.closeChat()">×</button>
                    </div>

                    <!-- Área de mensajes -->
                    <div class="whatsapp-messages" id="whatsappMessages">
                        <!-- Los mensajes se cargan dinámicamente -->
                    </div>

                    <!-- Acciones rápidas -->
                    <div class="whatsapp-actions" id="whatsappActions">
                        <!-- Las acciones se cargan dinámicamente -->
                    </div>
                </div>

                <!-- Botón principal -->
                <button class="whatsapp-btn" id="whatsappBtn" onclick="whatsappWidget.toggleChat()">
                    <span class="whatsapp-notification" id="whatsappNotification">3</span>
                    <svg class="whatsapp-icon" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                </button>
            </div>
        `;

        // Insertar en el DOM
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        
        // Cargar mensajes iniciales después de un pequeño delay
        setTimeout(() => {
            this.loadInitialMessages();
        }, 1000);
    }

    /* ================================
       GESTIÓN DE MENSAJES AUTOMÁTICOS - CORREGIDO
       ================================ */
    loadInitialMessages() {
        console.log('📝 Cargando mensajes iniciales para página:', this.currentPage);
        
        const template = this.messageTemplates[this.currentPage];
        if (!template) {
            console.error('❌ No se encontró template para página:', this.currentPage);
            return;
        }

        const messagesContainer = document.getElementById('whatsappMessages');
        if (!messagesContainer) {
            console.error('❌ No se encontró contenedor de mensajes');
            return;
        }
        
        // Limpiar mensajes previos
        messagesContainer.innerHTML = '';
        
        // Mensaje de bienvenida
        console.log('✅ Agregando mensaje de bienvenida:', template.welcome);
        this.addMessage(template.welcome, 'bot', true);
        
        // Mensaje de introducción después de un delay
        setTimeout(() => {
            console.log('✅ Agregando mensaje de introducción:', template.intro);
            this.addMessage(template.intro, 'bot');
            
            // Cargar acciones rápidas después de otro delay
            setTimeout(() => {
                this.loadQuickActions(template.quickActions);
            }, 1000);
        }, 1500);
    }

    loadQuickActions(actions) {
        console.log('🎯 Cargando acciones rápidas:', actions);
        
        const actionsContainer = document.getElementById('whatsappActions');
        if (!actionsContainer) {
            console.error('❌ No se encontró contenedor de acciones');
            return;
        }
        
        let actionsHTML = actions.map(action => 
            `<div class="quick-action" onclick="whatsappWidget.selectQuickAction('${action.replace(/'/g, "\\'")}')">${action}</div>`
        ).join('');
        
        actionsHTML += `
            <button class="chat-with-us-btn" onclick="whatsappWidget.openWhatsApp()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Chatear con nosotros
            </button>
        `;
        
        actionsContainer.innerHTML = actionsHTML;
        console.log('✅ Acciones rápidas cargadas');
    }

    addMessage(text, sender = 'bot', isFirst = false) {
        console.log('💬 Agregando mensaje:', text, 'de:', sender);
        
        const messagesContainer = document.getElementById('whatsappMessages');
        if (!messagesContainer) {
            console.error('❌ No se encontró contenedor de mensajes');
            return;
        }
        
        const time = new Date().toLocaleTimeString('es-CL', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Mostrar indicador de escritura si es bot y no es el primer mensaje
        if (sender === 'bot' && !isFirst) {
            this.showTypingIndicator();
            setTimeout(() => {
                this.hideTypingIndicator();
                this.appendMessage(text, sender, time);
            }, 1000 + Math.random() * 1000);
        } else {
            this.appendMessage(text, sender, time);
        }
    }

    appendMessage(text, sender, time) {
        console.log('📝 Insertando mensaje en DOM:', text);
        
        const messagesContainer = document.getElementById('whatsappMessages');
        if (!messagesContainer) {
            console.error('❌ No se encontró contenedor de mensajes en appendMessage');
            return;
        }
        
        const messageHTML = `
            <div class="message ${sender}">
                ${sender === 'bot' ? '<div class="whatsapp-avatar">CN</div>' : ''}
                <div class="message-bubble">
                    <div class="message-text">${text}</div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
        
        console.log('🔧 HTML del mensaje:', messageHTML);
        
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        console.log('✅ Mensaje insertado correctamente');
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('whatsappMessages');
        if (!messagesContainer) return;
        
        const typingHTML = `
            <div class="typing-indicator" id="typingIndicator">
                <div class="whatsapp-avatar">CN</div>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    /* ================================
       INTERACCIONES DEL USUARIO
       ================================ */
    selectQuickAction(action) {
        console.log('🎯 Acción seleccionada:', action);
        this.addMessage(action, 'user');
        
        // Respuesta automática basada en la acción
        setTimeout(() => {
            const response = this.getResponseForAction(action);
            this.addMessage(response, 'bot');
        }, 1500);
    }

    getResponseForAction(action) {
        const responses = {
            // Respuestas generales
            '🏠 Ver propiedades en venta': 'Perfecto! Te dirijo a nuestras propiedades disponibles. También puedo ayudarte con información específica.',
            '🏢 Propiedades en arriendo': 'Excelente! Tenemos arriendos desde $400.000. ¿Qué zona te interesa?',
            '💰 Solicitar tasación': 'Genial! Realizamos tasaciones gratuitas. ¿De qué tipo de propiedad necesitas la tasación?',
            '📞 Hablar con un asesor': 'Te conectamos ahora mismo. Puedes llamarnos o escribirnos por WhatsApp.',
            
            // Respuestas específicas para propiedades
            '📋 Más detalles de esta propiedad': 'Te puedo dar todos los detalles! ¿Qué información específica necesitas?',
            '📅 Agendar visita': 'Perfecto! Podemos coordinar una visita. ¿Cuándo te acomoda mejor?',
            '💰 Consultar precio': 'Te doy toda la información de precio y financiamiento disponible.',
            
            // Default
            default: '¡Excelente elección! Te ayudo con eso de inmediato. ¿Qué más necesitas saber?'
        };
        
        return responses[action] || responses.default;
    }

    /* ================================
       AUTOMATIZACIÓN INTELIGENTE
       ================================ */
    startAutomation() {
        // Mostrar tooltip después de cierto tiempo
        setTimeout(() => {
            if (!this.hasBeenOpened) {
                this.showTooltip();
            }
        }, this.config.tooltipDelay);

        // Pulsar botón para llamar atención
        setTimeout(() => {
            if (!this.hasBeenOpened) {
                this.startPulsing();
            }
        }, this.config.autoShowDelay);

        // Simular notificaciones
        this.simulateNotifications();
        
        // Detectar inactividad del usuario
        this.setupInactivityDetection();
    }

    showTooltip() {
        const tooltip = document.getElementById('whatsappTooltip');
        if (tooltip && !this.hasBeenOpened) {
            tooltip.classList.add('show');
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                tooltip.classList.remove('show');
            }, 5000);
        }
    }

    hideTooltip() {
        const tooltip = document.getElementById('whatsappTooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    startPulsing() {
        const widget = document.querySelector('.whatsapp-widget');
        if (widget && !this.hasBeenOpened) {
            widget.classList.add('pulsing');
            
            // Detener después de 10 segundos
            setTimeout(() => {
                widget.classList.remove('pulsing');
            }, 10000);
        }
    }

    simulateNotifications() {
        const notification = document.getElementById('whatsappNotification');
        if (!notification) return;

        let count = 3;
        
        // Reducir contador cada 30 segundos
        const interval = setInterval(() => {
            if (this.hasBeenOpened || count <= 0) {
                notification.style.display = 'none';
                clearInterval(interval);
                return;
            }
            
            count--;
            notification.textContent = count;
            
            if (count <= 0) {
                notification.style.display = 'none';
            }
        }, 30000);
    }

    setupInactivityDetection() {
        let inactivityTimer;
        
        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (!this.isOpen && !this.hasBeenOpened) {
                    this.showTooltip();
                }
            }, 60000); // 1 minuto de inactividad
        };
        
        // Detectar actividad del usuario
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimer, { passive: true });
        });
        
        resetTimer();
    }

    /* ================================
       CONTROL DEL CHAT
       ================================ */
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const chat = document.getElementById('whatsappChat');
        const notification = document.getElementById('whatsappNotification');
        
        if (chat) {
            chat.classList.add('active');
            this.isOpen = true;
            this.hasBeenOpened = true;
            
            // Ocultar notificación
            if (notification) {
                notification.style.display = 'none';
            }
            
            // Ocultar tooltip
            this.hideTooltip();
            
            // Detener pulsing
            document.querySelector('.whatsapp-widget')?.classList.remove('pulsing');
            
            console.log('💬 Chat abierto');
        }
    }

    closeChat() {
        const chat = document.getElementById('whatsappChat');
        
        if (chat) {
            chat.classList.remove('active');
            this.isOpen = false;
            console.log('💬 Chat cerrado');
        }
    }

    /* ================================
       ABRIR WHATSAPP REAL
       ================================ */
    openWhatsApp() {
        let message = this.generateContextualMessage();
        
        const phoneNumber = this.config.phoneNumber.replace(/[^0-9]/g, '');
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        console.log('📱 Abriendo WhatsApp con mensaje:', message);
        window.open(whatsappURL, '_blank');
        
        // Cerrar el chat
        this.closeChat();
    }

    generateContextualMessage() {
        const template = this.messageTemplates[this.currentPage];
        let message = `Hola! Vengo desde el sitio web de Casa Nuvera.\\n\\n`;
        
        // Mensaje específico según la página
        switch (this.currentPage) {
            case 'property':
                const propertyId = new URLSearchParams(window.location.search).get('id');
                message += `Estoy interesado/a en la propiedad #${propertyId}.\\n`;
                message += `🔗 ${window.location.href}\\n\\n`;
                break;
            case 'buy':
                message += 'Estoy buscando una propiedad para comprar.\\n\\n';
                break;
            case 'rent':
                message += 'Estoy buscando una propiedad para arrendar.\\n\\n';
                break;
            case 'services':
                message += 'Me interesan sus servicios inmobiliarios.\\n\\n';
                break;
            default:
                message += 'Me interesa obtener más información.\\n\\n';
        }
        
        message += '¿Podrían ayudarme?';
        
        return message;
    }

    /* ================================
       UTILIDADES
       ================================ */
    getBusinessStatus() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay(); // 0 = Domingo, 6 = Sábado
        
        // Horario: Lunes a Viernes 9:00 - 19:00
        if (day >= 1 && day <= 5 && hour >= this.config.businessHours.start && hour < this.config.businessHours.end) {
            return 'En línea ahora';
        } else if (day >= 1 && day <= 5) {
            return 'Responderemos pronto';
        } else {
            return 'Abierto el lunes';
        }
    }

    attachEventListeners() {
        // Cerrar chat al hacer clic fuera
        document.addEventListener('click', (e) => {
            const widget = document.getElementById('whatsappWidget');
            const chat = document.getElementById('whatsappChat');
            
            if (this.isOpen && widget && !widget.contains(e.target)) {
                this.closeChat();
            }
        });
        
        // Tecla ESC para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChat();
            }
        });
    }

    /* ================================
       MÉTODOS PÚBLICOS
       ================================ */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    showMessage(message) {
        this.addMessage(message, 'bot');
    }

    destroy() {
        const widget = document.getElementById('whatsappWidget');
        if (widget) {
            widget.remove();
        }
    }
}

/* ================================
   INICIALIZACIÓN AUTOMÁTICA
   ================================ */
let whatsappWidget;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsAppWidget);
} else {
    initWhatsAppWidget();
}

function initWhatsAppWidget() {
    // Verificar que no exista ya
    if (document.getElementById('whatsappWidget')) {
        return;
    }
    
    // Configuración específica para Casa Nuvera
    const config = {
        phoneNumber: '+56912345678',
        companyName: 'Casa Nuvera',
        agentName: 'Equipo Casa Nuvera',
        businessHours: {
            start: 9,
            end: 19,
            timezone: 'America/Santiago'
        }
    };
    
    // Crear instancia global
    whatsappWidget = new WhatsAppWidget(config);
    
    console.log('🚀 Widget WhatsApp Casa Nuvera iniciado');
}