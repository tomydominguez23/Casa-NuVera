// diagnostico-estructura-bd.js - Script para analizar la estructura real de la base de datos
console.log('🔍 Iniciando diagnóstico de estructura de base de datos...');

class DatabaseStructureAnalyzer {
    constructor() {
        this.results = [];
    }

    async analyzeDatabaseStructure() {
        console.log('🚀 Analizando estructura de base de datos...');
        
        // 1. Verificar conexión
        await this.checkConnection();
        
        // 2. Analizar estructura de property_images
        await this.analyzePropertyImagesTable();
        
        // 3. Analizar estructura de properties
        await this.analyzePropertiesTable();
        
        // 4. Analizar estructura de property_tours
        await this.analyzePropertyToursTable();
        
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

    async analyzePropertyImagesTable() {
        console.log('📸 Analizando tabla property_images...');
        
        try {
            // Intentar obtener una muestra de datos para ver la estructura
            const { data: sampleData, error: sampleError } = await window.supabase
                .from('property_images')
                .select('*')
                .limit(3);

            if (sampleError) {
                this.addResult(`❌ Error accediendo a property_images: ${sampleError.message}`, 'error');
                this.addResult(`   Código de error: ${sampleError.code}`, 'info');
                this.addResult(`   Detalles: ${JSON.stringify(sampleError.details)}`, 'info');
                return;
            }

            if (!sampleData || sampleData.length === 0) {
                this.addResult('⚠️ Tabla property_images está vacía', 'warning');
                return;
            }

            this.addResult(`✅ Tabla property_images accesible - ${sampleData.length} registros encontrados`, 'success');

            // Analizar estructura de columnas
            const firstRecord = sampleData[0];
            const columns = Object.keys(firstRecord);
            
            this.addResult(`📋 Columnas encontradas en property_images:`, 'info');
            columns.forEach(column => {
                const value = firstRecord[column];
                const type = typeof value;
                const isNull = value === null;
                this.addResult(`   - ${column}: ${type} ${isNull ? '(null)' : `= ${JSON.stringify(value)}`}`, 'info');
            });

            // Verificar si tiene columna 'id'
            if (columns.includes('id')) {
                this.addResult('✅ Columna "id" encontrada', 'success');
            } else {
                this.addResult('❌ Columna "id" NO encontrada', 'error');
            }

            // Verificar columnas esperadas
            const expectedColumns = ['property_id', 'image_url', 'is_main', 'image_order', 'created_at'];
            expectedColumns.forEach(col => {
                if (columns.includes(col)) {
                    this.addResult(`✅ Columna "${col}" encontrada`, 'success');
                } else {
                    this.addResult(`⚠️ Columna "${col}" NO encontrada`, 'warning');
                }
            });

            // Mostrar muestra de datos
            this.addResult('📊 Muestra de datos:', 'info');
            sampleData.forEach((record, index) => {
                this.addResult(`   Registro ${index + 1}:`, 'info');
                Object.entries(record).forEach(([key, value]) => {
                    this.addResult(`     ${key}: ${JSON.stringify(value)}`, 'info');
                });
            });

        } catch (error) {
            this.addResult(`❌ Error analizando property_images: ${error.message}`, 'error');
        }
    }

    async analyzePropertiesTable() {
        console.log('🏠 Analizando tabla properties...');
        
        try {
            const { data: sampleData, error: sampleError } = await window.supabase
                .from('properties')
                .select('*')
                .limit(1);

            if (sampleError) {
                this.addResult(`❌ Error accediendo a properties: ${sampleError.message}`, 'error');
                return;
            }

            if (!sampleData || sampleData.length === 0) {
                this.addResult('⚠️ Tabla properties está vacía', 'warning');
                return;
            }

            this.addResult('✅ Tabla properties accesible', 'success');
            
            const firstRecord = sampleData[0];
            const columns = Object.keys(firstRecord);
            this.addResult(`📋 Columnas en properties: ${columns.join(', ')}`, 'info');

        } catch (error) {
            this.addResult(`❌ Error analizando properties: ${error.message}`, 'error');
        }
    }

    async analyzePropertyToursTable() {
        console.log('🌐 Analizando tabla property_tours...');
        
        try {
            const { data: sampleData, error: sampleError } = await window.supabase
                .from('property_tours')
                .select('*')
                .limit(1);

            if (sampleError) {
                this.addResult(`❌ Error accediendo a property_tours: ${sampleError.message}`, 'error');
                return;
            }

            if (!sampleData || sampleData.length === 0) {
                this.addResult('⚠️ Tabla property_tours está vacía', 'warning');
                return;
            }

            this.addResult('✅ Tabla property_tours accesible', 'success');
            
            const firstRecord = sampleData[0];
            const columns = Object.keys(firstRecord);
            this.addResult(`📋 Columnas en property_tours: ${columns.join(', ')}`, 'info');

        } catch (error) {
            this.addResult(`❌ Error analizando property_tours: ${error.message}`, 'error');
        }
    }

    addResult(message, type) {
        this.results.push({ message, type, timestamp: new Date() });
        console.log(message);
    }

    showResults() {
        console.log('\n📊 RESUMEN DEL ANÁLISIS DE ESTRUCTURA:');
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
                <h4>🔍 Análisis de Estructura de Base de Datos</h4>
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

// Función global para ejecutar análisis
window.analyzeDatabaseStructure = function() {
    const analyzer = new DatabaseStructureAnalyzer();
    return analyzer.analyzeDatabaseStructure();
};

console.log('✅ Script de análisis de estructura cargado - Ejecutar window.analyzeDatabaseStructure() para analizar');