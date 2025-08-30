-- ===============================================
-- CASA-NUVERA: SISTEMA DE LEAD GENERATION Y ANALYTICS
-- ===============================================
-- Archivo: database/lead_generation_schema.sql
-- Descripción: Estructura completa para sistema de leads y analytics
-- Autor: Casa-NuVera Team
-- ===============================================

-- 1. TABLA PRINCIPAL DE LEADS
-- ===============================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    tipo_interes VARCHAR(20) CHECK (tipo_interes IN ('compra', 'arriendo')) NOT NULL,
    presupuesto_min DECIMAL(15, 2),
    presupuesto_max DECIMAL(15, 2),
    zona_interes TEXT[],
    mensaje TEXT,
    
    -- SCORING Y CLASIFICACIÓN
    lead_score INTEGER DEFAULT 0,
    clasificacion VARCHAR(20) DEFAULT 'cold' CHECK (clasificacion IN ('hot', 'warm', 'cold')),
    
    -- METADATA
    utm_source VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_medium VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    
    -- TIMESTAMPS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultimo_contacto TIMESTAMP WITH TIME ZONE
);

-- 2. TABLA DE SESIONES DE USUARIO
-- ===============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    
    -- DATOS DE LA SESIÓN
    inicio_sesion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fin_sesion TIMESTAMP WITH TIME ZONE,
    duracion_segundos INTEGER,
    paginas_visitadas INTEGER DEFAULT 0,
    dispositivo VARCHAR(50),
    navegador VARCHAR(50),
    sistema_operativo VARCHAR(50),
    resolucion_pantalla VARCHAR(20),
    
    -- COMPORTAMIENTO
    scroll_maximo INTEGER DEFAULT 0,
    clicks_total INTEGER DEFAULT 0,
    tiempo_inactivo INTEGER DEFAULT 0,
    salto_directo BOOLEAN DEFAULT FALSE,
    
    -- LOCATION
    pais VARCHAR(100),
    ciudad VARCHAR(100),
    region VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE INTERACCIONES DEL USUARIO
-- ===============================================
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    
    -- TIPO DE INTERACCIÓN
    tipo_interaccion VARCHAR(50) NOT NULL CHECK (tipo_interaccion IN (
        'page_view', 'property_favorite', 'property_unfavorite', 
        'whatsapp_click', 'form_submit', 'filter_use', 'search',
        'scroll_deep', 'time_spent', 'click_contact'
    )),
    
    -- DETALLES DE LA INTERACCIÓN
    pagina VARCHAR(255),
    property_id INTEGER,
    filtros_aplicados JSONB,
    tiempo_en_pagina INTEGER,
    posicion_scroll INTEGER,
    elemento_clickeado VARCHAR(255),
    valor_busqueda TEXT,
    
    -- METADATA
    timestamp_interaccion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    datos_adicionales JSONB
);

-- 4. TABLA DE PROPIEDADES FAVORITAS
-- ===============================================
CREATE TABLE IF NOT EXISTS property_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL,
    
    -- DETALLES DE LA PROPIEDAD (snapshot)
    property_title VARCHAR(255),
    property_price DECIMAL(15, 2),
    property_location VARCHAR(255),
    property_type VARCHAR(50),
    property_bedrooms INTEGER,
    property_bathrooms INTEGER,
    property_area DECIMAL(8, 2),
    
    -- ESTADO DEL FAVORITO
    is_active BOOLEAN DEFAULT TRUE,
    fecha_agregado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_removido TIMESTAMP WITH TIME ZONE,
    veces_visitada INTEGER DEFAULT 0,
    
    UNIQUE(lead_id, property_id)
);

-- 5. TABLA DE SCORING HISTÓRICO
-- ===============================================
CREATE TABLE IF NOT EXISTS lead_scoring_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    
    score_anterior INTEGER,
    score_nuevo INTEGER NOT NULL,
    clasificacion_anterior VARCHAR(20),
    clasificacion_nueva VARCHAR(20),
    
    -- RAZÓN DEL CAMBIO
    trigger_accion VARCHAR(100),
    detalle_cambio JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===============================================

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_clasificacion ON leads(clasificacion);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Índices para sesiones
CREATE INDEX IF NOT EXISTS idx_sessions_lead_id ON user_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON user_sessions(created_at DESC);

-- Índices para interacciones
CREATE INDEX IF NOT EXISTS idx_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_lead_id ON user_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_interactions_tipo ON user_interactions(tipo_interaccion);
CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON user_interactions(timestamp_interaccion DESC);

