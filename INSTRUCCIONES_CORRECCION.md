# 🔧 Instrucciones para Corregir el Problema de Eliminación

## 🚨 Problema Identificado
El error principal es: `cannot delete from table "property_images" because...not have a replica identity and publishes deletes`

## 📋 Pasos para Solucionar

### 1. **Ejecutar Script SQL en Supabase** ⚡ PRIORITARIO

1. Ve a tu proyecto de Supabase: `https://otfbouzmhmmguvqbbwku.supabase.co`
2. Ve a **SQL Editor** (en el menú lateral)
3. Copia y pega el contenido del archivo `supabase_fix.sql`
4. Ejecuta el script completo

**Este script hará:**
- ✅ Configurar REPLICA IDENTITY en todas las tablas
- ✅ Crear funciones RPC para eliminación alternativa
- ✅ Verificar la configuración actual

### 2. **Verificar Permisos de API Key**

1. Ve a **Settings → API** en tu proyecto Supabase
2. Verifica que tu `anon key` tenga permisos de DELETE
3. Si usas autenticación, verifica también `service_role key`

### 3. **Probar la Eliminación**

1. Recarga tu página de administración
2. Intenta eliminar una propiedad
3. Verifica la consola del navegador para ver los logs

### 4. **Si Persiste el Problema**

Ejecuta en la consola del navegador:
```javascript
window.runDeleteDiagnostics()
```

Esto ejecutará un diagnóstico completo y te mostrará exactamente dónde está el problema.

## 🔍 Verificaciones Adicionales

### Verificar Configuración de RLS (Row Level Security)
Si tienes RLS habilitado, ejecuta esto en SQL Editor:

```sql
-- Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('properties', 'property_images', 'property_tours');

-- Si RLS está habilitado, crear políticas
CREATE POLICY "Allow delete properties" ON properties FOR DELETE USING (true);
CREATE POLICY "Allow delete property_images" ON property_images FOR DELETE USING (true);
CREATE POLICY "Allow delete property_tours" ON property_tours FOR DELETE USING (true);
```

### Verificar Estructura de Tablas
```sql
-- Verificar que las tablas tengan las columnas correctas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'property_images' 
AND table_schema = 'public';
```

## 🎯 Resultado Esperado

Después de aplicar estas correcciones:
- ✅ Las propiedades se eliminarán completamente de la base de datos
- ✅ Se eliminarán automáticamente de la web
- ✅ Se eliminarán los archivos de imágenes del Storage
- ✅ Se eliminarán los tours 360°
- ✅ No habrá más errores de REPLICA IDENTITY

## 🆘 Si Aún No Funciona

1. Ejecuta `window.runDeleteDiagnostics()` en la consola
2. Comparte los resultados del diagnóstico
3. Verifica que el script SQL se ejecutó sin errores
4. Revisa los logs de Supabase en la sección Logs

## 📞 Soporte Adicional

Si necesitas ayuda adicional:
- Revisa los logs de la consola del navegador
- Verifica los logs de Supabase
- Ejecuta el diagnóstico automático
- Comparte cualquier error específico que aparezca