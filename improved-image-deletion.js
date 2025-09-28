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
        
        // Primero, obtener todas las imágenes de la propiedad para entender la estructura
        console.log('🔍 Obteniendo todas las imágenes de la propiedad...');
        const { data: allImages, error: allImagesError } = await window.supabase
            .from('property_images')
            .select('*')
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
        
        if (imageId && imageId !== 'null' && imageId !== '') {
            console.log('🔍 Buscando por ID:', imageId);
            imageToDelete = allImages.find(img => img.id === imageId);
        } else if (imageUrl) {
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
        }
        
        if (!imageToDelete) {
            throw new Error('Imagen no encontrada en la propiedad');
        }
        
        console.log('📋 Imagen a eliminar encontrada:', imageToDelete);
        
        // Eliminar de la base de datos usando la clave primaria disponible
        let deleteError = null;
        
        // Intentar diferentes estrategias de eliminación según la estructura de la tabla
        if (imageToDelete.id) {
            console.log('🗑️ Eliminando por ID...');
            const { error } = await window.supabase
                .from('property_images')
                .delete()
                .eq('id', imageToDelete.id);
            deleteError = error;
        } else if (imageToDelete.property_id && imageToDelete.image_url) {
            console.log('🗑️ Eliminando por property_id e image_url...');
            const { error } = await window.supabase
                .from('property_images')
                .delete()
                .eq('property_id', propertyId)
                .eq('image_url', imageToDelete.image_url);
            deleteError = error;
        } else {
            throw new Error('No se puede determinar cómo eliminar la imagen');
        }
        
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
                .select('*')
                .eq('property_id', propertyId);
            
            if (!remainingError && remainingImages && remainingImages.length > 0) {
                // Marcar la primera imagen restante como principal
                const firstImage = remainingImages[0];
                if (firstImage.id) {
                    const { error: updateError } = await window.supabase
                        .from('property_images')
                        .update({ is_main: true })
                        .eq('id', firstImage.id);
                    
                    if (updateError) {
                        console.warn('⚠️ Error reasignando imagen principal:', updateError);
                    } else {
                        console.log('✅ Nueva imagen principal asignada');
                    }
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
            .select('*')
            .eq('property_id', propertyId);
        
        if (error) {
            console.warn('⚠️ Error obteniendo imágenes restantes:', error);
            return;
        }
        
        if (!remainingImages || remainingImages.length === 0) {
            console.log('ℹ️ No hay imágenes restantes para reordenar');
            return;
        }
        
        // Ordenar por image_order si existe, sino por created_at, sino por id
        const sortedImages = remainingImages.sort((a, b) => {
            if (a.image_order !== undefined && b.image_order !== undefined) {
                return a.image_order - b.image_order;
            }
            if (a.created_at && b.created_at) {
                return new Date(a.created_at) - new Date(b.created_at);
            }
            if (a.id && b.id) {
                return a.id.localeCompare(b.id);
            }
            return 0;
        });
        
        // Actualizar image_order secuencialmente
        for (let i = 0; i < sortedImages.length; i++) {
            const image = sortedImages[i];
            let updateError = null;
            
            if (image.id) {
                const { error } = await window.supabase
                    .from('property_images')
                    .update({ image_order: i })
                    .eq('id', image.id);
                updateError = error;
            } else if (image.property_id && image.image_url) {
                const { error } = await window.supabase
                    .from('property_images')
                    .update({ image_order: i })
                    .eq('property_id', propertyId)
                    .eq('image_url', image.image_url);
                updateError = error;
            }
            
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
            .select('*')
            .eq('property_id', propertyId);
        
        if (error) {
            console.error('❌ Error obteniendo imágenes:', error);
            return [];
        }
        
        if (!data || data.length === 0) {
            return [];
        }
        
        // Ordenar por image_order si existe, sino por created_at, sino por id
        const sortedImages = data.sort((a, b) => {
            if (a.image_order !== undefined && b.image_order !== undefined) {
                return a.image_order - b.image_order;
            }
            if (a.created_at && b.created_at) {
                return new Date(a.created_at) - new Date(b.created_at);
            }
            if (a.id && b.id) {
                return a.id.localeCompare(b.id);
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
window.setMainImage = async function(propertyId, imageId) {
    try {
        if (!window.supabase) {
            throw new Error('Supabase no está disponible');
        }
        
        if (!imageId) {
            throw new Error('ID de imagen requerido');
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
        let setError = null;
        
        // Intentar por ID primero
        const { error: idError } = await window.supabase
            .from('property_images')
            .update({ is_main: true })
            .eq('id', imageId)
            .eq('property_id', propertyId);
        
        if (idError) {
            console.warn('⚠️ Error marcando por ID, intentando método alternativo:', idError);
            // Si falla por ID, intentar por property_id e image_url
            const { data: imageData } = await window.supabase
                .from('property_images')
                .select('image_url')
                .eq('property_id', propertyId)
                .eq('id', imageId)
                .single();
            
            if (imageData && imageData.image_url) {
                const { error: urlError } = await window.supabase
                    .from('property_images')
                    .update({ is_main: true })
                    .eq('property_id', propertyId)
                    .eq('image_url', imageData.image_url);
                setError = urlError;
            } else {
                setError = idError;
            }
        }
        
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
        const temp = images[currentIndex].image_order || currentIndex;
        images[currentIndex].image_order = images[newIndex].image_order || newIndex;
        images[newIndex].image_order = temp;
        
        // Actualizar en la base de datos
        let updateCurrentError = null;
        let updateNewError = null;
        
        // Actualizar imagen actual
        if (images[currentIndex].id) {
            const { error } = await window.supabase
                .from('property_images')
                .update({ image_order: images[currentIndex].image_order })
                .eq('id', images[currentIndex].id);
            updateCurrentError = error;
        } else if (images[currentIndex].property_id && images[currentIndex].image_url) {
            const { error } = await window.supabase
                .from('property_images')
                .update({ image_order: images[currentIndex].image_order })
                .eq('property_id', propertyId)
                .eq('image_url', images[currentIndex].image_url);
            updateCurrentError = error;
        }
        
        // Actualizar imagen nueva
        if (images[newIndex].id) {
            const { error } = await window.supabase
                .from('property_images')
                .update({ image_order: images[newIndex].image_order })
                .eq('id', images[newIndex].id);
            updateNewError = error;
        } else if (images[newIndex].property_id && images[newIndex].image_url) {
            const { error } = await window.supabase
                .from('property_images')
                .update({ image_order: images[newIndex].image_order })
                .eq('property_id', propertyId)
                .eq('image_url', images[newIndex].image_url);
            updateNewError = error;
        }
        
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