-- Índices para favoritos
CREATE INDEX IF NOT EXISTS idx_favorites_lead_id ON property_favorites(lead_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON property_favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_favorites_active ON property_favorites(is_active);

-- ===============================================
-- FUNCIONES AUTOMÁTICAS DE SCORING
-- ===============================================

-- Función para calcular score automático
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_uuid UUID) 
RETURNS INTEGER AS $$
DECLARE
    base_score INTEGER := 0;
    session_score INTEGER := 0;
    interaction_score INTEGER := 0;
    favorite_score INTEGER := 0;
    total_score INTEGER := 0;
BEGIN
    -- SCORE BASE: Información proporcionada (máximo 20 puntos)
    SELECT 
        CASE WHEN nombre IS NOT NULL AND nombre != '' THEN 3 ELSE 0 END +
        CASE WHEN apellido IS NOT NULL AND apellido != '' THEN 2 ELSE 0 END +
        CASE WHEN email IS NOT NULL AND email != '' THEN 5 ELSE 0 END +
        CASE WHEN telefono IS NOT NULL AND telefono != '' THEN 5 ELSE 0 END +
        CASE WHEN presupuesto_min IS NOT NULL THEN 3 ELSE 0 END +
        CASE WHEN zona_interes IS NOT NULL THEN 2 ELSE 0 END
    INTO base_score
    FROM leads WHERE id = lead_uuid;
    
    -- SCORE SESIONES: Tiempo y páginas (máximo 30 puntos)
    SELECT 
        LEAST(30, 
            COALESCE(AVG(duracion_segundos), 0) / 60 +  -- 1 punto por minuto promedio
            COALESCE(AVG(paginas_visitadas), 0) * 2 +   -- 2 puntos por página visitada
            COUNT(*) * 2                                -- 2 puntos por sesión
        )::INTEGER
    INTO session_score
    FROM user_sessions WHERE lead_id = lead_uuid;
    
    -- SCORE INTERACCIONES: Engagement (máximo 30 puntos)
    SELECT 
        LEAST(30, 
            COUNT(CASE WHEN tipo_interaccion = 'property_favorite' THEN 1 END) * 5 +
            COUNT(CASE WHEN tipo_interaccion = 'whatsapp_click' THEN 1 END) * 8 +
            COUNT(CASE WHEN tipo_interaccion = 'form_submit' THEN 1 END) * 10 +
            COUNT(CASE WHEN tipo_interaccion = 'filter_use' THEN 1 END) * 2 +
            COUNT(CASE WHEN tipo_interaccion = 'search' THEN 1 END) * 3
        )::INTEGER
    INTO interaction_score
    FROM user_interactions WHERE lead_id = lead_uuid;
    
    -- SCORE FAVORITOS: Propiedades de interés (máximo 20 puntos)
    SELECT 
        LEAST(20, COUNT(*) * 4)::INTEGER  -- 4 puntos por propiedad favorita
    INTO favorite_score
    FROM property_favorites 
    WHERE lead_id = lead_uuid AND is_active = TRUE;
    
    total_score := base_score + session_score + interaction_score + favorite_score;
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Función para clasificar lead automáticamente
CREATE OR REPLACE FUNCTION classify_lead(score INTEGER) 
RETURNS VARCHAR(20) AS $$
BEGIN
    IF score >= 70 THEN
        RETURN 'hot';    -- Muy probable de convertir
    ELSIF score >= 40 THEN
        RETURN 'warm';   -- Interesado, necesita nurturing
    ELSE
        RETURN 'cold';   -- Poco interesado o recién llegado
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar score automáticamente
CREATE OR REPLACE FUNCTION update_lead_score_trigger()
RETURNS TRIGGER AS $$
DECLARE
    nuevo_score INTEGER;
    nueva_clasificacion VARCHAR(20);
    lead_uuid UUID;
BEGIN
    -- Determinar lead_id según la tabla que se actualizó
    IF TG_TABLE_NAME = 'leads' THEN
        lead_uuid := NEW.id;
    ELSIF TG_TABLE_NAME = 'user_sessions' THEN
        lead_uuid := NEW.lead_id;
    ELSIF TG_TABLE_NAME = 'user_interactions' THEN
        lead_uuid := NEW.lead_id;
    ELSIF TG_TABLE_NAME = 'property_favorites' THEN
        lead_uuid := NEW.lead_id;
    END IF;
    
    -- Calcular nuevo score
    nuevo_score := calculate_lead_score(lead_uuid);
    nueva_clasificacion := classify_lead(nuevo_score);
    
    -- Actualizar lead
    UPDATE leads 
    SET 
        lead_score = nuevo_score,
        clasificacion = nueva_clasificacion,
        updated_at = NOW()
    WHERE id = lead_uuid;
    
    -- Guardar en historial si cambió significativamente
    INSERT INTO lead_scoring_history (
        lead_id, score_nuevo, clasificacion_nueva, 
        trigger_accion, created_at
    ) 
    SELECT 
        lead_uuid, nuevo_score, nueva_clasificacion,
        TG_TABLE_NAME || '_' || TG_OP, NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM lead_scoring_history 
        WHERE lead_id = lead_uuid 
        AND score_nuevo = nuevo_score 
        AND created_at > NOW() - INTERVAL '1 hour'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers a todas las tablas relevantes
