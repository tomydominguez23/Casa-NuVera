// verificar-estructura-bd.js - Script simple para verificar estructura de BD
// Ejecutar en la consola del navegador: window.verificarEstructuraBD()

window.verificarEstructuraBD = async function() {
    console.log('🔍 Verificando estructura de base de datos...');
    
    if (!window.supabase) {
        console.error('❌ Supabase no está disponible');
        return;
    }
    
    try {
        // 1. Verificar tabla property_images
        console.log('\n📸 Analizando tabla property_images...');
        const { data: images, error: imagesError } = await window.supabase
            .from('property_images')
            .select('*')
            .limit(3);
        
        if (imagesError) {
            console.error('❌ Error accediendo a property_images:', imagesError);
            console.error('   Código:', imagesError.code);
            console.error('   Mensaje:', imagesError.message);
            console.error('   Detalles:', imagesError.details);
        } else {
            console.log('✅ Tabla property_images accesible');
            console.log('📊 Registros encontrados:', images.length);
            
            if (images.length > 0) {
                console.log('📋 Estructura del primer registro:');
                const firstRecord = images[0];
                Object.entries(firstRecord).forEach(([key, value]) => {
                    console.log(`   ${key}: ${typeof value} = ${JSON.stringify(value)}`);
                });
                
                // Verificar columnas específicas
                const hasId = 'id' in firstRecord;
                const hasPropertyId = 'property_id' in firstRecord;
                const hasImageUrl = 'image_url' in firstRecord;
                const hasIsMain = 'is_main' in firstRecord;
                const hasImageOrder = 'image_order' in firstRecord;
                
                console.log('\n🔍 Verificación de columnas:');
                console.log(`   id: ${hasId ? '✅' : '❌'}`);
                console.log(`   property_id: ${hasPropertyId ? '✅' : '❌'}`);
                console.log(`   image_url: ${hasImageUrl ? '✅' : '❌'}`);
                console.log(`   is_main: ${hasIsMain ? '✅' : '❌'}`);
                console.log(`   image_order: ${hasImageOrder ? '✅' : '❌'}`);
            }
        }
        
        // 2. Verificar tabla properties
        console.log('\n🏠 Analizando tabla properties...');
        const { data: properties, error: propertiesError } = await window.supabase
            .from('properties')
            .select('id, title, created_at')
            .limit(1);
        
        if (propertiesError) {
            console.error('❌ Error accediendo a properties:', propertiesError);
        } else {
            console.log('✅ Tabla properties accesible');
            console.log('📊 Registros encontrados:', properties.length);
        }
        
        // 3. Probar una consulta específica que estaba fallando
        console.log('\n🧪 Probando consulta que estaba fallando...');
        const { data: testQuery, error: testError } = await window.supabase
            .from('property_images')
            .select('id, image_url, is_main, image_order')
            .eq('property_id', 'test-id')
            .limit(1);
        
        if (testError) {
            console.error('❌ Error en consulta de prueba:', testError);
            console.error('   Este es el tipo de error que estaba causando problemas');
        } else {
            console.log('✅ Consulta de prueba exitosa');
        }
        
        console.log('\n✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
};

console.log('✅ Script de verificación cargado');
console.log('💡 Ejecuta: window.verificarEstructuraBD()');