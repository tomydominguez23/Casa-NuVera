// property-handler.js - Corregido para estructura real de Casa Nuvera con Tours 360°
console.log('🔄 Cargando Property Handler (Corregido con Tours 360°)...');

class PropertyHandler {
    constructor() {
        this.isSubmitting = false;
        this.uploadProgress = 0;
    }

    // Función principal para enviar propiedad (actualizada para incluir tours)
    async submitProperty(formData, files = [], tours = []) {
        if (this.isSubmitting) {
            return { success: false, message: 'Ya hay una propiedad siendo enviada' };
        }

        if (!window.supabase) {
            return { success: false, message: 'No hay conexión con la base de datos' };
        }

        this.isSubmitting = true;
        
        try {
            console.log('📤 Enviando propiedad a Supabase...', formData);
            console.log('🌐 Tours incluidos:', tours);

            // 1. Preparar datos para la base de datos (SIN imágenes primero)
            const propertyData = this.preparePropertyData(formData);
            
            // 2. Insertar propiedad en la base de datos
            const { data, error } = await window.supabase
                .from('properties')
                .insert([propertyData])
                .select()
                .single();

            if (error) {
                console.error('❌ Error insertando en BD:', error);
                throw new Error(`Error de base de datos: ${error.message}`);
            }

            console.log('✅ Propiedad guardada:', data);

            // 3. Subir imágenes y asociarlas a la propiedad
            if (files && files.length > 0) {
                await this.uploadAndLinkImages(data.id, files);
            }

            // 4. Guardar tours 360° si existen
            if (tours && tours.length > 0) {
                await this.saveTours(data.id, tours);
            }

            // 5. Recargar propiedades en la página si existe el loader
            if (window.propertyLoader) {
                setTimeout(() => {
                    window.propertyLoader.refreshProperties();
                }, 1000);
            }

            return {
                success: true,
                data: data,
                message: 'Propiedad publicada exitosamente'
            };

        } catch (error) {
            console.error('💥 Error en submitProperty:', error);
            return {
                success: false,
                message: error.message || 'Error desconocido al publicar la propiedad'
            };
        } finally {
            this.isSubmitting = false;
        }
    }

    // Nueva función para guardar tours 360°
    async saveTours(propertyId, tours) {
        try {
            console.log(`🌐 Guardando ${tours.length} tours para propiedad ${propertyId}...`);

            if (!tours || tours.length === 0) {
                console.log('ℹ️ No hay tours para guardar');
                return;
            }

            // Preparar datos de tours para insertar
            const tourRecords = tours.map(tour => ({
                property_id: propertyId,
                tour_url: tour.tour_url,
                tour_title: tour.tour_title || 'Tour Virtual 360°',
                order_index: tour.order_index || 1,
                is_active: tour.is_active !== false // Default true
            }));

            // Insertar tours en la base de datos
            const { data, error } = await window.supabase
                .from('property_tours')
                .insert(tourRecords)
                .select();

            if (error) {
                console.error('❌ Error insertando tours:', error);
                throw new Error(`Error guardando tours: ${error.message}`);
            }

            console.log(`✅ ${data.length} tours guardados exitosamente:`, data);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Error en saveTours:', error);
            // No lanzar error para no interrumpir el proceso principal
            return { success: false, error: error.message };
        }
    }

