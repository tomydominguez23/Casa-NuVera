// test-image-functionality.js - Script para probar la funcionalidad de imágenes
console.log('🧪 Iniciando pruebas de funcionalidad de imágenes...');

class ImageFunctionalityTester {
    constructor() {
        this.supabase = null;
        this.testResults = [];
    }

    async initialize() {
        try {
            // Esperar a que Supabase esté disponible
            if (!window.supabase) {
                console.log('⏳ Esperando Supabase...');
                await this.waitForSupabase();
            }
            
            this.supabase = window.supabase;
            console.log('✅ Supabase disponible para pruebas');
            
            // Ejecutar todas las pruebas
            await this.runAllTests();
            
            // Mostrar resultados
            this.showResults();
            
        } catch (error) {
            console.error('❌ Error en ImageFunctionalityTester:', error);
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

    async runAllTests() {
        console.log('🧪 Ejecutando pruebas de funcionalidad...');
        
        // Test 1: Verificar conexión a Supabase
        await this.testSupabaseConnection();
        
        // Test 2: Verificar estructura de tablas
        await this.testTableStructure();
        
        // Test 3: Verificar carga de propiedades
        await this.testLoadProperties();
        
        // Test 4: Verificar carga de imágenes
        await this.testLoadImages();
        
        // Test 5: Verificar funciones de eliminación
        await this.testDeletionFunctions();
        
        console.log('✅ Todas las pruebas completadas');
    }

    async testSupabaseConnection() {
        try {
            console.log('🔍 Probando conexión a Supabase...');
            
            const { data, error } = await this.supabase
                .from('properties')
                .select('count')
                .limit(1);
            
            if (error) {
                throw new Error(`Error de conexión: ${error.message}`);
            }
            
            this.testResults.push({
                test: 'Supabase Connection',
                status: 'PASS',
                message: 'Conexión exitosa'
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Supabase Connection',
                status: 'FAIL',
                message: error.message
            });
        }
    }

    async testTableStructure() {
        try {
            console.log('🔍 Probando estructura de tablas...');
            
            // Probar tabla properties
            const { error: propError } = await this.supabase
                .from('properties')
                .select('id')
                .limit(1);
            
            if (propError) {
                throw new Error(`Error en tabla properties: ${propError.message}`);
            }
            
            // Probar tabla property_images
            const { error: imgError } = await this.supabase
                .from('property_images')
                .select('id')
                .limit(1);
            
            if (imgError) {
                throw new Error(`Error en tabla property_images: ${imgError.message}`);
            }
            
            this.testResults.push({
                test: 'Table Structure',
                status: 'PASS',
                message: 'Estructura de tablas correcta'
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Table Structure',
                status: 'FAIL',
                message: error.message
            });
        }
    }

    async testLoadProperties() {
        try {
            console.log('🔍 Probando carga de propiedades...');
            
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
                    published
                `)
                .eq('published', true)
                .limit(5);
            
            if (error) {
                throw new Error(`Error cargando propiedades: ${error.message}`);
            }
            
            this.testResults.push({
                test: 'Load Properties',
                status: 'PASS',
                message: `${properties.length} propiedades cargadas`
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Load Properties',
                status: 'FAIL',
                message: error.message
            });
        }
    }

    async testLoadImages() {
        try {
            console.log('🔍 Probando carga de imágenes...');
            
            // Obtener una propiedad con imágenes
            const { data: properties, error: propError } = await this.supabase
                .from('properties')
                .select('id, title')
                .eq('published', true)
                .limit(1);
            
            if (propError || !properties || properties.length === 0) {
                throw new Error('No hay propiedades para probar');
            }
            
            const propertyId = properties[0].id;
            
            // Cargar imágenes de la propiedad
            const { data: images, error: imgError } = await this.supabase
                .from('property_images')
                .select('id, image_url, is_main')
                .eq('property_id', propertyId);
            
            if (imgError) {
                throw new Error(`Error cargando imágenes: ${imgError.message}`);
            }
            
            this.testResults.push({
                test: 'Load Images',
                status: 'PASS',
                message: `${images.length} imágenes encontradas para propiedad ${propertyId}`
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Load Images',
                status: 'FAIL',
                message: error.message
            });
        }
    }

    async testDeletionFunctions() {
        try {
            console.log('🔍 Probando funciones de eliminación...');
            
            // Verificar que las funciones estén disponibles
            const functions = [
                'deletePropertyImageImproved',
                'getPropertyImages',
                'setMainImage',
                'moveImage'
            ];
            
            const missingFunctions = functions.filter(func => !window[func]);
            
            if (missingFunctions.length > 0) {
                throw new Error(`Funciones faltantes: ${missingFunctions.join(', ')}`);
            }
            
            this.testResults.push({
                test: 'Deletion Functions',
                status: 'PASS',
                message: 'Todas las funciones de eliminación están disponibles'
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Deletion Functions',
                status: 'FAIL',
                message: error.message
            });
        }
    }

    showResults() {
        console.log('📊 Resultados de las pruebas:');
        console.table(this.testResults);
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        
        console.log(`✅ Pruebas exitosas: ${passed}`);
        console.log(`❌ Pruebas fallidas: ${failed}`);
        
        if (failed === 0) {
            console.log('🎉 ¡Todas las pruebas pasaron! El sistema de imágenes está funcionando correctamente.');
        } else {
            console.log('⚠️ Algunas pruebas fallaron. Revisa los errores arriba.');
        }
        
        return {
            passed,
            failed,
            total: this.testResults.length,
            results: this.testResults
        };
    }

    // Función para probar la eliminación de una imagen específica
    async testImageDeletion(propertyId, imageId) {
        try {
            console.log(`🧪 Probando eliminación de imagen ${imageId} de propiedad ${propertyId}...`);
            
            if (!window.deletePropertyImageImproved) {
                throw new Error('Función de eliminación mejorada no está disponible');
            }
            
            const result = await window.deletePropertyImageImproved(propertyId, null, imageId);
            
            if (result.success) {
                console.log('✅ Eliminación de imagen exitosa');
                return { success: true };
            } else {
                console.error('❌ Error en eliminación:', result.error);
                return { success: false, error: result.error };
            }
            
        } catch (error) {
            console.error('❌ Error probando eliminación:', error);
            return { success: false, error: error.message };
        }
    }
}

// Función global para ejecutar las pruebas
window.testImageFunctionality = async function() {
    const tester = new ImageFunctionalityTester();
    return await tester.initialize();
};

// Función global para probar eliminación específica
window.testImageDeletion = async function(propertyId, imageId) {
    const tester = new ImageFunctionalityTester();
    await tester.initialize();
    return await tester.testImageDeletion(propertyId, imageId);
};

// Auto-ejecutar si estamos en el panel de administración
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('admin-properties.html')) {
            setTimeout(() => window.testImageFunctionality(), 3000);
        }
    });
} else {
    if (window.location.pathname.includes('admin-properties.html')) {
        setTimeout(() => window.testImageFunctionality(), 3000);
    }
}

console.log('✅ Script de pruebas de funcionalidad de imágenes cargado');