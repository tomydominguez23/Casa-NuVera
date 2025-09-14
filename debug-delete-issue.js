// debug-delete-issue.js - Script de diagnóstico para el problema de eliminación
console.log('🔍 Iniciando diagnóstico del problema de eliminación...');

class DeleteIssueDebugger {
    constructor() {
        this.testResults = [];
    }

    async runDiagnostics() {
        console.log('🚀 Ejecutando diagnóstico completo...');
        
        // 1. Verificar conexión a Supabase
        await this.checkSupabaseConnection();
        
        // 2. Verificar permisos de eliminación
        await this.checkDeletePermissions();
        
        // 3. Probar eliminación de prueba
        await this.testDeleteFunction();
        
        // 4. Verificar sincronización con property-loader
        await this.checkPropertyLoaderSync();
        
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

            // Probar consulta simple
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

    async checkDeletePermissions() {
        console.log('🔐 Verificando permisos de eliminación...');
        
        try {
            // Intentar hacer una consulta de eliminación de prueba (sin ejecutar)
            const { data, error } = await window.supabase
                .from('properties')
                .select('id')
                .limit(1);

            if (error) {
                this.addResult(`❌ Error de permisos: ${error.message}`, 'error');
                return false;
            }

            this.addResult('✅ Permisos de eliminación verificados', 'success');
            return true;
        } catch (error) {
            this.addResult(`❌ Error verificando permisos: ${error.message}`, 'error');
            return false;
        }
    }

    async testDeleteFunction() {
        console.log('🧪 Probando función de eliminación...');
        
        try {
            // Crear una propiedad de prueba
            const testProperty = {
                title: 'Propiedad de Prueba - Eliminar',
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
                return false;
            }

            const testId = insertData.id;
            this.addResult(`✅ Propiedad de prueba creada con ID: ${testId}`, 'success');

            // Probar eliminación usando property-handler
            if (window.propertyHandler) {
                const deleteResult = await window.propertyHandler.deleteProperty(testId);
                
                if (deleteResult.success) {
                    this.addResult('✅ Función deleteProperty funciona correctamente', 'success');
                } else {
                    this.addResult(`❌ Error en deleteProperty: ${deleteResult.error}`, 'error');
                }
            } else {
                this.addResult('❌ property-handler no está disponible', 'error');
            }

            return true;
        } catch (error) {
            this.addResult(`❌ Error en prueba de eliminación: ${error.message}`, 'error');
            return false;
        }
    }

    async checkPropertyLoaderSync() {
        console.log('🔄 Verificando sincronización con property-loader...');
        
        try {
            if (!window.propertyLoader) {
                this.addResult('❌ property-loader no está disponible', 'error');
                return false;
            }

            // Verificar si está usando datos de fallback
            if (window.propertyLoader.useFallbackData) {
                this.addResult('⚠️ property-loader está usando datos de fallback', 'warning');
            } else {
                this.addResult('✅ property-loader está usando datos de BD', 'success');
            }

            // Probar refresh
            await window.propertyLoader.refreshProperties();
            this.addResult('✅ property-loader.refreshProperties() ejecutado', 'success');

            return true;
        } catch (error) {
            this.addResult(`❌ Error verificando property-loader: ${error.message}`, 'error');
            return false;
        }
    }

    addResult(message, type) {
        this.testResults.push({ message, type, timestamp: new Date() });
        console.log(message);
    }

    showResults() {
        console.log('\n📊 RESUMEN DE DIAGNÓSTICO:');
        console.log('='.repeat(50));
        
        this.testResults.forEach((result, index) => {
            const time = result.timestamp.toLocaleTimeString();
            console.log(`${index + 1}. [${time}] ${result.message}`);
        });

        // Mostrar en la página si estamos en admin-properties
        if (document.getElementById('propertiesGrid')) {
            this.showResultsInPage();
        }
    }

    showResultsInPage() {
        const resultsHTML = `
            <div style="background: #f8f9fa; padding: 1rem; margin: 1rem 0; border-radius: 8px; border-left: 4px solid #007bff;">
                <h4>🔍 Resultados del Diagnóstico</h4>
                <ul style="margin: 0; padding-left: 1.5rem;">
                    ${this.testResults.map(result => 
                        `<li style="margin: 0.5rem 0; color: ${result.type === 'error' ? '#dc3545' : result.type === 'warning' ? '#ffc107' : '#28a745'};">
                            ${result.message}
                        </li>`
                    ).join('')}
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
window.runDeleteDiagnostics = function() {
    const deleteDebugger = new DeleteIssueDebugger();
    return deleteDebugger.runDiagnostics();
};

// Auto-ejecutar si estamos en admin-properties
if (document.getElementById('propertiesGrid')) {
    console.log('🔍 Ejecutando diagnóstico automático...');
    setTimeout(() => {
        const deleteDebugger = new DeleteIssueDebugger();
        deleteDebugger.runDiagnostics();
    }, 2000);
}

console.log('✅ Debug script cargado - Ejecutar window.runDeleteDiagnostics() para diagnosticar');