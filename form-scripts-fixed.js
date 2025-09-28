// form-scripts-fixed.js - Script corregido para formulario de Casa Nuvera
// REEMPLAZA form-scripts.js con este código corregido

let uploadedFiles = [];
let propertyTours = [];
let propertyImages = [];
let propertyVideos = [];
let editMode = false;
let editingPropertyId = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 Modo Casa Nuvera - Formulario iniciado (VERSIÓN CORREGIDA)');
    
    // Esperar a que Supabase esté listo
    if (window.supabase) {
        initializeApp();
    } else {
        window.addEventListener('supabaseReady', initializeApp);
        
        // Timeout de seguridad
        setTimeout(() => {
            if (!window.supabase) {
                console.error('❌ Timeout: Supabase no se pudo cargar');
                alert('Error: No se pudo conectar con la base de datos. Recarga la página.');
            }
        }, 5000);
    }
});

function initializeApp() {
    console.log('🚀 Inicializando aplicación...');
    
    if (!window.supabase) {
        console.error('❌ Error: Supabase no está disponible');
        document.getElementById('authWarning').style.display = 'block';
        document.getElementById('formContainer').style.display = 'none';
        return;
    }
    
    setupFileUpload();
    setupFormValidation();
    setupFormSubmit();
    setupRegionCommune();
    setupToursSection();
    setupVideosSection();
    setupImagesSection();
    
    // Google Maps se maneja por separado con el script unificado
    console.log('🗺️ Google Maps manejado por script unificado');
    
    document.getElementById('formContainer').style.display = 'block';
    document.getElementById('authWarning').style.display = 'none';
    
    // Detectar modo edición
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) {
        editMode = true;
        editingPropertyId = editId;
        console.log('✏️ Modo edición activado. ID:', editingPropertyId);
        enableEditUI();
        loadPropertyForEdit(editingPropertyId);
    }

    console.log('✅ Aplicación inicializada correctamente');
}

// ======================
// FUNCIONES PARA TOURS 360°
// ======================
function setupToursSection() {
    console.log('🌐 Configurando sección de Tours 360°...');
    
    // Auto-completar URL cuando se escribe el título
    const tourTitleInput = document.getElementById('tourTitle');
    const tourUrlInput = document.getElementById('tourUrl');
    
    if (tourTitleInput && tourUrlInput) {
        tourTitleInput.addEventListener('input', function() {
            if (!tourUrlInput.value && this.value) {
                tourUrlInput.value = 'https://kuula.co/share/collection/7D9k8?logo=0&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1';
            }
        });
    }
    
    // Inicializar orden
    updateTourOrder();
}

function addTour() {
    const titleInput = document.getElementById('tourTitle');
    const urlInput = document.getElementById('tourUrl');
    const orderInput = document.getElementById('tourOrder');

    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    const order = parseInt(orderInput.value) || 1;

    // Validaciones
    if (!title) {
        alert('Por favor ingresa un título para el tour');
        titleInput.focus();
        return;
    }

    if (!url) {
        alert('Por favor ingresa la URL de Kuula');
        urlInput.focus();
        return;
    }

    if (!url.includes('kuula.co')) {
        alert('La URL debe ser de Kuula (kuula.co)');
        urlInput.focus();
        return;
    }

    // Agregar tour a la lista
    const newTour = {
        id: Date.now(),
        tour_title: title,
        tour_url: url,
        order_index: order,
        is_active: true
    };

    propertyTours.push(newTour);
    
    // Limpiar formulario
    titleInput.value = '';
    urlInput.value = '';
    updateTourOrder();

    // Re-renderizar lista
    renderToursList();

    console.log('✅ Tour agregado:', newTour);
}

function removeTour(tourId) {
    propertyTours = propertyTours.filter(tour => tour.id !== tourId);
    renderToursList();
    updateTourOrder();
    console.log('🗑️ Tour eliminado:', tourId);
}

function previewTour(tourUrl) {
    window.open(tourUrl, '_blank', 'width=1200,height=800');
}

