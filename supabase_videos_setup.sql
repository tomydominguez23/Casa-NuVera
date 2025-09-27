-- Casa Nuvera - Setup para videos de propiedades
-- Ejecutar en el SQL Editor de tu proyecto Supabase

-- 1) Tabla property_videos (si no existe)
create table if not exists public.property_videos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  video_url text not null,
  video_title text,
  video_order int default 1,
  created_at timestamp with time zone default now()
);

-- 2) Activar RLS si aún no está (y políticas abiertas tipo demo)
alter table public.property_videos enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'property_videos' and policyname = 'Allow read property_videos'
  ) then
    create policy "Allow read property_videos" on public.property_videos for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'property_videos' and policyname = 'Allow insert property_videos'
  ) then
    create policy "Allow insert property_videos" on public.property_videos for insert with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'property_videos' and policyname = 'Allow delete property_videos'
  ) then
    create policy "Allow delete property_videos" on public.property_videos for delete using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'property_videos' and policyname = 'Allow update property_videos'
  ) then
    create policy "Allow update property_videos" on public.property_videos for update using (true);
  end if;
end $$;

-- 3) Sugerencia de Storage: crear bucket público "property-videos"
-- En Storage > Buckets: New bucket → name: property-videos → Public
-- (los uploads ya usan este nombre en property-handler.js)

-- 4) Ajuste opcional replica identity para eliminar en cascada sin errores
alter table public.property_videos replica identity full;
