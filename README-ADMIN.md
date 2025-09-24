# 🏠 Panel de Administración Casa Nuvera

Panel de administración completo para la gestión de la inmobiliaria Casa Nuvera. Sistema diseñado para administrar propiedades, contactos, análisis y configuraciones de manera eficiente y segura.

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- **Login Seguro**: Sistema de autenticación con credenciales protegidas
- **Sesiones Temporales**: Sesiones que expiran automáticamente después de 8 horas
- **Recordar Usuario**: Opción para recordar el nombre de usuario
- **Múltiples Credenciales**: Soporte para diferentes niveles de administrador

### 📊 Dashboard Principal
- **Estadísticas en Tiempo Real**: Visión general de propiedades, contactos y visitas
- **Actividad Reciente**: Historial de las últimas acciones realizadas
- **Acciones Rápidas**: Enlaces directos a las funciones más utilizadas
- **Estado del Sistema**: Monitoreo de la conexión a base de datos y servicios

### 🏘️ Gestión de Propiedades
- **Lista Completa**: Visualización de todas las propiedades con filtros avanzados
- **Filtros Inteligentes**: Por tipo, categoría, comuna y búsqueda de texto
- **Estadísticas**: Contadores automáticos por categoría y estado
- **Acciones Rápidas**: Ver, editar y eliminar propiedades directamente
- **Vista en Cards**: Diseño visual atractivo con información clave

### 📧 Gestión de Contactos
- **Lista de Consultas**: Todas las consultas organizadas por estado
- **Sistema de Estados**: Nuevas, respondidas y pendientes
- **Respuesta Integrada**: Modal para responder directamente desde el panel
- **Información Detallada**: Datos completos del cliente y su consulta
- **Acciones de Contacto**: Llamar, responder y marcar como leída

### 📈 Análisis y Reportes
- **Métricas Clave**: Visitas, conversiones, tiempo promedio en sitio
- **Gráficos Interactivos**: Visualización de datos por períodos
- **Propiedades Top**: Ranking de propiedades más consultadas
- **Generador de Reportes**: Creación de reportes en PDF, Excel y CSV
- **Filtros de Fecha**: Análisis por períodos personalizados

### ⚙️ Configuración Avanzada
- **Información de Empresa**: Datos básicos y contacto
- **Configuración SEO**: Títulos, descripciones y palabras clave
- **Redes Sociales**: Enlaces a perfiles sociales
- **Personalización Visual**: Colores, logo y tipografía
- **Notificaciones**: Configuración de alertas por email
- **Integraciones**: Google Maps, Analytics y chat en línea
- **Seguridad**: Cambio de contraseñas y backups

## 🚀 Acceso al Panel

### Credenciales de Administrador

El sistema incluye múltiples cuentas de administrador:

1. **Admin Principal**
   - Usuario: `admin`
   - Contraseña: `admin123`

2. **Casa Nuvera**
   - Usuario: `casanuvera`
   - Contraseña: `nuvera2025`

3. **Administrador**
   - Usuario: `administrador`
   - Contraseña: `casanuvera123`

### URL de Acceso
```
https://tu-dominio.com/admin-login.html
```

## 📱 Características Técnicas

### 🎨 Diseño Responsivo
- **Adaptable**: Funciona perfectamente en desktop, tablet y móvil
- **Sidebar Colapsable**: Navegación optimizada para pantallas pequeñas
- **Touch Friendly**: Interfaz optimizada para dispositivos táctiles

### 🔒 Seguridad
- **Autenticación Segura**: Verificación de credenciales del lado cliente
- **Sesiones Controladas**: Expiración automática por tiempo
- **Limpieza de Datos**: Eliminación automática de datos sensibles
- **Validación de Formularios**: Verificación de datos antes del envío

### 💾 Almacenamiento
- **LocalStorage**: Configuraciones persistentes del usuario
- **SessionStorage**: Datos de sesión temporal
- **Supabase**: Base de datos para propiedades y contactos
- **Auto-guardado**: Borradores automáticos de formularios

### ⚡ Performance
- **Carga Rápida**: Recursos optimizados y comprimidos
- **Animaciones Suaves**: Transiciones fluidas y atractivas
- **Lazy Loading**: Carga de datos bajo demanda
- **Cache Inteligente**: Almacenamiento en caché de recursos

