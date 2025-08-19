---
title: Introducción
slug: /feature-flags/introduccion
---

# 🎛️ FEATURE FLAGS - DOCUMENTACIÓN COMPLETA

> **Sistema Enterprise de Feature Flags para Next.js 15 + React 19**

## 📚 Documentación Completa

### 🚀 Para Empezar Rápido

- **[⚡ Quick Reference](./FEATURE_FLAGS_QUICK_REFERENCE.md)** - Comandos y patrones esenciales
- **[🌙 Tutorial Dark Mode](./FEATURE_FLAGS_DARK_MODE_TUTORIAL.md)** - Implementación paso a paso

### 📖 Documentación Detallada

- **[🎛️ Guía Completa](./FEATURE_FLAGS_COMPLETE_GUIDE.md)** - Arquitectura y conceptos
- **[🎯 Ejemplos Prácticos](./FEATURE_FLAGS_EXAMPLES.md)** - Casos de uso reales

---

## 🎯 ¿Qué son los Feature Flags?

Los **Feature Flags** son interruptores que permiten activar/desactivar funcionalidades sin desplegar código nuevo.

### ✨ Beneficios Principales

- 🚀 **Deploys seguros** - Rollback instantáneo
- 🧪 **A/B Testing** - Probar variantes
- 🎯 **Rollouts graduales** - 10% → 50% → 100%
- 🛡️ **Kill switch** - Desactivar rápidamente
- 🌍 **Por región/usuario** - Targeting específico

---

## ⚡ Inicio Rápido

### 1. 📝 Crear Feature Flag

```bash
npm run create-flag darkMode "Dark Mode" ui
```

### 2. 🔧 Activar en Environment

```bash
# .env.local
FEATURE_DARK_MODE=true
```

### 3. 🎨 Usar en Componente

```typescript
import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

function MyComponent() {
  const enabled = useIsEnabled("darkMode");
  return enabled ? <DarkUI /> : <LightUI />;
}
```

### 4. 🎛️ Gestionar desde Admin

Ve a `/admin/feature-flags` para activar/desactivar y ajustar rollout.

---

## 🏗️ Arquitectura del Sistema

```
🎛️ FEATURE FLAGS LAYERS
├── 📄 Static Config (feature-flags.ts)          → Base configuration
├── 🏢 Server Evaluation (server-feature-flags.ts) → Enterprise logic
├── 🧩 Module Integration (modules.ts)           → Module connection
├── 🪝 Client Hooks (useFeatureFlagsServerActions) → React integration
└── ⚙️ Admin Interface (feature-flags/)          → Management UI
```

### 🔄 Flujo de Evaluación

1. **🛡️ Middleware** - Evalúa flags en el edge
2. **📄 Server Components** - Acceso ultra-rápido vía headers
3. **👤 Client Components** - Hooks con sync en tiempo real
4. **🗄️ Database** - Configuración persistente y A/B testing

---

## 📊 Categorías de Flags

| Categoría      | Uso                  | Ejemplo                | Activación           |
| -------------- | -------------------- | ---------------------- | -------------------- |
| `core`         | Funcionalidades base | `authentication: true` | Siempre activo       |
| `module`       | Módulos opcionales   | `fileUpload`           | Por configuración    |
| `ui`           | Características UI   | `darkMode`             | Environment variable |
| `experimental` | Features en prueba   | `betaFeatures`         | Environment variable |
| `admin`        | Solo administradores | `advancedUserMgmt`     | Por rol              |

---

## 🪝 Hooks Principales

### `useIsEnabled` - Verificación Simple

```typescript
const isEnabled = useIsEnabled();
const darkMode = isEnabled("darkMode");
```

### `useFeatureFlagsServer` - Hook Completo

```typescript
const {
  isEnabled, // Verificar flags
  toggleFlag, // Cambiar flags (admin)
  isPending, // Estado de carga
  flags, // Array completo
} = useFeatureFlagsServer();
```

---

## 🎨 Patrones de Implementación

### 🎛️ Component Guard

```typescript
function FeatureComponent() {
  const enabled = useIsEnabled("myFeature");

  if (!enabled) {
    return <ComingSoonMessage />;
  }

  return <NewFeature />;
}
```

### 🛡️ Server Component

```typescript
import { isFeatureEnabled } from "@/core/config/server-feature-flags";

async function ServerComponent() {
  const enabled = await isFeatureEnabled("myFeature");
  return enabled ? <ServerFeature /> : <LegacyFeature />;
}
```

### 🔒 API Protection

```typescript
export async function POST(request: Request) {
  const enabled = await isFeatureEnabled("myFeature");

  if (!enabled) {
    return NextResponse.json(
      { error: "Feature not available" },
      { status: 403 }
    );
  }

  // ... feature logic
}
```

### 📱 Navigation Item

```typescript
{
  id: "feature-item",
  label: "New Feature",
  href: "/feature",
  icon: Sparkles,
  requiredFeatureFlag: "myFeature", // Auto-hide if disabled
}
```

---

## 🧪 Casos de Uso Avanzados

### 🎲 A/B Testing

```typescript
const variant = await getExperimentVariant("homepage-test", userId, [
  "control",
  "variant-a",
]);
return variant === "variant-a" ? <NewDesign /> : <CurrentDesign />;
```

### 📊 Rollout Gradual

