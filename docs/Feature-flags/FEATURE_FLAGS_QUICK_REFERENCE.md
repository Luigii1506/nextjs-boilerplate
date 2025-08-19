---
title: Referencía
slug: /feature-flags/referencia
---

# ⚡ FEATURE FLAGS - QUICK REFERENCE

> **Guía rápida para usar Feature Flags en tu día a día**

## 🚀 Comandos Rápidos

### ➕ Crear Nuevo Feature Flag

```bash
# Básico
npm run create-flag darkMode "Dark Mode" ui

# Con opciones avanzadas
npm run create-flag newDashboard "New Dashboard" experimental --rollout=25 --desc="Dashboard mejorado con nuevas métricas"

# Módulo con dependencias
npm run create-flag applePaySupport "Apple Pay" module --deps=payments --audience=US,CA
```

### 🎛️ Gestión desde Admin

1. Ve a `/admin/feature-flags`
2. Busca tu flag
3. Ajusta rollout %
4. Toggle on/off

---

## 🪝 Hooks Principales

### `useIsEnabled` - Verificar Flag

```typescript
import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

function MyComponent() {
  const isEnabled = useIsEnabled();
  const darkMode = isEnabled("darkMode");

  return darkMode ? <DarkUI /> : <LightUI />;
}
```

### `useFeatureFlagsServer` - Hook Completo

```typescript
const {
  isEnabled, // Función para verificar flags
  toggleFlag, // Función para cambiar flags
  isPending, // Estado de carga
  flags, // Array completo de flags
} = useFeatureFlagsServer();
```

---

## 🏗️ Patrones de Implementación

### 🎨 UI Component

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

### 🔒 API Route Protection

```typescript
// app/api/my-feature/route.ts
import { isFeatureEnabled } from "@/core/config/server-feature-flags";

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
// core/navigation/constants.ts
{
  id: "feature-item",
  label: "New Feature",
  href: "/feature",
  icon: Sparkles,
  requiredFeatureFlag: "myFeature", // 🎯 Auto-hide if disabled
}
```

---

## 🎯 Casos de Uso Comunes

### 🌙 Dark Mode

```typescript
// 1. Setup
npm run create-flag darkMode "Dark Mode" ui

// 2. Use
const { isDarkMode, toggleTheme } = useTheme();
```

### 🔔 Feature Beta

```typescript
// 1. Setup con rollout gradual
npm run create-flag betaFeature "Beta Feature" experimental --rollout=10

// 2. Use con tracking
const enabled = useFeatureFlagTracking("betaFeature", userId);
```

### 💳 Payment Method

```typescript
// 1. Setup por región
npm run create-flag applePaySupport "Apple Pay" module --audience=US,CA

// 2. Use en component
function PaymentMethods() {
  const applePayEnabled = useIsEnabled("applePaySupport");

  return (
    <div>
      <CreditCardOption />
      {applePayEnabled && <ApplePayOption />}
    </div>
  );
}
```

### 🧪 A/B Testing

```typescript
// Server Component
async function ExperimentalComponent({ userId }: { userId: string }) {
  const variant = await getExperimentVariant("homepage-test", userId, [
    "control",
    "variant-a",
  ]);

  return variant === "variant-a" ? <NewDesign /> : <CurrentDesign />;
}
```

---

## 📊 Categorías de Flags

| Categoría      | Propósito             | Ejemplo                                              | Valor        |
| -------------- | --------------------- | ---------------------------------------------------- | ------------ |
| `core`         | Funcionalidades base  | `authentication: true`                               | `true/false` |
| `module`       | Módulos opcionales    | `fileUpload: MODULE_CONFIG.fileUpload.enabled`       | Config-based |
| `ui`           | Características de UI | `darkMode: process.env.FEATURE_DARK_MODE === "true"` | ENV-based    |
| `experimental` | Features en prueba    | `betaFeatures: process.env.ENABLE_BETA === "true"`   | ENV-based    |
| `admin`        | Solo administradores  | `advancedUserMgmt: true`                             | `true/false` |

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

