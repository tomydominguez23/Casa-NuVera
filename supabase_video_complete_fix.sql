-- Script SQL COMPLETO para corregir problemas de videos en Supabase
-- Ejecutar en SQL Editor de Supabase
-- Este script corrige tanto Storage como la tabla property_videos

-- ========================================
-- PARTE 1: CONFIGURAR TABLA property_videos
-- ========================================

-- 1. Crear tabla property_videos si no existe
CREATE TABLE IF NOT EXISTS public.property_videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    video_url text NOT NULL,
    video_title text,
    video_order int DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Habilitar RLS en property_videos
ALTER TABLE public.property_videos ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS para property_videos
-- Política para permitir lectura
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'property_videos' 
        AND policyname = 'Allow read property_videos'
    ) THEN
        CREATE POLICY "Allow read property_videos" ON public.property_videos 
        FOR SELECT USING (true);
        RAISE NOTICE 'Política de lectura creada para property_videos';
    END IF;
END $$;

-- Política para permitir inserción
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'property_videos' 
        AND policyname = 'Allow insert property_videos'
    ) THEN
        CREATE POLICY "Allow insert property_videos" ON public.property_videos 
        FOR INSERT WITH CHECK (true);
        RAISE NOTICE 'Política de inserción creada para property_videos';
    END IF;
END $$;

-- Política para permitir actualización
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'property_videos' 
        AND policyname = 'Allow update property_videos'
    ) THEN
        CREATE POLICY "Allow update property_videos" ON public.property_videos 
        FOR UPDATE USING (true);
        RAISE NOTICE 'Política de actualización creada para property_videos';
    END IF;
END $$;

-- Política para permitir eliminación
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'property_videos' 
        AND policyname = 'Allow delete property_videos'
    ) THEN
        CREATE POLICY "Allow delete property_videos" ON public.property_videos 
        FOR DELETE USING (true);
        RAISE NOTICE 'Política de eliminación creada para property_videos';
    END IF;
END $$;

-- 4. Configurar REPLICA IDENTITY para property_videos
ALTER TABLE public.property_videos REPLICA IDENTITY FULL;

-- ========================================
-- PARTE 2: CONFIGURAR STORAGE BUCKET
-- ========================================

-- 5. Crear bucket property-videos si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-videos',
    'property-videos',
    true,
    52428800, -- 50MB limit
    ARRAY['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/mkv']
) ON CONFLICT (id) DO NOTHING;

-- 6. Crear políticas de Storage para el bucket property-videos
-- Política para permitir lectura pública de videos
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
    'property-videos-read-policy',
    'property-videos',
    'Permitir lectura pública de videos',
    'true',
    'true',
    'SELECT'
) ON CONFLICT (id) DO NOTHING;

-- Política para permitir subida de videos
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
    'property-videos-upload-policy',
    'property-videos',
    'Permitir subida de videos',
    'true',
    'true',
    'INSERT'
) ON CONFLICT (id) DO NOTHING;

-- Política para permitir actualización de videos
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
    'property-videos-update-policy',
    'property-videos',
    'Permitir actualización de videos',
    'true',
    'true',
    'UPDATE'
) ON CONFLICT (id) DO NOTHING;

-- Política para permitir eliminación de videos
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
    'property-videos-delete-policy',
    'property-videos',
    'Permitir eliminación de videos',
    'true',
    'true',
    'DELETE'
) ON CONFLICT (id) DO NOTHING;

-- ========================================
-- PARTE 3: FUNCIONES AUXILIARES
-- ========================================

-- 7. Crear función RPC para eliminar videos de propiedad
CREATE OR REPLACE FUNCTION delete_property_videos(property_id UUID)
RETURNS void AS $$
BEGIN
    DELETE FROM property_videos WHERE property_videos.property_id = delete_property_videos.property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PARTE 4: VERIFICACIÓN FINAL
-- ========================================

-- 8. Verificar configuración de la tabla
SELECT 
    'Tabla property_videos' as component,
    COUNT(*) as policies_count
FROM pg_policies 
WHERE tablename = 'property_videos';

-- 9. Verificar configuración del bucket
SELECT 
    'Bucket property-videos' as component,
    b.name as bucket_name,
    b.public as is_public,
    COUNT(p.id) as policies_count
FROM storage.buckets b
LEFT JOIN storage.policies p ON p.bucket_id = b.id
WHERE b.name = 'property-videos'
GROUP BY b.name, b.public;

-- 10. Verificar estructura de la tabla
SELECT 
    'Estructura de tabla' as component,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'property_videos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 11. Verificar funciones RPC
SELECT 
    'Funciones RPC' as component,
    routine_name, 
    routine_type 
FROM information_schema.routines 
WHERE routine_name = 'delete_property_videos'
AND routine_schema = 'public';

-- ========================================
-- MENSAJE FINAL
-- ========================================
SELECT '✅ Configuración de videos completada exitosamente' as status;