function renderToursList() {
    const container = document.getElementById('toursList');
    
    if (propertyTours.length === 0) {
        container.innerHTML = `
            <div class="empty-tours">
                <p>🏠 No hay tours virtuales agregados</p>
                <p>Agrega tu primer tour 360° usando el formulario de abajo</p>
            </div>
        `;
        return;
    }

    container.innerHTML = propertyTours.map(tour => `
        <div class="tour-item">
            <div class="tour-info">
                <div class="tour-title">${tour.tour_title}</div>
                <div class="tour-url">${tour.tour_url}</div>
                <small>Orden: ${tour.order_index}</small>
            </div>
            <div class="tour-actions">
                <button class="tour-btn preview" onclick="previewTour('${tour.tour_url}')">
                    👁️ Vista Previa
                </button>
                <button class="tour-btn delete" onclick="removeTour(${tour.id})">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function updateTourOrder() {
    const orderInput = document.getElementById('tourOrder');
    if (orderInput) {
        orderInput.value = propertyTours.length + 1;
    }
}

function getToursForSaving() {
    return propertyTours.map(tour => ({
        tour_title: tour.tour_title,
        tour_url: tour.tour_url,
        order_index: tour.order_index,
        is_active: true
    }));
}

// ======================
// FUNCIONES PARA IMÁGENES
// ======================
function setupImagesSection() {
    console.log('📸 Configurando sección de imágenes...');
    
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            handleFileUpload(e.target.files, 'image');
        });
    }
}

function handleFileUpload(files, type) {
    Array.from(files).forEach(file => {
        if (type === 'image') {
            if (!file.type.startsWith('image/')) {
                alert('Por favor selecciona solo archivos de imagen');
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB
                alert('Las imágenes deben ser menores a 10MB');
                return;
            }
            if (propertyImages.length >= 20) {
                alert('Máximo 20 imágenes por propiedad');
                return;
            }
            addImageToList(file);
        } else if (type === 'video') {
            if (!file.type.startsWith('video/')) {
                alert('Por favor selecciona solo archivos de video');
                return;
            }
            if (file.size > 50 * 1024 * 1024) { // 50MB
                alert('Los videos deben ser menores a 50MB');
                return;
            }
            if (propertyVideos.length >= 5) {
                alert('Máximo 5 videos por propiedad');
                return;
            }
            addVideoToList(file);
        }
    });
}

function addImageToList(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            name: file.name,
            size: file.size
        };
        
        propertyImages.push(imageData);
        renderImageList();
        console.log('📸 Imagen agregada:', file.name);
    };
    reader.readAsDataURL(file);
}

function renderImageList() {
    const container = document.getElementById('fileList');
    container.innerHTML = propertyImages.map((image, index) => `
        <div class="file-item">
            <img src="${image.preview}" alt="${image.name}">
            <div class="file-name">${image.name}</div>
            <div style="font-size: 0.7rem; color: #999; margin-top: 0.3rem;">
                ${(image.size / 1024 / 1024).toFixed(1)} MB
                ${index === 0 ? '<br><strong>📌 Imagen Principal</strong>' : ''}
            </div>
            <button class="remove-file" onclick="removeImage(${image.id})">×</button>
        </div>
    `).join('');
}

function removeImage(imageId) {
    propertyImages = propertyImages.filter(img => img.id !== imageId);
    renderImageList();
    console.log('🗑️ Imagen eliminada:', imageId);
}

// ======================
// FUNCIONES PARA VIDEOS
// ======================
function setupVideosSection() {
    console.log('🎥 Configurando sección de videos...');
    
    const videoInput = document.getElementById('videoInput');
    if (videoInput) {
        videoInput.addEventListener('change', function(e) {
            handleFileUpload(e.target.files, 'video');
        });
    }
}

function addVideoToList(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const videoData = {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            name: file.name,
            size: file.size,
            duration: 0
        };
        
        propertyVideos.push(videoData);
        renderVideoList();
        console.log('🎥 Video agregado:', file.name);
    };
    reader.readAsDataURL(file);
}

function renderVideoList() {
    const container = document.getElementById('videoList');
    container.innerHTML = propertyVideos.map((video, index) => `
        <div class="video-item">
            <video src="${video.preview}" controls muted preload="metadata">
                Tu navegador no soporta videos.
            </video>
            <div class="video-name">${video.name}</div>
            <div class="video-info">
                📁 ${(video.size / 1024 / 1024).toFixed(1)} MB
            </div>
            <button class="remove-file" onclick="removeVideo(${video.id})">×</button>
        </div>
    `).join('');
}

function removeVideo(videoId) {
    propertyVideos = propertyVideos.filter(vid => vid.id !== videoId);
    renderVideoList();
    console.log('🗑️ Video eliminado:', videoId);
}

// ======================
// FUNCIONES PARA ARCHIVOS (COMPATIBILIDAD)
// ======================
function setupFileUpload() {
    const fileInput = document.getElementById('imageInput');
    const uploadArea = document.querySelector('.file-upload-area');

    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            handleFiles(files);
        });
    }
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    handleFiles(files);
}

function handleFiles(files) {
    files.forEach(file => {
        if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
            uploadedFiles.push(file);
            displayFile(file);
        } else {
            alert(`Error: ${file.name} no es una imagen válida o excede 10MB`);
        }
    });
}

function displayFile(file) {
    const fileList = document.getElementById('fileList');
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const reader = new FileReader();
    reader.onload = (e) => {
        fileItem.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}">
            <div class="file-name">${file.name}</div>
            <button type="button" class="remove-file" onclick="removeFile('${file.name}')">×</button>
        `;
    };
    reader.readAsDataURL(file);
    fileList.appendChild(fileItem);
}

