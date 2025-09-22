## PR: Responsive – Correcciones móviles clave (aspect-ratio, 100dvh/100svh, overflow)

### Resumen
- Soluciona cortes y desbordes en vistas móviles al eliminar alturas rígidas en grillas de propiedades y el widget de WhatsApp.
- Adopta `aspect-ratio` en contenedores de imagen y limita alturas del chat con `min(…vh, …dvh)` para mejor compatibilidad iOS/Android.
- Corrige bloque CSS inválido en `property-styles.css` que causaba errores de linter y posibles rupturas de estilo.

### Archivos editados
- Estilos de propiedades (público)
  - `css/property-grid-dark.css`:
    - Reemplaza `height: Npx` por `aspect-ratio` en `.property-card .property-image` con ratios adaptativos por breakpoint.
  - `property-styles.css`:
    - Corrige secuencias literales `\n` en `@keyframes` y bloques siguientes; elimina errores de linter.
- Widget
  - `whatsapp-widget.css`:
    - Ajusta tamaño del chat a `width: min(320px, 92vw)` y `max-height: min(70vh, 70dvh)`.
    - Breakpoints: usa `min(…vh, …dvh)` y `calc(100% - 30px)` en ≤480px para evitar overflow horizontal en iOS.

### Cómo probar
1) Cards de propiedades
   - Abrir `arriendos.html` (usa `css/property-grid-dark.css`).
   - Reducir ancho del viewport a 375px/320px: las imágenes mantienen proporción, sin cortes.
2) Página principal y listados
   - Abrir `index.html` y `compras.html` en móvil: sin desplazamiento horizontal; hero y grillas se adaptan.
3) Widget WhatsApp
   - En móviles (≤480px) abrir/cerrar el chat: el contenedor no supera la altura útil, no se corta contenido.

### Notas
- Los cambios son CSS-only; no requieren migraciones. Próximo paso: unificar ratios vía variables CSS y revisar `background-attachment: fixed` en secciones con parallax en móviles.
