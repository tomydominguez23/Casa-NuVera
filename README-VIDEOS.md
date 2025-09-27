Casa Nuvera — Videos de Propiedades

1) Base de datos (SQL)
- Ejecuta `supabase_videos_setup.sql` en el SQL Editor de tu proyecto.
- Crea la tabla `property_videos` con RLS y políticas abiertas (demo) y activa `REPLICA IDENTITY FULL`.

2) Storage
- Crea un bucket público llamado `property-videos`.
- Panel: Storage → New bucket → Name: property-videos → Public: enabled.
- No necesitas reglas adicionales si el bucket es público.

3) App ya compatible
- Subida: `property-handler.uploadAndLinkVideos` guarda en bucket `property-videos` y crea filas en `property_videos`.
- Vista: `property-detail-dynamic.js` y `form-scripts-fixed.js` leen `property_videos` y muestran `<video src="...">`.

4) Errores comunes
- 404 al obtener/insertar: tabla o políticas faltantes → corre el SQL.
- Video no se ve: bucket inexistente o no público → crea `property-videos` como público.
- Eliminar imagen falla: ya solucionado, ahora se elimina por `id` en edición.

5) Notas de seguridad (cuando pases a producción)
- Reemplaza políticas abiertas `(true)` por reglas con autenticación/roles.
- Considera usar firmas temporales si haces privado el bucket.