    // Preparar datos para insertar en la base de datos (SIN imágenes)
    preparePropertyData(formData) {
        const propertyData = {
            // Campos básicos - EXACTOS a tu estructura
            title: formData.title || '',
            property_type: formData.propertyType || 'venta',
            category: formData.category || 'casa',
            bedrooms: parseInt(formData.bedrooms) || 0,
            bathrooms: parseInt(formData.bathrooms) || 1,
            description: formData.description || '',
            
            // Ubicación
            region: formData.region || '',
            commune: formData.commune || '',
            address: formData.address || '',
            neighborhood: formData.neighborhood || '',
            
            // Medidas
            total_area: formData.totalArea ? parseFloat(formData.totalArea) : null,
            built_area: formData.builtArea ? parseFloat(formData.builtArea) : null,
            parking_spaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : 0,
            
            // Precio
            price: parseFloat(formData.price) || 0,
            currency: formData.currency || 'CLP',
            expenses: formData.expenses ? parseFloat(formData.expenses) : null,
            availability: formData.availability || 'inmediata',
            
            // Contacto
            contact_name: formData.contactName || '',
            contact_phone: formData.contactPhone || '',
            contact_email: formData.contactEmail || '',
            
            // Google Maps
            google_maps_url: formData.googleMapsUrl || null,
            
            // Características
            features: formData.features || [],
            featured: formData.featured || false,
            
            // Estado
            published: true
            
            // Las fechas created_at y updated_at se manejan automáticamente
        };

        console.log('📋 Datos preparados para BD:', propertyData);
        return propertyData;
    }

