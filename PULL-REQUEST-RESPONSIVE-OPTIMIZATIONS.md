## PR: Responsive – Menú móvil unificado y mejoras Admin (Mobile/Tablet)

### Resumen
- Unifica el menú hamburguesa (☰) y comportamiento mobile en `compras.html`, `compras-nuevo.html`, `arriendos.html` y `arriendos-nuevo.html`.
- Optimiza panel de administración en mobile/tablet: agrega toggle superior para abrir/cerrar sidebar y corrige overflow horizontal de tablas.

### Archivos editados
- Público
  - `compras.html`, `compras-nuevo.html`:
    - Botón `nav-toggle` (☰), media query mobile y JS para abrir/cerrar menú y autocierre al navegar.
  - `arriendos.html`, `arriendos-nuevo.html`:
    - Misma integración del botón `nav-toggle` (☰) y lógica mobile.
- Administración
  - `admin-styles.css`:
    - `overflow-x: auto` en contenedores de tablas y `-webkit-overflow-scrolling: touch`.
    - Nuevo `.mobile-sidebar-toggle` visible en mobile.
  - `admin-scripts.js`:
    - Soporte para `#mobileSidebarToggle` además de `#sidebarToggle`.
  - `admin-dashboard.html`, `admin-properties.html`, `admin-images.html`, `admin-contacts.html`, `admin-analytics.html`, `admin-settings.html`:
    - Inserta botón `#mobileSidebarToggle` en el header.

### Cómo probar
1) Menú móvil (≤768px)
   - Abrir `compras*.html` y `arriendos*.html`.
   - Ver botón ☰ en el header. Tocar para abrir/cerrar. Tocar un link debe cerrar el menú.
2) Admin (≤768px)
   - En cada página admin, tocar ☰ del header para abrir/cerrar la sidebar.
   - Revisar tablas anchas: se debe permitir scroll horizontal sin cortar contenido ni romper layout.

### Notas
- Cambios encapsulados en cada página para minimizar regresiones. Siguiente paso aconsejado: extraer header a un parcial reutilizable.
