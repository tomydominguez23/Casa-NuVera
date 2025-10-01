# 🧪 Probar Workflow AHORA (Antes del Deploy Final)

## 🎯 Objetivo
Probar el workflow de deploy ANTES de hacer el deploy final a https://casanuvera.cl

## 📋 Pasos para Probar el Workflow

### Paso 1: Configurar Secrets en GitHub (AHORA)
1. Ve a: `https://github.com/tomydominguez23/Casa-NuVera`
2. Haz clic en **"Settings"**
3. Ve a **"Secrets and variables"** → **"Actions"**
4. Haz clic en **"New repository secret"** y agrega:

```
BLUEHOST_FTP_SERVER: ftp.casanuvera.cl
BLUEHOST_FTP_USERNAME: Admin@casanuvera.cl
BLUEHOST_FTP_PASSWORD: CY*mAazxnkMB
```

### Paso 2: Probar Workflow Manualmente
1. Ve a **"Actions"** en tu repositorio GitHub
2. Selecciona **"Deploy Casa Nuvera to Bluehost via FTP"**
3. Haz clic en **"Run workflow"**
4. Selecciona la rama: `cursor/deploy-website-to-casanuvera-cl-on-bluehost-56a1`
5. Haz clic en **"Run workflow"**

### Paso 3: Verificar Logs
1. Haz clic en el workflow que se ejecutó
2. Revisa los logs para verificar:
   - ✅ Conexión FTP exitosa
   - ✅ Archivos subidos correctamente
   - ✅ Sin errores de permisos
   - ✅ Deploy completado

### Paso 4: Verificar Deploy
1. Accede a tu panel de Bluehost
2. Ve a **"Administrador de Archivos"**
3. Navega a `/public_html/casanuvera.cl/`
4. Verifica que los archivos se hayan subido:
   - `index.html`
   - Archivos CSS y JS
   - Carpetas `css/` y `js/`

## 🔍 Qué Buscar en los Logs

### ✅ Logs Exitosos:
```
✅ Deploy completado!
🌐 Sitio disponible en: https://casanuvera.cl
📅 Fecha: [fecha]
🔄 Commit: [hash]
```

### ❌ Logs con Errores:
```
❌ Error: Authentication failed
❌ Error: Permission denied
⚠️ Warning: Some files not uploaded
```

## 🚨 Solución de Problemas

### Error de Autenticación:
```
❌ Error: Authentication failed
```
**Solución**: Verificar que las credenciales FTP sean correctas

### Error de Permisos:
```
❌ Error: Permission denied
```
**Solución**: Verificar que el usuario tenga permisos en la carpeta

### Archivos No Se Suben:
```
⚠️ Warning: Some files not uploaded
```
**Solución**: Revisar los logs para identificar archivos específicos

## 📋 Checklist de Prueba

- [ ] Secrets configurados en GitHub
- [ ] Workflow ejecutado manualmente
- [ ] Logs revisados sin errores
- [ ] Archivos verificados en Bluehost
- [ ] Deploy de prueba exitoso

## 🎯 Próximo Paso

Una vez que el workflow de prueba funcione correctamente:

```bash
# Hacer merge a main para deploy final
git checkout main
git merge cursor/deploy-website-to-casanuvera-cl-on-bluehost-56a1
git push origin main
```

## ⚠️ Importante

- **NO hagas merge a main** hasta que el workflow de prueba funcione
- **Verifica todos los logs** antes del deploy final
- **Confirma que los archivos se suban** correctamente
- **Prueba el workflow** varias veces si es necesario

---

**¡Prueba el workflow AHORA antes del deploy final! 🧪**