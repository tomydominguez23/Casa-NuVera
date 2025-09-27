-- Script SQL para corregir problemas de eliminación en Supabase
-- Ejecutar en SQL Editor de Supabase

-- 1. Configurar REPLICA IDENTITY para permitir eliminaciones
ALTER TABLE property_images REPLICA IDENTITY FULL;
ALTER TABLE property_tours REPLICA IDENTITY FULL;
ALTER TABLE properties REPLICA IDENTITY FULL;

-- 2. Verificar si RLS está habilitado y configurarlo si es necesario
-- (Solo ejecutar si tienes problemas de permisos)
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE property_tours ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS para permitir eliminación (solo si RLS está habilitado)
-- CREATE POLICY "Allow delete properties" ON properties FOR DELETE USING (true);
-- CREATE POLICY "Allow delete property_images" ON property_images FOR DELETE USING (true);
-- CREATE POLICY "Allow delete property_tours" ON property_tours FOR DELETE USING (true);

-- 4. Crear función RPC para eliminar imágenes de propiedad (método alternativo)
CREATE OR REPLACE FUNCTION delete_property_images(property_id UUID)
RETURNS void AS $$
BEGIN
    -- Eliminar registros de imágenes para una propiedad específica
    DELETE FROM property_images WHERE property_images.property_id = delete_property_images.property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear función RPC para eliminar tours de propiedad (método alternativo)
CREATE OR REPLACE FUNCTION delete_property_tours(property_id UUID)
RETURNS void AS $$
BEGIN
    -- Eliminar tours para una propiedad específica
    DELETE FROM property_tours WHERE property_tours.property_id = delete_property_tours.property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Verificar configuración actual
SELECT 
    schemaname, 
    tablename, 
    relreplident as replicaidentity,
    rowsecurity
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE tablename IN ('properties', 'property_images', 'property_tours')
ORDER BY tablename;

-- 7. Verificar políticas existentes
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename IN ('properties', 'property_images', 'property_tours')
ORDER BY tablename, policyname;

-- 8. Verificar estructura de tablas
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name IN ('properties', 'property_images', 'property_tours') 
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 9. Crear tabla para videos si no existe
CREATE TABLE IF NOT EXISTS public.property_videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    video_url text NOT NULL,
    video_title text,
    video_order integer DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

-- 10. REPLICA IDENTITY y RLS (si aplica) para property_videos
ALTER TABLE property_videos REPLICA IDENTITY FULL;
-- ALTER TABLE property_videos ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow read videos" ON property_videos FOR SELECT USING (true);
-- CREATE POLICY "Allow insert videos" ON property_videos FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow delete videos" ON property_videos FOR DELETE USING (true);

-- 11. Verificar que la tabla de videos existe
SELECT table_name FROM information_schema.tables WHERE table_name = 'property_videos' AND table_schema = 'public';