function removeFile(fileName) {
    uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
    updateFileDisplay();
}

function updateFileDisplay() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    uploadedFiles.forEach(file => displayFile(file));
}

// ======================
// VALIDACIÓN DE FORMULARIO
// ======================
function setupFormValidation() {
    const form = document.getElementById('propertyForm');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo es obligatorio');
        return false;
    }
    
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Ingrese un email válido');
            return false;
        }
    }
    
    if (field.type === 'tel' && value) {
        const phoneRegex = /^(\+56|56)?[\s\-]?[2-9][\s\-]?\d{4}[\s\-]?\d{4}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            showFieldError(field, 'Ingrese un teléfono válido (+569 77944695)');
            return false;
        }
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.style.borderColor = '#e74c3c';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.style.borderColor = '#ddd';
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function clearError(event) {
    clearFieldError(event.target);
}

// ======================
// ENVÍO DE FORMULARIO
// ======================
function setupFormSubmit() {
    const form = document.getElementById('propertyForm');
    const previewBtn = document.getElementById('previewBtn');
    
    form.addEventListener('submit', handleFormSubmit);
    if (previewBtn) {
        previewBtn.addEventListener('click', showPreview);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!window.supabase) {
        alert('Error: No hay conexión con la base de datos');
        return;
    }
    
    if (!window.propertyHandler) {
        alert('Error: Property Handler no está disponible');
        return;
    }
    
    if (!validateForm()) {
        return;
    }
    
    showLoading(true);
    
    try {
        const formData = getFormData();
        console.log('📤 Enviando formulario:', formData);
        console.log('🌐 Tours incluidos:', getToursForSaving());
        console.log('📸 Imágenes incluidas:', propertyImages.length);
        console.log('🎥 Videos incluidos:', propertyVideos.length);

        if (editMode) {
            // Actualizar propiedad existente
            const updatePayload = window.propertyHandler.preparePropertyData(formData);
            const updateResult = await window.propertyHandler.updateProperty(editingPropertyId, updatePayload);
            if (!updateResult.success) {
                throw new Error(updateResult.error || 'No se pudo actualizar la propiedad');
            }

            // Actualizar tours: reemplazar todos por los actuales del formulario
            const toursResult = await window.propertyHandler.updatePropertyTours(editingPropertyId, getToursForSaving());
            if (toursResult && toursResult.success === false) {
                console.warn('⚠️ Error actualizando tours:', toursResult.error);
            }

            // Subir nuevas imágenes si el usuario agregó
            const newImageFiles = propertyImages.map(img => img.file).filter(Boolean);
            if (newImageFiles.length > 0) {
                await window.propertyHandler.uploadAndLinkImages(editingPropertyId, newImageFiles);
            }

            // Subir y vincular videos si el usuario agregó
            const newVideos = getVideosForSaving();
            if (newVideos.length > 0) {
                const videosResult = await window.propertyHandler.updatePropertyVideos(editingPropertyId, newVideos);
                if (videosResult && videosResult.success === false) {
                    console.warn('⚠️ Error actualizando videos:', videosResult.error);
                }
            }

            showLoading(false);
            showSuccess();

            // Mantener en página de edición y refrescar datos
            await loadPropertyForEdit(editingPropertyId);
        } else {
            // Crear nueva propiedad
            const imageFiles = propertyImages.map(img => img.file);
            const videos = getVideosForSaving();
            const result = await window.propertyHandler.submitProperty(formData, imageFiles, getToursForSaving(), videos);
            showLoading(false);
            if (result.success) {
                showSuccess();
                resetForm();
            } else {
                alert('Error: ' + result.message);
            }
        }
    } catch (error) {
        console.error('💥 Error:', error);
        showLoading(false);
        alert((editMode ? 'Error al actualizar la propiedad: ' : 'Error al publicar la propiedad: ') + error.message);
    }
}

