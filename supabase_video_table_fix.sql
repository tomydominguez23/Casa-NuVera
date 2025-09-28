-- Script SQL para corregir políticas de la tabla property_videos
-- Ejecutar en SQL Editor de Supabase

-- 1. Verificar si la tabla property_videos existe y tiene RLS habilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE tablename = 'property_videos';

-- 2. Verificar políticas existentes en property_videos
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'property_videos'
ORDER BY policyname;

-- 3. Crear políticas RLS para property_videos si no existen
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
    ELSE
        RAISE NOTICE 'Política de lectura ya existe para property_videos';
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
    ELSE
        RAISE NOTICE 'Política de inserción ya existe para property_videos';
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
    ELSE
        RAISE NOTICE 'Política de actualización ya existe para property_videos';
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
    ELSE
        RAISE NOTICE 'Política de eliminación ya existe para property_videos';
    END IF;
END $$;

-- 4. Configurar REPLICA IDENTITY para property_videos
ALTER TABLE public.property_videos REPLICA IDENTITY FULL;

-- 5. Verificar configuración final
SELECT 
    'property_videos configurado' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'property_videos';

-- 6. Verificar estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'property_videos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Crear función RPC para eliminar videos de propiedad (método alternativo)
CREATE OR REPLACE FUNCTION delete_property_videos(property_id UUID)
RETURNS void AS $$
BEGIN
    DELETE FROM property_videos WHERE property_videos.property_id = delete_property_videos.property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Verificar que la función se creó correctamente
SELECT 
    routine_name, 
    routine_type 
FROM information_schema.routines 
WHERE routine_name = 'delete_property_videos'
AND routine_schema = 'public';