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
        this.conversationStep = 0; // Para seguir la conversación
        
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
                welcome: '¡Hola! 👋 Soy María de Casa Nuvera',
                intro: 'Te ayudo a encontrar tu hogar ideal en Santiago. ¿Qué estás buscando hoy?',
                quickActions: [
                    '🏠 Quiero comprar una propiedad',
                    '🏢 Busco propiedades en arriendo',
                    '💰 Necesito una tasación gratuita',
                    '📞 Quiero hablar con un asesor'
                ]
            },
            buy: {
                welcome: '¡Perfecto! 🏠 Veo que quieres comprar',
                intro: 'Tengo varias opciones disponibles. ¿Qué tipo de propiedad te interesa más?',
                quickActions: [
                    '🏘️ Casas familiares',
                    '🏢 Departamentos modernos',
                    '💰 ¿Cómo puedo financiar?',
                    '📊 Ver todas las propiedades'
                ]
            },
            rent: {
                welcome: '🏢 ¡Genial! Te ayudo con arriendos',
                intro: 'Tenemos excelentes opciones para arrendar. ¿En qué comuna te gustaría vivir?',
                quickActions: [
                    '🏠 Ver arriendos disponibles',
                    '📋 ¿Qué documentos necesito?',
                    '💭 Consultar garantías',
                    '📞 Asesoría personalizada'
                ]
            },
            property: {
                welcome: '👀 Vi que estás viendo esta propiedad específica',
                intro: '¿Te gusta? Puedo contarte todos los detalles y coordinar una visita si quieres.',
                quickActions: [
                    '📋 Cuéntame más detalles',
                    '📅 ¿Puedo visitarla?',
                    '💰 ¿Cuál es el precio final?',
                    '🏠 Ver propiedades similares'
                ]
            },
            services: {
                welcome: '🔧 ¡Perfecto! Te cuento sobre nuestros servicios',
                intro: 'Ofrecemos tasaciones gratuitas, asesorías y gestión completa. ¿Qué necesitas?',
                quickActions: [
                    '📊 Tasar mi propiedad',
                    '🏗️ Asesoría en inversiones',
                    '📋 Gestión de propiedades',
                    '💬 Consulta personalizada'
                ]
            },
            contact: {
                welcome: '📞 ¡Excelente! Estoy aquí para ayudarte',
                intro: '¿En qué puedo ayudarte específicamente?',
                quickActions: [
                    '📱 Prefiero que me llamen',
                    '📧 Enviar mi consulta por email',
                    '📅 Agendar una reunión',
                    '💬 Seguir chateando aquí'
                ]
            },
            about: {
                welcome: '🏢 ¡Que bueno que quieras conocernos!',
                intro: 'Somos una corredora familiar e innovadora. ¿Te ayudo con algo específico?',
                quickActions: [
                    '🏠 Ver nuestras propiedades',
                    '👥 ¿Quién es el equipo?',
                    '📈 ¿Cuáles son sus resultados?',
                    '💬 Hacer una consulta'
                ]
            },
            other: {
                welcome: '👋 ¡Hola! Soy María de Casa Nuvera',
                intro: '¿En qué puedo ayudarte hoy?',
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
                    <p class="tooltip-text">💬 ¡Hola! Soy María, ¿necesitas ayuda?</p>
                </div>

                <!-- Chat emergente -->
                <div class="whatsapp-chat" id="whatsappChat">
                    <!-- Header -->
                    <div class="whatsapp-header">
                        <div class="whatsapp-avatar">M</div>
                        <div class="whatsapp-info">
                            <h4 class="whatsapp-name">María - ${this.config.agentName}</h4>
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

                    <!-- Input para escribir mensajes -->
                    <div class="whatsapp-input-area" id="whatsappInputArea">
                        <input type="text" class="whatsapp-input" id="whatsappInput" placeholder="Escribe tu mensaje..." maxlength="500">
                        <button class="whatsapp-send-btn" id="whatsappSendBtn" onclick="whatsappWidget.sendUserMessage()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
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
        
        // Configurar event listeners para el input
        this.setupInputListeners();
        
        // Cargar mensajes iniciales después de un pequeño delay
        setTimeout(() => {
            this.loadInitialMessages();
        }, 1000);
    }

    /* ================================
       CONFIGURAR INPUT DE MENSAJES
       ================================ */
    setupInputListeners() {
        const input = document.getElementById('whatsappInput');
        const sendBtn = document.getElementById('whatsappSendBtn');
        
        if (input) {
            // Enviar con Enter
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendUserMessage();
                }
            });
            
            // Habilitar/deshabilitar botón de envío
            input.addEventListener('input', () => {
                const hasText = input.value.trim().length > 0;
                sendBtn.style.opacity = hasText ? '1' : '0.5';
                sendBtn.style.cursor = hasText ? 'pointer' : 'not-allowed';
            });
        }
    }

    /* ================================
       ENVIAR MENSAJE DEL USUARIO
       ================================ */
    sendUserMessage() {
        const input = document.getElementById('whatsappInput');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        
        // Limpiar input
        input.value = '';
        const sendBtn = document.getElementById('whatsappSendBtn');
        if (sendBtn) {
            sendBtn.style.opacity = '0.5';
        }
        
        // Ocultar acciones rápidas cuando el usuario empieza a escribir
        this.hideQuickActions();
        
        // Generar respuesta automática
        setTimeout(() => {
            this.generateBotResponse(message);
        }, 1000 + Math.random() * 2000);
    }

    /* ================================
       GENERAR RESPUESTA AUTOMÁTICA
       ================================ */
    generateBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        let response = '';
        let actions = [];
        
        // Respuestas basadas en palabras clave
        if (message.includes('hola') || message.includes('hi') || message.includes('buenos')) {
            response = '¡Hola! Un gusto conocerte. Soy María y estoy aquí para ayudarte con todo lo inmobiliario. ¿Qué estás buscando?';
            actions = ['🏠 Comprar propiedad', '🏢 Arrendar', '💰 Tasación', '📞 Hablar con asesor'];
            
        } else if (message.includes('comprar') || message.includes('compra') || message.includes('venta')) {
            response = '¡Perfecto! Tengo varias propiedades en venta que te podrían interesar. ¿Te llevo a verlas?';
            actions = ['📋 Ver propiedades disponibles', '💰 ¿Cómo financiar?', '📍 ¿En qué comuna?'];
            
        } else if (message.includes('arriendo') || message.includes('arrendar') || message.includes('alqui')) {
            response = 'Excelente, tenemos arriendos desde $400.000. ¿En qué zona te gustaría vivir?';
            actions = ['🏠 Ver arriendos', '📋 Requisitos', '📍 Ubicaciones'];
            
        } else if (message.includes('tasacion') || message.includes('tasar') || message.includes('avaluo')) {
            response = 'Perfecto! Hacemos tasaciones gratuitas. Solo necesito algunos datos de tu propiedad.';
            actions = ['📋 Empezar tasación', '📞 Llamar para tasación'];
            
        } else if (message.includes('precio') || message.includes('costo') || message.includes('valor')) {
            if (this.currentPage === 'property') {
                response = 'El precio de esta propiedad incluye todos los gastos legales. ¿Te interesa conocer las opciones de financiamiento?';
                actions = ['💰 Opciones de pago', '📅 Agendar visita', '📋 Más detalles'];
            } else {
                response = 'Los precios varían según ubicación y características. ¿Te muestro las propiedades disponibles?';
                actions = ['📋 Ver propiedades', '💰 Rango de precios'];
            }
            
        } else if (message.includes('visita') || message.includes('ver') || message.includes('mostrar')) {
            response = '¡Por supuesto! Podemos coordinar una visita. ¿Cuándo te acomodaría mejor?';
            actions = ['📅 Esta semana', '📅 Próxima semana', '📞 Coordinar por teléfono'];
            
        } else if (message.includes('comuna') || message.includes('ubicacion') || message.includes('zona')) {
            response = 'Tenemos propiedades en las mejores zonas de Santiago. ¿Alguna comuna en particular te interesa?';
            actions = ['📍 Las Condes', '📍 Providencia', '📍 Ñuñoa', '📍 Otras zonas'];
            
        } else if (message.includes('financiamiento') || message.includes('credito') || message.includes('hipoteca')) {
            response = 'Te ayudo con el financiamiento. Trabajamos con todos los bancos y tenemos excelentes convenios.';
            actions = ['🏦 Bancos disponibles', '💳 Simulador crédito', '📞 Asesor financiero'];
            
        } else if (message.includes('gracias') || message.includes('thank')) {
            response = '¡De nada! Estoy aquí para ayudarte en todo el proceso. ¿Algo más en lo que pueda ayudarte?';
            actions = ['🏠 Ver más propiedades', '📞 Hablar con asesor', '💬 Seguir conversando'];
            
        } else {
            // Respuesta genérica inteligente
            response = 'Entiendo. Déjame ayudarte con eso. ¿Prefieres que te muestre algunas opciones o tienes algo específico en mente?';
            actions = ['🏠 Ver propiedades', '💰 Consultar precios', '📞 Hablar por teléfono', '📋 Más información'];
        }
        
        // Enviar respuesta
        this.addMessage(response, 'bot');
        
        // Mostrar acciones después de un delay
        if (actions.length > 0) {
            setTimeout(() => {
                this.showCustomActions(actions);
            }, 1500);
        }
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
        this.showCustomActions(actions, true);
    }

    showCustomActions(actions, showWhatsAppButton = false) {
        const actionsContainer = document.getElementById('whatsappActions');
        if (!actionsContainer) {
            console.error('❌ No se encontró contenedor de acciones');
            return;
        }
        
        let actionsHTML = actions.map(action => 
            `<div class="quick-action" onclick="whatsappWidget.selectQuickAction('${action.replace(/'/g, "\\'")}')">${action}</div>`
        ).join('');
        
        if (showWhatsAppButton) {
            actionsHTML += `
                <button class="chat-with-us-btn" onclick="whatsappWidget.openWhatsApp()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Continuar en WhatsApp
                </button>
            `;
        }
        
        actionsContainer.innerHTML = actionsHTML;
        actionsContainer.style.display = 'flex';
        console.log('✅ Acciones rápidas cargadas');
    }

    hideQuickActions() {
        const actionsContainer = document.getElementById('whatsappActions');
        if (actionsContainer) {
            actionsContainer.style.display = 'none';
        }
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
                ${sender === 'bot' ? '<div class="whatsapp-avatar">M</div>' : ''}
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
                <div class="whatsapp-avatar">M</div>
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
        
        // Ocultar acciones rápidas
        this.hideQuickActions();
        
        // Procesar acción específica
        setTimeout(() => {
            this.processQuickAction(action);
        }, 1500);
    }

    processQuickAction(action) {
        const cleanAction = action.toLowerCase();
        
        if (cleanAction.includes('comprar') || cleanAction.includes('propiedades en venta')) {
            this.addMessage('¡Excelente! Te llevo a ver todas nuestras propiedades en venta disponibles.', 'bot');
            setTimeout(() => {
                window.open('compras.html', '_blank');
                this.addMessage('También puedes seguir preguntándome aquí cualquier duda que tengas 😊', 'bot');
            }, 2000);
            
        } else if (cleanAction.includes('ver propiedades') || cleanAction.includes('todas las opciones')) {
            this.addMessage('Perfecto! Abriendo nuestra galería de propiedades...', 'bot');
            setTimeout(() => {
                window.open('compras.html', '_blank');
            }, 1500);
            
        } else if (cleanAction.includes('arriendo') || cleanAction.includes('arrendar')) {
            this.addMessage('Te ayudo con arriendos. Tenemos desde $400.000 en adelante.', 'bot');
            setTimeout(() => {
                this.showCustomActions(['📋 Ver arriendos disponibles', '📍 ¿En qué comuna?', '💰 Rango de precios']);
            }, 1500);
            
        } else if (cleanAction.includes('tasacion') || cleanAction.includes('tasar')) {
            this.addMessage('¡Perfecto! Las tasaciones son completamente gratuitas. ¿De qué tipo de propiedad necesitas la tasación?', 'bot');
            setTimeout(() => {
                this.showCustomActions(['🏠 Casa', '🏢 Departamento', '📞 Llamar para coordinar']);
            }, 1500);
            
        } else if (cleanAction.includes('asesor') || cleanAction.includes('hablar')) {
            this.addMessage('Te conectamos con nuestro equipo de asesores especializados. ¿Prefieres que te llamen o seguimos por WhatsApp?', 'bot');
            setTimeout(() => {
                this.showCustomActions(['📞 Prefiero que me llamen', '💬 Seguir por WhatsApp', '📧 Enviar email']);
            }, 1500);
            
        } else if (cleanAction.includes('financiamiento') || cleanAction.includes('financiar')) {
            this.addMessage('Excelente! Trabajamos con todos los bancos y tenemos convenios especiales. Te ayudo con el financiamiento.', 'bot');
            setTimeout(() => {
                this.showCustomActions(['🏦 Ver bancos disponibles', '💳 Simular crédito', '📞 Asesor financiero']);
            }, 1500);
            
        } else if (cleanAction.includes('visita') || cleanAction.includes('visitarla')) {
            this.addMessage('¡Por supuesto! Las visitas se pueden coordinar de lunes a sábado. ¿Cuándo te acomodaría?', 'bot');
            setTimeout(() => {
                this.showCustomActions(['📅 Esta semana', '📅 Próxima semana', '📞 Coordinar por teléfono']);
            }, 1500);
            
        } else if (cleanAction.includes('detalles') || cleanAction.includes('información')) {
            if (this.currentPage === 'property') {
                this.addMessage('Esta propiedad tiene excelentes características. ¿Te interesa algún aspecto en particular?', 'bot');
                setTimeout(() => {
                    this.showCustomActions(['🏠 Características técnicas', '📍 Sobre el barrio', '💰 Formas de pago', '📅 Agendar visita']);
                }, 1500);
            } else {
                this.addMessage('Te muestro información detallada. ¿Sobre qué específicamente quieres saber más?', 'bot');
                setTimeout(() => {
                    this.showCustomActions(['🏠 Tipos de propiedades', '📍 Ubicaciones', '💰 Precios', '📋 Proceso de compra']);
                }, 1500);
            }
        } else {
            // Respuesta genérica
            this.addMessage('Perfecto! Te ayudo con eso. ¿Algo más específico en lo que pueda ayudarte?', 'bot');
            setTimeout(() => {
                this.showCustomActions(['🏠 Ver propiedades', '💰 Consultar precios', '📞 Hablar con asesor']);
            }, 1500);
        }
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
            
            // Enfocar input
            setTimeout(() => {
                const input = document.getElementById('whatsappInput');
                if (input) input.focus();
            }, 500);
            
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
        
        // No cerrar el chat, mantenerlo abierto
        this.addMessage('¡Perfecto! Te contactaremos por WhatsApp. También puedes seguir escribiendo aquí 😊', 'bot');
    }

    generateContextualMessage() {
        let message = `Hola! Soy ${window.userName || 'un usuario'} y vengo desde el sitio web de Casa Nuvera.\\n\\n`;
        
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
                message += 'Me interesa obtener más información sobre sus servicios.\\n\\n';
        }
        
        message += '¿Podrían ayudarme? Gracias!';
        
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
            return 'Te responderemos pronto';
        } else {
            return 'Abierto el lunes';
        }
    }

    attachEventListeners() {
        // Cerrar chat al hacer clic fuera
        document.addEventListener('click', (e) => {
            const widget = document.getElementById('whatsappWidget');
            
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
        agentName: 'Casa Nuvera',
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