```sql
-- Incrementar gradualmente
UPDATE feature_flags SET rollout_percentage = 25 WHERE key = 'newFeature';
UPDATE feature_flags SET rollout_percentage = 50 WHERE key = 'newFeature';
UPDATE feature_flags SET rollout_percentage = 100 WHERE key = 'newFeature';
```

### 🌍 Targeting por País

```typescript
// En middleware - geolocation automática
const flagContext = {
  userId: session.userId,
  country: request.geo?.country || "unknown",
};
```

---

## 🛠️ Scripts Disponibles

```bash
# Crear nuevo flag
npm run create-flag <key> <name> <category> [options]

# Listar todos los flags
npm run flags:list

# Sincronizar flags
npm run flags:sync
```

### Ejemplos de Creación

```bash
# UI Feature
npm run create-flag darkMode "Dark Mode" ui

# Experimental con rollout
npm run create-flag newDashboard "New Dashboard" experimental --rollout=25

# Módulo con dependencias
npm run create-flag applePaySupport "Apple Pay" module --deps=payments --audience=US,CA
```

---

## 🔧 Environment Variables

```bash
# .env.local

# UI Features
FEATURE_DARK_MODE=true
FEATURE_ANIMATIONS=true

# Experimental
ENABLE_BETA_FEATURES=false
FEATURE_NEW_DASHBOARD=false

# Modules
MODULE_FILE_UPLOAD=true
MODULE_STRIPE=false
MODULE_ANALYTICS=true
```

---

## 📈 Gestión desde Admin

1. **Ve a** `/admin/feature-flags`
2. **Busca** tu flag en la lista
3. **Ajusta** el porcentaje de rollout
4. **Toggle** on/off según necesites
5. **Monitorea** métricas y adoption

---

## 🎯 Mejores Prácticas

### ✅ Do's

```typescript
// ✅ Nombres descriptivos
const isNewCheckoutEnabled = useIsEnabled("checkoutFlowV2");

// ✅ Fallbacks seguros
return enabled ? <NewFeature /> : <LegacyFeature />;

// ✅ Memoize checks
const features = useMemo(
  () => ({
    darkMode: isEnabled("darkMode"),
    premium: isEnabled("premiumFeature"),
  }),
  [isEnabled]
);
```

### ❌ Don'ts

```typescript
// ❌ Hardcodear condiciones
if (userRole === "admin" && env === "prod") {
  /* Malo */
}

// ❌ Dependencias complejas
const show = isEnabled("a") && isEnabled("b") && userRole === "admin";

// ❌ Sin fallbacks
return isEnabled("feature") ? <Feature /> : null; // ¿Qué si falla?
```

---

## 🔍 Debug y Troubleshooting

### 🧪 Debug en Desarrollo

```typescript
import { FeatureFlagsDebug } from "@/core/config/server-feature-flags";

const debugInfo = await FeatureFlagsDebug.getAllWithMetadata();
console.log("Flags:", debugInfo);
```

### 🔄 Invalidar Cache

```typescript
import { invalidateFeatureFlagsCache } from "@/core/config/server-feature-flags";
await invalidateFeatureFlagsCache();
```

### 🌐 Test en Browser

```javascript
// En browser console
localStorage.setItem(
  "debug-feature-flags",
  JSON.stringify({
    myFeature: true,
  })
);
location.reload();
```

---

## 📚 Archivos Clave

| Archivo                                             | Propósito                 | Editar |
| --------------------------------------------------- | ------------------------- | ------ |
| `src/core/config/feature-flags.ts`                  | 🎛️ Configuración estática | ✅ Sí  |
| `src/core/config/server-feature-flags.ts`           | 🏢 Evaluación server-side | ❌ No  |
| `src/shared/hooks/useFeatureFlagsServerActions.tsx` | 🪝 React hooks            | ❌ No  |
| `src/features/admin/feature-flags/`                 | ⚙️ Admin interface        | ❌ No  |
| `middleware.ts`                                     | 🛡️ Edge evaluation        | ❌ No  |

---

## 🎯 Checklist para Nuevo Flag

- [ ] 📝 Crear con: `npm run create-flag`
- [ ] 🔧 Agregar ENV variable
- [ ] 🎨 Implementar component con guard
- [ ] 🛡️ Agregar protección server-side
- [ ] 📊 Configurar analytics/tracking
- [ ] 🧪 Probar con rollout bajo (5-10%)
- [ ] 📈 Monitorear métricas
- [ ] 🚀 Incrementar rollout gradualmente
- [ ] ✅ Full rollout cuando sea estable
- [ ] 🧹 Cleanup código legacy

---

## 🚀 Siguientes Pasos

1. **📖 Lee la [Guía Completa](./FEATURE_FLAGS_COMPLETE_GUIDE.md)** para entender la arquitectura
2. **🌙 Sigue el [Tutorial Dark Mode](./FEATURE_FLAGS_DARK_MODE_TUTORIAL.md)** como primer ejemplo
3. **🎯 Revisa [Ejemplos Prácticos](./FEATURE_FLAGS_EXAMPLES.md)** para más casos de uso
4. **⚡ Usa [Quick Reference](./FEATURE_FLAGS_QUICK_REFERENCE.md)** como consulta rápida

¡El sistema está listo para escalar con tu aplicación! 🎉
