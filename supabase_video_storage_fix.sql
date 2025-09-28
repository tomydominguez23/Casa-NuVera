-- Script SQL para corregir políticas de Supabase Storage para videos
-- Ejecutar en SQL Editor de Supabase

-- 1. Crear bucket property-videos si no existe (esto debe hacerse manualmente en el panel de Supabase)
-- Storage > Buckets > New bucket > name: property-videos > Public: enabled

-- 2. Crear políticas de Storage para el bucket property-videos
-- Estas políticas permiten subir, leer y eliminar videos

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

-- 3. Verificar que las políticas se crearon correctamente
SELECT 
    id,
    bucket_id,
    name,
    definition,
    check_expression,
    command
FROM storage.policies 
WHERE bucket_id = 'property-videos'
ORDER BY command;

-- 4. Verificar que el bucket existe y está configurado correctamente
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'property-videos';

-- 5. Si el bucket no existe, crear una función para crearlo
-- (Nota: Esto normalmente se hace desde el panel de Supabase)
CREATE OR REPLACE FUNCTION create_property_videos_bucket()
RETURNS void AS $$
BEGIN
    -- Intentar crear el bucket (esto puede fallar si ya existe)
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'property-videos',
        'property-videos',
        true,
        52428800, -- 50MB limit
        ARRAY['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/mkv']
    );
EXCEPTION
    WHEN unique_violation THEN
        -- El bucket ya existe, no hacer nada
        RAISE NOTICE 'Bucket property-videos ya existe';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Ejecutar la función para crear el bucket si no existe
SELECT create_property_videos_bucket();

-- 7. Verificar configuración final
SELECT 
    'Bucket configurado' as status,
    b.name as bucket_name,
    b.public as is_public,
    COUNT(p.id) as policy_count
FROM storage.buckets b
LEFT JOIN storage.policies p ON p.bucket_id = b.id
WHERE b.name = 'property-videos'
GROUP BY b.name, b.public;