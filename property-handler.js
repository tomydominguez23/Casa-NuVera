// property-handler.js - Corregido para estructura real de Casa Nuvera con Tours 360°
console.log('🔄 Cargando Property Handler (Corregido con Tours 360°)...');

class PropertyHandler {
    constructor() {
        this.isSubmitting = false;
        this.uploadProgress = 0;
    }

    // Función principal para enviar propiedad (actualizada para incluir tours)
    async submitProperty(formData, files = [], tours = [], videos = []) {
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

            // 5. Subir y asociar videos si existen
            if (videos && videos.length > 0) {
                await this.uploadAndLinkVideos(data.id, videos);
            }

            // 6. Recargar propiedades en la página si existe el loader
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

    // Subir videos y crear registros en property_videos
    async uploadAndLinkVideos(propertyId, videos) {
        try {
            // Permitir dos formatos de entrada:
            // - Array<File>
            // - Array<{ file: File, video_order?: number, video_title?: string }>
            const asObjects = (videos || []).map((candidate) => {
                if (candidate && candidate.file instanceof File) {
                    return {
                        file: candidate.file,
                        video_order: candidate.video_order || null,
                        video_title: candidate.video_title || null
                    };
                }
                return {
                    file: candidate,
                    video_order: null,
                    video_title: null
                };
            }).filter(v => !!v.file);

            // Filtrar solo archivos de video por MIME o extensión
            const videoObjects = asObjects.filter(({ file }) => {
                const name = (file && file.name ? file.name : '').toLowerCase();
                const type = (file && file.type ? file.type : '');
                const looksLikeVideo = type.startsWith('video/');
                const hasVideoExtension = /\.(mp4|mov|avi|webm|mkv)$/i.test(name);
                return looksLikeVideo || hasVideoExtension;
            });

            if (videoObjects.length === 0) {
                console.log('ℹ️ No hay videos válidos para subir');
                return { success: true, uploaded: 0 };
            }

            console.log(`🎬 Procesando ${videoObjects.length} videos para propiedad ${propertyId}...`);

            for (let i = 0; i < videoObjects.length; i++) {
                const { file, video_order, video_title } = videoObjects[i];

                const timestamp = Date.now();
                const randomId = Math.random().toString(36).substring(2, 10);
                const originalName = (file && file.name) ? file.name : `video_${timestamp}.mp4`;
                const extension = originalName.split('.').pop().toLowerCase();
                const safeExt = extension.match(/^(mp4|mov|avi|webm|mkv)$/i) ? extension : 'mp4';
                const fileName = `property_${propertyId}_${i}_${timestamp}_${randomId}.${safeExt}`;

                console.log(`📤 Subiendo video ${i + 1}/${videoObjects.length}: ${fileName}`);

                let videoUrl = null;
                try {
                    const { data, error } = await window.supabase.storage
                        .from('property-videos')
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false,
                            contentType: file && file.type ? file.type : undefined
                        });

                    if (error) {
                        console.error('❌ Error subiendo video a Storage:', error);
                        continue; // No crear registro sin URL
                    }

                    const { data: urlData } = window.supabase.storage
                        .from('property-videos')
                        .getPublicUrl(fileName);
                    videoUrl = urlData.publicUrl;
                } catch (storageError) {
                    console.error('❌ Error de Storage al subir video:', storageError);
                    continue; // No crear registro sin URL
                }

                if (!videoUrl) continue;

                const record = {
                    property_id: propertyId,
                    video_url: videoUrl,
                    video_title: video_title || originalName,
                    video_order: (typeof video_order === 'number' && !isNaN(video_order)) ? video_order : (i + 1)
                };

                const { error: insertError } = await window.supabase
                    .from('property_videos')
                    .insert([record]);

                if (insertError) {
                    console.error('❌ Error insertando registro de video:', insertError);
                } else {
                    console.log('✅ Video vinculado a propiedad');
                }
            }

            return { success: true };
        } catch (error) {
            console.error('❌ Error general en uploadAndLinkVideos:', error);
            return { success: false, error: error.message };
        }
    }

    // Reemplazar videos de una propiedad por los provistos
    async updatePropertyVideos(propertyId, videos) {
        try {
            console.log(`🎬 Actualizando videos para propiedad ${propertyId}...`);

            // Eliminar registros existentes
            const { error: delErr } = await window.supabase
                .from('property_videos')
                .delete()
                .eq('property_id', propertyId);

            if (delErr) {
                console.warn('⚠️ Error eliminando videos existentes:', delErr);
            }

            if (videos && videos.length > 0) {
                return await this.uploadAndLinkVideos(propertyId, videos);
            }

            return { success: true };
        } catch (error) {
            console.error('❌ Error en updatePropertyVideos:', error);
            return { success: false, error: error.message };
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
        const normalizeNumber = (value) => {
            if (value == null) return 0;
            const raw = String(value).trim();
            if (raw === '') return 0;
            // remover separadores de miles y convertir coma decimal
            let sanitized = raw.replace(/\.(?=\d{3}(\D|$))/g, '').replace(/[\u00A0\s]/g, '');
            sanitized = sanitized.replace(/,(\d+)$/, '.$1');
            const num = parseFloat(sanitized);
            return isNaN(num) ? 0 : num;
        };

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
            total_area: formData.totalArea ? normalizeNumber(formData.totalArea) : null,
            built_area: formData.builtArea ? normalizeNumber(formData.builtArea) : null,
            parking_spaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : 0,
            
            // Precio
            price: normalizeNumber(formData.price) || 0,
            currency: formData.currency || 'CLP',
            expenses: formData.expenses ? normalizeNumber(formData.expenses) : null,
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

    // Eliminar UNA imagen de una propiedad (DB + Storage) y reordenar
    async deletePropertyImage(propertyId, imageUrl) {
        try {
            if (!propertyId || !imageUrl) {
                throw new Error('Parámetros inválidos para eliminar imagen');
            }

            // Buscar el registro exacto de la imagen
            let imageRow = null;
            let fetchError = null;
            try {
                const exact = await window.supabase
                    .from('property_images')
                    .select('id, image_url, is_main')
                    .eq('property_id', propertyId)
                    .eq('image_url', imageUrl)
                    .maybeSingle();
                imageRow = exact.data;
                fetchError = exact.error;
            } catch (e) {
                fetchError = e;
            }

            // Fallback: intentar buscar por el nombre del archivo/path si no se encontró
            if (!imageRow) {
                try {
                    let pathTail = null;
                    if (imageUrl.includes('/storage/v1/object/public/property-images/')) {
                        const match = imageUrl.match(/\/object\/public\/property-images\/(.+)$/);
                        if (match && match[1]) {
                            pathTail = match[1].split('?')[0];
                        }
                    }
                    const fileName = imageUrl.split('/').pop()?.split('?')[0] || null;

                    let altQuery = window.supabase
                        .from('property_images')
                        .select('id, image_url, is_main')
                        .eq('property_id', propertyId)
                        .limit(1);

                    if (pathTail) {
                        altQuery = altQuery.ilike('image_url', `%${pathTail}`);
                    } else if (fileName) {
                        altQuery = altQuery.ilike('image_url', `%${fileName}`);
                    }

                    const { data: altData, error: altErr } = await altQuery;
                    if (!altErr && altData && altData.length > 0) {
                        imageRow = altData[0];
                    }
                } catch (e) {
                    // ignore
                }
            }

            if (!imageRow) {
                throw new Error('Imagen no encontrada para esta propiedad');
            }

            // Intentar eliminar archivo de Storage si corresponde a Supabase
            try {
                if (imageUrl.includes('/storage/v1/object/public/property-images/')) {
                    let storagePath = null;
                    const match = imageUrl.match(/\/object\/public\/property-images\/(.+)$/);
                    if (match && match[1]) {
                        storagePath = match[1];
                    } else {
                        storagePath = imageUrl.split('/').pop();
                    }
                    if (storagePath) {
                        storagePath = storagePath.split('?')[0];
                        const { error: storageError } = await window.supabase.storage
                            .from('property-images')
                            .remove([storagePath]);
                        if (storageError) {
                            console.warn('⚠️ No se pudo eliminar el archivo de Storage:', storageError);
                        }
                    }
                }
            } catch (storageEx) {
                console.warn('⚠️ Error eliminando archivo de Storage:', storageEx);
            }

            // Eliminar registro en BD
            const { error: deleteRowError } = await window.supabase
                .from('property_images')
                .delete()
                .eq('id', imageRow.id);

            if (deleteRowError) {
                throw new Error(`No se pudo eliminar el registro de la imagen: ${deleteRowError.message}`);
            }

            // Reasignar imagen principal si era principal y reordenar índices
            const { data: remaining, error: remainingError } = await window.supabase
                .from('property_images')
                .select('id, image_order')
                .eq('property_id', propertyId)
                .order('image_order', { ascending: true });

            if (remainingError) {
                console.warn('⚠️ Error obteniendo imágenes restantes para reordenar:', remainingError);
            } else if (remaining && remaining.length > 0) {
                // Si la eliminada era principal, marcar la primera como principal
                if (imageRow.is_main) {
                    try {
                        const newMainId = remaining[0].id;
                        await window.supabase
                            .from('property_images')
                            .update({ is_main: true })
                            .eq('id', newMainId);
                        await window.supabase
                            .from('property_images')
                            .update({ is_main: false })
                            .eq('property_id', propertyId)
                            .neq('id', newMainId);
                    } catch (reassignErr) {
                        console.warn('⚠️ Error reasignando imagen principal:', reassignErr);
                    }
                }

                // Reindexar image_order secuencialmente
                for (let i = 0; i < remaining.length; i++) {
                    const img = remaining[i];
                    try {
                        await window.supabase
                            .from('property_images')
                            .update({ image_order: i })
                            .eq('id', img.id);
                    } catch (orderErr) {
                        console.warn('⚠️ Error actualizando image_order:', orderErr);
                    }
                }
            }

            console.log('✅ Imagen eliminada correctamente de la propiedad');
            return { success: true };
        } catch (error) {
            console.error('❌ Error en deletePropertyImage:', error);
            return { success: false, error: error.message };
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

            // 5. Eliminar videos
            console.log('🎬 Eliminando videos asociados...');
            const { error: videosError } = await window.supabase
                .from('property_videos')
                .delete()
                .eq('property_id', propertyId);
            if (videosError) {
                console.warn('⚠️ Error eliminando videos:', videosError);
            } else {
                console.log('✅ Videos eliminados');
            }

            // 6. Eliminar propiedad principal
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
            
            // 7. Verificar que la eliminación fue exitosa (con reintentos)
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
window.submitProperty = async function(formData, files, tours, videos) {
    return await window.propertyHandler.submitProperty(formData, files, tours, videos);
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