## 🛠️ Estructura de Archivos

```
/
├── admin-login.html          # Página de inicio de sesión
├── admin-dashboard.html      # Dashboard principal
├── admin-properties.html    # Gestión de propiedades
├── admin-contacts.html      # Gestión de contactos
├── admin-analytics.html     # Análisis y reportes
├── admin-settings.html      # Configuración del sistema
├── admin-styles.css         # Estilos del panel de administración
├── admin-scripts.js         # Scripts principales del panel
├── subir-propiedades.html   # Formulario para nuevas propiedades
├── supabase.js              # Configuración de base de datos
├── property-handler.js      # Manejo de propiedades
├── form-scripts.js          # Scripts de formularios
└── property-styles.css      # Estilos de propiedades
```

## 🎯 Funcionalidades por Página

### 📊 Dashboard (`admin-dashboard.html`)
- Vista general del sistema
- Estadísticas en tiempo real
- Actividad reciente
- Acciones rápidas
- Estado del sistema

### 🏘️ Propiedades (`admin-properties.html`)
- Lista con filtros avanzados
- Estadísticas por categoría
- Acciones masivas
- Vista detallada
- Edición rápida

### 📧 Contactos (`admin-contacts.html`)
- Gestión de consultas
- Sistema de estados
- Respuestas integradas
- Filtros por tipo
- Acciones de contacto

### 📈 Análisis (`admin-analytics.html`)
- Métricas de rendimiento
- Gráficos interactivos
- Reportes personalizados
- Exportación de datos
- Filtros temporales

### ⚙️ Configuración (`admin-settings.html`)
- Configuración general
- Personalización visual
- Notificaciones
- Integraciones
- Seguridad y backups

## 🔧 Personalización

### Colores de Marca
El sistema utiliza la paleta de colores de Casa Nuvera:
- **Primario**: `#2c3e50` (Azul oscuro)
- **Secundario**: `#3498db` (Azul)
- **Éxito**: `#27ae60` (Verde)
- **Advertencia**: `#f39c12` (Naranja)
- **Error**: `#e74c3c` (Rojo)

### Tipografía
- **Principal**: Segoe UI, Arial, sans-serif
- **Títulos**: Hereda de la fuente principal
- **Monospace**: Para códigos y claves API

## 📚 Guía de Uso

### Primer Acceso
1. Abrir `admin-login.html` en el navegador
2. Usar las credenciales proporcionadas (click en el cuadro para auto-completar)
3. El sistema redirigirá automáticamente al dashboard

### Gestión Diaria
1. **Revisar Dashboard**: Estadísticas y actividad reciente
2. **Gestionar Consultas**: Responder a nuevos contactos
3. **Administrar Propiedades**: Agregar, editar o eliminar inmuebles
4. **Generar Reportes**: Análisis periódicos de rendimiento

### Mantenimiento
1. **Backup Regular**: Usar la función de backup en configuración
2. **Actualizar Información**: Mantener datos de empresa actualizados
3. **Revisar Configuración**: Verificar integraciones y notificaciones
4. **Monitorear Seguridad**: Cambiar contraseñas periódicamente

## 🤝 Soporte

### Funcionalidades Futuras
- [ ] Integración con CRM
- [ ] Chat en tiempo real
- [ ] App móvil nativa
- [ ] API REST completa
- [ ] Reportes automáticos por email
- [ ] Sistema de roles y permisos
- [ ] Integración con redes sociales
- [ ] Tours virtuales 360°

### Problemas Conocidos
- El sistema actualmente utiliza datos de demostración
- Las funciones de email requieren configuración SMTP
- Los reportes son simulados (pendiente implementación real)

## 📞 Contacto

Para soporte técnico o consultas sobre el panel de administración:

**Casa Nuvera - Departamento de TI**
- 📧 Email: soporte@casanuvera.cl
- 📱 WhatsApp: +56 9 1234 5678
- 🌐 Web: https://casanuvera.cl

---

**© 2025 Casa Nuvera - Panel de Administración**  
*Sistema diseñado para la gestión eficiente de inmobiliarias*

🏠 **Tu hogar ideal te está esperando**