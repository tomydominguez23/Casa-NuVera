/**
 * ===============================================
 * CASA-NUVERA: LEAD GENERATION POP-UP SYSTEM
 * ===============================================
 * Archivo: js/lead-popup.js
 * Descripción: Pop-up profesional para captura de leads
 * Funcionalidades:
 * - Pop-up activado por clic en favoritos
 * - Formulario optimizado para conversión
 * - Integración con sistema de tracking
 * - Validación y UX profesional
 * ===============================================
 */

class LeadPopup {
    constructor() {
        this.isOpen = false;
        this.currentProperty = null;
        this.formData = {};
        this.currentStep = 1;
        this.totalSteps = 2;
        
        this.init();
    }
    
    init() {
        this.createPopupHTML();
        this.bindEvents();
        console.log('🎯 LeadPopup inicializado');
    }
    
    /**
     * Crear estructura HTML del pop-up
     */
    createPopupHTML() {
        const popupHTML = `
            <!-- Lead Generation Popup -->
            <div id="leadPopup" class="lead-popup-overlay" style="display: none;">
                <div class="lead-popup-container">
                    <!-- Header del popup -->
                    <div class="lead-popup-header">
                        <div class="popup-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </div>
                        <h3 id="popupTitle">¡Te gusta esta propiedad!</h3>
                        <p id="popupSubtitle">Déjanos tus datos y te ayudaremos a encontrar tu hogar ideal</p>
                        <button class="popup-close" onclick="leadPopup.close()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Property Preview -->
                    <div id="propertyPreview" class="property-preview" style="display: none;">
                        <div class="property-preview-image">
                            <img id="previewImage" src="" alt="Propiedad">
                        </div>
                        <div class="property-preview-info">
                            <h4 id="previewTitle">Título de la propiedad</h4>
                            <p id="previewLocation">Ubicación</p>
                            <p id="previewPrice" class="preview-price">Precio</p>
                        </div>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 50%"></div>
                        </div>
                        <span class="progress-text">Paso <span id="currentStep">1</span> de <span id="totalSteps">2</span></span>
                    </div>
                    
                    <!-- Form Content -->
                    <form id="leadForm" class="lead-form">
                        <!-- Paso 1: Información Básica -->
                        <div id="step1" class="form-step active">
                            <div class="step-title">
                                <h4>Información Básica</h4>
                                <p>Solo necesitamos algunos datos para contactarte</p>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="nombre">Nombre *</label>
                                    <input type="text" id="nombre" name="nombre" required placeholder="Tu nombre">
                                    <span class="error-message"></span>
                                </div>
                                <div class="form-group">
                                    <label for="apellido">Apellido</label>
                                    <input type="text" id="apellido" name="apellido" placeholder="Tu apellido">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="email">Email *</label>
                                <input type="email" id="email" name="email" required placeholder="tu@email.com">
                                <span class="error-message"></span>
                            </div>
                            
                            <div class="form-group">
                                <label for="telefono">Teléfono *</label>
                                <input type="tel" id="telefono" name="telefono" required placeholder="+56 9 1234 5678">
                                <span class="error-message"></span>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="leadPopup.close()">
                                    Cerrar
                                </button>
                                <button type="button" class="btn-primary" onclick="leadPopup.nextStep()">
                                    Continuar
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="9,18 15,12 9,6"></polyline>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Paso 2: Preferencias -->
                        <div id="step2" class="form-step">
                            <div class="step-title">
                                <h4>Tus Preferencias</h4>
                                <p>Ayúdanos a entender mejor lo que buscas</p>
                            </div>
                            
                            <div class="form-group">
                                <label for="tipoInteres">¿Qué tipo de operación te interesa? *</label>
                                <select id="tipoInteres" name="tipoInteres" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="compra">Comprar</option>
                                    <option value="arriendo">Arrendar</option>
                                    <option value="ambos">Ambos</option>
                                </select>
                                <span class="error-message"></span>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="presupuestoMin">Presupuesto Mínimo</label>
                                    <select id="presupuestoMin" name="presupuestoMin">
                                        <option value="">Sin mínimo</option>
                                        <option value="30000000">$30.000.000</option>
                                        <option value="50000000">$50.000.000</option>
                                        <option value="80000000">$80.000.000</option>
                                        <option value="100000000">$100.000.000</option>
                                        <option value="150000000">$150.000.000</option>
                                        <option value="200000000">$200.000.000+</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="presupuestoMax">Presupuesto Máximo</label>
                                    <select id="presupuestoMax" name="presupuestoMax">
                                        <option value="">Sin máximo</option>
                                        <option value="50000000">$50.000.000</option>
                                        <option value="80000000">$80.000.000</option>
                                        <option value="100000000">$100.000.000</option>
                                        <option value="150000000">$150.000.000</option>
                                        <option value="200000000">$200.000.000</option>
                                        <option value="300000000">$300.000.000+</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="zonaInteres">¿En qué zonas te gustaría buscar?</label>
                                <div class="checkbox-group" id="zonaInteres">
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="zona" value="las-condes">
                                        <span>Las Condes</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="zona" value="providencia">
                                        <span>Providencia</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="zona" value="vitacura">
                                        <span>Vitacura</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="zona" value="ñuñoa">
                                        <span>Ñuñoa</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="zona" value="san-miguel">
                                        <span>San Miguel</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="zona" value="santiago">
                                        <span>Santiago Centro</span>
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="zona" value="otras">
                                        <span>Otras zonas</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="mensaje">Mensaje adicional (opcional)</label>
                                <textarea id="mensaje" name="mensaje" rows="3" placeholder="¿Algo específico que te gustaría que sepamos?"></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="leadPopup.prevStep()">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="15,18 9,12 15,6"></polyline>
                                    </svg>
                                    Atrás
                                </button>
                                <button type="submit" class="btn-primary" id="submitBtn">
                                    <span class="btn-text">Enviar Información</span>
                                    <span class="btn-loading" style="display: none;">
                                        <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
                                            <path d="M12 2v4" stroke="currentColor" stroke-width="4" opacity="0.75"/>
                                        </svg>
                                        Enviando...
                                    </span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Paso de Éxito -->
                        <div id="stepSuccess" class="form-step success-step" style="display: none;">
                            <div class="success-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20,6 9,17 4,12"></polyline>
                                </svg>
                            </div>
                            <h4>¡Perfecto!</h4>
                            <p>Hemos recibido tu información. Nos contactaremos contigo pronto para ayudarte a encontrar tu hogar ideal.</p>
                            
                            <div class="success-actions">
                                <button type="button" class="btn-primary" onclick="leadPopup.close()">
                                    Continuar navegando
                                </button>
                                <a href="https://wa.me/56912345678?text=Hola! Acabo de completar mis datos en Casa Nuvera y me gustaría más información" 
                                   class="btn-whatsapp" target="_blank">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                    </svg>
                                    Hablar por WhatsApp
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        this.createStyles();
    }
    
    /**
     * Crear estilos CSS del pop-up
     */
    createStyles() {
        const styles = `
            <style id="leadPopupStyles">
                /* ===== LEAD POPUP STYLES ===== */
                .lead-popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.3s ease;
                    padding: 1rem;
                }
                