    // Subir imágenes y crear registros en property_images
    async uploadAndLinkImages(propertyId, files) {
        try {
            console.log(`📸 Procesando ${files.length} imágenes para propiedad ${propertyId}...`);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Generar nombre único para el archivo
                const timestamp = Date.now();
                const randomId = Math.random().toString(36).substring(2, 15);
                const fileExtension = file.name.split('.').pop().toLowerCase();
                const fileName = `property_${propertyId}_${i}_${timestamp}.${fileExtension}`;
                
                console.log(`📤 Subiendo imagen ${i + 1}/${files.length}: ${fileName}`);

                let imageUrl = null;

                // Intentar subir a Supabase Storage
                try {
                    const { data, error } = await window.supabase.storage
                        .from('property-images')
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (error) {
                        console.warn(`⚠️ Error subiendo ${fileName} a Storage:`, error);
                        // Usar data URL como fallback
                        imageUrl = await this.fileToDataUrl(file);
                    } else {
                        // Obtener URL pública
                        const { data: urlData } = window.supabase.storage
                            .from('property-images')
                            .getPublicUrl(fileName);
                        imageUrl = urlData.publicUrl;
                        console.log(`✅ Imagen subida a Storage: ${imageUrl}`);
                    }
                } catch (storageError) {
                    console.warn(`⚠️ Error de Storage, usando fallback:`, storageError);
                    imageUrl = await this.fileToDataUrl(file);
                }

                // Crear registro en property_images
                if (imageUrl) {
                    const imageRecord = {
                        property_id: propertyId,
                        image_url: imageUrl,
                        image_order: i,
                        is_main: i === 0 // Primera imagen como principal
                    };

                    const { error: insertError } = await window.supabase
                        .from('property_images')
                        .insert([imageRecord]);

                    if (insertError) {
                        console.error(`❌ Error insertando imagen ${i}:`, insertError);
                    } else {
                        console.log(`✅ Imagen ${i} vinculada a propiedad`);
                    }
                }
            }

            console.log(`✅ ${files.length} imágenes procesadas para propiedad ${propertyId}`);

        } catch (error) {
            console.error('❌ Error general en uploadAndLinkImages:', error);
        }
    }

    // Convertir archivo a data URL (fallback)
    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Función para validar conexión con Supabase
    async validateConnection() {
        try {
            if (!window.supabase) {
                throw new Error('Cliente de Supabase no disponible');
            }

            // Intentar hacer una consulta simple
            const { data, error } = await window.supabase
                .from('properties')
                .select('count')
                .limit(1);

            if (error) {
                throw new Error(`Error de conexión: ${error.message}`);
            }

            console.log('✅ Conexión a Supabase validada');
            return { success: true };

        } catch (error) {
            console.error('❌ Error validando conexión:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión' 
            };
        }
    }

    // Función para obtener propiedades con tours (útil para debugging)
    async getProperties(limit = 10) {
        try {
            const { data, error } = await window.supabase
                .from('properties')
                .select(`
                    *,
                    property_images(
                        image_url,
                        image_order,
                        is_main
                    ),
                    property_tours(
                        id,
                        tour_url,
                        tour_title,
                        order_index,
                        is_active
                    )
                `)
                .eq('published', true)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                throw error;
            }

            console.log(`📋 ${data?.length || 0} propiedades obtenidas con imágenes y tours`);
            return { success: true, data: data || [] };

        } catch (error) {
            console.error('❌ Error obteniendo propiedades:', error);
            return { success: false, error: error.message };
        }
    }

    // Función para eliminar propiedad (admin) - actualizada para tours
    async deleteProperty(propertyId) {
        try {
            if (!propertyId) {
                throw new Error('ID de propiedad requerido');
            }

            // Eliminar tours primero
            const { error: toursError } = await window.supabase
                .from('property_tours')
                .delete()
                .eq('property_id', propertyId);

            if (toursError) {
                console.warn('⚠️ Error eliminando tours:', toursError);
            }

            // Eliminar imágenes
            const { error: imagesError } = await window.supabase
                .from('property_images')
                .delete()
                .eq('property_id', propertyId);

            if (imagesError) {
                console.warn('⚠️ Error eliminando imágenes:', imagesError);
            }

            // Eliminar propiedad
            const { error } = await window.supabase
                .from('properties')
                .delete()
                .eq('id', propertyId);

            if (error) {
                throw error;
            }

            console.log('🗑️ Propiedad eliminada:', propertyId);
            
            // Refrescar propiedades
            if (window.propertyLoader) {
                window.propertyLoader.refreshProperties();
            }

            return { success: true };

        } catch (error) {
            console.error('❌ Error eliminando propiedad:', error);
            return { success: false, error: error.message };
        }
    }

    // Nueva función para gestionar tours de una propiedad
    async updatePropertyTours(propertyId, tours) {
        try {
            console.log(`🌐 Actualizando tours para propiedad ${propertyId}...`);

            // Eliminar tours existentes
            const { error: deleteError } = await window.supabase
                .from('property_tours')
                .delete()
                .eq('property_id', propertyId);

            if (deleteError) {
                console.warn('⚠️ Error eliminando tours existentes:', deleteError);
            }

            // Insertar nuevos tours si existen
            if (tours && tours.length > 0) {
                const result = await this.saveTours(propertyId, tours);
                return result;
            }

            return { success: true, message: 'Tours actualizados' };

        } catch (error) {
            console.error('❌ Error actualizando tours:', error);
            return { success: false, error: error.message };
        }
    }

    // Función para actualizar propiedad
    async updateProperty(propertyId, updates) {
        try {
            if (!propertyId) {
                throw new Error('ID de propiedad requerido');
            }

            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await window.supabase
                .from('properties')
                .update(updateData)
                .eq('id', propertyId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log('📝 Propiedad actualizada:', data);

            // Refrescar propiedades
            if (window.propertyLoader) {
                window.propertyLoader.refreshProperties();
            }

            return { success: true, data };

        } catch (error) {
            console.error('❌ Error actualizando propiedad:', error);
            return { success: false, error: error.message };
        }
    }
}

// Crear instancia global
window.propertyHandler = new PropertyHandler();

// Función de conveniencia para el formulario (actualizada)
window.submitProperty = async function(formData, files, tours) {
    return await window.propertyHandler.submitProperty(formData, files, tours);
};

// Auto-validar conexión cuando se carga
document.addEventListener('DOMContentLoaded', async function() {
    if (window.supabase) {
        await window.propertyHandler.validateConnection();
    } else {
        window.addEventListener('supabaseReady', async function() {
            await window.propertyHandler.validateConnection();
        });
    }
});

console.log('✅ Property Handler cargado correctamente - Casa Nuvera con Tours 360°');
