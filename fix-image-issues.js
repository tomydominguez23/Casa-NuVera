// fix-image-issues.js - Script para diagnosticar y corregir problemas de imágenes
console.log('🔧 Iniciando diagnóstico y corrección de problemas de imágenes...');

class ImageIssuesFixer {
    constructor() {
        this.supabase = null;
        this.issues = [];
        this.fixes = [];
    }

    async initialize() {
        try {
            // Esperar a que Supabase esté disponible
            if (!window.supabase) {
                console.log('⏳ Esperando Supabase...');
                await this.waitForSupabase();
            }
            
            this.supabase = window.supabase;
            console.log('✅ Supabase disponible');
            
            // Ejecutar diagnóstico
            await this.diagnoseIssues();
            
            // Aplicar correcciones
            await this.applyFixes();
            
        } catch (error) {
            console.error('❌ Error en ImageIssuesFixer:', error);
        }
    }

    async waitForSupabase() {
        return new Promise((resolve) => {
            const checkSupabase = () => {
                if (window.supabase) {
                    resolve();
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };
            checkSupabase();
        });
    }

    async diagnoseIssues() {
        console.log('🔍 Diagnosticando problemas de imágenes...');
        
        // 1. Verificar estructura de la tabla property_images
        await this.checkTableStructure();
        
        // 2. Verificar imágenes existentes
        await this.checkExistingImages();
        
        // 3. Verificar propiedades sin imágenes
        await this.checkPropertiesWithoutImages();
        
        console.log('📋 Diagnóstico completado:', this.issues);
    }

    async checkTableStructure() {
        try {
            console.log('🔍 Verificando estructura de property_images...');
            
            const { data, error } = await this.supabase
                .from('property_images')
                .select('*')
                .limit(1);
            
            if (error) {
                this.issues.push({
                    type: 'table_structure',
                    message: `Error accediendo a property_images: ${error.message}`,
                    severity: 'high'
                });
                return;
            }
            
            if (data && data.length > 0) {
                const columns = Object.keys(data[0]);
                console.log('📊 Columnas encontradas:', columns);
                
                const requiredColumns = ['id', 'property_id', 'image_url'];
                const missingColumns = requiredColumns.filter(col => !columns.includes(col));
                
                if (missingColumns.length > 0) {
                    this.issues.push({
                        type: 'missing_columns',
                        message: `Faltan columnas requeridas: ${missingColumns.join(', ')}`,
                        severity: 'high',
                        missingColumns
                    });
                }
                
                // Verificar columnas opcionales
                const optionalColumns = ['image_order', 'is_main'];
                const missingOptional = optionalColumns.filter(col => !columns.includes(col));
                
                if (missingOptional.length > 0) {
                    this.issues.push({
                        type: 'missing_optional_columns',
                        message: `Faltan columnas opcionales: ${missingOptional.join(', ')}`,
                        severity: 'medium',
                        missingOptional
                    });
                }
            }
            
        } catch (error) {
            this.issues.push({
                type: 'table_check_error',
                message: `Error verificando tabla: ${error.message}`,
                severity: 'high'
            });
        }
    }

    async checkExistingImages() {
        try {
            console.log('🔍 Verificando imágenes existentes...');
            
            const { data, error } = await this.supabase
                .from('property_images')
                .select('id, property_id, image_url')
                .limit(10);
            
            if (error) {
                this.issues.push({
                    type: 'images_query_error',
                    message: `Error consultando imágenes: ${error.message}`,
                    severity: 'high'
                });
                return;
            }
            
            console.log(`📸 Encontradas ${data.length} imágenes`);
            
            // Verificar URLs válidas
            const invalidUrls = data.filter(img => !img.image_url || img.image_url.trim() === '');
            if (invalidUrls.length > 0) {
                this.issues.push({
                    type: 'invalid_image_urls',
                    message: `${invalidUrls.length} imágenes tienen URLs inválidas`,
                    severity: 'medium',
                    count: invalidUrls.length
                });
            }
            
        } catch (error) {
            this.issues.push({
                type: 'images_check_error',
                message: `Error verificando imágenes: ${error.message}`,
                severity: 'high'
            });
        }
    }

    async checkPropertiesWithoutImages() {
        try {
            console.log('🔍 Verificando propiedades sin imágenes...');
            
            const { data: properties, error: propError } = await this.supabase
                .from('properties')
                .select('id, title')
                .eq('published', true)
                .limit(10);
            
            if (propError) {
                this.issues.push({
                    type: 'properties_query_error',
                    message: `Error consultando propiedades: ${propError.message}`,
                    severity: 'high'
                });
                return;
            }
            
            for (const property of properties) {
                const { data: images, error: imgError } = await this.supabase
                    .from('property_images')
                    .select('id')
                    .eq('property_id', property.id)
                    .limit(1);
                
                if (imgError) {
                    console.warn(`⚠️ Error consultando imágenes para propiedad ${property.id}:`, imgError);
                    continue;
                }
                
                if (!images || images.length === 0) {
                    this.issues.push({
                        type: 'property_without_images',
                        message: `Propiedad "${property.title}" no tiene imágenes`,
                        severity: 'low',
                        propertyId: property.id,
                        propertyTitle: property.title
                    });
                }
            }
            
        } catch (error) {
            this.issues.push({
                type: 'properties_check_error',
                message: `Error verificando propiedades: ${error.message}`,
                severity: 'high'
            });
        }
    }

    async applyFixes() {
        console.log('🔧 Aplicando correcciones...');
        
        for (const issue of this.issues) {
            switch (issue.type) {
                case 'missing_optional_columns':
                    await this.addMissingColumns(issue.missingOptional);
                    break;
                case 'property_without_images':
                    await this.addDefaultImage(issue.propertyId, issue.propertyTitle);
                    break;
                default:
                    console.log(`⚠️ No hay corrección automática para: ${issue.type}`);
            }
        }
        
        console.log('✅ Correcciones aplicadas');
    }

    async addMissingColumns(missingColumns) {
        console.log('🔧 Agregando columnas faltantes...');
        
        // Nota: Esto requeriría permisos de administrador en Supabase
        // Por ahora, solo documentamos qué se necesita hacer
        this.fixes.push({
            type: 'add_columns',
            message: `Se necesitan agregar estas columnas a property_images: ${missingColumns.join(', ')}`,
            sql: missingColumns.map(col => {
                if (col === 'image_order') return 'ALTER TABLE property_images ADD COLUMN image_order INTEGER DEFAULT 0;';
                if (col === 'is_main') return 'ALTER TABLE property_images ADD COLUMN is_main BOOLEAN DEFAULT false;';
                return `-- Agregar columna ${col}`;
            }).join('\n')
        });
    }

    async addDefaultImage(propertyId, propertyTitle) {
        console.log(`🖼️ Agregando imagen por defecto para "${propertyTitle}"...`);
        
        // Crear una imagen placeholder usando data URL
        const placeholderImage = this.createPlaceholderImage(propertyTitle);
        
        try {
            const { error } = await this.supabase
                .from('property_images')
                .insert([{
                    property_id: propertyId,
                    image_url: placeholderImage,
                    image_order: 0,
                    is_main: true
                }]);
            
            if (error) {
                console.warn(`⚠️ Error agregando imagen placeholder:`, error);
            } else {
                console.log(`✅ Imagen placeholder agregada para "${propertyTitle}"`);
                this.fixes.push({
                    type: 'add_placeholder_image',
                    propertyId,
                    propertyTitle
                });
            }
        } catch (error) {
            console.warn(`⚠️ Error agregando imagen placeholder:`, error);
        }
    }

    createPlaceholderImage(title) {
        // Crear un SVG placeholder
        const svg = `
            <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f0f0f0"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#666">
                    ${title.substring(0, 30)}...
                </text>
                <text x="50%" y="60%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="12" fill="#999">
                    Imagen no disponible
                </text>
            </svg>
        `;
        
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    // Función para corregir el panel de administración
    async fixAdminPanel() {
        console.log('🔧 Corrigiendo panel de administración...');
        
        // Verificar si estamos en el panel de administración
        if (!document.getElementById('propertiesGrid')) {
            console.log('ℹ️ No estamos en el panel de administración');
            return;
        }
        
        // Recargar propiedades con imágenes
        await this.reloadPropertiesWithImages();
    }

    async reloadPropertiesWithImages() {
        try {
            console.log('🔄 Recargando propiedades con imágenes...');
            
            const { data: properties, error } = await this.supabase
                .from('properties')
                .select(`
                    id,
                    title,
                    property_type,
                    category,
                    bedrooms,
                    bathrooms,
                    price,
                    currency,
                    commune,
                    address,
                    neighborhood,
                    published,
                    created_at
                `)
                .eq('published', true)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('❌ Error cargando propiedades:', error);
                return;
            }
            
            // Para cada propiedad, cargar su imagen principal
            for (const property of properties) {
                const { data: mainImage } = await this.supabase
                    .from('property_images')
                    .select('image_url')
                    .eq('property_id', property.id)
                    .eq('is_main', true)
                    .limit(1)
                    .single();
                
                property.mainImage = mainImage?.image_url || null;
            }
            
            // Actualizar la interfaz
            this.updatePropertiesGrid(properties);
            
        } catch (error) {
            console.error('❌ Error recargando propiedades:', error);
        }
    }

    updatePropertiesGrid(properties) {
        const grid = document.getElementById('propertiesGrid');
        if (!grid) return;
        
        const propertiesHTML = properties.map(property => {
            const price = this.formatPrice(property.price, property.currency);
            const location = `${property.neighborhood || ''} ${property.commune || ''} ${property.address || ''}`.trim();
            const statusText = property.published ? 'ACTIVA' : 'PENDIENTE';
            const statusClass = property.published ? 'status-active' : 'status-pending';
            const date = new Date(property.created_at).toLocaleDateString('es-CL');
            
            // Imagen de la propiedad
            const imageHtml = property.mainImage 
                ? `<img src="${property.mainImage}" alt="${property.title}" class="property-image" style="width: 100%; height: 200px; object-fit: cover;">`
                : `<div class="property-image" style="display: flex; align-items: center; justify-content: center; background: #f8f9fa; color: #7f8c8d; font-size: 3rem;">${property.category === 'casa' ? '🏠' : '🏢'}</div>`;
            
            return `
                <div class="property-card" data-property-id="${property.id}">
                    ${imageHtml}
                    <div class="property-content">
                        <h3 class="property-title">
                            ${property.title || 'Sin título'}
                            <span class="tours-badge no-tours">🌐 0 tours</span>
                        </h3>
                        <div class="property-location">
                            📍 ${location || 'Ubicación no especificada'}
                        </div>
                        
                        <div class="property-details">
                            <div class="property-detail">
                                <span class="property-detail-value">${property.bedrooms || 0}</span>
                                <span class="property-detail-label">DORM.</span>
                            </div>
                            <div class="property-detail">
                                <span class="property-detail-value">${property.bathrooms || 0}</span>
                                <span class="property-detail-label">BAÑOS</span>
                            </div>
                            <div class="property-detail">
                                <span class="property-detail-value">0</span>
                                <span class="property-detail-label">EST.</span>
                            </div>
                        </div>
                        
                        <div class="property-price">${price}</div>
                        
                        <div class="d-flex justify-between align-center">
                            <span class="property-status ${statusClass}">${statusText}</span>
                            <small style="color: #7f8c8d;">${date}</small>
                        </div>
                        
                        <div class="property-actions">
                            <a href="property-detail.html?id=${property.id}" class="action-btn view" target="_blank">
                                👁️ Ver
                            </a>
                            <button class="action-btn tours" onclick="handleTours('${property.id}', '${property.title}')">
                                🌐 Tours
                            </button>
                            <button class="action-btn edit" onclick="handleEdit('${property.id}')">
                                ✏️ Editar
                            </button>
                            <button class="action-btn delete" onclick="handleDelete('${property.id}', '${property.title}')">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        grid.innerHTML = propertiesHTML;
        
        // Actualizar contador
        const countElement = document.getElementById('propertiesCount');
        if (countElement) {
            countElement.textContent = `${properties.length} propiedades encontradas`;
        }
    }

    formatPrice(price, currency = 'CLP') {
        if (!price) return 'Precio a consultar';
        
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return 'Precio a consultar';
        
        switch(currency) {
            case 'CLP':
                return `$${numPrice.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`;
            case 'UF':
                return `${numPrice.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} UF`;
            case 'USD':
                return `US$ ${numPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            default:
                return `${currency} ${numPrice.toLocaleString('es-CL')}`;
        }
    }

    // Función para corregir la eliminación de imágenes
    async fixImageDeletion() {
        console.log('🔧 Corrigiendo función de eliminación de imágenes...');
        
        // Sobrescribir la función problemática
        if (window.propertyHandler) {
            const originalDelete = window.propertyHandler.deletePropertyImage;
            
            window.propertyHandler.deletePropertyImage = async function(propertyId, imageUrl, imageId = null) {
                try {
                    console.log(`🗑️ Eliminando imagen - PropertyId: ${propertyId}, ImageId: ${imageId}, ImageUrl: ${imageUrl}`);
                    
                    if (!propertyId) {
                        throw new Error('ID de propiedad requerido');
                    }
                    
                    // Buscar la imagen por ID o URL
                    let query = this.supabase
                        .from('property_images')
                        .select('id, image_url, is_main')
                        .eq('property_id', propertyId);
                    
                    if (imageId && imageId !== 'null') {
                        query = query.eq('id', imageId);
                    } else if (imageUrl) {
                        query = query.eq('image_url', imageUrl);
                    } else {
                        throw new Error('Se requiere ID de imagen o URL');
                    }
                    
                    const { data: imageRow, error: fetchError } = await query.single();
                    
                    if (fetchError || !imageRow) {
                        throw new Error('Imagen no encontrada');
                    }
                    
                    // Eliminar de la base de datos
                    const { error: deleteError } = await this.supabase
                        .from('property_images')
                        .delete()
                        .eq('id', imageRow.id);
                    
                    if (deleteError) {
                        throw new Error(`Error eliminando imagen: ${deleteError.message}`);
                    }
                    
                    console.log('✅ Imagen eliminada correctamente');
                    return { success: true };
                    
                } catch (error) {
                    console.error('❌ Error eliminando imagen:', error);
                    return { success: false, error: error.message };
                }
            };
            
            console.log('✅ Función de eliminación de imágenes corregida');
        }
    }

    // Generar reporte de problemas
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            issues: this.issues,
            fixes: this.fixes,
            summary: {
                totalIssues: this.issues.length,
                highSeverity: this.issues.filter(i => i.severity === 'high').length,
                mediumSeverity: this.issues.filter(i => i.severity === 'medium').length,
                lowSeverity: this.issues.filter(i => i.severity === 'low').length
            }
        };
        
        console.log('📊 Reporte de problemas:', report);
        return report;
    }
}

// Función global para ejecutar la corrección
window.fixImageIssues = async function() {
    const fixer = new ImageIssuesFixer();
    await fixer.initialize();
    await fixer.fixAdminPanel();
    await fixer.fixImageDeletion();
    return fixer.generateReport();
};

// Auto-ejecutar si estamos en el panel de administración
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('admin-properties.html')) {
            setTimeout(() => window.fixImageIssues(), 2000);
        }
    });
} else {
    if (window.location.pathname.includes('admin-properties.html')) {
        setTimeout(() => window.fixImageIssues(), 2000);
    }
}

console.log('✅ Script de corrección de imágenes cargado');