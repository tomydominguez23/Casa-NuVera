// diagnostico-bd.js - Diagnóstico específico para verificar la base de datos
console.log('🔍 Iniciando diagnóstico de base de datos...');

class DatabaseDiagnostic {
    constructor() {
        this.results = [];
    }

    async runFullDiagnostic() {
        console.log('🚀 Ejecutando diagnóstico completo de base de datos...');
        
        // 1. Verificar conexión
        await this.checkConnection();
        
        // 2. Verificar estructura de tablas
        await this.checkTableStructure();
        
        // 3. Verificar datos de prueba
        await this.checkTestData();
        
        // 4. Probar eliminación paso a paso
        await this.testStepByStepDeletion();
        
        // 5. Mostrar resultados
        this.showResults();
    }

    async checkConnection() {
        console.log('🔌 Verificando conexión a Supabase...');
        
        try {
            if (!window.supabase) {
                this.addResult('❌ Supabase no está disponible', 'error');
                return false;
            }

            const { data, error } = await window.supabase
                .from('properties')
                .select('count')
                .limit(1);

            if (error) {
                this.addResult(`❌ Error de conexión: ${error.message}`, 'error');
                return false;
            }

            this.addResult('✅ Conexión a Supabase exitosa', 'success');
            return true;
        } catch (error) {
            this.addResult(`❌ Error verificando conexión: ${error.message}`, 'error');
            return false;
        }
    }

    async checkTableStructure() {
        console.log('📋 Verificando estructura de tablas...');
        
        try {
            // Verificar tabla properties
            const { data: properties, error: propError } = await window.supabase
                .from('properties')
                .select('id, title, created_at')
                .limit(1);

            if (propError) {
                this.addResult(`❌ Error accediendo a tabla properties: ${propError.message}`, 'error');
            } else {
                this.addResult('✅ Tabla properties accesible', 'success');
            }

            // Verificar tabla property_images
            const { data: images, error: imgError } = await window.supabase
                .from('property_images')
                .select('id, property_id, image_url')
                .limit(1);

            if (imgError) {
                this.addResult(`❌ Error accediendo a tabla property_images: ${imgError.message}`, 'error');
            } else {
                this.addResult('✅ Tabla property_images accesible', 'success');
            }

            // Verificar tabla property_tours
            const { data: tours, error: tourError } = await window.supabase
                .from('property_tours')
                .select('id, property_id, tour_url')
                .limit(1);

            if (tourError) {
                this.addResult(`❌ Error accediendo a tabla property_tours: ${tourError.message}`, 'error');
            } else {
                this.addResult('✅ Tabla property_tours accesible', 'success');
            }

        } catch (error) {
            this.addResult(`❌ Error verificando estructura: ${error.message}`, 'error');
        }
    }

    async checkTestData() {
        console.log('📊 Verificando datos de prueba...');
        
        try {
            // Obtener todas las propiedades
            const { data: properties, error: propError } = await window.supabase
                .from('properties')
                .select('id, title, created_at')
                .order('created_at', { ascending: false });

            if (propError) {
                this.addResult(`❌ Error obteniendo propiedades: ${propError.message}`, 'error');
                return;
            }

            this.addResult(`✅ Encontradas ${properties.length} propiedades en la BD`, 'success');

            // Mostrar las primeras 3 propiedades
            properties.slice(0, 3).forEach((prop, index) => {
                this.addResult(`📋 Propiedad ${index + 1}: ${prop.title} (ID: ${prop.id})`, 'info');
            });

            // Verificar imágenes para cada propiedad
            for (const prop of properties.slice(0, 2)) {
                const { data: images, error: imgError } = await window.supabase
                    .from('property_images')
                    .select('id, image_url')
                    .eq('property_id', prop.id);

                if (imgError) {
                    this.addResult(`⚠️ Error obteniendo imágenes para ${prop.title}: ${imgError.message}`, 'warning');
                } else {
                    this.addResult(`📸 ${prop.title}: ${images.length} imágenes`, 'info');
                }
            }

        } catch (error) {
            this.addResult(`❌ Error verificando datos: ${error.message}`, 'error');
        }
    }

