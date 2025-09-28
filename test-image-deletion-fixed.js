// test-image-deletion-fixed.js - Script de prueba para verificar eliminación de imágenes corregida
console.log('🧪 Iniciando prueba de eliminación de imágenes corregida...');

window.testImageDeletionFixed = async function() {
    console.log('🚀 Probando eliminación de imágenes con estructura corregida...');
    
    if (!window.supabase) {
        console.error('❌ Supabase no está disponible');
        return;
    }
    
    try {
        // 1. Obtener una propiedad con imágenes para probar
        console.log('\n📋 Buscando propiedades con imágenes...');
        const { data: properties, error: propError } = await window.supabase
            .from('properties')
            .select('id, title')
            .limit(5);
        
        if (propError) {
            console.error('❌ Error obteniendo propiedades:', propError);
            return;
        }
        
        if (!properties || properties.length === 0) {
            console.log('⚠️ No hay propiedades para probar');
            return;
        }
        
        console.log(`✅ Encontradas ${properties.length} propiedades`);
        
        // Buscar una propiedad que tenga imágenes
        let testProperty = null;
        for (const prop of properties) {
            const { data: images, error: imgError } = await window.supabase
                .from('property_images')
                .select('property_id, image_url, image_order, is_main, created_at')
                .eq('property_id', prop.id);
            
            if (!imgError && images && images.length > 0) {
                testProperty = { ...prop, images };
                console.log(`📸 Propiedad "${prop.title}" tiene ${images.length} imágenes`);
                break;
            }
        }
        
        if (!testProperty) {
            console.log('⚠️ No se encontró ninguna propiedad con imágenes para probar');
            return;
        }
        
        console.log(`\n🎯 Probando con propiedad: "${testProperty.title}" (${testProperty.images.length} imágenes)`);
        
        // 2. Mostrar estructura de las imágenes
        console.log('\n📊 Estructura de imágenes encontradas:');
        testProperty.images.forEach((img, index) => {
            console.log(`   Imagen ${index + 1}:`);
            console.log(`     URL: ${img.image_url}`);
            console.log(`     Orden: ${img.image_order}`);
            console.log(`     Principal: ${img.is_main}`);
            console.log(`     Creada: ${img.created_at}`);
        });
        
        // 3. Probar función de eliminación mejorada
        console.log('\n🗑️ Probando función de eliminación mejorada...');
        
        if (window.deletePropertyImageImproved) {
            console.log('✅ Función deletePropertyImageImproved disponible');
            
            // Probar con la primera imagen
            const firstImage = testProperty.images[0];
            console.log(`🧪 Probando eliminación de: ${firstImage.image_url}`);
            
            const result = await window.deletePropertyImageImproved(
                testProperty.id, 
                firstImage.image_url, 
                null // No hay ID en la estructura real
            );
            
            if (result && result.success) {
                console.log('✅ Eliminación exitosa');
                
                // Verificar que se eliminó
                const { data: remainingImages } = await window.supabase
                    .from('property_images')
                    .select('property_id, image_url, image_order, is_main, created_at')
                    .eq('property_id', testProperty.id);
                
                console.log(`📊 Imágenes restantes: ${remainingImages.length}`);
                
                if (remainingImages.length === testProperty.images.length - 1) {
                    console.log('✅ Verificación exitosa: Se eliminó exactamente 1 imagen');
                } else {
                    console.log('⚠️ Advertencia: El número de imágenes no coincide con lo esperado');
                }
                
            } else {
                console.error('❌ Error en eliminación:', result?.error || 'Error desconocido');
            }
            
        } else {
            console.error('❌ Función deletePropertyImageImproved no está disponible');
        }
        
        // 4. Probar función getPropertyImages
        console.log('\n📸 Probando función getPropertyImages...');
        
        if (window.getPropertyImages) {
            const images = await window.getPropertyImages(testProperty.id);
            console.log(`✅ getPropertyImages devolvió ${images.length} imágenes`);
            
            if (images.length > 0) {
                console.log('📋 Estructura de la primera imagen:');
                const firstImg = images[0];
                Object.entries(firstImg).forEach(([key, value]) => {
                    console.log(`   ${key}: ${typeof value} = ${JSON.stringify(value)}`);
                });
            }
        } else {
            console.error('❌ Función getPropertyImages no está disponible');
        }
        
        console.log('\n✅ Prueba completada');
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
};

console.log('✅ Script de prueba cargado');
console.log('💡 Ejecuta: window.testImageDeletionFixed()');