// form-script.js - Script adaptado para formulario de Casa Nuvera
// REEMPLAZA todo el JavaScript que tienes en subir-propiedad.html con este código

let uploadedFiles = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 Modo Casa Nuvera - Formulario iniciado');
    
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
    
    document.getElementById('formContainer').style.display = 'block';
    document.getElementById('authWarning').style.display = 'none';
    
    console.log('✅ Aplicación inicializada correctamente');
}

function setupFileUpload() {
    const fileInput = document.getElementById('imageInput');
    const uploadArea = document.querySelector('.file-upload-area');

    fileInput.addEventListener('change', handleFileSelect);

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
            showFieldError(field, 'Ingrese un teléfono válido (+56 9 1234 5678)');
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

function setupFormSubmit() {
    const form = document.getElementById('propertyForm');
    const previewBtn = document.getElementById('previewBtn');
    
    form.addEventListener('submit', handleFormSubmit);
    previewBtn.addEventListener('click', showPreview);
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
        
        const result = await window.propertyHandler.submitProperty(formData, uploadedFiles);
        
        showLoading(false);
        
        if (result.success) {
            showSuccess();
            resetForm();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('💥 Error:', error);
        showLoading(false);
        alert('Error al publicar la propiedad: ' + error.message);
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
    
    if (uploadedFiles.length === 0) {
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
    updateFileDisplay();
    
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('.form-control').forEach(field => {
        field.style.borderColor = '#ddd';
    });
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
            
            <div class="section">
                <h3>📸 Imágenes (${uploadedFiles.length})</h3>
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
    uploadedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = previewWindow.document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            previewImages.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// FUNCIÓN ADAPTADA A TU ESTRUCTURA EN INGLÉS
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
        price: document.getElementById('price').value,
        expenses: document.getElementById('expenses').value,
        availability: document.getElementById('availability').value,
        contactName: document.getElementById('contactName').value,
        contactPhone: document.getElementById('contactPhone').value,
        contactEmail: document.getElementById('contactEmail').value,
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

console.log('✅ Form Script cargado correctamente - Casa Nuvera');