    async testStepByStepDeletion() {
        console.log('🧪 Probando eliminación paso a paso...');
        
        try {
            // Crear una propiedad de prueba
            const testProperty = {
                title: 'PROPIEDAD DE PRUEBA - ELIMINAR',
                property_type: 'venta',
                category: 'casa',
                bedrooms: 1,
                bathrooms: 1,
                price: 1000,
                currency: 'CLP',
                published: true
            };

            // Insertar propiedad de prueba
            const { data: insertData, error: insertError } = await window.supabase
                .from('properties')
                .insert([testProperty])
                .select()
                .single();

            if (insertError) {
                this.addResult(`❌ Error insertando propiedad de prueba: ${insertError.message}`, 'error');
                return;
            }

            const testId = insertData.id;
            this.addResult(`✅ Propiedad de prueba creada: ${testId}`, 'success');

            // Probar eliminación de tours
            const { error: toursError } = await window.supabase
                .from('property_tours')
                .delete()
                .eq('property_id', testId);

            if (toursError) {
                this.addResult(`❌ Error eliminando tours: ${toursError.message}`, 'error');
            } else {
                this.addResult('✅ Eliminación de tours exitosa', 'success');
            }

            // Probar eliminación de imágenes
            const { error: imagesError } = await window.supabase
                .from('property_images')
                .delete()
                .eq('property_id', testId);

            if (imagesError) {
                this.addResult(`❌ Error eliminando imágenes: ${imagesError.message}`, 'error');
            } else {
                this.addResult('✅ Eliminación de imágenes exitosa', 'success');
            }

            // Probar eliminación de propiedad principal
            const { error: propertyError } = await window.supabase
                .from('properties')
                .delete()
                .eq('id', testId);

            if (propertyError) {
                this.addResult(`❌ Error eliminando propiedad principal: ${propertyError.message}`, 'error');
            } else {
                this.addResult('✅ Eliminación de propiedad principal exitosa', 'success');
            }

            // Verificar que se eliminó
            const { data: verifyData, error: verifyError } = await window.supabase
                .from('properties')
                .select('id')
                .eq('id', testId)
                .single();

            if (verifyError && verifyError.code === 'PGRST116') {
                this.addResult('✅ Verificación exitosa: Propiedad eliminada de la BD', 'success');
            } else if (verifyData) {
                this.addResult('❌ ERROR: La propiedad aún existe después de la eliminación', 'error');
            } else {
                this.addResult('✅ Verificación exitosa: Propiedad eliminada de la BD', 'success');
            }

        } catch (error) {
            this.addResult(`❌ Error en prueba de eliminación: ${error.message}`, 'error');
        }
    }

    addResult(message, type) {
        this.results.push({ message, type, timestamp: new Date() });
        console.log(message);
    }

    showResults() {
        console.log('\n📊 RESUMEN DEL DIAGNÓSTICO DE BASE DE DATOS:');
        console.log('='.repeat(60));
        
        this.results.forEach((result, index) => {
            const time = result.timestamp.toLocaleTimeString();
            const icon = result.type === 'error' ? '❌' : result.type === 'warning' ? '⚠️' : result.type === 'info' ? 'ℹ️' : '✅';
            console.log(`${index + 1}. [${time}] ${icon} ${result.message}`);
        });

        // Mostrar en la página si estamos en admin-properties
        if (document.getElementById('propertiesGrid')) {
            this.showResultsInPage();
        }
    }

    showResultsInPage() {
        const resultsHTML = `
            <div style="background: #f8f9fa; padding: 1rem; margin: 1rem 0; border-radius: 8px; border-left: 4px solid #007bff;">
                <h4>🔍 Diagnóstico de Base de Datos</h4>
                <ul style="margin: 0; padding-left: 1.5rem;">
                    ${this.results.map(result => {
                        const color = result.type === 'error' ? '#dc3545' : result.type === 'warning' ? '#ffc107' : result.type === 'info' ? '#17a2b8' : '#28a745';
                        const icon = result.type === 'error' ? '❌' : result.type === 'warning' ? '⚠️' : result.type === 'info' ? 'ℹ️' : '✅';
                        return `<li style="margin: 0.5rem 0; color: ${color};">
                            ${icon} ${result.message}
                        </li>`;
                    }).join('')}
                </ul>
            </div>
        `;
        
        const grid = document.getElementById('propertiesGrid');
        if (grid) {
            grid.insertAdjacentHTML('afterbegin', resultsHTML);
        }
    }
}

// Función global para ejecutar diagnóstico
window.runDatabaseDiagnostic = function() {
    const diagnostic = new DatabaseDiagnostic();
    return diagnostic.runFullDiagnostic();
};

console.log('✅ Script de diagnóstico de BD cargado - Ejecutar window.runDatabaseDiagnostic() para diagnosticar');