DROP TRIGGER IF EXISTS trigger_update_lead_score_on_leads ON leads;
CREATE TRIGGER trigger_update_lead_score_on_leads
    AFTER INSERT OR UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_lead_score_trigger();

DROP TRIGGER IF EXISTS trigger_update_lead_score_on_sessions ON user_sessions;
CREATE TRIGGER trigger_update_lead_score_on_sessions
    AFTER INSERT OR UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_lead_score_trigger();

DROP TRIGGER IF EXISTS trigger_update_lead_score_on_interactions ON user_interactions;
CREATE TRIGGER trigger_update_lead_score_on_interactions
    AFTER INSERT OR UPDATE ON user_interactions
    FOR EACH ROW EXECUTE FUNCTION update_lead_score_trigger();

DROP TRIGGER IF EXISTS trigger_update_lead_score_on_favorites ON property_favorites;
CREATE TRIGGER trigger_update_lead_score_on_favorites
    AFTER INSERT OR UPDATE OR DELETE ON property_favorites
    FOR EACH ROW EXECUTE FUNCTION update_lead_score_trigger();

-- ===============================================
-- VISTAS ÚTILES PARA EL PANEL ADMIN
-- ===============================================

-- Vista resumen de leads
CREATE OR REPLACE VIEW leads_dashboard AS
SELECT 
    l.id,
    l.nombre,
    l.apellido,
    l.email,
    l.telefono,
    l.tipo_interes,
    l.lead_score,
    l.clasificacion,
    l.created_at,
    
    -- Estadísticas de sesiones
    COUNT(DISTINCT us.id) as total_sesiones,
    COALESCE(AVG(us.duracion_segundos), 0)::INTEGER as tiempo_promedio_segundos,
    COALESCE(SUM(us.paginas_visitadas), 0) as total_paginas_vistas,
    
    -- Estadísticas de interacciones
    COUNT(ui.id) as total_interacciones,
    COUNT(pf.id) as propiedades_favoritas,
    
    -- Última actividad
    GREATEST(l.updated_at, MAX(us.created_at), MAX(ui.timestamp_interaccion)) as ultima_actividad
    
FROM leads l
LEFT JOIN user_sessions us ON l.id = us.lead_id
LEFT JOIN user_interactions ui ON l.id = ui.lead_id
LEFT JOIN property_favorites pf ON l.id = pf.lead_id AND pf.is_active = TRUE
GROUP BY l.id, l.nombre, l.apellido, l.email, l.telefono, l.tipo_interes, l.lead_score, l.clasificacion, l.created_at
ORDER BY l.lead_score DESC, l.created_at DESC;

-- ===============================================
-- DATOS DE PRUEBA PARA DESARROLLO
-- ===============================================

-- Insertar algunos leads de ejemplo para pruebas
INSERT INTO leads (nombre, apellido, email, telefono, tipo_interes, presupuesto_min, presupuesto_max, zona_interes) VALUES 
('Juan', 'Pérez', 'juan.perez@email.com', '+56912345678', 'compra', 50000000, 80000000, ARRAY['Las Condes', 'Providencia']),
('María', 'González', 'maria.gonzalez@email.com', '+56987654321', 'arriendo', 500000, 800000, ARRAY['Ñuñoa', 'San Miguel']),
('Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '+56911223344', 'compra', 80000000, 120000000, ARRAY['Vitacura'])
ON CONFLICT (email) DO NOTHING;

-- ===============================================
-- COMENTARIOS FINALES
-- ===============================================
-- Este esquema provee:
-- 1. Captura completa de datos de leads
-- 2. Tracking detallado de comportamiento
-- 3. Sistema automático de scoring
-- 4. Clasificación inteligente de leads
-- 5. Historial completo de cambios
-- 6. Vistas optimizadas para el panel admin
-- 7. Índices para rendimiento óptimo
-- 8. Triggers automáticos para actualización de scores