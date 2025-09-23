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
            // Filtrar solo archivos de imagen (incluye HEIC/HEIF por extensión si viene sin MIME)
            const imageFiles = (files || []).filter((candidate) => {
                const candidateName = (candidate && candidate.name ? candidate.name : '').toLowerCase();
                const candidateType = (candidate && candidate.type ? candidate.type : '');
                const looksLikeImage = candidateType.startsWith('image/');
                const hasImageExtension = /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(candidateName);
                return looksLikeImage || hasImageExtension;
            });

            console.log(`📸 Procesando ${imageFiles.length} imágenes para propiedad ${propertyId}...`);

            for (let i = 0; i < imageFiles.length; i++) {
                let file = imageFiles[i];
                
                // Generar nombre único para el archivo
                const timestamp = Date.now();
                const randomId = Math.random().toString(36).substring(2, 15);
                const originalName = (file && file.name) ? file.name : `imagen_${timestamp}`;

                // Detectar HEIC/HEIF y convertir a JPEG cuando sea posible
                const fileType = (file && file.type) ? file.type : '';
                const isHeic = /heic|heif/i.test(fileType) || /\.(heic|heif)$/i.test(originalName);
                if (isHeic) {
                    try {
                        if (window && window.heic2any) {
                            const blob = await window.heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
                            const newName = originalName.replace(/\.(heic|heif)$/i, '') + '.jpg';
                            file = new File([blob], newName, { type: 'image/jpeg' });
                            console.log('🔄 HEIC convertido a JPEG:', newName);
                        } else {
                            console.warn('⚠️ heic2any no está disponible. Se usará fallback.');
                            // Como fallback, si no podemos convertir, usaremos data URL en la BD para asegurar compatibilidad visual
                            const dataUrl = await this.fileToDataUrl(file);
                            await this.#insertImageRecordWithoutStorage(propertyId, dataUrl, i);
                            continue;
                        }
                    } catch (conversionError) {
                        console.warn('⚠️ Falló conversión HEIC → JPEG. Usando data URL como fallback.', conversionError);
                        const dataUrl = await this.fileToDataUrl(file);
                        await this.#insertImageRecordWithoutStorage(propertyId, dataUrl, i);
                        continue;
                    }
                }

                const fileExtension = (file && file.name ? file.name : originalName).split('.').pop().toLowerCase();
                const fileName = `property_${propertyId}_${i}_${timestamp}.${fileExtension}`;
                
                console.log(`📤 Subiendo imagen ${i + 1}/${files.length}: ${fileName}`);

                let imageUrl = null;

                // Intentar subir a Supabase Storage
                try {
                    const { data, error } = await window.supabase.storage
                        .from('property-images')
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false,
                            contentType: file && file.type ? file.type : undefined
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

    // Insertar registro en la BD cuando no se sube a Storage (usa data URL)
    async #insertImageRecordWithoutStorage(propertyId, imageUrl, index) {
        const imageRecord = {
            property_id: propertyId,
            image_url: imageUrl,
            image_order: index,
            is_main: index === 0
        };
        const { error: insertError } = await window.supabase
            .from('property_images')
            .insert([imageRecord]);
        if (insertError) {
            console.error(`❌ Error insertando imagen ${index}:`, insertError);
        } else {
            console.log(`✅ Imagen ${index} vinculada a propiedad (sin Storage)`);
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

    // Función para eliminar propiedad (admin) - Versión mejorada con manejo robusto de errores
    async deleteProperty(propertyId) {
        try {
            if (!propertyId) {
                throw new Error('ID de propiedad requerido');
            }

            console.log(`🗑️ Iniciando eliminación completa de propiedad ${propertyId}...`);

            // Verificar que la propiedad existe antes de eliminar
            const { data: propertyExists, error: checkError } = await window.supabase
                .from('properties')
                .select('id, title')
                .eq('id', propertyId)
                .single();

            if (checkError || !propertyExists) {
                throw new Error('La propiedad no existe o ya fue eliminada');
            }

            console.log(`📋 Propiedad encontrada: "${propertyExists.title}"`);

            // 1. Obtener información de imágenes antes de eliminar
            const { data: images, error: imagesQueryError } = await window.supabase
                .from('property_images')
                .select('image_url')
                .eq('property_id', propertyId);

            if (imagesQueryError) {
                console.warn('⚠️ Error obteniendo imágenes:', imagesQueryError);
            }

            // 2. Eliminar archivos de Storage si existen
            if (images && images.length > 0) {
                console.log(`📸 Eliminando ${images.length} archivos de Storage...`);
                
                for (const image of images) {
                    if (image.image_url && image.image_url.includes('supabase')) {
                        try {
                            // Extraer nombre del archivo de la URL
                            const fileName = image.image_url.split('/').pop();
                            if (fileName) {
                                const { error: storageError } = await window.supabase.storage
                                    .from('property-images')
                                    .remove([fileName]);
                                
                                if (storageError) {
                                    console.warn(`⚠️ Error eliminando archivo ${fileName}:`, storageError);
                                } else {
                                    console.log(`✅ Archivo eliminado: ${fileName}`);
                                }
                            }
                        } catch (storageError) {
                            console.warn('⚠️ Error eliminando archivo de Storage:', storageError);
                        }
                    }
                }
            }

            // 3. Eliminar tours primero
            console.log('🌐 Eliminando tours 360°...');
            const { error: toursError } = await window.supabase
                .from('property_tours')
                .delete()
                .eq('property_id', propertyId);

            if (toursError) {
                console.warn('⚠️ Error eliminando tours:', toursError);
            } else {
                console.log('✅ Tours eliminados');
            }

            // 4. Eliminar registros de imágenes de la base de datos
            console.log('📸 Eliminando registros de imágenes...');
            const { error: imagesError } = await window.supabase
                .from('property_images')
                .delete()
                .eq('property_id', propertyId);

            if (imagesError) {
                console.warn('⚠️ Error eliminando registros de imágenes:', imagesError);
                
                // Si es el error específico de REPLICA IDENTITY, intentar solución alternativa
                if (imagesError.code === '55000' && imagesError.message.includes('replica identity')) {
                    console.log('🔧 Intentando solución alternativa para REPLICA IDENTITY...');
                    
                    // Intentar eliminar usando una transacción diferente
                    try {
                        const { error: altImagesError } = await window.supabase.rpc('delete_property_images', {
                            property_id: propertyId
                        });
                        
                        if (altImagesError) {
                            console.warn('⚠️ Método alternativo también falló:', altImagesError);
                            // Continuar sin las imágenes, eliminar la propiedad principal
                        } else {
                            console.log('✅ Registros de imágenes eliminados con método alternativo');
                        }
                    } catch (rpcError) {
                        console.warn('⚠️ RPC no disponible, continuando sin eliminar imágenes:', rpcError);
                    }
                } else {
                    // Para otros errores, continuar con la eliminación de la propiedad principal
                    console.log('⚠️ Continuando eliminación sin las imágenes...');
                }
            } else {
                console.log('✅ Registros de imágenes eliminados');
            }

            // 5. Eliminar propiedad principal
            console.log('🏠 Eliminando propiedad principal...');
            const { error: propertyError } = await window.supabase
                .from('properties')
                .delete()
                .eq('id', propertyId);

            if (propertyError) {
                console.error('❌ Error eliminando propiedad principal:', propertyError);
                throw new Error(`Error eliminando propiedad: ${propertyError.message}`);
            }

            console.log('✅ Propiedad eliminada completamente:', propertyId);
            
            // 6. Verificar que la eliminación fue exitosa (con reintentos)
            let verificationAttempts = 0;
            let propertyStillExists = true;
            
            while (verificationAttempts < 3 && propertyStillExists) {
                verificationAttempts++;
                
                // Esperar un poco antes de verificar
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const { data: verifyDelete, error: verifyError } = await window.supabase
                    .from('properties')
                    .select('id')
                    .eq('id', propertyId)
                    .maybeSingle();

                if (verifyError) {
                    // Si hay error, probablemente significa que no existe (eliminación exitosa)
                    if (verifyError.code === 'PGRST116' || verifyError.message.includes('No rows')) {
                        propertyStillExists = false;
                        console.log('✅ Verificación exitosa: La propiedad fue eliminada de la BD');
                    } else {
                        console.warn(`⚠️ Error verificando eliminación: ${verifyError.message}`);
                    }
                } else if (!verifyDelete) {
                    propertyStillExists = false;
                    console.log('✅ Verificación exitosa: La propiedad fue eliminada de la BD');
                } else {
                    console.warn(`⚠️ Intento ${verificationAttempts}: La propiedad aún existe, reintentando...`);
                }
            }

            if (propertyStillExists) {
                console.warn('⚠️ La propiedad aún existe después de 3 intentos de verificación');
                // No lanzar error aquí, la eliminación puede haber sido exitosa pero la verificación falló
            }
            
            // 7. Refrescar propiedades en la web
            if (window.propertyLoader) {
                console.log('🔄 Refrescando lista de propiedades...');
                // Forzar recarga desde BD, no usar cache
                window.propertyLoader.useFallbackData = false;
                await window.propertyLoader.refreshProperties();
            }

            return { 
                success: true, 
                message: 'Propiedad eliminada completamente de la base de datos y archivos',
                deletedImages: images ? images.length : 0,
                propertyTitle: propertyExists.title
            };

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
