# 🚀 Sistema de Lead Generation y Analytics - Casa Nuvera

## 📋 Descripción General

Este sistema completo de **Lead Generation y Analytics** convierte a Casa Nuvera en una plataforma profesional de captura y análisis de clientes potenciales. Cada vez que un usuario hace clic en ❤️ favoritos, se activa un pop-up profesional para capturar sus datos y clasificarlos automáticamente según su nivel de interés.

## ✨ Características Principales

### 🎯 **Captura de Leads**
- Pop-up profesional activado por clic en favoritos
- Formulario multi-paso con validación en tiempo real
- Integración automática con base de datos Supabase
- Sistema de favoritos híbrido (temporal + permanente)

### 📊 **Analytics Inteligente**
- Tracking automático de cada sesión de usuario
- Análisis de comportamiento (tiempo, clicks, scroll, páginas)
- Sistema de scoring automático (0-100 puntos)
- Clasificación Hot/Warm/Cold basada en engagement

### 🧠 **Scoring Automático**
- **20 puntos:** Información básica (email, teléfono, etc.)
- **30 puntos:** Sesiones (tiempo en sitio, páginas visitadas)
- **30 puntos:** Interacciones (favoritos, WhatsApp, formularios)
- **20 puntos:** Propiedades favoritas

### 🔥 **Clasificación de Leads**
- **HOT (70+ puntos):** Muy probable de convertir
- **WARM (40-69 puntos):** Interesado, necesita nurturing
- **COLD (<40 puntos):** Poco interesado o recién llegado

## 📁 Estructura del Sistema

```
/database/
  └── lead_generation_schema.sql    # Estructura completa de BD
/js/
  ├── user-tracking.js             # Sistema de tracking
  ├── lead-popup.js                # Pop-up de captura
  └── lead-integration.js          # Integración con código existente
README.md                          # Esta documentación
```

## 🛠️ Instalación

### Paso 1: Configurar Base de Datos

1. Ejecuta el script SQL en tu Supabase:
```sql
-- Ejecutar todo el contenido de /database/lead_generation_schema.sql
```

2. Configura las políticas de seguridad en Supabase (RLS):
```sql
-- Permitir inserción pública en leads
CREATE POLICY "Allow public insert on leads" ON leads FOR INSERT WITH CHECK (true);

-- Permitir inserción pública en user_sessions
CREATE POLICY "Allow public insert on user_sessions" ON user_sessions FOR INSERT WITH CHECK (true);

-- Permitir inserción pública en user_interactions
CREATE POLICY "Allow public insert on user_interactions" ON user_interactions FOR INSERT WITH CHECK (true);

-- Permitir inserción pública en property_favorites
CREATE POLICY "Allow public insert on property_favorites" ON property_favorites FOR INSERT WITH CHECK (true);
```

### Paso 2: Incluir Scripts en HTML

Agrega estos scripts **ANTES del cierre de `</body>`** en todos tus archivos HTML:

```html
<!-- Sistema de Lead Generation -->
<script src="js/user-tracking.js"></script>
<script src="js/lead-popup.js"></script>
<script src="js/lead-integration.js"></script>
```

**⚠️ ORDEN IMPORTANTE:** 
1. user-tracking.js (primero)
2. lead-popup.js (segundo)
3. lead-integration.js (último)

### Paso 3: Verificar Integración

El sistema se integra automáticamente con:
- ✅ Funciones `toggleFavorite()` existentes
- ✅ Botones con clase `.property-favorite`
- ✅ Cards con clase `.property-card`
- ✅ Funciones `renderProperties()` existentes

## 🎮 Cómo Funciona

### 1. **Usuario Nuevo Visita el Sitio**
```javascript
// Se crea automáticamente una sesión de tracking
UserTracker iniciado: {
  sessionId: "sess_1693834567_abc123",
  device: "desktop",
  browser: "Chrome"
}
```

### 2. **Usuario Hace Clic en Favorito ❤️**
```javascript
// Primera vez → Muestra pop-up
// Siguientes veces → Solo marca favorito
handleFavoriteClick(propertyId, propertyData)
```

### 3. **Usuario Completa Formulario**
```javascript
// Se crea lead en BD con score automático
Lead guardado: {
  id: "uuid-abc123",
  score: 45,
  clasificacion: "warm"
}
```

