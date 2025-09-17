## PR: Responsive – Navegación móvil, CTA sticky y ajustes iniciales

### Resumen
- Agrega navegación móvil (hamburguesa) con el mismo menú que desktop en `index.html` y `compras.html`.
- Añade CTA sticky de WhatsApp y Llamar en mobile en `property-detail.html`.
- Estilos y comportamiento mobile-only, sin impacto en desktop.

### Archivos editados
- `index.html`
  - Añadido botón `nav-toggle` (hamburguesa) y estilos mobile en media query.
  - Lógica JS para abrir/cerrar el menú y cerrar al navegar entre anchors.
- `compras.html`
  - Añadido botón `nav-toggle` (hamburguesa) y estilos mobile en media query.
  - Lógica JS para toggle del menú y cierre al hacer click en links.
- `property-detail.html`
  - Agregado contenedor de CTA sticky (`.sticky-cta`) visible solo en mobile.
  - Estilos mobile para CTA y activación condicional en `DOMContentLoaded`.

### Cómo probar
1) Navegación móvil
   - Abrir `index.html` y `compras.html` en viewport ≤ 768px.
   - Verificar que aparezca botón hamburguesa (☰).
   - Pulsar para abrir el menú; verificar items: Inicio, Comprar, Arrendar, Contacto.
   - Pulsar un link; el menú debe cerrarse automáticamente.

2) CTA sticky en detalle
   - Abrir `property-detail.html` en viewport ≤ 768px.
   - Ver la banda inferior con dos botones: WhatsApp (primario) y Llamar (secundario).
   - Pulsar WhatsApp debe abrir `wa.me` con mensaje prellenado.
   - Pulsar Llamar debe abrir `tel:+56948406684`.

### Notas
- Desktop se mantiene inalterado; `.nav-toggle` se oculta por defecto y solo se muestra en mobile por media query.
- El CTA sticky solo se muestra en mobile mediante `matchMedia('(max-width: 768px)')`.

### Próximos pasos (siguientes PRs propuestos)
- Ajustar alturas de hero y parallax en mobile con `clamp` para tipografías y mejorar CLS.
- Unificar rejilla responsiva de cards (minmax 320–350px) y consolidar breakpoints.
- Verificación de admin: colapso de sidebar por defecto en <1024 y ocultar widget en admin.
