// improved-image-deletion.js - Función mejorada para eliminar imágenes
console.log('🔧 Cargando función mejorada de eliminación de imágenes...');

// Función mejorada para eliminar imágenes de propiedades
// CORREGIDA para la estructura real: property_images NO tiene columna 'id'
window.deletePropertyImageImproved = async function(propertyId, imageUrl, imageId = null) {
    try {
        console.log(`🗑️ Eliminando imagen mejorada - PropertyId: ${propertyId}, ImageId: ${imageId}, ImageUrl: ${imageUrl}`);
        
        if (!propertyId) {
            throw new Error('ID de propiedad requerido');
        }
        
        if (!window.supabase) {
            throw new Error('Supabase no está disponible');
        }
        
        // Obtener todas las imágenes de la propiedad
        console.log('🔍 Obteniendo todas las imágenes de la propiedad...');
        const { data: allImages, error: allImagesError } = await window.supabase
            .from('property_images')
            .select('property_id, image_url, image_order, is_main, created_at')
            .eq('property_id', propertyId);
        
        if (allImagesError) {
            console.error('❌ Error obteniendo imágenes:', allImagesError);
            throw new Error(`Error obteniendo imágenes: ${allImagesError.message}`);
        }
        
        if (!allImages || allImages.length === 0) {
            throw new Error('No se encontraron imágenes para esta propiedad');
        }
        
        console.log('📋 Imágenes encontradas:', allImages);
        
        // Buscar la imagen específica a eliminar
        let imageToDelete = null;
        
        if (imageUrl) {
            console.log('🔍 Buscando por URL:', imageUrl);
            // Buscar por URL exacta primero
            imageToDelete = allImages.find(img => img.image_url === imageUrl);
            
            // Si no se encuentra, buscar por nombre de archivo
            if (!imageToDelete) {
                const fileName = imageUrl.split('/').pop()?.split('?')[0];
                if (fileName) {
                    imageToDelete = allImages.find(img => 
                        img.image_url && img.image_url.includes(fileName)
                    );
                }
            }
        } else {
            throw new Error('Se requiere URL de imagen para eliminar');
        }
        
        if (!imageToDelete) {
            throw new Error('Imagen no encontrada en la propiedad');
        }
        
        console.log('📋 Imagen a eliminar encontrada:', imageToDelete);
        
        // Eliminar de la base de datos usando property_id e image_url
        console.log('🗑️ Eliminando por property_id e image_url...');
        const { error: deleteError } = await window.supabase
            .from('property_images')
            .delete()
            .eq('property_id', propertyId)
            .eq('image_url', imageToDelete.image_url);
        
        if (deleteError) {
            console.error('❌ Error eliminando de BD:', deleteError);
            throw new Error(`Error eliminando imagen: ${deleteError.message}`);
        }
        
        console.log('✅ Imagen eliminada de la base de datos');
        
        // Si era la imagen principal, asignar una nueva
        if (imageToDelete.is_main) {
            console.log('🔄 Reasignando imagen principal...');
            
            const { data: remainingImages, error: remainingError } = await window.supabase
                .from('property_images')
                .select('property_id, image_url, image_order, is_main, created_at')
                .eq('property_id', propertyId);
            
            if (!remainingError && remainingImages && remainingImages.length > 0) {
                // Ordenar por image_order y tomar la primera
                const sortedImages = remainingImages.sort((a, b) => {
                    const orderA = a.image_order || 0;
                    const orderB = b.image_order || 0;
                    return orderA - orderB;
                });
                
                const firstImage = sortedImages[0];
                console.log('📋 Marcando como principal:', firstImage);
                
                const { error: updateError } = await window.supabase
                    .from('property_images')
                    .update({ is_main: true })
                    .eq('property_id', propertyId)
                    .eq('image_url', firstImage.image_url);
                
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
            .select('property_id, image_url, image_order, is_main, created_at')
            .eq('property_id', propertyId);
        
        if (error) {
            console.warn('⚠️ Error obteniendo imágenes restantes:', error);
            return;
        }
        
        if (!remainingImages || remainingImages.length === 0) {
            console.log('ℹ️ No hay imágenes restantes para reordenar');
            return;
        }
        
        // Ordenar por image_order si existe, sino por created_at
        const sortedImages = remainingImages.sort((a, b) => {
            const orderA = a.image_order || 0;
            const orderB = b.image_order || 0;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            if (a.created_at && b.created_at) {
                return new Date(a.created_at) - new Date(b.created_at);
            }
            return 0;
        });
        
        // Actualizar image_order secuencialmente usando property_id e image_url
        for (let i = 0; i < sortedImages.length; i++) {
            const image = sortedImages[i];
            
            const { error: updateError } = await window.supabase
                .from('property_images')
                .update({ image_order: i })
                .eq('property_id', propertyId)
                .eq('image_url', image.image_url);
            
            if (updateError) {
                console.warn(`⚠️ Error actualizando orden de imagen ${i}:`, updateError);
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
            .select('property_id, image_url, image_order, is_main, created_at')
            .eq('property_id', propertyId);
        
        if (error) {
            console.error('❌ Error obteniendo imágenes:', error);
            return [];
        }
        
        if (!data || data.length === 0) {
            return [];
        }
        
        // Ordenar por image_order si existe, sino por created_at
        const sortedImages = data.sort((a, b) => {
            const orderA = a.image_order || 0;
            const orderB = b.image_order || 0;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            if (a.created_at && b.created_at) {
                return new Date(a.created_at) - new Date(b.created_at);
            }
            return 0;
        });
        
        return sortedImages;
        
    } catch (error) {
        console.error('❌ Error en getPropertyImages:', error);
        return [];
    }
};

// Función para marcar una imagen como principal
window.setMainImage = async function(propertyId, imageUrl) {
    try {
        if (!window.supabase) {
            throw new Error('Supabase no está disponible');
        }
        
        if (!imageUrl) {
            throw new Error('URL de imagen requerida');
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
            .eq('property_id', propertyId)
            .eq('image_url', imageUrl);
        
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
window.moveImage = async function(propertyId, imageUrl, direction) {
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
        const currentIndex = images.findIndex(img => img.image_url === imageUrl);
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
        const temp = images[currentIndex].image_order || currentIndex;
        images[currentIndex].image_order = images[newIndex].image_order || newIndex;
        images[newIndex].image_order = temp;
        
        // Actualizar en la base de datos usando property_id e image_url
        const { error: updateCurrentError } = await window.supabase
            .from('property_images')
            .update({ image_order: images[currentIndex].image_order })
            .eq('property_id', propertyId)
            .eq('image_url', images[currentIndex].image_url);
        
        const { error: updateNewError } = await window.supabase
            .from('property_images')
            .update({ image_order: images[newIndex].image_order })
            .eq('property_id', propertyId)
            .eq('image_url', images[newIndex].image_url);
        
        if (updateCurrentError || updateNewError) {
            console.warn('⚠️ Error actualizando orden de imágenes:', { updateCurrentError, updateNewError });
            // No lanzar error, solo mostrar advertencia
        }
        
        console.log('✅ Imagen movida correctamente');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error en moveImage:', error);
        return { success: false, error: error.message };
    }
};

console.log('✅ Funciones mejoradas de eliminación de imágenes cargadas');