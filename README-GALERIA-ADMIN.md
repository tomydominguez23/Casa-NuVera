# 🎬 Gestión de Galería del Sitio - Casa Nuvera

## Descripción

Sistema completo para gestionar las imágenes y videos que aparecen en la galería principal del sitio web (`index.html`). Permite agregar, editar, eliminar y organizar el contenido visual de manera intuitiva desde el panel de administración.

## Características

### ✨ Funcionalidades Principales

- **Vista Previa en Tiempo Real**: Ve cómo se verá la galería antes de publicar los cambios
- **Gestión de Slides**: Agregar, editar, eliminar y reordenar slides de imagen y video
- **Subida de Archivos**: Integración con Supabase Storage para subir imágenes y videos
- **Sincronización Automática**: Los cambios se reflejan automáticamente en el sitio web
- **Interfaz Intuitiva**: Panel de administración fácil de usar

### 🎯 Tipos de Contenido Soportados

- **Imágenes**: JPG, PNG, WEBP (máximo 5MB)
- **Videos**: MP4, WebM (máximo 50MB)
- **Metadatos**: Título, descripción, orden de visualización

## Archivos Creados/Modificados

### Nuevos Archivos

1. **`admin-gallery.html`** - Panel de administración para gestionar la galería
2. **`test-gallery-sync.html`** - Página de prueba para verificar la sincronización
3. **`README-GALERIA-ADMIN.md`** - Esta documentación

### Archivos Modificados

1. **`admin-dashboard.html`** - Agregado enlace a gestión de galería
2. **`index.html`** - Integrado sistema de sincronización automática

## Cómo Usar

### 1. Acceder al Panel de Administración

1. Ve a `admin-login.html` e inicia sesión
2. En el dashboard, haz clic en "Galería del Sitio" o ve directamente a `admin-gallery.html`

### 2. Gestionar Slides

#### Agregar Nuevo Slide

1. Haz clic en "Agregar Imagen" o "Agregar Video"
2. Completa el formulario:
   - **Título**: Nombre del slide
   - **Descripción**: Texto que aparece en el overlay
   - **Tipo**: Imagen o Video
   - **Archivo**: Sube tu imagen o video
   - **Orden**: Posición en la galería (1-5)
3. Haz clic en "Guardar Slide"

#### Editar Slide Existente

1. En la cuadrícula de slides, haz clic en "✏️ Editar"
2. Modifica los campos necesarios
3. Haz clic en "Guardar Slide"

#### Activar/Desactivar Slide

1. Haz clic en "👁️ Mostrar" o "👁️ Ocultar"
2. Los slides desactivados no aparecen en el sitio web

#### Eliminar Slide

1. Haz clic en "🗑️ Eliminar"
2. Confirma la eliminación

### 3. Sincronizar con el Sitio Web

1. Haz clic en "🔄 Sincronizar con Sitio Web"
2. Los datos se guardan automáticamente en localStorage
3. Elige si quieres abrir el sitio web para ver los cambios
4. Los cambios se reflejan automáticamente en la galería del sitio

### 4. Vista Previa

- La sección "Vista Previa de la Galería" muestra cómo se verá en el sitio web
- Usa los controles de navegación para probar el carrusel
- Los cambios se reflejan inmediatamente

## Estructura Técnica

### Sistema de Sincronización

```javascript
// El sistema mantiene sincronizados los datos entre admin y sitio web
window.gallerySync = new GallerySync();

// Métodos principales:
- loadGalleryData()     // Cargar datos desde Supabase
- saveGalleryChanges()  // Guardar cambios
- updateIndexGallery()  // Actualizar galería en index.html
```

### Estructura de Datos

```javascript
const slideData = {
    id: 1,                    // ID único
    title: "Título",         // Título del slide
    description: "Descripción", // Texto del overlay
    type: "image",           // "image" o "video"
    url: "https://...",      // URL del archivo
    order: 1,                // Orden de visualización
    active: true,            // Si está activo
    propertyId: 1,           // ID de propiedad relacionada
    slug: "property-slug"    // Slug para navegación
};
```

## Integración con Supabase

### Storage Bucket

- **Bucket**: `imagenes-sitio`
- **Políticas**: Configuradas para permitir lectura pública y escritura autenticada
- **Estructura**: Archivos organizados por fecha y tipo

### Tabla de Galería (Futuro)

```sql
CREATE TABLE gallery_slides (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(10) CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    order_position INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    property_id INTEGER,
    slug VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Personalización

### Modificar Estilos

Los estilos están en la sección `<style>` de `admin-gallery.html`:

```css
/* Colores principales */
--primary-color: #3498db;
--success-color: #27ae60;
--warning-color: #f39c12;
--danger-color: #e74c3c;

/* Modificar estos valores para cambiar la apariencia */
```

### Agregar Nuevos Tipos de Contenido

1. Modifica el `select` de tipo en el modal
2. Actualiza la validación en `handleFiles()`
3. Ajusta la renderización en `renderPreviewCarousel()`

## Solución de Problemas

### Error de Conexión con Supabase

```
❌ Error de conexión. Recarga la página.
```

**Solución**: Verifica que `supabase.js` esté cargado correctamente y que las credenciales sean válidas.

### Error al Subir Archivos

```
❌ Error subiendo archivo: [mensaje]
```

**Soluciones**:
- Verifica que el archivo no exceda el tamaño límite
- Confirma que el formato sea soportado
- Revisa los permisos del bucket en Supabase

### Galería No Se Actualiza

**Solución**: 
1. Verifica que `gallery-sync.js` esté incluido en `index.html`
2. Revisa la consola del navegador para errores
3. Confirma que los cambios se guardaron correctamente

## Próximas Mejoras

### Funcionalidades Planificadas

- [ ] **Drag & Drop**: Reordenar slides arrastrando
- [ ] **Bulk Upload**: Subir múltiples archivos a la vez
- [ ] **Optimización Automática**: Redimensionar imágenes automáticamente
- [ ] **Analytics**: Estadísticas de visualización de slides
- [ ] **Templates**: Plantillas predefinidas para diferentes tipos de contenido
- [ ] **Scheduling**: Programar cambios para fechas específicas

### Integraciones Futuras

- [ ] **CDN**: Integración con Cloudflare o similar
- [ ] **AI**: Generación automática de descripciones
- [ ] **SEO**: Optimización automática para motores de búsqueda
- [ ] **Mobile**: App móvil para gestión desde dispositivos móviles

## Página de Prueba

### `test-gallery-sync.html`

Esta página te permite probar la sincronización entre el panel de administración y el sitio web:

1. **Cargar Datos**: Verifica qué datos de galería están guardados
2. **Guardar Datos de Prueba**: Crea datos de ejemplo para probar
3. **Abrir Panel Admin**: Acceso directo al panel de administración
4. **Abrir Sitio Web**: Acceso directo al sitio web para ver los cambios

**Cómo usar:**
1. Ve a `test-gallery-sync.html` en tu navegador
2. Haz clic en "Guardar Datos de Prueba" para crear datos de ejemplo
3. Haz clic en "Abrir Panel Admin" para gestionar la galería
4. Haz clic en "Sincronizar con Sitio Web" en el panel admin
5. Haz clic en "Abrir Sitio Web" para ver los cambios reflejados

## Soporte

Para soporte técnico o preguntas sobre la implementación:

1. Revisa la consola del navegador para errores
2. Verifica la documentación de Supabase
3. Consulta los logs del servidor si aplica
4. Usa `test-gallery-sync.html` para diagnosticar problemas de sincronización

---

**Casa Nuvera** - Innovando el sector Inmobiliario | EST. 2025