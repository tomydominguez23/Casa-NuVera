-- Setup de videos para Casa Nuvera
-- 1) Crear tabla de videos si no existe
CREATE TABLE IF NOT EXISTS public.property_videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    video_url text NOT NULL,
    video_title text,
    video_order integer DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

-- 2) Ajustar replica identity (para eliminaciones desde clientes)
ALTER TABLE property_videos REPLICA IDENTITY FULL;

-- 3) (Opcional) Habilitar RLS y políticas básicas
-- ALTER TABLE property_videos ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow read" ON property_videos FOR SELECT USING (true);
-- CREATE POLICY "Allow insert" ON property_videos FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow delete" ON property_videos FOR DELETE USING (true);

-- 4) Crear bucket de Storage para videos (ejecutar desde el panel de Supabase si se requiere)
-- Nota: La creación de buckets usualmente se hace vía API o panel, no vía SQL.
-- Asegúrate de tener un bucket llamado 'property-videos' con acceso público.
-- Luego ajusta políticas publicas:
--
-- POLÍTICAS DE STORAGE (ejemplo, ejecutar en SQL editor):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('property-videos', 'property-videos', true) ON CONFLICT (id) DO NOTHING;
-- -- Permitir lectura pública en el bucket
-- CREATE POLICY IF NOT EXISTS "Public read access to property-videos"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'property-videos');
-- -- Permitir inserción con anon key
-- CREATE POLICY IF NOT EXISTS "Anon insert to property-videos"
-- ON storage.objects FOR INSERT
-- TO anon
-- WITH CHECK (bucket_id = 'property-videos');
-- -- Permitir borrado desde anon (si lo necesitas desde front); preferible restringir a service role del backend
-- CREATE POLICY IF NOT EXISTS "Anon delete from property-videos"
-- ON storage.objects FOR DELETE
-- TO anon
-- USING (bucket_id = 'property-videos');