// diagnostico-maps.js - Diagnóstico específico para Google Maps
console.log('🗺️ Iniciando diagnóstico de Google Maps...');

class MapsDiagnostic {
    constructor() {
        this.results = [];
        this.testUrls = [
            'https://maps.app.goo.gl/eTgr7Rofa76tBGYc6',
            'https://goo.gl/maps/abc123',
            'https://maps.google.com/?q=Santiago+Chile',
            'https://www.google.com/maps/embed?pb=test123'
        ];
    }

    async runFullDiagnostic() {
        console.log('🚀 Ejecutando diagnóstico completo de Google Maps...');
        
        // 1. Verificar conexión a Supabase
        await this.checkSupabaseConnection();
        
        // 2. Verificar estructura de base de datos
        await this.checkDatabaseStructure();
        
        // 3. Verificar datos de mapas existentes
        await this.checkExistingMaps();
        
        // 4. Probar funcionalidad de mapas
        await this.testMapsFunctionality();
        
        // 5. Mostrar resultados
        this.showResults();
    }

    async checkSupabaseConnection() {
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

    async checkDatabaseStructure() {
        console.log('📋 Verificando estructura de base de datos...');
        
        try {
            // Verificar si la columna google_maps_url existe
            const { data: properties, error: propError } = await window.supabase
                .from('properties')
                .select('id, title, google_maps_url')
                .limit(1);

            if (propError) {
                if (propError.message.includes('google_maps_url')) {
                    this.addResult('❌ Columna google_maps_url no existe en la tabla properties', 'error');
                    return false;
                } else {
                    this.addResult(`❌ Error accediendo a tabla properties: ${propError.message}`, 'error');
                    return false;
                }
            } else {
                this.addResult('✅ Columna google_maps_url existe en la tabla properties', 'success');
                return true;
            }

        } catch (error) {
            this.addResult(`❌ Error verificando estructura: ${error.message}`, 'error');
            return false;
        }
    }

    async checkExistingMaps() {
        console.log('🗺️ Verificando mapas existentes...');
        
        try {
            // Obtener propiedades con mapas
            const { data: properties, error: propError } = await window.supabase
                .from('properties')
                .select('id, title, google_maps_url')
                .not('google_maps_url', 'is', null);

            if (propError) {
                this.addResult(`❌ Error obteniendo propiedades con mapas: ${propError.message}`, 'error');
                return;
            }

            this.addResult(`✅ Encontradas ${properties.length} propiedades con mapas`, 'success');

            // Mostrar detalles de los mapas
            properties.slice(0, 3).forEach((prop, index) => {
                this.addResult(`🗺️ Propiedad ${index + 1}: ${prop.title}`, 'info');
                this.addResult(`   URL: ${prop.google_maps_url}`, 'info');
                
                // Verificar si la URL es válida
                if (this.isValidGoogleMapsUrl(prop.google_maps_url)) {
                    this.addResult(`   ✅ URL válida`, 'success');
                } else {
                    this.addResult(`   ❌ URL inválida o malformada`, 'error');
                }
            });

        } catch (error) {
            this.addResult(`❌ Error verificando mapas: ${error.message}`, 'error');
        }
    }

    async testMapsFunctionality() {
        console.log('🧪 Probando funcionalidad de mapas...');
        
        try {
            // Probar inserción de propiedad con mapa
            const testProperty = {
                title: 'PROPIEDAD DE PRUEBA - MAPA',
                property_type: 'venta',
                category: 'casa',
                bedrooms: 1,
                bathrooms: 1,
                price: 1000,
                currency: 'CLP',
                google_maps_url: 'https://maps.app.goo.gl/eTgr7Rofa76tBGYc6',
                published: true
            };

            // Insertar propiedad de prueba
            const { data: insertData, error: insertError } = await window.supabase
                .from('properties')
                .insert([testProperty])
                .select()
                .single();

            if (insertError) {
                this.addResult(`❌ Error insertando propiedad con mapa: ${insertError.message}`, 'error');
                return;
            }

            const testId = insertData.id;
            this.addResult(`✅ Propiedad de prueba con mapa creada: ${testId}`, 'success');

            // Verificar que se guardó correctamente
            const { data: verifyData, error: verifyError } = await window.supabase
                .from('properties')
                .select('id, title, google_maps_url')
                .eq('id', testId)
                .single();

            if (verifyError) {
                this.addResult(`❌ Error verificando propiedad: ${verifyError.message}`, 'error');
            } else if (verifyData.google_maps_url) {
                this.addResult(`✅ Mapa guardado correctamente: ${verifyData.google_maps_url}`, 'success');
            } else {
                this.addResult(`❌ ERROR: El mapa no se guardó correctamente`, 'error');
            }

            // Eliminar propiedad de prueba
            const { error: deleteError } = await window.supabase
                .from('properties')
                .delete()
                .eq('id', testId);

            if (deleteError) {
                this.addResult(`⚠️ Error eliminando propiedad de prueba: ${deleteError.message}`, 'warning');
            } else {
                this.addResult(`✅ Propiedad de prueba eliminada`, 'success');
            }

        } catch (error) {
            this.addResult(`❌ Error en prueba de funcionalidad: ${error.message}`, 'error');
        }
    }

    isValidGoogleMapsUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        const validPatterns = [
            /^https:\/\/maps\.app\.goo\.gl\//,
            /^https:\/\/goo\.gl\/maps\//,
            /^https:\/\/maps\.google\.com\//,
            /^https:\/\/www\.google\.com\/maps\/embed/
        ];
        
        return validPatterns.some(pattern => pattern.test(url));
    }

    addResult(message, type) {
        this.results.push({ message, type, timestamp: new Date() });
        console.log(message);
    }

    showResults() {
        console.log('\n📊 RESUMEN DEL DIAGNÓSTICO DE MAPAS:');
        console.log('='.repeat(50));
        
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
            <div style="background: #e3f2fd; padding: 1rem; margin: 1rem 0; border-radius: 8px; border-left: 4px solid #2196f3;">
                <h4>🗺️ Diagnóstico de Google Maps</h4>
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

// Función global para ejecutar diagnóstico de mapas
window.runMapsDiagnostic = function() {
    const diagnostic = new MapsDiagnostic();
    return diagnostic.runFullDiagnostic();
};

console.log('✅ Script de diagnóstico de mapas cargado - Ejecutar window.runMapsDiagnostic() para diagnosticar');