### 4. **Sistema Actualiza Score Automáticamente**
```javascript
// Cada interacción actualiza el score
calculate_lead_score(leadId) → 65 puntos → "warm"
```

## 📊 Panel de Admin - Consultas Útiles

### Ver Dashboard de Leads
```sql
SELECT * FROM leads_dashboard 
ORDER BY lead_score DESC, created_at DESC;
```

### Leads Hot de Últimos 7 Días
```sql
SELECT nombre, email, telefono, lead_score, clasificacion, created_at
FROM leads 
WHERE clasificacion = 'hot' 
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY lead_score DESC;
```

### Análisis de Comportamiento
```sql
SELECT 
  l.nombre, l.email, l.lead_score,
  COUNT(ui.id) as total_interacciones,
  COUNT(pf.id) as propiedades_favoritas,
  AVG(us.duracion_segundos) as tiempo_promedio
FROM leads l
LEFT JOIN user_interactions ui ON l.id = ui.lead_id
LEFT JOIN property_favorites pf ON l.id = pf.lead_id AND pf.is_active = true
LEFT JOIN user_sessions us ON l.id = us.lead_id
WHERE l.created_at > NOW() - INTERVAL '30 days'
GROUP BY l.id, l.nombre, l.email, l.lead_score
ORDER BY l.lead_score DESC;
```

### Top Propiedades Favoritas
```sql
SELECT 
  property_id,
  property_title,
  COUNT(*) as total_favoritos,
  AVG(l.lead_score) as score_promedio_interesados
FROM property_favorites pf
JOIN leads l ON pf.lead_id = l.id
WHERE pf.is_active = true
GROUP BY property_id, property_title
ORDER BY total_favoritos DESC, score_promedio_interesados DESC
LIMIT 10;
```

## 🎨 Personalización

### Configurar Sistema
```javascript
// Modificar configuración global
window.LEAD_SYSTEM_CONFIG = {
  enabled: true,                        // Activar/desactivar
  showPopupOnFirstFavorite: true,       // Mostrar popup en primer favorito
  autoTrackInteractions: true,          // Tracking automático
  maxFavoritesWithoutLead: 3,          // Max favoritos sin lead
  debugMode: false                      // Modo debug
};
```

### Personalizar Pop-up
```javascript
// Modificar textos del pop-up
document.getElementById('popupTitle').textContent = 'Tu mensaje personalizado';
document.getElementById('popupSubtitle').textContent = 'Subtítulo personalizado';
```

### Personalizar Scoring
```sql
-- Modificar pesos del scoring en la función calculate_lead_score()
-- Ejemplo: más peso a WhatsApp clicks
COUNT(CASE WHEN tipo_interaccion = 'whatsapp_click' THEN 1 END) * 15  -- era 8
```

## 🔧 API JavaScript

### Funciones Disponibles
```javascript
// Mostrar popup manualmente
window.showLeadPopupForProperty({
  id: 123,
  title: "Casa en Las Condes",
  price: 50000000,
  location: "Las Condes"
});

// Verificar si usuario tiene lead
const hasLead = window.userHasLead();

// Obtener info del usuario actual
const userInfo = window.getCurrentUserInfo();

// Debug del sistema
window.debugLeadSystem();

// Activar/desactivar sistema
window.toggleLeadSystem(false);
```

### Events Personalizados
```javascript
// Escuchar cuando se crea un lead
document.addEventListener('leadCreated', function(event) {
  console.log('Nuevo lead:', event.detail.leadData);
});

// Tracking manual de eventos
window.userTracker.track('custom_event', {
  action: 'clicked_special_button',
  value: 'premium_property'
});
```

## 📈 Métricas y KPIs

### KPIs Principales
- **Conversion Rate:** Visitantes → Leads
- **Lead Score Average:** Score promedio de leads
- **Hot Leads %:** Porcentaje de leads hot
- **Time to Lead:** Tiempo promedio hasta convertir

### Consultas para Métricas
```sql
-- Conversion Rate últimos 30 días
WITH stats AS (
  SELECT 
    COUNT(DISTINCT us.session_id) as total_sessions,
    COUNT(DISTINCT l.id) as total_leads
  FROM user_sessions us
  LEFT JOIN leads l ON us.lead_id = l.id
  WHERE us.created_at > NOW() - INTERVAL '30 days'
)
SELECT 
  total_sessions,
  total_leads,
  ROUND((total_leads::float / total_sessions * 100), 2) as conversion_rate
FROM stats;
```

