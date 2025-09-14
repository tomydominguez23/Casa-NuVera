-- Script SQL SIMPLIFICADO para corregir problemas de eliminación en Supabase
-- Ejecutar en SQL Editor de Supabase

-- 1. Configurar REPLICA IDENTITY para permitir eliminaciones (LO MÁS IMPORTANTE)
ALTER TABLE property_images REPLICA IDENTITY FULL;
ALTER TABLE property_tours REPLICA IDENTITY FULL;
ALTER TABLE properties REPLICA IDENTITY FULL;

-- 2. Crear función RPC para eliminar imágenes de propiedad (método alternativo)
CREATE OR REPLACE FUNCTION delete_property_images(property_id UUID)
RETURNS void AS $$
BEGIN
    DELETE FROM property_images WHERE property_images.property_id = delete_property_images.property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear función RPC para eliminar tours de propiedad (método alternativo)
CREATE OR REPLACE FUNCTION delete_property_tours(property_id UUID)
RETURNS void AS $$
BEGIN
    DELETE FROM property_tours WHERE property_tours.property_id = delete_property_tours.property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificar que las funciones se crearon correctamente
SELECT 
    routine_name, 
    routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('delete_property_images', 'delete_property_tours')
AND routine_schema = 'public';