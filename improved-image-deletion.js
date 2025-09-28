// improved-image-deletion.js - Función mejorada para eliminar imágenes
console.log('🔧 Cargando función mejorada de eliminación de imágenes...');

// Función mejorada para eliminar imágenes de propiedades
window.deletePropertyImageImproved = async function(propertyId, imageUrl, imageId = null) {
    try {
        console.log(`🗑️ Eliminando imagen mejorada - PropertyId: ${propertyId}, ImageId: ${imageId}, ImageUrl: ${imageUrl}`);
        
        if (!propertyId) {
            throw new Error('ID de propiedad requerido');
        }
        
        if (!window.supabase) {
            throw new Error('Supabase no está disponible');
        }
        
        // Buscar la imagen por ID o URL
        let query = window.supabase
            .from('property_images')
            .select('id, image_url, is_main, image_order')
            .eq('property_id', propertyId);
        
        if (imageId && imageId !== 'null' && imageId !== '') {
            console.log('🔍 Buscando por ID:', imageId);
            query = query.eq('id', imageId);
        } else if (imageUrl) {
            console.log('🔍 Buscando por URL:', imageUrl);
            query = query.eq('image_url', imageUrl);
        } else {
            throw new Error('Se requiere ID de imagen o URL');
        }
        
        const { data: imageRow, error: fetchError } = await query.single();
        
        if (fetchError) {
            console.error('❌ Error buscando imagen:', fetchError);
            
            // Intentar búsqueda alternativa si falla la primera
            if (imageUrl) {
                console.log('🔄 Intentando búsqueda alternativa...');
                const { data: altImages, error: altError } = await window.supabase
                    .from('property_images')
                    .select('id, image_url, is_main, image_order')
                    .eq('property_id', propertyId)
                    .ilike('image_url', `%${imageUrl.split('/').pop()}%`);
                
                if (altError || !altImages || altImages.length === 0) {
                    throw new Error('Imagen no encontrada');
                }
                
                imageRow = altImages[0];
                console.log('✅ Imagen encontrada en búsqueda alternativa');
            } else {
                throw new Error('Imagen no encontrada');
            }
        }
        
        if (!imageRow) {
            throw new Error('Imagen no encontrada');
        }
        
        console.log('📋 Imagen encontrada:', imageRow);
        
        // Eliminar de la base de datos
        const { error: deleteError } = await window.supabase
            .from('property_images')
            .delete()
            .eq('id', imageRow.id);
        
        if (deleteError) {
            console.error('❌ Error eliminando de BD:', deleteError);
            throw new Error(`Error eliminando imagen: ${deleteError.message}`);
        }
        
        console.log('✅ Imagen eliminada de la base de datos');
        
        // Si era la imagen principal, asignar una nueva
        if (imageRow.is_main) {
            console.log('🔄 Reasignando imagen principal...');
            
            const { data: remainingImages, error: remainingError } = await window.supabase
                .from('property_images')
                .select('id, image_order')
                .eq('property_id', propertyId)
                .order('image_order', { ascending: true });
            
            if (!remainingError && remainingImages && remainingImages.length > 0) {
                // Marcar la primera imagen restante como principal
                const { error: updateError } = await window.supabase
                    .from('property_images')
                    .update({ is_main: true })
                    .eq('id', remainingImages[0].id);
                
                if (updateError) {
                    console.warn('⚠️ Error reasignando imagen principal:', updateError);
                } else {
                    console.log('✅ Nueva imagen principal asignada');
                }
            }
        }
        
        // Reordenar las imágenes restantes
        await reorderRemainingImages(propertyId);
        
        console.log('✅ Imagen eliminada correctamente');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error eliminando imagen:', error);
        return { success: false, error: error.message };
    }
};

