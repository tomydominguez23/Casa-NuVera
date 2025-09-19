Título: Buscador global en todas las páginas + filtros por URL para compras/arriendos

Resumen
- Se creó un widget de búsqueda reutilizable que replica el buscador del inicio y ahora aparece en las páginas principales (compras, arriendos, contacto, nosotros, servicios).
- Al enviar la búsqueda, redirige a la sección correspondiente (compras o arriendos) con parámetros en la URL para prefiltrar resultados.
- En compras y arriendos se agregó soporte para leer esos parámetros y aplicar los filtros automáticamente al cargar.

Archivos nuevos
- css/global-search.css: estilos del buscador global, consistentes con el diseño del home.
- js/global-search.js: lógica del widget (render, envío y navegación). Inyección automática bajo .hero si no existe el buscador nativo.

Edits en páginas
- compras.html
  - Se incluyen css/global-search.css y js/global-search.js.
  - Nueva función applyFiltersFromParams() para leer ?type=&loc= y ejecutar búsqueda inicial.
- arriendos.html
  - Se incluyen css/global-search.css y js/global-search.js.
  - Se filtra la lista renderizada con ?type=&loc= si vienen en la URL.
- contacto.html, nosotros.html, servicios.html
  - Se incluyen css/global-search.css y js/global-search.js para inyectar el widget debajo del hero.

Cómo funciona el widget
1) Campos: operación (Venta/Arriendo), tipo (Casa/Departamento/Oficina), ubicación, checkbox Proyectos.
2) Al presionar Buscar:
   - Si operación = Venta → navega a compras.html con ?op=venta&type=&loc=&proj=
   - Si operación = Arriendo → navega a arriendos.html con ?op=arriendo&type=&loc=&proj=
3) En compras/arriendos se leen esos parámetros para prefiltrar resultados.

Pruebas sugeridas
- Desde cualquier página (ej: contacto.html), usar el buscador para:
  - Venta + Departamento + “Providencia” → debe abrir compras.html y mostrar resultados filtrados.
  - Arriendo + Casa + “Las Condes” → debe abrir arriendos.html con lista filtrada.
- En móvil, validar que el widget se adapte (inputs ≥16px para evitar zoom iOS) y quede debajo del hero.

Notas
- En home (index.html) se mantiene el buscador original. El widget global no se inyecta ahí para evitar duplicado.
- En compras existen filtros avanzados propios; el widget global sólo facilita el acceso rápido desde cualquier página.