## 🛡️ Guards y Protección

### Client-Side Guard

```typescript
function ProtectedFeature() {
  const enabled = useIsEnabled("premiumFeature");

  if (!enabled) {
    return <UpgradePrompt />;
  }

  return <PremiumFeature />;
}
```

### Server-Side Guard

```typescript
// middleware.ts (ya implementado)
if (pathname.startsWith("/premium")) {
  const enabled = await isFeatureEnabled("premiumFeature", { userId });
  if (!enabled) {
    return NextResponse.redirect("/upgrade");
  }
}
```

### Layout Guard

```typescript
// layout.tsx
export default async function PremiumLayout({ children }) {
  const enabled = await isFeatureEnabled("premiumFeature");

  if (!enabled) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
}
```

---

## 📈 Performance Tips

### ✅ Do's

```typescript
// ✅ Memoize checks
const features = useMemo(
  () => ({
    darkMode: isEnabled("darkMode"),
    premium: isEnabled("premiumFeature"),
  }),
  [isEnabled]
);

// ✅ Early return
if (!isEnabled("expensiveFeature")) {
  return <LightComponent />;
}

// ✅ Batch checks en Server Components
const flags = await getMultipleFeatureFlags(["feature1", "feature2"]);
```

### ❌ Don'ts

```typescript
// ❌ Don't call in loops
items.map((item) => (isEnabled("feature") ? <A /> : <B />));

// ❌ Don't create complex dependencies
const show = isEnabled("a") && isEnabled("b") && userRole === "admin";

// ❌ Don't forget fallbacks
return isEnabled("feature") ? <Feature /> : null; // ¿Qué si falla?
```

---

## 🐛 Debug y Troubleshooting

### 🔍 Debug Info

```typescript
// En desarrollo
import { FeatureFlagsDebug } from "@/core/config/server-feature-flags";

const debugInfo = await FeatureFlagsDebug.getAllWithMetadata();
console.log("Flags:", debugInfo);
```

### 🔄 Invalidar Cache

```typescript
import { invalidateFeatureFlagsCache } from "@/core/config/server-feature-flags";

await invalidateFeatureFlagsCache();
```

### 🧪 Test Flag in Console

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

| Archivo                                             | Propósito                 |
| --------------------------------------------------- | ------------------------- |
| `src/core/config/feature-flags.ts`                  | 🎛️ Configuración estática |
| `src/core/config/server-feature-flags.ts`           | 🏢 Evaluación server-side |
| `src/shared/hooks/useFeatureFlagsServerActions.tsx` | 🪝 React hooks            |
| `src/features/admin/feature-flags/`                 | ⚙️ Admin interface        |
| `middleware.ts`                                     | 🛡️ Edge evaluation        |

---

## ⚡ Shortcuts

```bash
# Ver todos los flags
curl http://localhost:3000/api/feature-flags/public

# Toggle flag (admin)
curl -X POST http://localhost:3000/api/feature-flags/toggle \
  -H "Content-Type: application/json" \
  -d '{"flagKey": "darkMode"}'

# Ver métricas
curl http://localhost:3000/api/analytics/feature-flags/metrics
```

---

## 🎯 Checklist para Nuevo Flag

- [ ] 📝 Crear con script: `npm run create-flag`
- [ ] 🔧 Agregar ENV var en `.env.local`
- [ ] 🎨 Implementar componente con guard
- [ ] 🛡️ Agregar protección server-side si necesario
- [ ] 📊 Configurar tracking/analytics
- [ ] 🧪 Probar con rollout bajo (5-10%)
- [ ] 📈 Monitorear métricas
- [ ] 🚀 Incrementar rollout gradualmente
- [ ] ✅ Full rollout y cleanup cuando sea estable

¡Con esto tienes todo lo necesario para dominar los Feature Flags! 🚀
