# 🛠️ Feature Flags - Troubleshooting Guide

> **Solución de problemas comunes del sistema de feature flags**

## 📋 **Índice**

1. [🚨 Problemas Comunes](#-problemas-comunes)
2. [🔍 Herramientas de Debug](#-herramientas-de-debug)
3. [⚡ Problemas de Performance](#-problemas-de-performance)
4. [📡 Problemas de Broadcast](#-problemas-de-broadcast)
5. [🔒 Problemas de Permisos](#-problemas-de-permisos)
6. [🗄️ Problemas de Base de Datos](#️-problemas-de-base-de-datos)
7. [🎯 Problemas de Tipos](#-problemas-de-tipos)
8. [🔧 Herramientas de Diagnóstico](#-herramientas-de-diagnóstico)

---

## 🚨 **Problemas Comunes**

### **❌ Navigation no se actualiza cuando cambio un feature flag**

**Síntomas:**

- Cambio flag en admin UI
- Navigation no muestra/oculta items
- Necesito refresh manual

**Causas posibles:**

1. `FeatureFlagsProvider` no está en `layout.tsx`
2. Broadcast no está funcionando
3. Hook `useNavigation` no está usando el sistema correcto

**Solución:**

```typescript
// 1. Verificar que el provider esté en layout.tsx
// src/app/(admin)/layout.tsx
return (
  <FeatureFlagsProvider>
    {" "}
    {/* ✅ Debe estar aquí */}
    <AdminLayout>{children}</AdminLayout>
  </FeatureFlagsProvider>
);

// 2. Verificar que navigation use el hook correcto
// src/core/navigation/useNavigation.ts
import { useIsEnabled } from "@/core/feature-flags"; // ✅ Sistema consolidado
import { useFeatureFlagsBroadcast } from "@/shared/hooks/useBroadcast";

export function useNavigation({ userRole, isAuthenticated }) {
  const isEnabled = useIsEnabled();
  const { onFlagChange } = useFeatureFlagsBroadcast();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    return onFlagChange(() => {
      forceUpdate(); // ✅ Forzar re-render
    });
  }, [onFlagChange]);

  // ... resto del hook
}
```

---

### **❌ Página retorna 404 pero el flag está activado**

**Síntomas:**

- Flag aparece como activo en admin UI
- Página sigue retornando 404
- Navigation muestra el item

**Causas posibles:**

1. Cache no invalidado
2. Flag key incorrecto en página
3. Problema de tipos

**Solución:**

```typescript
// 1. Verificar el flag key exacto
// src/app/(admin)/my-feature/page.tsx
export default async function MyFeaturePage() {
  // ✅ Verificar que el key sea exactamente igual al config
  const enabled = await isServerFeatureEnabled("myFeature"); // ⚠️ Debe coincidir
  if (!enabled) notFound();

  return <MyFeatureContent />;
}

// 2. Verificar config
// src/core/feature-flags/config.ts
export const FEATURE_FLAGS = {
  myFeature: true, // ✅ Debe coincidir exactamente
} as const;

// 3. Invalidar cache manualmente si es necesario
import { invalidateFeatureFlagsCache } from "@/core/feature-flags/server";
await invalidateFeatureFlagsCache();
```

---

### **❌ Error de tipos: "Argument of type 'string' is not assignable to parameter of type 'FeatureFlag'"**

**Síntomas:**

- TypeScript error al usar `isEnabled()`
- Flag no aparece en autocompletado

**Causa:**
Flag no está definido en `FEATURE_FLAGS`

**Solución:**

```typescript
// ❌ INCORRECTO: Flag no definido
const enabled = isEnabled("nonExistentFlag"); // Error de tipos

// ✅ CORRECTO: Agregar flag al config primero
// src/core/feature-flags/config.ts
export const FEATURE_FLAGS = {
  // ... flags existentes
  nonExistentFlag: false, // ✅ Agregar aquí primero
} as const;

// Ahora funciona
const enabled = isEnabled("nonExistentFlag"); // ✅ Sin error
```

---

### **❌ Hook "useFeatureFlags must be used within FeatureFlagsProvider"**

**Síntomas:**

- Error al usar cualquier hook de feature flags
- Aplicación crashea

**Causa:**
Componente no está dentro del provider

**Solución:**

```typescript
// ✅ Asegurar que el provider esté en el layout correcto
// src/app/(admin)/layout.tsx
export default async function AdminLayout({ children }) {
  return (
    <FeatureFlagsProvider>
      {" "}
      {/* ✅ Provider aquí */}
      <AdminLayout>
        {children} {/* ✅ Todos los children tienen acceso */}
      </AdminLayout>
    </FeatureFlagsProvider>
  );
}

// ❌ INCORRECTO: Usar hook fuera del provider
function ComponentOutsideProvider() {
  const isEnabled = useIsEnabled(); // ❌ Error
  return <div>...</div>;
}

// ✅ CORRECTO: Usar hook dentro del provider
function ComponentInsideProvider() {
  const isEnabled = useIsEnabled(); // ✅ Funciona
  return <div>...</div>;
}
```

---

### **❌ Feature flag no aparece en admin UI**

**Síntomas:**

- Flag definido en config
- No aparece en `/feature-flags`
- No se puede toggle

**Causas posibles:**

1. No está en `FEATURE_FLAGS`
2. Error en server action
3. Problema de base de datos

**Solución:**

```typescript
// 1. Verificar que esté en config
// src/core/feature-flags/config.ts
export const FEATURE_FLAGS = {
  myNewFlag: false, // ✅ Debe estar aquí
} as const;

// 2. Verificar que admin UI use el hook correcto
// src/features/admin/feature-flags/page.tsx
export default function FeatureFlagsAdminPage() {
  const { flags, isLoading, error } = useFeatureFlags(); // ✅ Hook correcto

  if (error) {
    console.error("Error loading flags:", error); // 🔍 Debug
  }

  return (
    <div>
      {flags.map((flag) => (
        <FeatureFlagCard key={flag.key} flag={flag} />
      ))}
    </div>
  );
}
```

---

## 🔍 **Herramientas de Debug**

### **🐛 Debug Hook para Development**

```typescript
// src/hooks/useFeatureFlagDebug.ts
"use client";

import { useFeatureFlags } from "@/core/feature-flags";
import { useEffect } from "react";

export function useFeatureFlagDebug(
  enabled = process.env.NODE_ENV === "development"
) {
  const { flags, flagsMap, error, isLoading } = useFeatureFlags();

  useEffect(() => {
    if (!enabled) return;

    console.group("🎛️ Feature Flags Debug");
    console.log("📊 Estado:", { isLoading, error });
    console.log("🗺️ Flags Map:", flagsMap);
    console.log("📋 Flags Array:", flags);
    console.groupEnd();
  }, [enabled, flags, flagsMap, error, isLoading]);

  const debugFlag = (flagKey: string) => {
    if (!enabled) return;

    const flag = flags.find((f) => f.key === flagKey);
    console.log(`🎛️ Debug "${flagKey}":`, {
      exists: !!flag,
      enabled: flagsMap[flagKey],
      metadata: flag,
      source: flag ? "database" : "static",
    });
  };

  return { debugFlag };
}
```

**Uso:**

```typescript
// En cualquier componente
function MyComponent() {
  const { debugFlag } = useFeatureFlagDebug();

  useEffect(() => {
    debugFlag("myFeature"); // 🔍 Debug flag específico
  }, []);

  // ... resto del componente
}
```

---

### **🔍 Debug Navigation**

```typescript
// src/core/navigation/useNavigation.ts
export function useNavigation({
  userRole,
  isAuthenticated,
  debugMode = false,
}) {
  const isEnabled = useIsEnabled();

  // 🐛 Debug logging
  if (debugMode) {
    console.group("🧭 Navigation Debug");
    console.log("👤 User:", { userRole, isAuthenticated });
    console.log(
      "🎛️ Feature Flags:",
      Object.fromEntries(
        NAVIGATION_REGISTRY.filter((item) => item.requiredFeature).map(
          (item) => [item.requiredFeature, isEnabled(item.requiredFeature)]
        )
      )
    );
    console.log(
      "📋 Visible Items:",
      navigationItems.map((item) => item.id)
    );
    console.groupEnd();
  }

  // ... resto del hook
}
```

**Uso:**

```typescript
// Activar debug en development
const { navigationItems } = useNavigation({
  userRole: "admin",
  isAuthenticated: true,
  debugMode: process.env.NODE_ENV === "development", // 🐛 Debug mode
});
```

---

### **📊 Debug Component**

```typescript
// src/components/FeatureFlagDebugger.tsx
"use client";

import { useFeatureFlags } from "@/core/feature-flags";
import { useState } from "react";

export function FeatureFlagDebugger() {
  const { flags, flagsMap, isLoading, error } = useFeatureFlags();
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm"
      >
        🎛️ Debug Flags
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-auto">
          <h3 className="font-bold mb-2">Feature Flags Debug</h3>

          {isLoading && <p className="text-blue-600">Loading...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}

          <div className="space-y-1">
            {Object.entries(flagsMap).map(([key, enabled]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-mono">{key}</span>
                <span className={enabled ? "text-green-600" : "text-red-600"}>
                  {enabled ? "ON" : "OFF"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## ⚡ **Problemas de Performance**

### **❌ Muchos re-renders innecesarios**

**Síntomas:**

- Componentes se re-renderizan constantemente
- Performance lenta
- Logs de debug excesivos

**Causa:**
Hook `useFeatureFlags` usado incorrectamente

**Solución:**

```typescript
// ❌ INCORRECTO: Usar hook completo para verificación simple
function MyComponent() {
  const { isEnabled } = useFeatureFlags(); // ❌ Trae todo el contexto

  if (!isEnabled("myFeature")) return null;
  return <div>Content</div>;
}

// ✅ CORRECTO: Usar hook específico
function MyComponent() {
  const isEnabled = useIsEnabled(); // ✅ Solo la función

  if (!isEnabled("myFeature")) return null;
  return <div>Content</div>;
}

// ✅ MEJOR: Memoizar si es necesario
const MyComponent = memo(function MyComponent() {
  const isEnabled = useIsEnabled();

  if (!isEnabled("myFeature")) return null;
  return <div>Content</div>;
});
```

---

### **❌ Cache no funciona correctamente**

**Síntomas:**

- Queries lentas en servidor
- Datos no actualizados
- Cache hits bajos

**Solución:**

```typescript
// Verificar configuración de cache
// src/core/feature-flags/server.ts
const CACHE_CONFIG = {
  tags: ["feature-flags"] as const,
  revalidate: 300, // ✅ 5 minutos es razonable
} as const;

// Invalidar cache cuando sea necesario
// src/core/feature-flags/actions.ts
export async function toggleFeatureFlagAction(flagKey: string) {
  // ... actualizar DB

  // ✅ Invalidar cache después de cambios
  revalidateTag("feature-flags");

  return { success: true };
}
```

---

## 📡 **Problemas de Broadcast**

### **❌ Broadcast no funciona entre pestañas**

**Síntomas:**

- Cambio en una pestaña no se refleja en otra
- Navigation no se actualiza
- No hay errores en consola

**Causas posibles:**

1. BroadcastChannel no soportado
2. Listeners no configurados
3. Canal incorrecto

**Solución:**

```typescript
// 1. Verificar soporte de BroadcastChannel
// src/shared/hooks/useBroadcast.ts
useEffect(() => {
  if ("BroadcastChannel" in window) {
    channelRef.current = new BroadcastChannel(channelName);
  } else {
    console.warn("BroadcastChannel not supported"); // 🔍 Debug
  }
  return () => channelRef.current?.close();
}, [channelName]);

// 2. Verificar que listeners estén configurados
// src/core/navigation/useNavigation.ts
useEffect(() => {
  return onFlagChange((flagKey) => {
    console.log(`🎛️ Broadcast received: ${flagKey}`); // 🔍 Debug
    forceUpdate();
  });
}, [onFlagChange]);

// 3. Verificar que se envíe broadcast
// src/core/feature-flags/hooks.ts
const toggleFlag = useCallback(
  async (flagKey: string) => {
    const result = await toggleFeatureFlagAction(flagKey);
    if (result.success) {
      console.log(`📡 Broadcasting: ${flagKey}`); // 🔍 Debug
      notifyFlagChange(flagKey); // ✅ Enviar broadcast
      await refreshFlags();
    }
  },
  [notifyFlagChange, refreshFlags]
);
```

---

### **❌ Broadcast funciona pero navigation no se actualiza**

**Síntomas:**

- Console logs muestran broadcast recibido
- Navigation items no cambian
- Otros componentes sí se actualizan

**Causa:**
`useNavigation` no está forzando re-render

**Solución:**

```typescript
// src/core/navigation/useNavigation.ts
export function useNavigation({
  userRole,
  isAuthenticated,
  debugMode = false,
}) {
  const isEnabled = useIsEnabled();
  const { onFlagChange } = useFeatureFlagsBroadcast();
  const [, forceUpdate] = useReducer((x) => x + 1, 0); // ✅ Reducer para forzar render

  useEffect(() => {
    return onFlagChange((flagKey) => {
      if (debugMode)
        console.log(`🎛️ Flag '${flagKey}' changed - updating navigation`);
      forceUpdate(); // ✅ Forzar re-render
    });
  }, [onFlagChange, debugMode]);

  // ✅ Asegurar que isEnabled esté en dependencias
  const navigationItems = useMemo(() => {
    return NAVIGATION_REGISTRY.filter((item) => {
      if (item.requiredFeature && !isEnabled(item.requiredFeature)) {
        return false;
      }
      return true;
    });
  }, [userRole, isAuthenticated, isEnabled, debugMode]); // ✅ isEnabled como dependencia

  return { navigationItems /* ... */ };
}
```

---

## 🔒 **Problemas de Permisos**

### **❌ Error "Insufficient permissions to modify feature flags"**

**Síntomas:**

- No puedo toggle flags en admin UI
- Error en server actions
- Usuario es admin

**Causa:**
Verificación de permisos incorrecta

**Solución:**

```typescript
// Verificar implementación de requireAdminAuth
// src/core/feature-flags/actions.ts
async function requireAdminAuth(): Promise<Session> {
  const session = await requireAuth();

  if (!session || !session.user) {
    throw new Error("Authentication required");
  }

  const userRole = session.user.role ?? "user";

  // ✅ Verificar que incluya tanto admin como super_admin
  if (userRole !== "admin" && userRole !== "super_admin") {
    throw new Error("Admin permissions required");
  }

  return session;
}
```

---

### **❌ Navigation muestra items que no debería**

**Síntomas:**

- Usuario ve navigation items sin permisos
- Páginas están protegidas pero navigation no

**Causa:**
Verificación de roles en navigation incorrecta

**Solución:**

```typescript
// src/core/navigation/useNavigation.ts
const navigationItems = useMemo(() => {
  return NAVIGATION_REGISTRY.filter((item) => {
    // ✅ Verificar autenticación
    if (item.requiresAuth && !isAuthenticated) {
      return false;
    }

    // ✅ Verificar rol con jerarquía
    if (item.requiredRole && !hasRequiredRole(userRole, item.requiredRole)) {
      return false;
    }

    // ✅ Verificar feature flag
    if (item.requiredFeature && !isEnabled(item.requiredFeature)) {
      return false;
    }

    return true;
  });
}, [userRole, isAuthenticated, isEnabled]);

// ✅ Función helper para jerarquía de roles
function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    admin: 2,
    super_admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
```

---

## 🗄️ **Problemas de Base de Datos**

### **❌ Error "Database error while updating feature flag"**

**Síntomas:**

- Toggle falla con error de DB
- Admin UI muestra error
- Logs muestran SQL errors

**Causas posibles:**

1. Tabla no existe
2. Permisos de DB incorrectos
3. Schema desactualizado

**Solución:**

```bash
# 1. Verificar que las migraciones estén aplicadas
npx prisma migrate status

# 2. Aplicar migraciones pendientes
npx prisma migrate deploy

# 3. Regenerar cliente Prisma
npx prisma generate

# 4. Verificar schema
npx prisma db pull
```

```typescript
// Verificar modelo Prisma
// src/core/database/prisma/models/feature-flags.prisma
model FeatureFlag {
  id                  String   @id @default(cuid())
  key                 String   @unique
  name                String
  description         String   @default("")
  enabled             Boolean  @default(false)
  category            String   @default("core")
  version             String   @default("1.0.0")
  // ... resto del modelo
}
```

---

### **❌ Flags no persisten en base de datos**

**Síntomas:**

- Toggle funciona temporalmente
- Después de refresh vuelve al estado anterior
- Solo funciona con flags estáticos

**Causa:**
Server action no actualiza DB correctamente

**Solución:**

```typescript
// src/core/feature-flags/actions.ts
export async function toggleFeatureFlagAction(flagKey: string) {
  try {
    await requireAdminAuth();

    // ✅ Buscar flag actual
    const currentFlag = await prisma.featureFlag.findUnique({
      where: { key: flagKey },
    });

    if (currentFlag) {
      // ✅ Actualizar existente
      await prisma.featureFlag.update({
        where: { key: flagKey },
        data: { enabled: !currentFlag.enabled },
      });
    } else {
      // ✅ Crear nuevo con valor opuesto al estático
      const staticValue = FEATURE_FLAGS[flagKey as FeatureFlag] ?? false;
      await prisma.featureFlag.create({
        data: {
          key: flagKey,
          name: formatFlagName(flagKey),
          description: `Feature flag for ${flagKey}`,
          enabled: !staticValue,
          category: getFeatureCategory(flagKey) ?? "core",
        },
      });
    }

    // ✅ Invalidar cache
    revalidateTag("feature-flags");

    return { success: true };
  } catch (error) {
    console.error("Toggle error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

---

## 🎯 **Problemas de Tipos**

### **❌ TypeScript no reconoce nuevos feature flags**

**Síntomas:**

- Autocompletado no muestra nuevo flag
- Error de tipos al usar flag
- IDE no sugiere flag

**Causa:**
TypeScript no ha regenerado tipos

**Solución:**

```bash
# 1. Reiniciar TypeScript server en IDE
# VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"

# 2. Verificar que flag esté en config
# src/core/feature-flags/config.ts
export const FEATURE_FLAGS = {
  myNewFlag: false, // ✅ Debe estar aquí
} as const;

# 3. Rebuild si es necesario
npm run build
```

---

### **❌ Error "Type 'string' is not assignable to type 'FeatureFlag'"**

**Síntomas:**

- Error al pasar variable string a `isEnabled()`
- Funciona con string literal

**Causa:**
Variable no tiene tipo específico

**Solución:**

```typescript
// ❌ INCORRECTO: Variable string genérica
const flagKey = "myFeature"; // tipo: string
const enabled = isEnabled(flagKey); // ❌ Error

// ✅ CORRECTO: Tipo específico
const flagKey: FeatureFlag = "myFeature"; // tipo: FeatureFlag
const enabled = isEnabled(flagKey); // ✅ Funciona

// ✅ ALTERNATIVA: Assertion
const flagKey = "myFeature" as FeatureFlag;
const enabled = isEnabled(flagKey); // ✅ Funciona

// ✅ MEJOR: Usar directamente
const enabled = isEnabled("myFeature"); // ✅ Funciona
```

---

## 🔧 **Herramientas de Diagnóstico**

### **🩺 Health Check Component**

```typescript
// src/components/FeatureFlagHealthCheck.tsx
"use client";

import { useFeatureFlags } from "@/core/feature-flags";
import { useEffect, useState } from "react";

export function FeatureFlagHealthCheck() {
  const { flags, isLoading, error } = useFeatureFlags();
  const [health, setHealth] = useState<"healthy" | "warning" | "error">(
    "healthy"
  );

  useEffect(() => {
    if (error) {
      setHealth("error");
    } else if (isLoading) {
      setHealth("warning");
    } else if (flags.length === 0) {
      setHealth("warning");
    } else {
      setHealth("healthy");
    }
  }, [flags, isLoading, error]);

  if (process.env.NODE_ENV !== "development") return null;

  const statusColors = {
    healthy: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <div
      className={`fixed top-4 right-4 px-3 py-1 rounded-full text-sm ${statusColors[health]}`}
    >
      🎛️ {health.toUpperCase()} ({flags.length} flags)
    </div>
  );
}
```

---

### **📊 Performance Monitor**

```typescript
// src/hooks/useFeatureFlagPerformance.ts
"use client";

import { useFeatureFlags } from "@/core/feature-flags";
import { useEffect, useRef } from "react";

export function useFeatureFlagPerformance() {
  const { flags, isLoading } = useFeatureFlags();
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (process.env.NODE_ENV === "development") {
      console.log(`🎛️ Feature Flags Render #${renderCount.current}`, {
        timeSinceLastRender,
        flagsCount: flags.length,
        isLoading,
      });
    }
  }, [flags, isLoading]);

  return {
    renderCount: renderCount.current,
    flagsCount: flags.length,
  };
}
```

---

### **🔍 Network Monitor**

```typescript
// src/components/FeatureFlagNetworkMonitor.tsx
"use client";

import { useEffect, useState } from "react";

export function FeatureFlagNetworkMonitor() {
  const [requests, setRequests] = useState<
    Array<{
      url: string;
      method: string;
      status: number;
      timestamp: number;
    }>
  >([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const [url] = args;
      const startTime = Date.now();

      try {
        const response = await originalFetch(...args);

        if (typeof url === "string" && url.includes("feature-flag")) {
          setRequests((prev) => [
            ...prev.slice(-9),
            {
              url: url.toString(),
              method: "GET",
              status: response.status,
              timestamp: startTime,
            },
          ]);
        }

        return response;
      } catch (error) {
        if (typeof url === "string" && url.includes("feature-flag")) {
          setRequests((prev) => [
            ...prev.slice(-9),
            {
              url: url.toString(),
              method: "GET",
              status: 0,
              timestamp: startTime,
            },
          ]);
        }
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (process.env.NODE_ENV !== "development" || requests.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border rounded-lg shadow-lg p-3 text-xs">
      <h4 className="font-bold mb-2">🌐 Feature Flag Requests</h4>
      {requests.map((req, i) => (
        <div key={i} className="flex justify-between gap-2">
          <span className="font-mono">{req.method}</span>
          <span
            className={req.status === 200 ? "text-green-600" : "text-red-600"}
          >
            {req.status}
          </span>
          <span className="text-slate-500">
            {new Date(req.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}
```

---

## 🆘 **Cuando Todo Falla**

### **🔄 Reset Completo**

```bash
# 1. Limpiar cache de Next.js
rm -rf .next

# 2. Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# 3. Regenerar Prisma
npx prisma generate
npx prisma migrate reset --force

# 4. Rebuild
npm run build
```

### **🔍 Verificación Sistemática**

```typescript
// Crear componente de verificación completa
// src/components/FeatureFlagSystemCheck.tsx
"use client";

import { useFeatureFlags } from "@/core/feature-flags";
import { FEATURE_FLAGS } from "@/core/feature-flags/config";

export function FeatureFlagSystemCheck() {
  const { flags, flagsMap, isLoading, error } = useFeatureFlags();

  const checks = [
    {
      name: "Provider Setup",
      status: flags !== undefined ? "✅" : "❌",
      details: flags !== undefined ? "Provider working" : "Provider not found",
    },
    {
      name: "Static Config",
      status: Object.keys(FEATURE_FLAGS).length > 0 ? "✅" : "❌",
      details: `${Object.keys(FEATURE_FLAGS).length} static flags`,
    },
    {
      name: "Database Connection",
      status: !error ? "✅" : "❌",
      details: error || "Connection OK",
    },
    {
      name: "Loading State",
      status: !isLoading ? "✅" : "⏳",
      details: isLoading ? "Loading..." : "Loaded",
    },
    {
      name: "Flags Map",
      status: Object.keys(flagsMap).length > 0 ? "✅" : "❌",
      details: `${Object.keys(flagsMap).length} flags in map`,
    },
  ];

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-red-500 rounded-lg p-6 shadow-xl z-50">
      <h2 className="text-xl font-bold mb-4">🩺 Feature Flags System Check</h2>

      <div className="space-y-2">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-lg">{check.status}</span>
            <span className="font-medium">{check.name}</span>
            <span className="text-sm text-slate-600">{check.details}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-slate-100 rounded text-sm">
        <strong>Debug Info:</strong>
        <pre className="mt-1 text-xs">
          {JSON.stringify(
            {
              flagsCount: flags.length,
              staticCount: Object.keys(FEATURE_FLAGS).length,
              error: error,
              isLoading,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
```

---

## 📞 **Contacto y Soporte**

Si ninguna de estas soluciones funciona:

1. **Revisar logs del servidor** para errores específicos
2. **Verificar configuración de base de datos** y migraciones
3. **Comprobar versiones** de Next.js, React y dependencias
4. **Crear issue** con información detallada del problema

---

_Última actualización: Enero 2025 - Troubleshooting completo v2.0_