                .lead-popup-overlay.active {
                    opacity: 1;
                }
                
                .lead-popup-container {
                    background: white;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                    transform: translateY(30px) scale(0.95);
                    transition: all 0.3s ease;
                }
                
                .lead-popup-overlay.active .lead-popup-container {
                    transform: translateY(0) scale(1);
                }
                
                /* Header */
                .lead-popup-header {
                    text-align: center;
                    padding: 2rem 2rem 1rem;
                    position: relative;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .popup-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                    border-radius: 50%;
                    color: white;
                    margin-bottom: 1rem;
                }
                
                .lead-popup-header h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #333;
                    margin: 0 0 0.5rem;
                }
                
                .lead-popup-header p {
                    color: #666;
                    font-size: 0.95rem;
                    margin: 0;
                    line-height: 1.4;
                }
                
                .popup-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: #f5f5f5;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #666;
                }
                
                .popup-close:hover {
                    background: #e0e0e0;
                    color: #333;
                }
                
                /* Property Preview */
                .property-preview {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem 2rem;
                    background: #f8f9fa;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .property-preview-image {
                    width: 80px;
                    height: 80px;
                    border-radius: 12px;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                
                .property-preview-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .property-preview-info {
                    flex: 1;
                }
                
                .property-preview-info h4 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 0.25rem;
                }
                
                .property-preview-info p {
                    font-size: 0.85rem;
                    color: #666;
                    margin: 0 0 0.25rem;
                }
                
                .preview-price {
                    font-weight: 700;
                    color: #333 !important;
                    font-size: 0.9rem !important;
                }
                
                /* Progress Bar */
                .progress-container {
                    padding: 1.5rem 2rem 0.5rem;
                    text-align: center;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 4px;
                    background: #f0f0f0;
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 2px;
                    transition: width 0.3s ease;
                }
                
                .progress-text {
                    font-size: 0.8rem;
                    color: #666;
                    font-weight: 500;
                }
                
                /* Form */
                .lead-form {
                    padding: 1rem 2rem 2rem;
                }
                
                .form-step {
                    display: none;
                }
                
                .form-step.active {
                    display: block;
                    animation: slideIn 0.3s ease;
                }
                
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                .step-title {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                
                .step-title h4 {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 0.5rem;
                }
                
                .step-title p {
                    color: #666;
                    font-size: 0.9rem;
                    margin: 0;
                }
                
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                
                .form-group {
                    margin-bottom: 1.5rem;
                }
                
                .form-group label {
                    display: block;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }
                
                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                    background: white;
                    color: #333;
                }
                
                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
                
                .form-group textarea {
                    resize: vertical;
                    min-height: 80px;
                }
                
                .error-message {
                    color: #e74c3c;
                    font-size: 0.8rem;
                    margin-top: 0.25rem;
                    display: none;
                }
                
                /* Checkbox Group */
                .checkbox-group {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 0.5rem;
                }
                
                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    transition: background 0.2s ease;
                    font-weight: 500 !important;
                    font-size: 0.9rem;
                }
                
                .checkbox-item:hover {
                    background: #f8f9fa;
                }
                
                .checkbox-item input[type="checkbox"] {
                    width: auto !important;
                    margin: 0 !important;
                }
                
                /* Buttons */
                .form-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: space-between;
                    margin-top: 2rem;
                }
                
                .btn-primary,
                .btn-secondary {
                    padding: 0.8rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: none;
                    text-decoration: none;
                    justify-content: center;
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    flex: 1;
                }
                
                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                }
                
                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .btn-secondary {
                    background: transparent;
                    color: #666;
                    border: 2px solid #e0e0e0;
                }
                
                .btn-secondary:hover {
                    background: #f8f9fa;
                    border-color: #d0d0d0;
                }
                
                .btn-whatsapp {
                    background: #25d366;
                    color: white;
                }
                
                .btn-whatsapp:hover {
                    background: #22c35e;
                    transform: translateY(-1px);
                    box-shadow: 0 8px 25px rgba(37, 211, 102, 0.3);
                }
                
                /* Loading Spinner */
                .spinner {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Success Step */
                .success-step {
                    text-align: center;
                    padding: 2rem 0;
                }
                
                .success-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #2ecc71, #27ae60);
                    border-radius: 50%;
                    color: white;
                    margin-bottom: 1.5rem;
                }
                
                .success-step h4 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #333;
                    margin: 0 0 1rem;
                }
                
                .success-step p {
                    color: #666;
                    font-size: 1rem;
                    line-height: 1.6;
                    margin: 0 0 2rem;
                }
                
                .success-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    max-width: 300px;
                    margin: 0 auto;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .lead-popup-container {
                        margin: 0.5rem;
                        border-radius: 16px;
                        max-height: 95vh;
                    }
                    
                    .lead-popup-header,
                    .lead-form {
                        padding-left: 1.5rem;
                        padding-right: 1.5rem;
                    }
                    
                    .property-preview {
                        padding: 1rem 1.5rem;
                    }
                    
                    .progress-container {
                        padding: 1rem 1.5rem 0.5rem;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .form-actions {
                        flex-direction: column;
                    }
                    
                    .checkbox-group {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Form submission
        document.getElementById('leadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Click outside to close
        document.getElementById('leadPopup').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.close();
            }
        });
        
        // Real-time validation
        this.setupValidation();
    }
    
    /**
     * Mostrar popup para una propiedad específica
     */
    show(propertyData) {
        this.currentProperty = propertyData;
        this.isOpen = true;
        
        // Update property preview if data provided
        if (propertyData) {
            this.updatePropertyPreview(propertyData);
        }
        
        // Reset form
        this.resetForm();
        
        // Show popup
        const popup = document.getElementById('leadPopup');
        popup.style.display = 'flex';
        
        // Trigger animation after paint
        requestAnimationFrame(() => {
            popup.classList.add('active');
        });
        
        // Track popup shown
        if (window.userTracker) {
            window.userTracker.track('lead_popup_shown', {
                property_id: propertyData?.id || null,
                property_title: propertyData?.title || null
            });
        }
        
        console.log('🎯 Lead popup mostrado para:', propertyData?.title || 'Sin propiedad');
    }
    
    /**
     * Cerrar popup
     */
    close() {
        if (!this.isOpen) return;
        
        const popup = document.getElementById('leadPopup');
        popup.classList.remove('active');
        
        setTimeout(() => {
            popup.style.display = 'none';
            this.isOpen = false;
            this.currentProperty = null;
            this.resetForm();
        }, 300);
        
        // Track popup closed
        if (window.userTracker) {
            window.userTracker.track('lead_popup_closed', {
                completed: false,
                step: this.currentStep
            });
        }
    }
    
    /**
     * Actualizar preview de propiedad
     */
    updatePropertyPreview(propertyData) {
        const preview = document.getElementById('propertyPreview');
        const image = document.getElementById('previewImage');
        const title = document.getElementById('previewTitle');
        const location = document.getElementById('previewLocation');
        const price = document.getElementById('previewPrice');
        
        if (propertyData.image) {
            image.src = propertyData.image;
            image.alt = propertyData.title;
        }
        
        title.textContent = propertyData.title || 'Propiedad';
        location.textContent = propertyData.location || '';
        
        if (propertyData.price) {
            const formattedPrice = new Intl.NumberFormat('es-CL').format(propertyData.price);
            price.textContent = propertyData.currency === 'UF' 
                ? `${formattedPrice} UF` 
                : `$${formattedPrice}`;
        }
        
        preview.style.display = 'flex';
    }
    
    /**
     * Navegar al siguiente paso
     */
    nextStep() {
        if (!this.validateCurrentStep()) {
            return;
        }
        
        this.currentStep++;
        this.updateStepDisplay();
        
        // Track step progression
        if (window.userTracker) {
            window.userTracker.track('lead_form_step_completed', {
                step: this.currentStep - 1,
                total_steps: this.totalSteps
            });
        }
    }
    
    /**
     * Navegar al paso anterior
     */
    prevStep() {
        if (this.currentStep <= 1) return;
        
        this.currentStep--;
        this.updateStepDisplay();
    }
    
    /**
     * Actualizar visualización del paso
     */
    updateStepDisplay() {
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = (this.currentStep / this.totalSteps) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        
        // Update step numbers
        document.getElementById('currentStep').textContent = this.currentStep;
        document.getElementById('totalSteps').textContent = this.totalSteps;
        
        // Show/hide steps
        document.querySelectorAll('.form-step').forEach((step, index) => {
            step.classList.remove('active');
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });
    }
    
    /**
     * Configurar validación en tiempo real
     */
    setupValidation() {
        // Email validation
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', () => {
            this.validateEmail(emailInput.value, emailInput);
        });
        
        // Phone validation
        const phoneInput = document.getElementById('telefono');
        phoneInput.addEventListener('blur', () => {
            this.validatePhone(phoneInput.value, phoneInput);
        });
        
        // Required fields
        document.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('blur', () => {
                this.validateRequired(input.value, input);
            });
        });
    }
    
    /**
     * Validar paso actual
     */
    validateCurrentStep() {
        let isValid = true;
        
        if (this.currentStep === 1) {
            // Validate step 1 fields
            const nombre = document.getElementById('nombre');
            const email = document.getElementById('email');
            const telefono = document.getElementById('telefono');
            
            if (!this.validateRequired(nombre.value, nombre)) isValid = false;
            if (!this.validateEmail(email.value, email)) isValid = false;
            if (!this.validatePhone(telefono.value, telefono)) isValid = false;
            
        } else if (this.currentStep === 2) {
            // Validate step 2 fields
            const tipoInteres = document.getElementById('tipoInteres');
            if (!this.validateRequired(tipoInteres.value, tipoInteres)) isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Validaciones individuales
     */
    validateRequired(value, element) {
        const isValid = value.trim() !== '';
        this.showValidationError(element, isValid ? '' : 'Este campo es obligatorio');
        return isValid;
    }
    
    validateEmail(email, element) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        this.showValidationError(element, isValid ? '' : 'Ingresa un email válido');
        return isValid;
    }
    
    validatePhone(phone, element) {
        const phoneRegex = /^(\+?56)?[ -]?[9][ -]?[0-9]{4}[ -]?[0-9]{4}$/;
        const isValid = phoneRegex.test(phone) || phone.length >= 8;
        this.showValidationError(element, isValid ? '' : 'Ingresa un teléfono válido');
        return isValid;
    }
    
    /**
     * Mostrar error de validación
     */
    showValidationError(element, message) {
        const errorElement = element.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
        }
        
        if (message) {
            element.style.borderColor = '#e74c3c';
        } else {
            element.style.borderColor = '#e0e0e0';
        }
    }
    
    /**
     * Recopilar datos del formulario
     */
    gatherFormData() {
        const formData = new FormData(document.getElementById('leadForm'));
        
        // Get selected zones
        const selectedZones = Array.from(document.querySelectorAll('input[name="zona"]:checked'))
            .map(checkbox => checkbox.value);
        
        return {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            tipo_interes: formData.get('tipoInteres'),
            presupuesto_min: formData.get('presupuestoMin') ? parseInt(formData.get('presupuestoMin')) : null,
            presupuesto_max: formData.get('presupuestoMax') ? parseInt(formData.get('presupuestoMax')) : null,
            zona_interes: selectedZones.length > 0 ? selectedZones : null,
            mensaje: formData.get('mensaje'),
            
            // Additional tracking data
            property_id: this.currentProperty?.id || null,
            utm_source: this.getUrlParameter('utm_source'),
            utm_campaign: this.getUrlParameter('utm_campaign'),
            utm_medium: this.getUrlParameter('utm_medium'),
            ip_address: null, // Will be filled by backend
            user_agent: navigator.userAgent
        };
    }
    
    /**
     * Obtener parámetro de URL
     */
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    /**
     * Enviar formulario
     */
    async submitForm() {
        if (!this.validateCurrentStep()) {
            return;
        }
        
        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        try {
            const leadData = this.gatherFormData();
            
            // Submit to Supabase
            const { data, error } = await supabase
                .from('leads')
                .insert([leadData])
                .select()
                .single();
            
            if (error) {
                console.error('Error guardando lead:', error);
                throw error;
            }
            
            console.log('✅ Lead guardado:', data);
            
            // Associate with user tracking
            if (window.userTracker) {
                await window.userTracker.associateWithLead(data.id);
                window.userTracker.track('lead_form_completed', {
                    lead_id: data.id,
                    property_id: this.currentProperty?.id || null
                });
            }
            
            // Add to favorites if property was provided
            if (this.currentProperty && window.userTracker) {
                await window.userTracker.trackFavorite(
                    this.currentProperty.id,
                    this.currentProperty,
                    'add'
                );
            }
            
            // Show success step
            this.showSuccessStep();
            
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Hubo un error enviando tu información. Por favor intenta nuevamente.');
            
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
        }
    }
    
    /**
     * Mostrar paso de éxito
     */
    showSuccessStep() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show success step
        document.getElementById('stepSuccess').style.display = 'block';
        document.getElementById('stepSuccess').classList.add('active');
        
        // Update progress bar to 100%
        document.querySelector('.progress-fill').style.width = '100%';
        document.getElementById('currentStep').textContent = this.totalSteps;
        
        // Auto-close after delay (optional)
        setTimeout(() => {
            // this.close();
        }, 15000);
    }
    
    /**
     * Resetear formulario
     */
    resetForm() {
        document.getElementById('leadForm').reset();
        this.currentStep = 1;
        this.updateStepDisplay();
        
        // Hide success step
        document.getElementById('stepSuccess').style.display = 'none';
        document.getElementById('stepSuccess').classList.remove('active');
        
        // Clear errors
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.style.borderColor = '#e0e0e0';
        });
    }
}

// ===============================================
// INICIALIZACIÓN Y API PÚBLICA
// ===============================================

// Variable global
window.leadPopup = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.leadPopup = new LeadPopup();
    console.log('🎯 LeadPopup listo');
});

// ===============================================
// INTEGRACIÓN CON FAVORITOS EXISTENTES
// ===============================================

/**
 * Función para mostrar popup desde botones de favoritos
 * Reemplazar la función toggleFavorite existente
 */
function showLeadPopupForProperty(propertyData) {
    if (window.leadPopup) {
        window.leadPopup.show(propertyData);
    }
}

// Export para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeadPopup;
}