function validateForm() {
    const form = document.getElementById('propertyForm');
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    if (propertyImages.length === 0) {
        alert('Debe subir al menos una imagen de la propiedad');
        isValid = false;
    }
    
    if (!isValid) {
        alert('Por favor complete todos los campos obligatorios correctamente');
    }
    
    return isValid;
}

function showLoading(show) {
    const loadingDiv = document.getElementById('loadingDiv');
    const submitBtn = document.getElementById('submitBtn');
    
    if (show) {
        loadingDiv.classList.add('active');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publicando...';
    } else {
        loadingDiv.classList.remove('active');
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 Publicar Propiedad';
    }
}

function showSuccess() {
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}

function resetForm() {
    document.getElementById('propertyForm').reset();
    uploadedFiles = [];
    propertyTours = [];
    propertyImages = [];
    propertyVideos = [];
    
    updateFileDisplay();
    renderToursList();
    renderImageList();
    renderVideoList();
    updateTourOrder();
    
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('.form-control').forEach(field => {
        field.style.borderColor = '#ddd';
    });
}

// ======================
// MODO EDICIÓN
// ======================
function enableEditUI() {
    const header = document.querySelector('.page-header h1');
    const subtitle = document.getElementById('welcomeMessage');
    const submitBtn = document.getElementById('submitBtn');
    if (header) header.textContent = 'Editar Propiedad';
    if (subtitle) subtitle.textContent = 'Modifica la información de la propiedad seleccionada';
    if (submitBtn) submitBtn.textContent = '💾 Guardar Cambios';
}

async function loadPropertyForEdit(propertyId) {
    try {
        if (!window.supabase) throw new Error('Supabase no disponible');
        // Cargar datos principales
        const { data: property, error } = await window.supabase
            .from('properties')
            .select('*')
            .eq('id', propertyId)
            .single();
        if (error) throw error;

        // Prefill campos
        setFormValue('propertyTitle', property.title || '');
        setFormValue('propertyType', property.property_type || '');
        setFormValue('category', property.category || '');
        setFormValue('bedrooms', String(property.bedrooms ?? ''));
        setFormValue('bathrooms', String(property.bathrooms ?? ''));
        setFormValue('description', property.description || '');
        setFormValue('region', property.region || '');
        setFormValue('commune', property.commune || '');
        setFormValue('address', property.address || '');
        setFormValue('neighborhood', property.neighborhood || '');
        setFormValue('totalArea', property.total_area ?? '');
        setFormValue('builtArea', property.built_area ?? '');
        setFormValue('parkingSpaces', property.parking_spaces ?? '');
        setFormValue('currency', property.currency || 'CLP');
        setFormValue('price', property.price ?? '');
        setFormValue('expenses', property.expenses ?? '');
        setFormValue('availability', property.availability || 'inmediata');
        setFormValue('contactName', property.contact_name || '');
        setFormValue('contactPhone', property.contact_phone || '');
        setFormValue('contactEmail', property.contact_email || '');
        setFormValue('googleMapsUrl', property.google_maps_url || '');

        // Features
        document.querySelectorAll('input[name="features"]').forEach(cb => cb.checked = false);
        if (Array.isArray(property.features)) {
            property.features.forEach(val => {
                const el = document.querySelector(`input[name="features"][value="${val}"]`);
                if (el) el.checked = true;
            });
        }
        const featuredEl = document.getElementById('destacada');
        if (featuredEl) featuredEl.checked = !!property.featured;

        // Cargar tours
        const { data: tours, error: toursError } = await window.supabase
            .from('property_tours')
            .select('*')
            .eq('property_id', propertyId)
            .order('order_index', { ascending: true });
        if (toursError) console.warn('⚠️ Error cargando tours:', toursError);
        propertyTours = (tours || []).map(t => ({
            id: t.id,
            tour_title: t.tour_title,
            tour_url: t.tour_url,
            order_index: t.order_index || 1,
            is_active: t.is_active !== false
        }));
        renderToursList();
        updateTourOrder();

        // Cargar imágenes existentes (solo mostrar)
        let images = [];
        try {
            const { data: imgs } = await window.supabase
                .from('property_images')
                .select('id, image_url, image_order, is_main')
                .eq('property_id', propertyId)
                .order('image_order', { ascending: true });
            images = imgs || [];
        } catch (_) { images = []; }

        // Fallback: si no hay filas en property_images pero la propiedad tiene image_url, mostrarla editable
        if ((!images || images.length === 0) && property.image_url) {
            images = [{ id: null, image_url: property.image_url, image_order: 0, is_main: true }];
        }
        renderExistingImages(images);

        // Cargar videos existentes con controles (eliminar y reordenar)
        try {
            const { data: videosData } = await window.supabase
                .from('property_videos')
                .select('id, video_url, video_title, video_order')
                .eq('property_id', propertyId)
                .order('video_order', { ascending: true });
            renderExistingVideos(videosData || []);
        } catch (e) {
            console.warn('⚠️ No se pudieron cargar videos existentes:', e);
            renderExistingVideos([]);
        }

        console.log('✅ Datos cargados para edición');
    } catch (e) {
        console.error('❌ Error cargando propiedad para editar:', e);
        alert('No se pudo cargar la propiedad para editar: ' + (e.message || e));
    }
}

function setFormValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = value == null ? '' : value;
    }
}

function renderExistingImages(images) {
    const section = document.getElementById('existingImagesSection');
    const list = document.getElementById('existingImagesList');
    if (!section || !list) return;
    if (!images || images.length === 0) {
        section.style.display = 'none';
        list.innerHTML = '';
        return;
    }
    section.style.display = 'block';
    list.innerHTML = images.map((img, index) => `
        <div class="file-item" data-image-id="${img.id || ''}">
            <img src="${img.image_url}" alt="Imagen existente ${index + 1}">
            <div class="file-name">${img.is_main ? '📌 Principal' : 'Imagen ' + (index + 1)}</div>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem; justify-content:center;">
                <button class="btn btn-secondary" style="padding:0.4rem 0.8rem;" onclick="moveExistingImage(${img.id || 'null'}, -1)">↑ Subir</button>
                <button class="btn btn-secondary" style="padding:0.4rem 0.8rem;" onclick="moveExistingImage(${img.id || 'null'}, 1)">↓ Bajar</button>
                <button class="btn btn-secondary" style="padding:0.4rem 0.8rem;" onclick="setImageAsMain(${img.id || 'null'})">📌 Principal</button>
                <button class="remove-file" title="Eliminar imagen" onclick="deleteExistingImage(this, ${img.id || 'null'}, '${encodeURIComponent(img.image_url)}')">×</button>
            </div>
        </div>
    `).join('');
}

// ======================
// REORDENAR IMÁGENES EXISTENTES
// ======================
async function moveExistingImage(imageId, direction) {
    try {
        if (!editMode || !editingPropertyId) return;
        // Obtener lista actual con su orden
        const { data: images } = await window.supabase
            .from('property_images')
            .select('id, image_order')
            .eq('property_id', editingPropertyId)
            .order('image_order', { ascending: true });
        if (!images || images.length === 0) return;

        const index = images.findIndex(i => i.id === imageId);
        if (index === -1) return;
        const targetIndex = index + (direction > 0 ? 1 : -1);
        if (targetIndex < 0 || targetIndex >= images.length) return;

        const a = images[index];
        const b = images[targetIndex];
        const orderA = typeof a.image_order === 'number' ? a.image_order : index;
        const orderB = typeof b.image_order === 'number' ? b.image_order : targetIndex;

        await window.supabase.from('property_images').update({ image_order: orderB }).eq('id', a.id);
        await window.supabase.from('property_images').update({ image_order: orderA }).eq('id', b.id);

        // Recargar lista y renderizar
        const { data: updated } = await window.supabase
            .from('property_images')
            .select('id, image_url, image_order, is_main')
            .eq('property_id', editingPropertyId)
            .order('image_order', { ascending: true });
        renderExistingImages(updated || []);
    } catch (e) {
        console.error('❌ Error reordenando imagen:', e);
        alert('No se pudo reordenar la imagen');
    }
}

async function setImageAsMain(imageId) {
    try {
        if (!editMode || !editingPropertyId) return;
        if (!imageId) return;
        // Marcar imagen como principal y desmarcar el resto
        await window.supabase
            .from('property_images')
            .update({ is_main: true })
            .eq('id', imageId);
        await window.supabase
            .from('property_images')
            .update({ is_main: false })
            .eq('property_id', editingPropertyId)
            .neq('id', imageId);

        // Opcional: colocarla al inicio (orden 0) y reindexar
        try {
            const { data: imgs } = await window.supabase
                .from('property_images')
                .select('id')
                .eq('property_id', editingPropertyId)
                .order('image_order', { ascending: true });
            if (imgs && imgs.length > 0) {
                // Poner seleccionada primero
                const others = imgs.filter(i => i.id !== imageId);
                await window.supabase.from('property_images').update({ image_order: 0 }).eq('id', imageId);
                for (let i = 0; i < others.length; i++) {
                    await window.supabase.from('property_images').update({ image_order: i + 1 }).eq('id', others[i].id);
                }
            }
        } catch (_) { /* noop */ }

        const { data: updated } = await window.supabase
            .from('property_images')
            .select('id, image_url, image_order, is_main')
            .eq('property_id', editingPropertyId)
            .order('image_order', { ascending: true });
        renderExistingImages(updated || []);
    } catch (e) {
        console.error('❌ Error marcando imagen principal:', e);
        alert('No se pudo marcar como principal');
    }
}

