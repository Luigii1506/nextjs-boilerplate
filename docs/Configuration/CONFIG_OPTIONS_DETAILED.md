---
title: Opciones
slug: /Configuracion/opciones
---

# 🎯 **DOCUMENTACIÓN DETALLADA DE OPCIONES DE CONFIGURACIÓN**

## 📖 **ÍNDICE RÁPIDO**

- [⚡ Performance](#-performance-configuraciones-de-rendimiento)
- [📊 UI/UX](#-uiux-configuraciones-de-interfaz)
- [🔧 Settings](#-settings-configuraciones-generales)
- [🛡️ Security](#-security-configuraciones-de-seguridad)
- [📧 Validation](#-validation-reglas-de-validación)
- [🕐 Timing](#-timing-configuraciones-de-tiempo)
- [🗂️ Files](#-files-manejo-de-archivos)
- [📈 Monitoring](#-monitoring-monitoreo-y-analytics)

---

## ⚡ **PERFORMANCE - Configuraciones de Rendimiento**

### **🎯 `debounceMs`**

**¿Qué hace?**
Controla cuánto tiempo espera la aplicación antes de ejecutar una búsqueda después de que el usuario deja de escribir.

**Valores típicos:**

- `100ms` - Respuesta muy rápida (alta carga en servidor)
- `300ms` - Balance óptimo (recomendado)
- `500ms` - Respuesta más lenta (menos carga en servidor)
- `1000ms` - Para conexiones muy lentas

**Ejemplo práctico:**

```typescript
// Usuario escribe: "J" -> "Jo" -> "Joh" -> "John"
debounceMs: 300;
// ⏰ Búsqueda se ejecuta SOLO después de "John" cuando pasan 300ms sin nuevas teclas
```

**¿Cómo afecta a tu app?**

- **Valor BAJO** → 🚀 Búsquedas instantáneas, 💸 más requests al servidor
- **Valor ALTO** → 🐌 Búsquedas más lentas, 💰 menos carga en servidor
- **Sweet Spot** → 300ms para la mayoría de casos

---

### **🔄 `maxRetries`**

**¿Qué hace?**
Define cuántas veces la aplicación intentará una operación fallida antes de rendirse.

**Valores típicos:**

- `1` - Un solo intento extra (para operaciones críticas)
- `3` - Estándar recomendado
- `5` - Para conexiones inestables
- `0` - Sin reintentos (fallar rápido)

**Ejemplo práctico:**

```typescript
maxRetries: 3;

// Intento 1: ❌ Falla (timeout de red)
// Intento 2: ❌ Falla (servidor ocupado)
// Intento 3: ✅ Éxito (servidor responde)
// Total: 3 intentos, operación exitosa
```

**¿Cómo afecta a tu app?**

- **Valor BAJO** → ⚡ Falla rápido, menos resistente a problemas de red
- **Valor ALTO** → 🛡️ Más resistente, pero operaciones más lentas cuando hay problemas
- **Recomendación** → 3 para la mayoría de casos

---

### **🗄️ `cacheTimeout`**

**¿Qué hace?**
Controla cuánto tiempo los datos se mantienen en cache antes de considerarse obsoletos.

**Valores típicos:**

- `60000` (1 minuto) - Datos muy dinámicos
- `300000` (5 minutos) - Balance estándar
- `600000` (10 minutos) - Para datos estables
- `1800000` (30 minutos) - Para datos que cambian poco

**Ejemplo práctico:**

```typescript
cacheTimeout: 300000; // 5 minutos

// 10:00 AM: Usuario carga lista de usuarios (se guarda en cache)
// 10:03 AM: Usuario vuelve a la página → ⚡ Datos del cache (rápido)
// 10:06 AM: Usuario vuelve a la página → 🌐 Nueva request (cache expirado)
```

**¿Cómo afecta a tu app?**

- **Valor BAJO** → 📈 Datos siempre frescos, más requests al servidor
- **Valor ALTO** → ⚡ App más rápida, datos pueden estar desactualizados
- **Balance** → Depende de qué tan crítico es tener datos frescos

---

### **📤 `maxConcurrentUploads` (Solo file-upload)**

**¿Qué hace?**
Limita cuántos archivos se pueden subir al mismo tiempo.

**Valores típicos:**

- `1` - Un archivo a la vez (más estable)
- `3` - Balance recomendado
- `5` - Para conexiones rápidas
- `10` - Solo para servidores potentes

**Ejemplo práctico:**

```typescript
maxConcurrentUploads: 3;

// Usuario selecciona 10 archivos
// ⚡ Suben 3 archivos simultáneamente
// ⏳ Los otros 7 esperan en cola
// ✅ Cuando uno termina, inicia el siguiente
```

**¿Cómo afecta a tu app?**

- **Valor BAJO** → 🐌 Uploads más lentos, menos problemas de memoria/red
- **Valor ALTO** → 🚀 Uploads más rápidos, puede saturar conexión/servidor
- **Consideraciones** → Memoria disponible, velocidad de conexión

---

## 📊 **UI/UX - Configuraciones de Interfaz**

### **📄 `itemsPerPage`**

**¿Qué hace?**
Define cuántos elementos mostrar en cada página de una lista paginada.

**Valores típicos:**

- `10` - Para listas complejas con mucha información
- `20` - Balance estándar recomendado
- `50` - Para listas simples
- `100` - Solo para pantallas grandes y buena conexión

**Ejemplo práctico:**

```typescript
itemsPerPage: 20;

// Lista de 1000 usuarios
// Página 1: Usuarios 1-20
// Página 2: Usuarios 21-40
// Total páginas: 50
```

**¿Cómo afecta a tu app?**

- **Valor BAJO** → 📱 Mejor para móviles, carga más rápida, más navegación
- **Valor ALTO** → 🖥️ Mejor para desktop, menos navegación, carga inicial más lenta
- **Consideraciones** → Tamaño de pantalla, velocidad de conexión

---

### **📦 `maxUsersPerBatch` / `maxFilesPerBatch`**

**¿Qué hace?**
Limita cuántos elementos se pueden procesar en operaciones masivas.

**Valores típicos:**

- `10` - Operaciones conservadoras
- `50` - Balance recomendado
- `100` - Para servidores potentes
- `500` - Solo para operaciones específicas

**Ejemplo práctico:**

```typescript
maxUsersPerBatch: 50;

// Usuario selecciona 200 usuarios para eliminar
// ⚡ Se procesan en lotes de 50
// Lote 1: Usuarios 1-50 ✅
// Lote 2: Usuarios 51-100 ✅
// Lote 3: Usuarios 101-150 ✅
// Lote 4: Usuarios 151-200 ✅
```

**¿Cómo afecta a tu app?**

- **Valor BAJO** → 🛡️ Operaciones más seguras, menos riesgo de timeout
- **Valor ALTO** → ⚡ Operaciones más rápidas, más riesgo de problemas
- **Consideraciones** → Capacidad del servidor, tamaño de cada elemento

---

### **📏 `maxFileSize`**

**¿Qué hace?**
Establece el tamaño máximo permitido para archivos individuales.

**Valores típicos:**

- `1MB` (1048576) - Para avatares/iconos
- `10MB` (10485760) - Para documentos
- `50MB` (52428800) - Para archivos multimedia
- `100MB` (104857600) - Para videos cortos

**Ejemplo práctico:**

```typescript
maxFileSize: 52428800; // 50MB

// Usuario intenta subir:
// ✅ documento.pdf (5MB) → Permitido
// ✅ video.mp4 (45MB) → Permitido
// ❌ pelicula.mkv (2GB) → Rechazado
```

**¿Cómo afecta a tu app?**

- **Valor BAJO** → 💾 Menos uso de almacenamiento, uploads más rápidos
- **Valor ALTO** → 🎬 Permite contenido más rico, más uso de recursos
- **Consideraciones** → Espacio disponible, velocidad de conexión, tipo de contenido

---

### **⚡ `progressUpdateInterval`**

**¿Qué hace?**
Controla con qué frecuencia se actualiza la barra de progreso durante operaciones largas.

**Valores típicos:**

- `50ms` - Actualización muy fluida
- `100ms` - Balance recomendado
- `250ms` - Actualización más espaciada
- `500ms` - Para dispositivos lentos

**Ejemplo práctico:**

```typescript
progressUpdateInterval: 100; // 100ms

// Upload de 100MB:
// 0.0s: 0% ██░░░░░░░░ (actualización)
// 0.1s: 3% ███░░░░░░░ (actualización)
// 0.2s: 6% ████░░░░░░ (actualización)
// ... cada 100ms
```

**¿Cómo afecta a tu app?**

- **Valor BAJO** → 🔄 Progreso muy fluido, más uso de CPU
- **Valor ALTO** → 🔋 Menos uso de recursos, progreso menos fluido
- **Balance** → 100ms es imperceptible para el usuario pero eficiente

---

## 🔧 **SETTINGS - Configuraciones Generales**

### **⚡ `optimisticUpdates`**

**¿Qué hace?**
Determina si la interfaz se actualiza inmediatamente antes de confirmar con el servidor.

**Valores:**

- `true` - UI se actualiza inmediatamente (recomendado)
- `false` - UI espera confirmación del servidor

**Ejemplo práctico:**

```typescript
optimisticUpdates: true;

// Usuario hace clic en "Banear usuario"
// ⚡ INMEDIATO: UI muestra usuario como "Baneado"
// 🌐 BACKGROUND: Se envía request al servidor
// ✅ CONFIRMACIÓN: Servidor confirma el cambio
// (Si hay error, se revierte la UI)
```

**¿Cómo afecta a tu app?**

- **TRUE** → 🚀 UI súper responsiva, mejor UX, puede mostrar estados incorrectos temporalmente
- **FALSE** → 🐌 UI más lenta pero siempre correcta
- **Recomendación** → TRUE para mejor experiencia de usuario

---

### **🔄 `autoRefresh`**

**¿Qué hace?**
Controla si los datos se refrescan automáticamente en segundo plano.

**Valores:**

- `true` - Refresco automático activado
- `false` - Solo refresco manual

**Ejemplo práctico:**

```typescript
autoRefresh: true;

// Usuario está en la lista de usuarios
// ⏰ Cada 30 segundos: Se actualizan los datos automáticamente
// 👀 Usuario ve cambios sin hacer nada
// 🔋 Consume más batería/datos
```

**¿Cómo afecta a tu app?**

- **TRUE** → 📈 Datos siempre frescos, más consumo de recursos
- **FALSE** → 🔋 Menos consumo, datos pueden estar desactualizados
- **Consideraciones** → Tipo de datos, frecuencia de cambios

---

### **📝 `advancedLogging`**

**¿Qué hace?**
Habilita/deshabilita logging detallado para debugging.

**Valores:**

- `true` - Logging completo (desarrollo)
- `false` - Logging mínimo (producción)

**Ejemplo práctico:**

```typescript
advancedLogging: true;

// Console output:
// 🔍 [Users] Hook initialized { userId: '123', config: {...} }
// ⏱️ [Users] Performance: Query took 150ms
// 📊 [Users] State update: { users: 25, loading: false }
// 🎯 [Users] Action: CREATE_USER success
```

**¿Cómo afecta a tu app?**

- **TRUE** → 🔍 Debugging más fácil, más información en consola, más lento
- **FALSE** → ⚡ Performance mejor, menos información de debugging
- **Recomendación** → TRUE en desarrollo, FALSE en producción

---

### **📊 `performanceTracking`**

**¿Qué hace?**
Activa el seguimiento de métricas de performance de la aplicación.

**Valores:**

- `true` - Tracking activado
- `false` - Sin tracking

**Ejemplo práctico:**

```typescript
performanceTracking: true;

// Se registran métricas como:
// - Tiempo de respuesta de queries
// - Tiempo de renderizado de componentes
// - Memoria utilizada
// - Errores y warnings
```

**¿Cómo afecta a tu app?**

- **TRUE** → 📈 Datos para optimización, ligero overhead
- **FALSE** → ⚡ Sin overhead, sin datos de performance
- **Uso típico** → TRUE en desarrollo y staging

---

## 🛡️ **SECURITY - Configuraciones de Seguridad**

### **🔐 `maxLoginAttempts`**

**¿Qué hace?**
Define cuántos intentos de login fallidos se permiten antes de bloquear la cuenta.

**Valores típicos:**

- `3` - Muy restrictivo (alta seguridad)
- `5` - Balance recomendado
- `10` - Más permisivo
- `0` - Sin límite (no recomendado)

**Ejemplo práctico:**

```typescript
maxLoginAttempts: 5;

// Usuario intenta login:
// Intento 1: ❌ Contraseña incorrecta (4 intentos restantes)
// Intento 2: ❌ Contraseña incorrecta (3 intentos restantes)
// ...
// Intento 5: ❌ Contraseña incorrecta (0 intentos restantes)
// 🚫 CUENTA BLOQUEADA
```

**¿Cómo afecta a tu app?**

- **Valor BAJO** → 🔒 Más seguro contra ataques de fuerza bruta, más frustrante para usuarios legítimos
- **Valor ALTO** → 😊 Más tolerante con usuarios, más vulnerable a ataques
- **Consideraciones** → Balance entre seguridad y usabilidad

---

### **⏰ `sessionTimeout`**

**¿Qué hace?**
Controla cuánto tiempo puede estar inactiva una sesión antes de expirar automáticamente.

**Valores típicos:**

- `900000` (15 min) - Alta seguridad
- `3600000` (1 hora) - Balance estándar
- `7200000` (2 horas) - Más conveniente
- `43200000` (12 horas) - Para apps internas

**Ejemplo práctico:**

```typescript
sessionTimeout: 3600000; // 1 hora

// Usuario hace login a las 10:00 AM
// Usuario activo hasta 10:30 AM, luego inactivo
// 11:30 AM: Sesión expira automáticamente
// Usuario debe hacer login nuevamente
```

**¿Cómo afecta a tu app?**

- **Valor BAJO** → 🔒 Más seguro, pero usuarios deben re-autenticarse frecuentemente
- **Valor ALTO** → 😊 Más conveniente, pero ventana más larga para ataques
- **Consideraciones** → Sensibilidad de los datos, tipo de usuarios

---

### **🔐 `banDurationHours`**

**¿Qué hace?**
Define cuántas horas dura un ban temporal de usuario.

**Valores típicos:**

- `1` - Ban muy corto (warning)
- `24` - Un día (estándar)
- `168` - Una semana (severo)
- `720` - Un mes (muy severo)

**Ejemplo práctico:**

```typescript
banDurationHours: 24;

// Admin banea usuario a las 14:00 del Lunes
// Usuario no puede acceder hasta las 14:00 del Martes
// Después del Martes 14:00: Ban se levanta automáticamente
```

**¿Cómo afecta a tu app?**

- **Valor BAJO** → ⚡ Bans más como advertencias
- **Valor ALTO** → 🔨 Bans más punitivos
- **Consideraciones** → Gravedad de infracciones, política de moderación

---

## 📧 **VALIDATION - Reglas de Validación**

### **📧 Email Validation**

```typescript
email: {
  minLength: 5,          // "a@b.c" es el mínimo posible
  maxLength: 254,        // Estándar RFC 5322
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Regex básico de email
}
```

**¿Cómo afecta a tu app?**

- **minLength BAJO** → Acepta más emails, pero algunos pueden ser inválidos
- **maxLength ALTO** → Acepta emails más largos, pero consume más almacenamiento
- **pattern ESTRICTO** → Rechaza emails malformados, pero puede rechazar algunos válidos

---

### **👤 Name Validation**

```typescript
name: {
  minLength: 2,    // "Jo" como mínimo
  maxLength: 100   // Nombres largos internacionales
}
```

**Ejemplo práctico:**

```typescript
// ✅ Válidos: "Ana", "María José", "Jean-Baptiste"
// ❌ Inválidos: "X" (muy corto), "[100+ caracteres]" (muy largo)
```

---

### **🔑 Password Validation**

```typescript
password: {
  minLength: 8,    // Mínimo seguro
  maxLength: 128   // Evita ataques de memoria
}
```

**¿Cómo afecta a tu app?**

- **minLength ALTO** → Más seguro, pero usuarios pueden olvidar contraseñas complejas
- **maxLength BAJO** → Menos memoria, pero limita contraseñas seguras

---

## 🕐 **TIMING - Configuraciones de Tiempo**

### **⏰ `refreshDelayMs`**

**¿Qué hace?**
Tiempo de espera antes de refrescar datos después de una operación exitosa.

**Valores típicos:**

- `0ms` - Inmediato
- `500ms` - Dar tiempo para animaciones
- `1000ms` - Balance estándar
- `2000ms` - Para operaciones complejas

**¿Cómo afecta a tu app?**

- **Valor BAJO** → 🚀 Datos frescos inmediatos, puede interrumpir animaciones
- **Valor ALTO** → 🎬 Permite animaciones completas, datos menos frescos

---

### **🔄 `retryDelayMs`**

**¿Qué hace?**
Tiempo de espera entre reintentos de operaciones fallidas.

**Valores típicos:**

- `500ms` - Reintentos rápidos
- `1000ms` - Balance estándar
- `2000ms` - Para problemas de servidor
- `5000ms` - Para problemas de red

**Ejemplo práctico:**

```typescript
retryDelayMs: 1000;

// Intento 1: ❌ Falla inmediatamente
// ⏳ Espera 1 segundo
// Intento 2: ❌ Falla
// ⏳ Espera 1 segundo
// Intento 3: ✅ Éxito
```

---

## 🗂️ **FILES - Manejo de Archivos**

### **📄 `allowedMimeTypes`**

**¿Qué hace?**
Lista de tipos de archivo permitidos para upload.

**Ejemplos:**

```typescript
allowedMimeTypes: [
  "image/jpeg",
  "image/png", // Imágenes
  "application/pdf", // PDFs
  "text/plain", // Archivos de texto
  "application/zip", // Archivos comprimidos
];
```

**¿Cómo afecta a tu app?**

- **Lista CORTA** → 🛡️ Más seguro, menos tipos de archivo
- **Lista LARGA** → 🔓 Más flexible, más riesgos de seguridad

---

### **🚫 `forbiddenExtensions`**

**¿Qué hace?**
Lista de extensiones de archivo explícitamente prohibidas.

**Ejemplo típico:**

```typescript
forbiddenExtensions: [
  ".exe",
  ".bat",
  ".cmd", // Ejecutables Windows
  ".sh",
  ".app", // Ejecutables Unix/Mac
  ".scr",
  ".com", // Otros ejecutables peligrosos
];
```

---

### **🦠 `virusScanEnabled`**

**¿Qué hace?**
Activa/desactiva el escaneo de virus en archivos subidos.

**Valores:**

- `true` - Todos los archivos se escanean (más lento pero seguro)
- `false` - Sin escaneo (más rápido pero riesgoso)

---

## 📈 **MONITORING - Monitoreo y Analytics**

### **📊 `trackUploadMetrics`**

**¿Qué hace?**
Registra métricas detalladas sobre uploads (velocidad, tamaño, éxito/fallo).

**Datos que recolecta:**

- Tiempo de upload
- Tamaño de archivo
- Tipo de archivo
- Éxito/fallo
- Velocidad promedio

---

### **👤 `trackUserBehavior`**

**¿Qué hace?**
Rastrea comportamiento del usuario para analytics (qué archivos suben, cuándo, etc.).

**⚠️ Consideraciones de privacidad:**

- Cumplimiento con GDPR
- Consentimiento del usuario
- Anonimización de datos

---

### **🚨 `errorReportingEnabled`**

**¿Qué hace?**
Envía automáticamente reportes de errores a servicios como Sentry.

**¿Cómo afecta a tu app?**

- **TRUE** → 🔍 Mejor debugging, detectas errores que usuarios no reportan
- **FALSE** → 🤐 Sin telemetría, debes confiar en reportes manuales de usuarios

---

## 🎯 **CONFIGURACIONES POR AMBIENTE**

### **🔧 Desarrollo**

```typescript
// Configuración optimizada para desarrollo
{
  performance: { debounceMs: 100, cacheTimeout: 60000 },
  settings: { advancedLogging: true, performanceTracking: true },
  ui: { itemsPerPage: 10 }, // Pocos items para testing
  monitoring: { trackUserBehavior: false } // Sin tracking en dev
}
```

### **🚀 Producción**

```typescript
// Configuración optimizada para producción
{
  performance: { debounceMs: 300, cacheTimeout: 900000 },
  settings: { advancedLogging: false, performanceTracking: false },
  ui: { itemsPerPage: 20 },
  monitoring: { errorReportingEnabled: true }
}
```

### **⚡ Alta Performance**

```typescript
// Configuración para máxima velocidad
{
  performance: {
    debounceMs: 150,
    cacheTimeout: 1800000,
    maxConcurrentUploads: 10
  },
  ui: {
    itemsPerPage: 50,
    progressUpdateInterval: 200
  }
}
```

---

## 🔧 **HERRAMIENTAS DE CONFIGURACIÓN**

### **Quick Accessors**

```typescript
// En lugar de hacer esto:
const config = usersConfig.getConfig();
const itemsPerPage = config.ui.itemsPerPage;

// Puedes hacer esto:
const itemsPerPage = configUtils.getItemsPerPage();
```

### **Environment Helpers**

```typescript
// Cambiar toda la configuración a modo desarrollo
configUtils.enableDevMode();

// Cambiar a modo producción
configUtils.enableProductionMode();

// Cambiar a modo alta performance
configUtils.enableHighPerformanceMode();
```

---

## 💡 **CASOS DE USO COMUNES**

### **🎯 Configuración por Tipo de Usuario**

```typescript
// Para usuarios normales
const regularConfig = {
  ui: { itemsPerPage: 20 },
  performance: { debounceMs: 300 },
};

// Para administradores
const adminConfig = {
  ui: { itemsPerPage: 100 }, // Ven más elementos
  performance: { debounceMs: 150 }, // Búsquedas más rápidas
  settings: { advancedLogging: true }, // Más información
};
```

### **📱 Configuración por Dispositivo**

```typescript
// Para móviles
const mobileConfig = {
  ui: {
    itemsPerPage: 10, // Menos elementos
    progressUpdateInterval: 200, // Menos actualizaciones
  },
  performance: { cacheTimeout: 300000 }, // Cache más corto
};

// Para desktop
const desktopConfig = {
  ui: { itemsPerPage: 50 },
  performance: {
    maxConcurrentUploads: 5,
    cacheTimeout: 900000,
  },
};
```

### **🌐 Configuración por Región**

```typescript
// Para regiones con conexión lenta
const slowRegionConfig = {
  performance: {
    debounceMs: 500,
    maxRetries: 5,
    cacheTimeout: 1800000,
  },
  ui: { itemsPerPage: 10 },
};

// Para regiones con conexión rápida
const fastRegionConfig = {
  performance: {
    debounceMs: 100,
    maxConcurrentUploads: 10,
  },
  ui: { itemsPerPage: 50 },
};
```

---

¿Te gustaría que profundice en alguna configuración específica o que añada más ejemplos prácticos para algún caso de uso particular?
