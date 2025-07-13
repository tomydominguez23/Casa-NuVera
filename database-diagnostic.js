// database-diagnostic.js - Diagnóstico de estructura de base de datos
console.log('🔍 Iniciando diagnóstico de base de datos...');

async function diagnoseDatabaseStructure() {
    if (!window.supabase) {
        console.error('❌ Supabase no está disponible');
        return;
    }

    console.log('📊 Analizando estructura de base de datos...');

    // Lista de posibles nombres de tablas
    const possibleTableNames = [
        'properties', 'propiedades', 
        'property', 'propiedad',
        'listings', 'listados'
    ];

    const possibleImageTableNames = [
        'property_images', 'imagenes_propiedades', 
        'images', 'imagenes',
        'property_photos', 'fotos_propiedades'
    ];

    let mainTable = null;
    let imageTable = null;
    let sampleData = null;

    // Buscar tabla principal
    for (const tableName of possibleTableNames) {
        try {
            console.log(`🔍 Probando tabla: ${tableName}`);
            const { data, error } = await window.supabase
                .from(tableName)
                .select('*')
                .limit(1);

            if (!error && data) {
                mainTable = tableName;
                sampleData = data[0];
                console.log(`✅ Tabla principal encontrada: ${tableName}`);
                console.log('📋 Estructura de datos:', Object.keys(sampleData));
                break;
            }
        } catch (e) {
            console.log(`❌ Tabla ${tableName} no existe o no es accesible`);
        }
    }

    // Buscar tabla de imágenes
    for (const tableName of possibleImageTableNames) {
        try {
            console.log(`🔍 Probando tabla de imágenes: ${tableName}`);
            const { data, error } = await window.supabase
                .from(tableName)
                .select('*')
                .limit(1);

            if (!error && data) {
                imageTable = tableName;
                console.log(`✅ Tabla de imágenes encontrada: ${tableName}`);
                if (data[0]) {
                    console.log('📋 Estructura de imágenes:', Object.keys(data[0]));
                }
                break;
            }
        } catch (e) {
            console.log(`❌ Tabla de imágenes ${tableName} no existe o no es accesible`);
        }
    }

    // Generar reporte
    const report = {
        mainTable,
        imageTable,
        sampleData,
        recommendations: []
    };

    if (mainTable) {
        console.log(`\n🎯 TABLA PRINCIPAL DETECTADA: ${mainTable}`);
        
        if (sampleData) {
            const fields = Object.keys(sampleData);
            console.log('📋 Campos disponibles:', fields);
            
            // Detectar mapeo de campos
            const fieldMapping = {};
            
            // Mapeo común de campos
            const commonMappings = {
                'title': ['titulo', 'title', 'nombre'],
                'price': ['precio', 'price', 'valor'],
                'description': ['descripcion', 'description', 'desc'],
                'address': ['direccion', 'address', 'ubicacion'],
                'commune': ['comuna', 'commune', 'city'],
                'region': ['region', 'region', 'state'],
                'bedrooms': ['dormitorios', 'bedrooms', 'dorm', 'habitaciones'],
                'bathrooms': ['banos', 'bathrooms', 'bath'],
                'property_type': ['tipo_operacion', 'property_type', 'tipo'],
                'category': ['categoria', 'category', 'tipo_propiedad'],
                'published': ['activa', 'published', 'activo', 'active'],
                'featured': ['destacada', 'featured', 'destacado'],
                'created_at': ['fecha_creacion', 'created_at', 'fecha']
            };

            for (const [standardField, possibleNames] of Object.entries(commonMappings)) {
                for (const possibleName of possibleNames) {
                    if (fields.includes(possibleName)) {
                        fieldMapping[standardField] = possibleName;
                        break;
                    }
                }
            }

            console.log('🔗 Mapeo de campos detectado:', fieldMapping);
            report.fieldMapping = fieldMapping;
        }
    }

    if (imageTable) {
        console.log(`\n🖼️ TABLA DE IMÁGENES DETECTADA: ${imageTable}`);
    }

    // Generar código de configuración
    if (mainTable) {
        const config = generateDatabaseConfig(report);
        console.log('\n⚙️ CONFIGURACIÓN GENERADA:');
        console.log(config);
        
        // Guardar configuración en localStorage para usar en property-loader
        try {
            localStorage.setItem('casaNuveraDbConfig', JSON.stringify(report));
            console.log('💾 Configuración guardada en localStorage');
        } catch (e) {
            console.warn('⚠️ No se pudo guardar en localStorage');
        }
    }

    return report;
}

function generateDatabaseConfig(report) {
    const { mainTable, imageTable, fieldMapping } = report;
    
    return `
// Configuración automática generada para Casa Nuvera
const DATABASE_CONFIG = {
    mainTable: '${mainTable}',
    imageTable: '${imageTable || 'no_encontrada'}',
    fieldMapping: ${JSON.stringify(fieldMapping, null, 4)},
    
    // Query de ejemplo generada
    getSampleQuery: function() {
        return window.supabase
            .from('${mainTable}')
            .select(\`
                *${imageTable ? `,
                ${imageTable} (
                    *
                )` : ''}
            \`)
            .eq('${fieldMapping.published || 'published'}', true)
            .order('${fieldMapping.created_at || 'created_at'}', { ascending: false });
    }
};

console.log('📋 Configuración de base de datos cargada:', DATABASE_CONFIG);
`;
}

// Auto-ejecutar diagnóstico cuando se carga el script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(diagnoseDatabaseStructure, 2000);
    });
} else {
    setTimeout(diagnoseDatabaseStructure, 2000);
}

// Exponer función globalmente para uso manual
window.diagnoseDatabaseStructure = diagnoseDatabaseStructure;