async function reindexExistingImages() {
    try {
        const { data: imgs } = await window.supabase
            .from('property_images')
            .select('id')
            .eq('property_id', editingPropertyId)
            .order('image_order', { ascending: true });
        if (!imgs) return;
        for (let i = 0; i < imgs.length; i++) {
            await window.supabase
                .from('property_images')
                .update({ image_order: i })
                .eq('id', imgs[i].id);
        }
    } catch (_) { /* noop */ }
}

// ======================
// VIDEOS EXISTENTES: listar, eliminar y reordenar
// ======================
function renderExistingVideos(videos) {
    const section = document.getElementById('existingVideosSection');
    const list = document.getElementById('existingVideosList');
    if (!section || !list) return;
    if (!videos || videos.length === 0) {
        section.style.display = 'none';
        list.innerHTML = '';
        return;
    }
    section.style.display = 'block';
    list.innerHTML = videos.map((v, index) => `
        <div class="video-item" data-video-id="${v.id || ''}">
            <div class="video-wrapper">
                <video src="${v.video_url}" controls muted preload="metadata"></video>
            </div>
            <div class="video-name">${v.video_title || `Video ${index + 1}`}</div>
            <div class="video-info">Orden: <strong>${(typeof v.video_order === 'number' ? v.video_order : index + 1)}</strong></div>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem; justify-content:center;">
                <button class="btn btn-secondary" style="padding:0.4rem 0.8rem;" onclick="moveExistingVideo(${v.id || 'null'}, -1)">↑ Subir</button>
                <button class="btn btn-secondary" style="padding:0.4rem 0.8rem;" onclick="moveExistingVideo(${v.id || 'null'}, 1)">↓ Bajar</button>
                <button class="remove-file" title="Eliminar video" onclick="deleteExistingVideo(${v.id || 'null'}, '${encodeURIComponent(v.video_url)}')">×</button>
            </div>
        </div>
    `).join('');
}

async function deleteExistingVideo(videoId, encodedUrl) {
    try {
        if (!editMode || !editingPropertyId) {
            alert('No estás en modo edición');
            return;
        }
        if (!confirm('¿Eliminar este video de la propiedad?')) return;

        const url = encodedUrl ? decodeURIComponent(encodedUrl) : null;
        // Eliminar registro de video (y dejamos el archivo en storage por ahora)
        const del = await window.supabase
            .from('property_videos')
            .delete()
            .match(videoId ? { id: videoId, property_id: editingPropertyId } : { property_id: editingPropertyId, video_url: url });
        if (del.error) throw del.error;

        // Reindexar orden restante
        await reindexExistingVideos();
        // Recargar
        const { data: videosData } = await window.supabase
            .from('property_videos')
            .select('id, video_url, video_title, video_order')
            .eq('property_id', editingPropertyId)
            .order('video_order', { ascending: true });
        renderExistingVideos(videosData || []);
    } catch (e) {
        console.error('❌ Error eliminando video:', e);
        alert('Error al eliminar el video: ' + (e.message || e));
    }
}

async function moveExistingVideo(videoId, direction) {
    try {
        if (!editMode || !editingPropertyId) return;
        // Obtener lista actual
        const { data: videos } = await window.supabase
            .from('property_videos')
            .select('id, video_order')
            .eq('property_id', editingPropertyId)
            .order('video_order', { ascending: true });
        if (!videos || videos.length === 0) return;

        // Encontrar índice
        const index = videos.findIndex(v => v.id === videoId);
        if (index === -1) return;
        const targetIndex = index + (direction > 0 ? 1 : -1);
        if (targetIndex < 0 || targetIndex >= videos.length) return;

        // Intercambiar órdenes (swap)
        const a = videos[index];
        const b = videos[targetIndex];
        const orderA = typeof a.video_order === 'number' ? a.video_order : index + 1;
        const orderB = typeof b.video_order === 'number' ? b.video_order : targetIndex + 1;

        await window.supabase.from('property_videos').update({ video_order: orderB }).eq('id', a.id);
        await window.supabase.from('property_videos').update({ video_order: orderA }).eq('id', b.id);

        // Volver a cargar y renderizar
        const { data: videosData } = await window.supabase
            .from('property_videos')
            .select('id, video_url, video_title, video_order')
            .eq('property_id', editingPropertyId)
            .order('video_order', { ascending: true });
        renderExistingVideos(videosData || []);
    } catch (e) {
        console.error('❌ Error moviendo video:', e);
        alert('No se pudo reordenar el video');
    }
}

