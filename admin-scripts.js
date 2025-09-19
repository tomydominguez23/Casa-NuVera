// admin-scripts.js - Scripts principales para el panel de administración Casa Nuvera

console.log('🏠 Cargando sistema de administración Casa Nuvera...');

// Clase principal para el panel de administración
class AdminPanel {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.sidebarCollapsed = false;
        
        this.init();
    }

    init() {
        console.log('🔧 Inicializando panel de administración...');
        
        // Verificar autenticación al cargar
        this.checkAuthentication();
        
        // Inicializar eventos
        this.initializeEvents();
        
        // Inicializar sidebar
        this.initializeSidebar();
        
        // Marcar como inicializado
        this.isInitialized = true;
        
        console.log('✅ Panel de administración inicializado');
    }

    checkAuthentication() {
        const session = sessionStorage.getItem('casaNuveraAdminSession');
        
        if (!session) {
            console.log('❌ No hay sesión activa');
            return false;
        }

        try {
            const sessionData = JSON.parse(session);
            const loginTime = new Date(sessionData.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

            // Sesión expira después de 8 horas
            if (hoursDiff > 8) {
                console.log('⏰ Sesión expirada');
                this.logout();
                return false;
            }

            if (sessionData.isAdmin === true && sessionData.company === 'Casa Nuvera') {
                this.currentUser = sessionData;
                console.log('✅ Sesión válida para:', sessionData.username);
                return true;
            }
        } catch (e) {
            console.error('❌ Error al verificar sesión:', e);
            this.logout();
            return false;
        }

        return false;
    }

    initializeEvents() {
        // Toggle sidebar en móviles
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Crear overlay para móviles
        this.createSidebarOverlay();

        // Responsive sidebar
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Auto-save drafts (para formularios)
        this.setupAutoSave();
    }

    createSidebarOverlay() {
        // Crear overlay si no existe
        if (!document.getElementById('sidebarOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', () => {
                this.closeSidebar();
            });
            document.body.appendChild(overlay);
        }
    }

    initializeSidebar() {
        // Marcar el item activo del menú basado en la URL actual
        const currentPage = window.location.pathname.split('/').pop();
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && href.includes(currentPage)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Configurar responsive sidebar
        this.handleResize();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (window.innerWidth <= 768) {
            // En móviles, mostrar/ocultar sidebar con overlay
            const isActive = sidebar.classList.toggle('active');
            if (overlay) {
                overlay.classList.toggle('active', isActive);
            }
            // Prevenir scroll del body cuando el sidebar está abierto
            document.body.style.overflow = isActive ? 'hidden' : '';
        } else {
            // En desktop, colapsar/expandir
            this.sidebarCollapsed = !this.sidebarCollapsed;
            sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
            mainContent.classList.toggle('expanded', this.sidebarCollapsed);
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.remove('active');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }
        // Restaurar scroll del body
        document.body.style.overflow = '';
    }

    handleResize() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (window.innerWidth <= 768) {
            // Modo móvil
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
            this.sidebarCollapsed = false;
        } else {
            // Modo desktop - cerrar sidebar móvil si está abierto
            sidebar.classList.remove('active');
            if (overlay) {
                overlay.classList.remove('active');
            }
            document.body.style.overflow = '';
        }
    }

    setupAutoSave() {
        // Auto-guardar borradores de formularios cada 30 segundos
        const forms = document.querySelectorAll('form[data-autosave]');
        
        forms.forEach(form => {
            const formId = form.id || 'form_' + Date.now();
            
            // Cargar borrador guardado
            this.loadDraft(formId, form);
            
            // Configurar auto-save
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.saveDraft(formId, form);
                });
            });
        });
    }

    saveDraft(formId, form) {
        try {
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            localStorage.setItem(`draft_${formId}`, JSON.stringify({
                data: data,
                timestamp: new Date().toISOString()
            }));
            
            // Mostrar indicador de guardado
            this.showSaveIndicator();
            
        } catch (e) {
            console.warn('Error al guardar borrador:', e);
        }
    }

    loadDraft(formId, form) {
        try {
            const draft = localStorage.getItem(`draft_${formId}`);
            if (!draft) return;
            
            const draftData = JSON.parse(draft);
            const data = draftData.data;
            
            // Cargar datos en el formulario
            for (let [key, value] of Object.entries(data)) {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = value;
                }
            }
            
            // Mostrar notificación de borrador cargado
            this.showNotification('Borrador cargado', 'info');
            
        } catch (e) {
            console.warn('Error al cargar borrador:', e);
        }
    }

    clearDraft(formId) {
        localStorage.removeItem(`draft_${formId}`);
    }

    showSaveIndicator() {
        // Crear o actualizar indicador de guardado
        let indicator = document.getElementById('saveIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'saveIndicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27ae60;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                font-size: 0.9rem;
                z-index: 9999;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = '💾 Guardado automáticamente';
        indicator.style.opacity = '1';
        
        // Ocultar después de 2 segundos
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        // Colores según el tipo
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remover después del tiempo especificado
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    showConfirmDialog(message, onConfirm, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Confirmar Acción</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="confirmCancel">Cancelar</button>
                    <button type="button" class="btn btn-danger" id="confirmOk">Confirmar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('confirmOk').addEventListener('click', () => {
            document.body.removeChild(modal);
            if (onConfirm) onConfirm();
        });
        
        document.getElementById('confirmCancel').addEventListener('click', () => {
            document.body.removeChild(modal);
            if (onCancel) onCancel();
        });
        
        // Cerrar al hacer click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                if (onCancel) onCancel();
            }
        });
    }

    logout() {
        console.log('🚪 Cerrando sesión...');
        
        // Limpiar sesión
        sessionStorage.removeItem('casaNuveraAdminSession');
        localStorage.removeItem('casaNuveraUsername');
        
        // Limpiar borradores
        const draftKeys = Object.keys(localStorage).filter(key => key.startsWith('draft_'));
        draftKeys.forEach(key => localStorage.removeItem(key));
        
        // Redirigir al login
        window.location.href = 'admin-login.html';
    }

    // Utilidades para manejar datos
    async loadProperties() {
        try {
            if (!window.supabaseClient) {
                console.warn('Supabase no está disponible');
                return [];
            }

            const { data, error } = await window.supabaseClient
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            return data || [];
        } catch (error) {
            console.error('Error al cargar propiedades:', error);
            this.showNotification('Error al cargar propiedades', 'error');
            return [];
        }
    }

    async deleteProperty(id) {
        try {
            if (!window.supabaseClient) {
                throw new Error('Supabase no está disponible');
            }

            const { error } = await window.supabaseClient
                .from('properties')
                .delete()
                .eq('id', id);

            if (error) throw error;
            
            this.showNotification('Propiedad eliminada exitosamente', 'success');
            return true;
        } catch (error) {
            console.error('Error al eliminar propiedad:', error);
            this.showNotification('Error al eliminar propiedad', 'error');
            return false;
        }
    }

    formatPrice(price, currency = 'CLP') {
        const formatters = {
            CLP: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }),
            USD: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'USD' }),
            UF: (amount) => `${amount.toLocaleString('es-CL')} UF`
        };

        if (currency === 'UF') {
            return formatters.UF(price);
        }

        return formatters[currency]?.format(price) || `${currency} ${price.toLocaleString('es-CL')}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Funciones globales para compatibilidad
window.checkAdminSession = function() {
    const panel = window.adminPanel;
    return panel ? panel.checkAuthentication() : false;
};

window.logoutAdmin = function() {
    const panel = window.adminPanel;
    if (panel) {
        panel.logout();
    } else {
        // Fallback
        sessionStorage.removeItem('casaNuveraAdminSession');
        localStorage.removeItem('casaNuveraUsername');
        window.location.href = 'admin-login.html';
    }
};

window.showConfirm = function(message, onConfirm, onCancel) {
    const panel = window.adminPanel;
    if (panel) {
        panel.showConfirmDialog(message, onConfirm, onCancel);
    } else {
        // Fallback con confirm nativo
        if (confirm(message)) {
            if (onConfirm) onConfirm();
        } else {
            if (onCancel) onCancel();
        }
    }
};

window.showNotification = function(message, type = 'info', duration = 3000) {
    const panel = window.adminPanel;
    if (panel) {
        panel.showNotification(message, type, duration);
    } else {
        // Fallback con alert
        alert(message);
    }
};

// Inicializar panel cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
    console.log('🏠 Panel de administración Casa Nuvera listo');
});

// Agregar estilos para notificaciones y animaciones
const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
`;
document.head.appendChild(styles);

console.log('✅ Sistema de administración Casa Nuvera cargado');