// Función para reordenar imágenes restantes
async function reorderRemainingImages(propertyId) {
    try {
        console.log('🔄 Reordenando imágenes restantes...');
        
        const { data: remainingImages, error } = await window.supabase
            .from('property_images')
            .select('id, image_order')
            .eq('property_id', propertyId)
            .order('image_order', { ascending: true });
        
        if (error) {
            console.warn('⚠️ Error obteniendo imágenes restantes:', error);
            return;
        }
        
        if (!remainingImages || remainingImages.length === 0) {
            console.log('ℹ️ No hay imágenes restantes para reordenar');
            return;
        }
        
        // Actualizar image_order secuencialmente
        for (let i = 0; i < remainingImages.length; i++) {
            const { error: updateError } = await window.supabase
                .from('property_images')
                .update({ image_order: i })
                .eq('id', remainingImages[i].id);
            
            if (updateError) {
                console.warn(`⚠️ Error actualizando orden de imagen ${remainingImages[i].id}:`, updateError);
            }
        }
        
        console.log('✅ Imágenes reordenadas correctamente');
        
    } catch (error) {
        console.warn('⚠️ Error reordenando imágenes:', error);
    }
}

// Función para obtener todas las imágenes de una propiedad
window.getPropertyImages = async function(propertyId) {
    try {
        if (!window.supabase) {
            throw new Error('Supabase no está disponible');
        }
        
        const { data, error } = await window.supabase
            .from('property_images')
            .select('id, image_url, image_order, is_main')
            .eq('property_id', propertyId)
            .order('image_order', { ascending: true });
        
        if (error) {
            console.error('❌ Error obteniendo imágenes:', error);
            return [];
        }
        
        return data || [];
        
    } catch (error) {
        console.error('❌ Error en getPropertyImages:', error);
        return [];
    }
};

// Función para marcar una imagen como principal
window.setMainImage = async function(propertyId, imageId) {
    try {
        if (!window.supabase) {
            throw new Error('Supabase no está disponible');
        }
        
        // Primero, quitar la marca de principal de todas las imágenes
        const { error: clearError } = await window.supabase
            .from('property_images')
            .update({ is_main: false })
            .eq('property_id', propertyId);
        
        if (clearError) {
            console.warn('⚠️ Error quitando marca de principal:', clearError);
        }
        
        // Luego, marcar la imagen seleccionada como principal
        const { error: setError } = await window.supabase
            .from('property_images')
            .update({ is_main: true })
            .eq('id', imageId)
            .eq('property_id', propertyId);
        
        if (setError) {
            throw new Error(`Error marcando imagen como principal: ${setError.message}`);
        }
        
        console.log('✅ Imagen marcada como principal');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error en setMainImage:', error);
        return { success: false, error: error.message };
    }
};

// Función para mover una imagen en el orden
window.moveImage = async function(propertyId, imageId, direction) {
    try {
        if (!window.supabase) {
            throw new Error('Supabase no está disponible');
        }
        
        // Obtener todas las imágenes ordenadas
        const images = await window.getPropertyImages(propertyId);
        if (images.length < 2) {
            console.log('ℹ️ No hay suficientes imágenes para reordenar');
            return { success: true };
        }
        
        // Encontrar la imagen actual
        const currentIndex = images.findIndex(img => img.id === imageId);
        if (currentIndex === -1) {
            throw new Error('Imagen no encontrada');
        }
        
        // Calcular nuevo índice
        const newIndex = currentIndex + direction;
        if (newIndex < 0 || newIndex >= images.length) {
            console.log('ℹ️ No se puede mover la imagen en esa dirección');
            return { success: true };
        }
        
        // Intercambiar posiciones
        const temp = images[currentIndex].image_order;
        images[currentIndex].image_order = images[newIndex].image_order;
        images[newIndex].image_order = temp;
        
        // Actualizar en la base de datos
        const { error: updateCurrent } = await window.supabase
            .from('property_images')
            .update({ image_order: images[currentIndex].image_order })
            .eq('id', images[currentIndex].id);
        
        const { error: updateNew } = await window.supabase
            .from('property_images')
            .update({ image_order: images[newIndex].image_order })
            .eq('id', images[newIndex].id);
        
        if (updateCurrent || updateNew) {
            throw new Error('Error actualizando orden de imágenes');
        }
        
        console.log('✅ Imagen movida correctamente');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error en moveImage:', error);
        return { success: false, error: error.message };
    }
};

console.log('✅ Funciones mejoradas de eliminación de imágenes cargadas');