async function reindexExistingVideos() {
    try {
        const { data: videos } = await window.supabase
            .from('property_videos')
            .select('id')
            .eq('property_id', editingPropertyId)
            .order('video_order', { ascending: true });
        if (!videos) return;
        for (let i = 0; i < videos.length; i++) {
            await window.supabase
                .from('property_videos')
                .update({ video_order: i + 1 })
                .eq('id', videos[i].id);
        }
    } catch (_) { /* noop */ }
}

// Eliminar imagen existente (modo edición)
async function deleteExistingImage(buttonEl, imageId, encodedUrl) {
    try {
        if (!editMode || !editingPropertyId) {
            alert('No estás en modo edición');
            return;
        }

        const imageUrl = encodedUrl ? decodeURIComponent(encodedUrl) : null;
        if (!confirm('¿Eliminar esta imagen de la propiedad?')) {
            return;
        }

        // Deshabilitar botón visualmente
        if (buttonEl) {
            buttonEl.disabled = true;
            buttonEl.style.opacity = '0.6';
        }

        if (!window.propertyHandler) {
            throw new Error('Property handler no está disponible');
        }

        const result = await window.propertyHandler.deletePropertyImage(editingPropertyId, imageUrl, imageId);
        if (!result || !result.success) {
            throw new Error(result && result.error ? result.error : 'No se pudo eliminar la imagen');
        }

        // Recargar la lista de imágenes desde la BD
        const { data: updatedImages, error } = await window.supabase
            .from('property_images')
            .select('image_url, image_order, is_main')
            .eq('property_id', editingPropertyId)
            .order('image_order', { ascending: true });
        if (error) {
            console.warn('⚠️ Error recargando imágenes:', error);
        }
        renderExistingImages(updatedImages || []);

    } catch (e) {
        console.error('❌ Error eliminando imagen:', e);
        alert('Error al eliminar la imagen: ' + (e.message || e));
        if (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.style.opacity = '1';
        }
    }
}