## 🚨 Troubleshooting

### Error: "Supabase no está disponible"
```javascript
// Verificar que supabase.js esté cargado antes
<script src="supabase.js"></script>  <!-- ANTES -->
<script src="js/user-tracking.js"></script>
```

### Error: "toggleFavorite is not defined"
```javascript
// El sistema override automáticamente la función
// Verificar que lead-integration.js esté incluído
```

### Los favoritos no activan el pop-up
```javascript
// Verificar configuración
window.LEAD_SYSTEM_CONFIG.enabled = true;
window.LEAD_SYSTEM_CONFIG.showPopupOnFirstFavorite = true;
```

### Pop-up no se ve
```css
/* Verificar z-index */
.lead-popup-overlay {
  z-index: 10000; /* Debe ser mayor que otros elementos */
}
```

## 🔒 Seguridad y Privacidad

### Datos Almacenados
- **Información personal:** Solo la proporcionada voluntariamente
- **Datos de comportamiento:** Anónimos hasta que el usuario se registra
- **Geolocalización:** Solo si el usuario la permite

### Cumplimiento GDPR
- Los usuarios pueden solicitar eliminación de datos
- Cookies de tracking solo esenciales
- Consentimiento explícito para marketing

### Eliminación de Lead
```sql
-- Eliminar completamente un lead y sus datos
DELETE FROM leads WHERE id = 'uuid-del-lead';
-- Los triggers automáticamente eliminan datos relacionados
```

## 🌟 Próximas Mejoras

### Versión 2.0 (Planificado)
- [ ] Email marketing automatizado
- [ ] Segmentación avanzada de leads
- [ ] A/B testing de pop-ups
- [ ] Integración con CRM externo
- [ ] Dashboard visual con gráficos
- [ ] Alertas en tiempo real para leads hot

### Integraciones Futuras
- [ ] Google Analytics 4
- [ ] Facebook Pixel
- [ ] Mailchimp/SendGrid
- [ ] HubSpot CRM
- [ ] Zapier webhooks

## 💡 Casos de Uso Avanzados

### Email Marketing Basado en Score
```sql
-- Leads warm que no han sido contactados en 7 días
SELECT email, nombre, lead_score
FROM leads 
WHERE clasificacion = 'warm' 
AND (ultimo_contacto IS NULL OR ultimo_contacto < NOW() - INTERVAL '7 days')
AND email IS NOT NULL;
```

### Remarketing por Propiedades
```sql
-- Usuarios que vieron propiedades premium pero no se registraron
SELECT DISTINCT property_id, COUNT(*) as vistas_anonimas
FROM user_interactions ui
LEFT JOIN leads l ON ui.lead_id = l.id
WHERE ui.tipo_interaccion = 'page_view'
AND ui.pagina LIKE '%property-detail%'
AND l.id IS NULL  -- Sin lead asociado
GROUP BY property_id
ORDER BY vistas_anonimas DESC;
```

### Análisis de Abandono
```sql
-- Usuarios que empezaron el popup pero no lo completaron
SELECT COUNT(*) as popup_abandonados
FROM user_interactions
WHERE tipo_interaccion = 'lead_popup_shown'
AND session_id NOT IN (
  SELECT DISTINCT session_id 
  FROM user_interactions 
  WHERE tipo_interaccion = 'lead_form_completed'
);
```

## 📞 Soporte

Para soporte técnico o consultas sobre implementación:

1. **Revisar logs del navegador** (F12 → Console)
2. **Ejecutar `window.debugLeadSystem()`** para diagnóstico
3. **Verificar configuración de Supabase**
4. **Comprobar orden de scripts HTML**

---

## 🏆 Resumen de Beneficios

✅ **Captura profesional de leads**  
✅ **Análisis completo de comportamiento**  
✅ **Scoring automático inteligente**  
✅ **Integración perfecta con código existente**  
✅ **Dashboard completo para análisis**  
✅ **Sistema escalable y personalizable**

**Con este sistema, Casa Nuvera se convierte en una máquina de captura y conversión de leads profesional. ¡Cada visitante es una oportunidad de negocio!** 🚀