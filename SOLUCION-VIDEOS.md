# Solución para Problema de Subida de Videos

## Problema Identificado
El error `StorageApiError: new row violates row-level security policy` indica que las políticas de seguridad de Supabase están bloqueando la subida de videos. Esto ocurre tanto en el Storage bucket como en la tabla `property_videos`.

## Solución

### Paso 1: Ejecutar Script SQL en Supabase
1. Ve a tu proyecto de Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido completo del archivo `supabase_video_complete_fix.sql`
4. Ejecuta el script

### Paso 2: Verificar Configuración Manual (si es necesario)
Si el script automático no funciona, configura manualmente:

#### En Storage:
1. Ve a **Storage** > **Buckets**
2. Crea un nuevo bucket llamado `property-videos`
3. Marca como **Público**
4. Establece límite de archivo a 50MB
5. Agrega tipos MIME permitidos: `video/mp4`, `video/avi`, `video/mov`, `video/webm`, `video/mkv`

#### En Policies:
1. Ve a **Authentication** > **Policies**
2. Busca la tabla `property_videos`
3. Crea las siguientes políticas:
   - **SELECT**: `true`
   - **INSERT**: `true`
   - **UPDATE**: `true`
   - **DELETE**: `true`

### Paso 3: Verificar que Funciona
1. Intenta subir un video en tu aplicación
2. Revisa la consola del navegador
3. Deberías ver mensajes de éxito en lugar del error de RLS

## Archivos Creados
- `supabase_video_complete_fix.sql` - Script completo para ejecutar
- `supabase_video_storage_fix.sql` - Solo correcciones de Storage
- `supabase_video_table_fix.sql` - Solo correcciones de tabla

## ¿Por qué Ocurrió Este Problema?
1. **RLS Habilitado**: Supabase tiene Row Level Security habilitado por defecto
2. **Políticas Faltantes**: No había políticas configuradas para permitir operaciones en `property_videos`
3. **Bucket Sin Configurar**: El bucket `property-videos` no tenía políticas de Storage configuradas

## Verificación Post-Solución
Después de ejecutar el script, deberías poder:
- ✅ Subir videos sin errores de RLS
- ✅ Ver videos en la página de propiedades
- ✅ Eliminar videos correctamente
- ✅ Editar propiedades con videos

## Si Aún Hay Problemas
1. Verifica que el bucket `property-videos` existe y es público
2. Revisa que las políticas RLS están activas
3. Comprueba que el usuario tiene permisos de autenticación
4. Revisa los logs de Supabase para errores específicos