function showPreview() {
    const formData = getFormData();
    
    if (!validateForm()) {
        return;
    }
    
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vista Previa - ${formData.title}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                .header { background: #2c3e50; color: white; padding: 20px; margin: -20px -20px 20px; }
                .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                .features { display: flex; flex-wrap: wrap; gap: 10px; }
                .feature { background: #ecf0f1; padding: 5px 10px; border-radius: 3px; font-size: 0.9rem; }
                .images { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin: 20px 0; }
                .images img { width: 100%; height: 150px; object-fit: cover; border-radius: 5px; }
                .tours { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; }
                .tour-item { background: rgba(255,255,255,0.1); padding: 10px; margin: 10px 0; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏠 ${formData.title}</h1>
                <p>${formData.address}, ${formData.commune}</p>
                <p><strong>Casa Nuvera</strong> - Vista Previa de Propiedad</p>
            </div>
            
            <div class="section">
                <h3>💰 Información Básica</h3>
                <p><strong>Tipo:</strong> ${formData.propertyType}</p>
                <p><strong>Categoría:</strong> ${formData.category}</p>
                <p><strong>Dormitorios:</strong> ${formData.bedrooms}</p>
                <p><strong>Baños:</strong> ${formData.bathrooms}</p>
                <p><strong>Precio:</strong> ${formData.currency} ${formData.price}</p>
                ${formData.expenses ? `<p><strong>Gastos Comunes:</strong> $${formData.expenses}</p>` : ''}
            </div>
            
            <div class="section">
                <h3>📝 Descripción</h3>
                <p>${formData.description || 'Sin descripción'}</p>
            </div>
            
            <div class="section">
                <h3>📐 Medidas</h3>
                ${formData.totalArea ? `<p><strong>Superficie Total:</strong> ${formData.totalArea}m²</p>` : ''}
                ${formData.builtArea ? `<p><strong>Superficie Construida:</strong> ${formData.builtArea}m²</p>` : ''}
                ${formData.parkingSpaces ? `<p><strong>Estacionamientos:</strong> ${formData.parkingSpaces}</p>` : ''}
            </div>
            
            <div class="section">
                <h3>✨ Características</h3>
                <div class="features">
                    ${formData.features.map(feature => `<span class="feature">${feature}</span>`).join('')}
                </div>
            </div>
            
            ${propertyTours.length > 0 ? `
                <div class="section">
                    <div class="tours">
                        <h3>🌐 Tours Virtuales 360° (${propertyTours.length})</h3>
                        ${propertyTours.map(tour => `
                            <div class="tour-item">
                                <strong>${tour.tour_title}</strong><br>
                                <small>${tour.tour_url}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="section">
                <h3>📸 Imágenes (${propertyImages.length})</h3>
                <div class="images" id="previewImages"></div>
            </div>
            
            <div class="section">
                <h3>📞 Contacto</h3>
                <p><strong>Nombre:</strong> ${formData.contactName}</p>
                <p><strong>Teléfono:</strong> ${formData.contactPhone}</p>
                <p><strong>Email:</strong> ${formData.contactEmail}</p>
            </div>
        </body>
        </html>
    `);
    
    const previewImages = previewWindow.document.getElementById('previewImages');
    propertyImages.forEach(image => {
        const img = previewWindow.document.createElement('img');
        img.src = image.preview;
        img.alt = image.name;
        previewImages.appendChild(img);
    });
}

// ======================
// FUNCIONES DE DATOS
// ======================
function getFormData() {
    const data = {
        title: document.getElementById('propertyTitle').value,
        propertyType: document.getElementById('propertyType').value,
        category: document.getElementById('category').value,
        bedrooms: document.getElementById('bedrooms').value,
        bathrooms: document.getElementById('bathrooms').value,
        description: document.getElementById('description').value,
        region: document.getElementById('region').value,
        commune: document.getElementById('commune').value,
        address: document.getElementById('address').value,
        neighborhood: document.getElementById('neighborhood').value,
        totalArea: document.getElementById('totalArea').value,
        builtArea: document.getElementById('builtArea').value,
        parkingSpaces: document.getElementById('parkingSpaces').value,
        currency: document.getElementById('currency').value,
        price: normalizeLocalizedNumber(document.getElementById('price').value),
        expenses: document.getElementById('expenses').value,
        availability: document.getElementById('availability').value,
        contactName: document.getElementById('contactName').value,
        contactPhone: document.getElementById('contactPhone').value,
        contactEmail: document.getElementById('contactEmail').value,
        googleMapsUrl: document.getElementById('googleMapsUrl').value || null,
        features: [],
        featured: false
    };
    
    // Recopilar características seleccionadas
    document.querySelectorAll('input[name="features"]:checked').forEach(checkbox => {
        if (checkbox.value === 'destacada') {
            data.featured = true;
        } else {
            data.features.push(checkbox.value);
        }
    });
    
    return data;
}

// Normaliza entradas tipo "6.000" o "6.000,5" -> 6000 o 6000.5
function normalizeLocalizedNumber(input) {
    if (input == null) return '';
    const raw = String(input).trim();
    if (raw === '') return '';
    // Quitar separadores de miles (puntos y espacios finos)
    let sanitized = raw.replace(/\.(?=\d{3}(\D|$))/g, '').replace(/[\u00A0\s]/g, '');
    // Convertir coma decimal a punto
    sanitized = sanitized.replace(/,(\d+)$/, '.$1');
    const num = parseFloat(sanitized);
    return isNaN(num) ? '' : num;
}

function setupRegionCommune() {
    const regionSelect = document.getElementById('region');
    const communeSelect = document.getElementById('commune');
    
    if (regionSelect && communeSelect) {
        regionSelect.addEventListener('change', function() {
            const region = this.value;
            
            communeSelect.innerHTML = '<option value="">Seleccionar comuna...</option>';
            
            if (region === 'Región Metropolitana') {
                const comunas = [
                    'Las Condes', 'Providencia', 'Vitacura', 'Ñuñoa', 'Santiago',
                    'La Reina', 'Lo Barnechea', 'Huechuraba', 'Quilicura', 'Maipú',
                    'Pudahuel', 'Estación Central', 'San Miguel', 'La Florida',
                    'Peñalolén', 'Macul', 'San Joaquín', 'Pedro Aguirre Cerda'
                ];
                
                comunas.forEach(comuna => {
                    const option = document.createElement('option');
                    option.value = comuna;
                    option.textContent = comuna;
                    communeSelect.appendChild(option);
                });
            }
        });
    }
}

console.log('✅ Form Script Corregido cargado correctamente - Casa Nuvera con Tours 360°, Imágenes, Videos y Google Maps');