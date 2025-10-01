# 🚀 Guía de Despliegue - Casa Nuvera a Bluehost

## 📋 Resumen del Proyecto
- **Sitio:** Casa Nuvera (casanuvera.cl)
- **Tipo:** Sitio web estático HTML/CSS/JavaScript
- **Tamaño:** ~3.4MB
- **Archivos principales:** 62 archivos (HTML, CSS, JS)
- **Tecnologías:** HTML5, CSS3, JavaScript, Supabase

## 🎯 Archivos Esenciales para Subir

### Archivos Principales (OBLIGATORIOS)
```
📁 Archivos raíz:
├── index.html (Página principal)
├── compras.html
├── arriendos-nuevo.html
├── contacto.html
├── nosotros.html
├── servicios.html
├── blog.html
├── propiedad.html
├── property-detail.html
├── admin-login.html
├── admin-dashboard.html
├── admin-properties.html
├── admin-contacts.html
├── admin-analytics.html
├── admin-images.html
├── admin-settings.html
├── subir-propiedades.html
├── subir-imagenes.html
├── diagnostico-estructura.html
├── test-changes.html
├── test-google-maps-fixed.html
├── test-mapa-fixed.html
├── test-mapa-urgente.html
└── mapa.html (si existe)

📁 Carpetas:
├── css/
│   ├── property-featured-styles.css
│   └── property-grid-dark.css
├── js/
│   └── property-detail-fixed.js
└── Archivos JS en raíz:
    ├── supabase.js
    ├── property-handler.js
    ├── property-loader-fixed.js
    ├── whatsapp-widget.js
    ├── whatsapp-widget.css
    ├── property-styles.css
    └── [otros archivos JS específicos]
```

## 🔧 Configuración de Bluehost

### 1. Acceso al Panel de Control
1. Inicia sesión en tu cuenta de Bluehost
2. Ve al **Panel de Control (cPanel)**
3. Busca la sección **"Archivos"**
4. Haz clic en **"Administrador de Archivos"**

### 2. Navegación a la Carpeta Correcta
1. En el Administrador de Archivos, navega a:
   ```
   public_html/
   ```
   ⚠️ **IMPORTANTE:** Esta es la carpeta donde deben ir todos los archivos de tu sitio web.

### 3. Subir Archivos

#### Opción A: Subir Archivo por Archivo
1. Haz clic en **"Subir"** en la barra superior
2. Selecciona todos los archivos HTML, CSS y JS
3. Sube cada archivo individualmente

#### Opción B: Crear ZIP y Subir (RECOMENDADO)
1. Comprime todos los archivos en un ZIP
2. Sube el archivo ZIP a `public_html/`
3. Haz clic derecho en el ZIP → **"Extraer"**
4. Elimina el archivo ZIP después de extraer

## 📁 Estructura Final en Bluehost

Tu estructura debe quedar así:
```
public_html/
├── index.html
├── compras.html
├── arriendos-nuevo.html
├── contacto.html
├── nosotros.html
├── servicios.html
├── blog.html
├── propiedad.html
├── property-detail.html
├── admin-login.html
├── admin-dashboard.html
├── admin-properties.html
├── admin-contacts.html
├── admin-analytics.html
├── admin-images.html
├── admin-settings.html
├── subir-propiedades.html
├── subir-imagenes.html
├── diagnostico-estructura.html
├── test-changes.html
├── test-google-maps-fixed.html
├── test-mapa-fixed.html
├── test-mapa-urgente.html
├── supabase.js
├── property-handler.js
├── property-loader-fixed.js
├── whatsapp-widget.js
├── whatsapp-widget.css
├── property-styles.css
├── css/
│   ├── property-featured-styles.css
│   └── property-grid-dark.css
└── js/
    └── property-detail-fixed.js
```

## ⚙️ Configuraciones Adicionales

### 1. Configurar Página de Inicio
- Asegúrate de que `index.html` esté en la raíz de `public_html/`
- Bluehost automáticamente mostrará `index.html` como página principal

### 2. Configurar Dominio (si es necesario)
1. En cPanel, ve a **"Dominios"**
2. Verifica que `casanuvera.cl` esté configurado correctamente
3. Asegúrate de que apunte a `public_html/`

### 3. Configurar SSL (Recomendado)
1. En cPanel, busca **"SSL/TLS"**
2. Activa **"Force HTTPS Redirect"**
3. Esto asegurará que tu sitio use HTTPS

## 🔍 Verificación Post-Despliegue

### 1. Pruebas Básicas
- [ ] Visita `https://casanuvera.cl` - debe cargar la página principal
- [ ] Verifica que todas las páginas carguen correctamente
- [ ] Prueba la navegación entre páginas
- [ ] Verifica que las imágenes se muestren

### 2. Pruebas de Funcionalidad
- [ ] Prueba el formulario de contacto
- [ ] Verifica la integración con Supabase
- [ ] Prueba el widget de WhatsApp
- [ ] Verifica la funcionalidad de búsqueda de propiedades

### 3. Pruebas de Responsividad
- [ ] Prueba en dispositivos móviles
- [ ] Verifica que el diseño se adapte correctamente
- [ ] Prueba la navegación móvil

## 🚨 Solución de Problemas Comunes

### Error 404 - Página no encontrada
- Verifica que todos los archivos estén en `public_html/`
- Asegúrate de que los nombres de archivo sean correctos
- Verifica los permisos de archivo (644 para archivos, 755 para carpetas)

### Imágenes no se muestran
- Verifica que las URLs de las imágenes sean correctas
- Asegúrate de que las imágenes estén subidas
- Verifica los permisos de archivo

### JavaScript no funciona
- Verifica que todos los archivos JS estén subidos
- Revisa la consola del navegador para errores
- Asegúrate de que las rutas a los archivos JS sean correctas

### Problemas con Supabase
- Verifica que las credenciales en `supabase.js` sean correctas
- Asegúrate de que el proyecto Supabase esté activo
- Revisa la configuración de CORS en Supabase

## 📞 Soporte Adicional

Si encuentras problemas durante el despliegue:

1. **Revisa los logs de error** en cPanel
2. **Verifica los permisos** de archivos y carpetas
3. **Contacta al soporte de Bluehost** si es necesario
4. **Revisa la documentación** de Bluehost para hosting estático

## ✅ Checklist Final

- [ ] Todos los archivos HTML subidos a `public_html/`
- [ ] Carpetas `css/` y `js/` creadas y con archivos
- [ ] Archivos JavaScript principales en la raíz
- [ ] SSL configurado y funcionando
- [ ] Dominio apuntando correctamente
- [ ] Sitio accesible en `https://casanuvera.cl`
- [ ] Todas las funcionalidades probadas
- [ ] Diseño responsivo verificado

---

**¡Tu sitio Casa Nuvera estará listo para recibir visitantes! 🏠✨**