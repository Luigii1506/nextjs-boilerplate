---
title: Guía Completa
slug: /feature-flags/guia
---

# 🎛️ FEATURE FLAGS - GUÍA COMPLETA

> **Sistema Enterprise de Feature Flags para Next.js 15 + React 19**

## 📋 Índice

1. [¿Qué son los Feature Flags?](#-qué-son-los-feature-flags)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Flujo de Evaluación](#-flujo-de-evaluación)
4. [Implementación Práctica: Dark Mode](#-implementación-práctica-dark-mode)
5. [Agregar Nuevo Feature Flag](#-agregar-nuevo-feature-flag)
6. [Casos de Uso Avanzados](#-casos-de-uso-avanzados)
7. [Best Practices](#-best-practices)
8. [Troubleshooting](#-troubleshooting)

---

## 🎯 ¿Qué son los Feature Flags?

Los **Feature Flags** (también llamados Feature Toggles) son un patrón de desarrollo que permite **activar/desactivar funcionalidades** sin necesidad de desplegar código nuevo.

### 🌟 Beneficios Clave

```typescript
// ✅ SIN Feature Flags - Problemático
if (process.env.NODE_ENV === "production") {
  // Solo en producción
  return <NewDashboard />;
} else {
  return <OldDashboard />;
}

// 🚀 CON Feature Flags - Flexible
if (isFeatureEnabled("newDashboard")) {
  return <NewDashboard />;
} else {
  return <OldDashboard />;
}
```

### 📊 Casos de Uso

- **🔄 Rollouts Graduales**: Activar para 10% de usuarios
- **🧪 A/B Testing**: Probar variantes diferentes
- **🛡️ Kill Switch**: Desactivar rápidamente si hay problemas
- **🎨 Funcionalidades Beta**: Solo para usuarios específicos
- **🌍 Features por Región**: Activar según país/idioma

---

## 🏗️ Arquitectura del Sistema

Nuestro sistema tiene **5 capas principales**:

```
📁 FEATURE FLAGS ARCHITECTURE
├── 🎛️ Static Config (feature-flags.ts)     → Configuración base
├── 🏢 Server Evaluation (server-feature-flags.ts) → Lógica enterprise
├── 🧩 Module Integration (modules.ts)      → Conexión con módulos
├── 🪝 Client Hooks (useFeatureFlagsServerActions) → React integration
└── ⚙️ Admin Interface (features/admin/feature-flags) → Gestión UI
```

### 🎛️ 1. Static Config (`feature-flags.ts`)

**Propósito**: Configuración base y fallback

```typescript
export const FEATURE_FLAGS = {
  // 🔥 CORE FEATURES - Siempre activos
  authentication: true,
  userManagement: true,

  // 🧩 MODULE FEATURES - Dinámicos
  fileUpload: MODULE_CONFIG.fileUpload.enabled,

  // 🧪 EXPERIMENTAL - Por environment
  darkMode: process.env.FEATURE_DARK_MODE === "true",
  newDashboard: process.env.FEATURE_NEW_DASHBOARD === "true",
} as const;
```

### 🏢 2. Server Evaluation (`server-feature-flags.ts`)

**Propósito**: Evaluación enterprise con A/B testing y cache

```typescript
// 🚀 Función principal - evaluada en middleware y Server Components
export const getServerFeatureFlags = unstable_cache(
  async (context: FeatureFlagContext = {}) => {
    // 1. Obtener de base de datos
    const flags = await getFeatureFlagsFromDatabase();

    // 2. Aplicar contexto (A/B testing, rollout %)
    const evaluated = await evaluateFeatureFlagsWithContext(flags, context);

    return evaluated;
  },
  ["server-feature-flags"],
  { revalidate: 30, tags: ["feature-flags"] }
);
```

### 🧩 3. Module Integration (`modules.ts`)

**Propósito**: Conectar flags con módulos del sistema

```typescript
export const MODULE_CONFIG = {
  fileUpload: {
    enabled: process.env.MODULE_FILE_UPLOAD === "true",
    // Este valor se usa en FEATURE_FLAGS.fileUpload
  },
  darkMode: {
    enabled: process.env.FEATURE_DARK_MODE === "true",
  },
};
```

### 🪝 4. Client Hooks (`useFeatureFlagsServerActions.tsx`)

**Propósito**: Integración React 19 con optimistic UI

```typescript
// Hook principal
const { isEnabled, toggleFlag, isPending } = useFeatureFlagsServer();

// Hook simple para verificar
const isEnabled = useIsEnabled();
const isDarkModeEnabled = isEnabled("darkMode");
```

### ⚙️ 5. Admin Interface (`features/admin/feature-flags/`)

**Propósito**: Interfaz para gestionar flags en tiempo real

```typescript
// Server Actions para CRUD
export async function toggleFeatureFlagServerAction(formData: FormData);
export async function getAllFeatureFlagsServerAction();
```

### 🧠 6. Metadata & Dependencies (`metadata.ts`)

**Propósito**: El "cerebro" que enriquece los flags con información descriptiva y valida dependencias

```typescript
// src/features/admin/feature-flags/config/metadata.ts
export const FEATURE_FLAG_METADATA: Record<string, FeatureFlagMetadata> = {
  darkMode: {
    name: "Dark Mode",
    description: "Modo oscuro para toda la aplicación",
    icon: "🌙",
    category: "ui",
    premium: false,
    dependencies: [], // No depende de otros flags
    rolloutStrategy: "percentage",
    analytics: {
      trackImpressions: true,
      trackConversions: true,
    },
  },

  newDashboard: {
    name: "Nuevo Dashboard",
    description: "Dashboard rediseñado con React 19",
    icon: "📊",
    category: "core",
    premium: true,
    dependencies: ["darkMode"], // Solo si darkMode está activo
    rolloutStrategy: "ab-testing",
    analytics: {
      trackImpressions: true,
      trackConversions: true,
      conversionGoal: "dashboard_engagement",
    },
  },

  fileUpload: {
    name: "File Upload",
    description: "Sistema de subida de archivos",
    icon: "📁",
    category: "modules",
    premium: false,
    dependencies: [], // Módulo independiente
    rolloutStrategy: "percentage",
    analytics: {
      trackImpressions: false,
      trackConversions: true,
    },
  },
};
```

#### 🔗 Sistema de Dependencias

**¿Cómo funciona?**

1. **Validación Automática**: El Admin UI valida que no se desactive un flag del que dependen otros
2. **Cascada Inteligente**: Si se desactiva `darkMode`, automáticamente se desactiva `newDashboard`
3. **Prevención de Errores**: No permite activar flags con dependencias no satisfechas

```typescript
// Ejemplo de validación de dependencias
export function validateFeatureFlagDependencies(
  flagKey: string,
  newState: boolean,
  allFlags: FeatureFlag[]
): ValidationResult {
  const metadata = FEATURE_FLAG_METADATA[flagKey];

  if (!metadata) {
    return { valid: false, error: "Flag no encontrado" };
  }

  // Si se está desactivando, verificar dependientes
  if (!newState) {
    const dependents = findDependentFlags(flagKey, allFlags);
    if (dependents.length > 0) {
      return {
        valid: false,
        error: `No se puede desactivar: ${dependents.join(
          ", "
        )} dependen de este flag`,
        dependents,
      };
    }
  }

  // Si se está activando, verificar que las dependencias estén activas
  if (newState && metadata.dependencies.length > 0) {
    const missingDeps = metadata.dependencies.filter(
      (dep) => !allFlags.find((f) => f.key === dep && f.enabled)
    );

    if (missingDeps.length > 0) {
      return {
        valid: false,
        error: `Dependencias faltantes: ${missingDeps.join(", ")}`,
        missingDependencies: missingDeps,
      };
    }
  }

  return { valid: true };
}
```

#### 🎨 Categorización y Organización

```typescript
// Categorías predefinidas para organización
export const FEATURE_FLAG_CATEGORIES = {
  ui: "🎨 Interfaz de Usuario",
  core: "🔥 Funcionalidades Core",
  modules: "🧩 Módulos del Sistema",
  experimental: "🧪 Funcionalidades Experimentales",
  premium: "💎 Funcionalidades Premium",
  analytics: "📊 Analytics y Tracking",
} as const;

// Estrategias de rollout
export const ROLLOUT_STRATEGIES = {
  percentage: "Porcentaje de usuarios",
  "ab-testing": "A/B Testing",
  "user-segments": "Segmentos específicos",
  gradual: "Rollout gradual",
} as const;
```

#### 📊 Analytics y Tracking

```typescript
// Configuración de analytics por flag
interface AnalyticsConfig {
  trackImpressions: boolean; // ¿Registrar cuando se muestra?
  trackConversions: boolean; // ¿Registrar cuando se usa?
  conversionGoal?: string; // Meta de conversión específica
  customEvents?: string[]; // Eventos personalizados
}

// Ejemplo de uso en componentes
function useFeatureFlagAnalytics(flagKey: string) {
  const metadata = FEATURE_FLAG_METADATA[flagKey];
  const isEnabled = useIsEnabled();

  useEffect(() => {
    if (metadata?.analytics?.trackImpressions && isEnabled(flagKey)) {
      // Registrar impresión
      analytics.track("feature_flag_impression", {
        flag: flagKey,
        category: metadata.category,
        timestamp: new Date().toISOString(),
      });
    }
  }, [flagKey, isEnabled]);

  const trackConversion = useCallback(() => {
    if (metadata?.analytics?.trackConversions) {
      analytics.track("feature_flag_conversion", {
        flag: flagKey,
        goal: metadata.analytics.conversionGoal,
        timestamp: new Date().toISOString(),
      });
    }
  }, [flagKey, metadata]);

  return { trackConversion };
}
```

---

## 🔄 Flujo de Evaluación

### 📊 Diagrama de Flujo

```mermaid
graph TD
    A[🌐 Request] --> B[🛡️ Middleware]
    B --> C{🎯 Needs Flags?}
    C -->|Yes| D[💾 Database Query]
    C -->|No| E[⏭️ Continue]
    D --> F[🎲 Context Evaluation]
    F --> G[📝 Headers/Cookies]
    G --> H[📄 Server Component]
    H --> I[🎛️ getFeatureFlags()]
    I --> J[⚡ Fast Access]

    K[👤 Client] --> L[🪝 useFeatureFlagsServer]
    L --> M[🔄 Server Actions]
    M --> N[📡 Optimistic UI]
```

### 🚀 Evaluación Paso a Paso

1. **🛡️ Middleware (Edge)**

   ```typescript
   // middleware.ts
   const flagContext = { userId, userRole, country };
   const featureFlags = await getServerFeatureFlags(flagContext);

   // Pasar a Server Components vía headers
   response.headers.set("x-feature-flags", JSON.stringify(featureFlags));
   ```

2. **📄 Server Components**

   ```typescript
   // Obtener flags evaluados (ultra-rápido)
   const flags = await getFeatureFlags(); // Del header/cookie
   const isDarkMode = flags.darkMode || false;
   ```

3. **👤 Client Components**
   ```typescript
   // Hook con sync en tiempo real
   const isEnabled = useIsEnabled();
   const isDarkMode = isEnabled("darkMode");
   ```

---

## 🌙 Implementación Práctica: Dark Mode

Vamos a implementar Dark Mode como ejemplo completo.

### 📝 Paso 1: Agregar al Static Config

```typescript
// src/core/config/feature-flags.ts
export const FEATURE_FLAGS = {
  // ... otros flags

  // 🎨 UI/UX FEATURES
  darkMode: process.env.FEATURE_DARK_MODE === "true",
  animations: process.env.FEATURE_ANIMATIONS !== "false",
} as const;
```

### 🗄️ Paso 2: Agregar a Base de Datos

```sql
-- Ejecutar en tu base de datos
INSERT INTO feature_flags (
  key, name, description, enabled, category, version
) VALUES (
  'darkMode',
  'Dark Mode',
  'Modo oscuro para toda la aplicación',
  false,
  'ui',
  '1.0.0'
);
```

### 🎨 Paso 3: Crear Theme Provider

```typescript
// src/shared/providers/ThemeProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isThemeLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isEnabled = useIsEnabled();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // 🎛️ Verificar si dark mode está habilitado
  const darkModeEnabled = isEnabled("darkMode");

  useEffect(() => {
    if (darkModeEnabled) {
      // Obtener preferencia guardada
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      setIsDarkMode(saved === "dark" || (!saved && prefersDark));
    } else {
      // Si el flag está desactivado, forzar light mode
      setIsDarkMode(false);
    }
    setIsThemeLoading(false);
  }, [darkModeEnabled]);

  // 🎨 Aplicar clase al documento
  useEffect(() => {
    if (isThemeLoading) return;

    if (isDarkMode && darkModeEnabled) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode, darkModeEnabled, isThemeLoading]);

  const toggleTheme = () => {
    if (darkModeEnabled) {
      setIsDarkMode(!isDarkMode);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode: isDarkMode && darkModeEnabled,
        toggleTheme,
        isThemeLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
```

### 🎛️ Paso 4: Crear Toggle Component

```typescript
// src/shared/components/ThemeToggle.tsx
"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/shared/providers/ThemeProvider";
import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

export function ThemeToggle() {
  const { isDarkMode, toggleTheme, isThemeLoading } = useTheme();
  const darkModeEnabled = useIsEnabled("darkMode");

  // ❌ No mostrar si el feature flag está desactivado
  if (!darkModeEnabled) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      disabled={isThemeLoading}
      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 
                 dark:border-slate-700 dark:hover:bg-slate-800 
                 transition-colors disabled:opacity-50"
      aria-label={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
    >
      {isThemeLoading ? (
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      ) : isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600" />
      )}
    </button>
  );
}
```

### 🏗️ Paso 5: Integrar en Layout

```typescript
// src/app/layout.tsx
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import { FeatureFlagsServerProvider } from "@/shared/hooks/useFeatureFlagsServerActions";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <FeatureFlagsServerProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </FeatureFlagsServerProvider>
      </body>
    </html>
  );
}
```

### 🎨 Paso 6: Actualizar AdminShell

```typescript
// src/shared/ui/layouts/AdminShellPure.tsx
import { ThemeToggle } from "@/shared/components/ThemeToggle";

// En headerActions
const headerActions = React.useMemo(
  (): HeaderAction[] => [
    {
      id: "theme",
      icon: <ThemeToggle />,
      label: "Cambiar tema",
    },
    // ... otros actions
  ],
  []
);
```

### 🎛️ Paso 7: Uso en Componentes

```typescript
// En cualquier componente
"use client";

import { useTheme } from "@/shared/providers/ThemeProvider";
import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

function MyComponent() {
  const { isDarkMode } = useTheme();
  const darkModeEnabled = useIsEnabled("darkMode");

  return (
    <div
      className={`
      p-6 rounded-lg border
      ${
        isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }
      ${!darkModeEnabled && "opacity-75"}
    `}
    >
      <h2 className="font-semibold">
        Dark Mode:{" "}
        {darkModeEnabled
          ? isDarkMode
            ? "🌙 Activado"
            : "☀️ Desactivado"
          : "❌ No disponible"}
      </h2>
    </div>
  );
}
```

---

## 🔗 Implementación de Dependencias

### 🎯 ¿Por qué son Importantes las Dependencias?

Las dependencias aseguran que tu aplicación funcione correctamente al activar/desactivar flags:

```typescript
// ❌ SIN dependencias - Problemas
if (isFeatureEnabled("newDashboard")) {
  // ¿Qué pasa si darkMode está desactivado?
  // El dashboard podría romperse visualmente
  return <NewDashboard />;
}

// ✅ CON dependencias - Seguro
if (isFeatureEnabled("newDashboard") && isFeatureEnabled("darkMode")) {
  // Solo se muestra si ambas funcionalidades están activas
  return <NewDashboard />;
}
```

### 🏗️ Implementación en el Admin UI

#### 1. **Validación al Toggle**

```typescript
// src/features/admin/feature-flags/ui/components/FeatureFlagCard.tsx
"use client";

import { validateFeatureFlagDependencies } from "../utils/dependency-validator";

export function FeatureFlagCard({ flag, onToggle }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (newState: boolean) => {
    // 🛡️ Validar dependencias ANTES de cambiar
    const validation = validateFeatureFlagDependencies(
      flag.key,
      newState,
      allFlags
    );

    if (!validation.valid) {
      // Mostrar error y NO permitir cambio
      toast.error(validation.error);
      return;
    }

    // ✅ Dependencias validadas, proceder con toggle
    startTransition(async () => {
      await toggleFeatureFlag(flag.key, newState);
    });
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{flag.name}</h3>
          <p className="text-sm text-gray-600">{flag.description}</p>

          {/* 🔗 Mostrar dependencias */}
          {flag.dependencies?.length > 0 && (
            <div className="mt-2 text-xs text-blue-600">
              <span>🔗 Depende de: </span>
              {flag.dependencies.map((dep) => (
                <span
                  key={dep}
                  className="inline-block bg-blue-100 px-2 py-1 rounded mr-1"
                >
                  {dep}
                </span>
              ))}
            </div>
          )}
        </div>

        <Switch
          checked={flag.enabled}
          onCheckedChange={handleToggle}
          disabled={isPending}
        />
      </div>
    </div>
  );
}
```

#### 2. **Validación de Dependencias**

```typescript
// src/features/admin/feature-flags/utils/dependency-validator.ts
import { FEATURE_FLAG_METADATA } from "../config/metadata";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  dependents?: string[];
  missingDependencies?: string[];
}

export function validateFeatureFlagDependencies(
  flagKey: string,
  newState: boolean,
  allFlags: FeatureFlag[]
): ValidationResult {
  const metadata = FEATURE_FLAG_METADATA[flagKey];

  if (!metadata) {
    return { valid: false, error: "Flag no encontrado" };
  }

  // 🚫 Si se está desactivando, verificar dependientes
  if (!newState) {
    const dependents = findDependentFlags(flagKey, allFlags);
    if (dependents.length > 0) {
      return {
        valid: false,
        error: `No se puede desactivar: ${dependents.join(
          ", "
        )} dependen de este flag`,
        dependents,
      };
    }
  }

  // ✅ Si se está activando, verificar que las dependencias estén activas
  if (newState && metadata.dependencies.length > 0) {
    const missingDeps = metadata.dependencies.filter(
      (dep) => !allFlags.find((f) => f.key === dep && f.enabled)
    );

    if (missingDeps.length > 0) {
      return {
        valid: false,
        error: `Dependencias faltantes: ${missingDeps.join(", ")}`,
        missingDependencies: missingDeps,
      };
    }
  }

  return { valid: true };
}

// 🔍 Encontrar flags que dependen de uno específico
export function findDependentFlags(
  flagKey: string,
  allFlags: FeatureFlag[]
): string[] {
  const dependents: string[] = [];

  for (const flag of allFlags) {
    const metadata = FEATURE_FLAG_METADATA[flag.key];
    if (metadata?.dependencies?.includes(flagKey)) {
      dependents.push(flag.key);
    }
  }

  return dependents;
}

// 🎯 Verificar si un flag puede ser activado
export function canActivateFlag(
  flagKey: string,
  allFlags: FeatureFlag[]
): boolean {
  const metadata = FEATURE_FLAG_METADATA[flagKey];

  if (!metadata || metadata.dependencies.length === 0) {
    return true; // Sin dependencias
  }

  // Verificar que todas las dependencias estén activas
  return metadata.dependencies.every((dep) =>
    allFlags.find((f) => f.key === dep && f.enabled)
  );
}
```

#### 3. **UI de Dependencias en el Admin**

```typescript
// src/features/admin/feature-flags/ui/components/DependencyGraph.tsx
"use client";

import { FEATURE_FLAG_METADATA } from "../../config/metadata";

export function DependencyGraph({ flags }: { flags: FeatureFlag[] }) {
  const dependencyNodes = Object.entries(FEATURE_FLAG_METADATA).map(
    ([key, metadata]) => ({
      id: key,
      label: metadata.name,
      category: metadata.category,
      dependencies: metadata.dependencies,
      enabled: flags.find((f) => f.key === key)?.enabled || false,
    })
  );

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔗 Grafo de Dependencias</h3>

      <div className="space-y-3">
        {dependencyNodes.map((node) => (
          <div
            key={node.id}
            className={`
              p-3 rounded border-l-4
              ${
                node.enabled
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 bg-white"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{node.label}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({node.category})
                </span>
              </div>

              <span
                className={`
                px-2 py-1 text-xs rounded
                ${
                  node.enabled
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              `}
              >
                {node.enabled ? "✅ Activo" : "❌ Inactivo"}
              </span>
            </div>

            {/* Mostrar dependencias */}
            {node.dependencies.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <span>🔗 Depende de: </span>
                {node.dependencies.map((dep) => {
                  const depEnabled = flags.find((f) => f.key === dep)?.enabled;
                  return (
                    <span
                      key={dep}
                      className={`
                        inline-block px-2 py-1 rounded mr-1 text-xs
                        ${
                          depEnabled
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }
                      `}
                    >
                      {dep} {depEnabled ? "✅" : "❌"}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 4. **Server Actions con Validación**

```typescript
// src/features/admin/feature-flags/server/actions/index.ts
"use server";

import { validateFeatureFlagDependencies } from "../../utils/dependency-validator";
import { revalidateTag } from "next/cache";

export async function toggleFeatureFlagServerAction(formData: FormData) {
  try {
    const flagKey = formData.get("flagKey") as string;
    const newState = formData.get("enabled") === "true";

    // 🛡️ Validar dependencias ANTES de cambiar en DB
    const allFlags = await getAllFeatureFlagsFromDatabase();
    const validation = validateFeatureFlagDependencies(
      flagKey,
      newState,
      allFlags
    );

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        dependents: validation.dependents,
        missingDependencies: validation.missingDependencies,
      };
    }

    // ✅ Dependencias validadas, proceder con cambio
    await updateFeatureFlagInDatabase(flagKey, newState);

    // 🔄 Invalidar cache y revalidar
    revalidateTag("feature-flags");

    return { success: true };
  } catch (error) {
    console.error("Error toggling feature flag:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}
```

### 🎨 Casos de Uso Prácticos

#### **Ejemplo 1: Dark Mode + New Dashboard**

```typescript
// metadata.ts
export const FEATURE_FLAG_METADATA = {
  darkMode: {
    name: "Dark Mode",
    description: "Modo oscuro para toda la aplicación",
    dependencies: [], // No depende de otros
  },

  newDashboard: {
    name: "Nuevo Dashboard",
    description: "Dashboard rediseñado con soporte para dark mode",
    dependencies: ["darkMode"], // Solo si dark mode está activo
  },
};

// Componente que usa ambos
function Dashboard() {
  const darkModeEnabled = useIsEnabled("darkMode");
  const newDashboardEnabled = useIsEnabled("newDashboard");

  // ✅ Validación automática de dependencias
  if (newDashboardEnabled && darkModeEnabled) {
    return <NewDashboard />;
  }

  if (darkModeEnabled) {
    return <OldDashboard />;
  }

  return <BasicDashboard />;
}
```

#### **Ejemplo 2: Módulo Completo con Dependencias**

```typescript
// metadata.ts
export const FEATURE_FLAG_METADATA = {
  fileUpload: {
    name: "File Upload",
    description: "Sistema básico de subida de archivos",
    dependencies: [],
  },

  fileUploadAdvanced: {
    name: "File Upload Avanzado",
    description: "Drag & drop, preview, compresión",
    dependencies: ["fileUpload"], // Requiere fileUpload básico
  },

  fileUploadAnalytics: {
    name: "Analytics de File Upload",
    description: "Tracking de uso y métricas",
    dependencies: ["fileUpload"], // Requiere fileUpload básico
  },

  fileUploadEnterprise: {
    name: "File Upload Enterprise",
    description: "S3, permisos avanzados, auditoría",
    dependencies: ["fileUpload", "fileUploadAdvanced"], // Requiere ambos
  },
};
```

---

## 🎛️ Admin UI con Sistema de Dependencias

### 🏗️ Estructura del Admin UI

```
📁 features/admin/feature-flags/
├── 🧠 config/
│   ├── metadata.ts              → Definición de flags + dependencias
│   ├── categories.ts            → Categorías y organización
│   └── constants.ts             → Constantes del sistema
├── 🪝 ui/
│   ├── components/
│   │   ├── FeatureFlagCard.tsx  → Card individual con validación
│   │   ├── DependencyGraph.tsx  → Visualización de dependencias
│   │   ├── FlagToggle.tsx       → Toggle con validación
│   │   └── FlagForm.tsx         → Formulario de creación/edición
│   └── routes/
│       └── index.screen.tsx     → Pantalla principal del admin
├── 🛡️ utils/
│   ├── dependency-validator.ts  → Validación de dependencias
│   ├── flag-helpers.ts          → Helpers para flags
│   └── analytics.ts             → Tracking de cambios
└── 🚀 server/
    ├── actions/
    │   └── index.ts             → Server Actions con validación
    └── queries/
        └── index.ts             → Queries para obtener flags
```

### 🔧 Implementación Paso a Paso

#### 1. **Configuración de Metadata**

```typescript
// src/features/admin/feature-flags/config/metadata.ts
export interface FeatureFlagMetadata {
  name: string;
  description: string;
  icon: string;
  category: keyof typeof FEATURE_FLAG_CATEGORIES;
  premium: boolean;
  dependencies: string[];
  rolloutStrategy: keyof typeof ROLLOUT_STRATEGIES;
  analytics: AnalyticsConfig;
  createdAt: string;
  updatedAt: string;
}

export const FEATURE_FLAG_METADATA: Record<string, FeatureFlagMetadata> = {
  // 🎨 UI Features
  darkMode: {
    name: "Dark Mode",
    description:
      "Modo oscuro para toda la aplicación con soporte para preferencias del sistema",
    icon: "🌙",
    category: "ui",
    premium: false,
    dependencies: [],
    rolloutStrategy: "percentage",
    analytics: {
      trackImpressions: true,
      trackConversions: true,
      conversionGoal: "theme_preference",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },

  // 🔥 Core Features
  newDashboard: {
    name: "Nuevo Dashboard",
    description: "Dashboard rediseñado con React 19 y soporte para dark mode",
    icon: "📊",
    category: "core",
    premium: true,
    dependencies: ["darkMode"],
    rolloutStrategy: "ab-testing",
    analytics: {
      trackImpressions: true,
      trackConversions: true,
      conversionGoal: "dashboard_engagement",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },

  // 🧩 Module Features
  fileUpload: {
    name: "File Upload",
    description: "Sistema básico de subida de archivos con drag & drop",
    icon: "📁",
    category: "modules",
    premium: false,
    dependencies: [],
    rolloutStrategy: "percentage",
    analytics: {
      trackImpressions: false,
      trackConversions: true,
      conversionGoal: "file_upload_success",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },

  fileUploadAdvanced: {
    name: "File Upload Avanzado",
    description: "Funcionalidades premium: compresión, preview, validación",
    icon: "🚀",
    category: "modules",
    premium: true,
    dependencies: ["fileUpload"],
    rolloutStrategy: "user-segments",
    analytics: {
      trackImpressions: true,
      trackConversions: true,
      conversionGoal: "premium_feature_usage",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },

  // 🧪 Experimental Features
  aiAssistant: {
    name: "AI Assistant",
    description: "Asistente de IA para ayudar con tareas comunes",
    icon: "🤖",
    category: "experimental",
    premium: true,
    dependencies: ["newDashboard"], // Solo en el nuevo dashboard
    rolloutStrategy: "gradual",
    analytics: {
      trackImpressions: true,
      trackConversions: true,
      conversionGoal: "ai_interaction",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
};

// 🎯 Categorías para organización
export const FEATURE_FLAG_CATEGORIES = {
  ui: "🎨 Interfaz de Usuario",
  core: "🔥 Funcionalidades Core",
  modules: "🧩 Módulos del Sistema",
  experimental: "🧪 Funcionalidades Experimentales",
  premium: "💎 Funcionalidades Premium",
  analytics: "📊 Analytics y Tracking",
} as const;

// 📈 Estrategias de rollout
export const ROLLOUT_STRATEGIES = {
  percentage: "Porcentaje de usuarios",
  "ab-testing": "A/B Testing",
  "user-segments": "Segmentos específicos",
  gradual: "Rollout gradual",
  "feature-gate": "Feature Gate (solo para usuarios específicos)",
} as const;
```

#### 2. **Validación de Dependencias**

```typescript
// src/features/admin/feature-flags/utils/dependency-validator.ts
import { FEATURE_FLAG_METADATA } from "../config/metadata";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  dependents?: string[];
  missingDependencies?: string[];
  warnings?: string[];
}

export interface DependencyNode {
  key: string;
  name: string;
  enabled: boolean;
  dependencies: string[];
  dependents: string[];
}

export class DependencyValidator {
  private dependencyGraph: Map<string, DependencyNode> = new Map();

  constructor(private allFlags: FeatureFlag[]) {
    this.buildDependencyGraph();
  }

  private buildDependencyGraph() {
    // Construir grafo de dependencias
    for (const [key, metadata] of Object.entries(FEATURE_FLAG_METADATA)) {
      const flag = this.allFlags.find((f) => f.key === key);

      this.dependencyGraph.set(key, {
        key,
        name: metadata.name,
        enabled: flag?.enabled || false,
        dependencies: metadata.dependencies,
        dependents: [],
      });
    }

    // Calcular dependientes
    for (const [key, node] of this.dependencyGraph) {
      for (const dep of node.dependencies) {
        const dependentNode = this.dependencyGraph.get(dep);
        if (dependentNode) {
          dependentNode.dependents.push(key);
        }
      }
    }
  }

  validateToggle(flagKey: string, newState: boolean): ValidationResult {
    const node = this.dependencyGraph.get(flagKey);
    if (!node) {
      return { valid: false, error: "Flag no encontrado" };
    }

    // 🚫 Si se está desactivando, verificar dependientes
    if (!newState) {
      const enabledDependents = node.dependents.filter(
        (dep) => this.dependencyGraph.get(dep)?.enabled
      );

      if (enabledDependents.length > 0) {
        const dependentNames = enabledDependents.map(
          (dep) => this.dependencyGraph.get(dep)?.name || dep
        );

        return {
          valid: false,
          error: `No se puede desactivar: ${dependentNames.join(
            ", "
          )} dependen de este flag`,
          dependents: enabledDependents,
        };
      }
    }

    // ✅ Si se está activando, verificar que las dependencias estén activas
    if (newState && node.dependencies.length > 0) {
      const missingDeps = node.dependencies.filter(
        (dep) => !this.dependencyGraph.get(dep)?.enabled
      );

      if (missingDeps.length > 0) {
        const missingNames = missingDeps.map(
          (dep) => this.dependencyGraph.get(dep)?.name || dep
        );

        return {
          valid: false,
          error: `Dependencias faltantes: ${missingNames.join(", ")}`,
          missingDependencies: missingDeps,
        };
      }
    }

    // ⚠️ Advertencias sobre impacto
    const warnings: string[] = [];

    if (newState && node.dependents.length > 0) {
      const disabledDependents = node.dependents.filter(
        (dep) => !this.dependencyGraph.get(dep)?.enabled
      );

      if (disabledDependents.length > 0) {
        warnings.push(
          `Al activar este flag, también podrías activar: ${disabledDependents.join(
            ", "
          )}`
        );
      }
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // 🔍 Encontrar flags que dependen de uno específico
  findDependentFlags(flagKey: string): string[] {
    const node = this.dependencyGraph.get(flagKey);
    return node?.dependents || [];
  }

  // 🎯 Verificar si un flag puede ser activado
  canActivateFlag(flagKey: string): boolean {
    const node = this.dependencyGraph.get(flagKey);
    if (!node || node.dependencies.length === 0) {
      return true; // Sin dependencias
    }

    return node.dependencies.every(
      (dep) => this.dependencyGraph.get(dep)?.enabled
    );
  }

  // 📊 Obtener estadísticas del grafo
  getGraphStats() {
    const totalFlags = this.dependencyGraph.size;
    const enabledFlags = Array.from(this.dependencyGraph.values()).filter(
      (node) => node.enabled
    ).length;
    const flagsWithDependencies = Array.from(
      this.dependencyGraph.values()
    ).filter((node) => node.dependencies.length > 0).length;
    const flagsWithDependents = Array.from(
      this.dependencyGraph.values()
    ).filter((node) => node.dependents.length > 0).length;

    return {
      totalFlags,
      enabledFlags,
      disabledFlags: totalFlags - enabledFlags,
      flagsWithDependencies,
      flagsWithDependents,
      dependencyChains: this.findDependencyChains(),
    };
  }

  // 🔗 Encontrar cadenas de dependencias
  private findDependencyChains(): string[][] {
    const chains: string[][] = [];
    const visited = new Set<string>();

    for (const [key, node] of this.dependencyGraph) {
      if (!visited.has(key)) {
        const chain = this.dfs(key, visited);
        if (chain.length > 1) {
          chains.push(chain);
        }
      }
    }

    return chains;
  }

  private dfs(key: string, visited: Set<string>): string[] {
    visited.add(key);
    const node = this.dependencyGraph.get(key);
    if (!node) return [key];

    const chain = [key];
    for (const dep of node.dependencies) {
      if (!visited.has(dep)) {
        chain.push(...this.dfs(dep, visited));
      }
    }

    return chain;
  }
}
```

#### 3. **Componente FeatureFlagCard con Dependencias**

```typescript
// src/features/admin/feature-flags/ui/components/FeatureFlagCard.tsx
"use client";

import React, { useState } from "react";
import { Switch } from "@/shared/ui/components/Switch";
import { Badge } from "@/shared/ui/components/Badge";
import { Button } from "@/shared/ui/components/Button";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { validateFeatureFlagDependencies } from "../../utils/dependency-validator";
import { useFeatureFlagsServer } from "@/shared/hooks/useFeatureFlagsServerActions";

interface FeatureFlagCardProps {
  flag: FeatureFlag;
  allFlags: FeatureFlag[];
  onToggle: (flagKey: string, newState: boolean) => Promise<void>;
}

export function FeatureFlagCard({
  flag,
  allFlags,
  onToggle,
}: FeatureFlagCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toggleFlag } = useFeatureFlagsServer();

  const metadata = FEATURE_FLAG_METADATA[flag.key];
  if (!metadata) return null;

  const handleToggle = async (newState: boolean) => {
    // 🛡️ Validar dependencias ANTES de cambiar
    const validator = new DependencyValidator(allFlags);
    const validation = validator.validateToggle(flag.key, newState);

    if (!validation.valid) {
      // Mostrar error y NO permitir cambio
      toast.error(validation.error);
      return;
    }

    // ⚠️ Mostrar advertencias si las hay
    if (validation.warnings) {
      const confirmed = window.confirm(
        `⚠️ Advertencias:\n${validation.warnings.join("\n")}\n\n¿Continuar?`
      );
      if (!confirmed) return;
    }

    // ✅ Dependencias validadas, proceder con toggle
    startTransition(async () => {
      await toggleFlag(flag.key, newState);
      await onToggle(flag.key, newState);
    });
  };

  const canToggle = () => {
    const validator = new DependencyValidator(allFlags);
    return validator.canActivateFlag(flag.key);
  };

  return (
    <div
      className={`
      p-4 border rounded-lg transition-all duration-200
      ${
        flag.enabled
          ? "border-green-200 bg-green-50"
          : "border-gray-200 bg-white"
      }
      ${!canToggle() && "opacity-60"}
    `}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{metadata.icon}</span>

          <div>
            <h3 className="font-semibold text-gray-900">{metadata.name}</h3>
            <p className="text-sm text-gray-600">{metadata.description}</p>

            {/* Categoría y Premium */}
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" size="sm">
                {FEATURE_FLAG_CATEGORIES[metadata.category]}
              </Badge>

              {metadata.premium && (
                <Badge variant="premium" size="sm">
                  💎 Premium
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center space-x-3">
          <Switch
            checked={flag.enabled}
            onCheckedChange={handleToggle}
            disabled={isPending || !canToggle()}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </Button>
        </div>
      </div>

      {/* Dependencias (si las hay) */}
      {metadata.dependencies.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center space-x-2 text-sm text-blue-800">
            <Info size={16} />
            <span className="font-medium">Dependencias:</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {metadata.dependencies.map((dep) => {
              const depFlag = allFlags.find((f) => f.key === dep);
              const depMetadata = FEATURE_FLAG_METADATA[dep];
              const isDepEnabled = depFlag?.enabled;

              return (
                <Badge
                  key={dep}
                  variant={isDepEnabled ? "success" : "destructive"}
                  size="sm"
                >
                  {depMetadata?.icon} {depMetadata?.name}
                  {isDepEnabled ? " ✅" : " ❌"}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Estado del Flag */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span
            className={`
            flex items-center space-x-1
            ${flag.enabled ? "text-green-700" : "text-gray-500"}
          `}
          >
            {flag.enabled ? <CheckCircle size={16} /> : <XCircle size={16} />}
            <span>{flag.enabled ? "Activo" : "Inactivo"}</span>
          </span>

          {flag.rollout_percentage > 0 && (
            <span className="text-blue-600">
              📊 {flag.rollout_percentage}% de usuarios
            </span>
          )}
        </div>

        <span className="text-gray-500">
          Última actualización: {new Date(flag.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Contenido Expandible */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Estrategia:</span>
              <span className="ml-2 text-gray-600">
                {ROLLOUT_STRATEGIES[metadata.rolloutStrategy]}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">Analytics:</span>
              <span className="ml-2 text-gray-600">
                {metadata.analytics.trackImpressions
                  ? "Impresiones ✅"
                  : "Impresiones ❌"}
                {metadata.analytics.trackConversions
                  ? " | Conversiones ✅"
                  : " | Conversiones ❌"}
              </span>
            </div>

            {metadata.analytics.conversionGoal && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">
                  Meta de conversión:
                </span>
                <span className="ml-2 text-gray-600">
                  {metadata.analytics.conversionGoal}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🎛️ Implementación Práctica del Admin UI

### 🏗️ Pantalla Principal del Admin

```typescript
// src/features/admin/feature-flags/ui/routes/index.screen.tsx
"use client";

import React, { useState, useEffect } from "react";
import { FeatureFlagCard } from "../components/FeatureFlagCard";
import { DependencyGraph } from "../components/DependencyGraph";
import { FlagStats } from "../components/FlagStats";
import { FlagFilters } from "../components/FlagFilters";
import { useFeatureFlagsServer } from "@/shared/hooks/useFeatureFlagsServerActions";
import { FEATURE_FLAG_CATEGORIES } from "../../config/metadata";

export default function FeatureFlagsAdminScreen() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [filteredFlags, setFilteredFlags] = useState<FeatureFlag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDependencies, setShowDependencies] = useState(false);

  const { getAllFlags, toggleFlag, isPending } = useFeatureFlagsServer();

  // Cargar flags al montar
  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      const allFlags = await getAllFlags();
      setFlags(allFlags);
      setFilteredFlags(allFlags);
    } catch (error) {
      console.error("Error loading flags:", error);
    }
  };

  // Filtrar flags por categoría y búsqueda
  useEffect(() => {
    let filtered = flags;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((flag) => {
        const metadata = FEATURE_FLAG_METADATA[flag.key];
        return metadata?.category === selectedCategory;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((flag) => {
        const metadata = FEATURE_FLAG_METADATA[flag.key];
        return (
          flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          metadata?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          metadata?.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      });
    }

    setFilteredFlags(filtered);
  }, [flags, selectedCategory, searchQuery]);

  const handleToggle = async (flagKey: string, newState: boolean) => {
    try {
      await toggleFlag(flagKey, newState);
      await loadFlags(); // Recargar para obtener estado actualizado
    } catch (error) {
      console.error("Error toggling flag:", error);
    }
  };

  const stats = {
    total: flags.length,
    enabled: flags.filter((f) => f.enabled).length,
    disabled: flags.filter((f) => !f.enabled).length,
    premium: flags.filter((f) => {
      const metadata = FEATURE_FLAG_METADATA[f.key];
      return metadata?.premium;
    }).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎛️ Feature Flags</h1>
          <p className="text-gray-600 mt-2">
            Gestiona funcionalidades y experimentos de la aplicación
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowDependencies(!showDependencies)}
            className={`
              px-4 py-2 rounded-lg border transition-colors
              ${
                showDependencies
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            {showDependencies
              ? "🔗 Ocultar Dependencias"
              : "🔗 Mostrar Dependencias"}
          </button>

          <button
            onClick={loadFlags}
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            🔄 Recargar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <FlagStats stats={stats} />

      {/* Filtros */}
      <FlagFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Grafo de Dependencias */}
      {showDependencies && <DependencyGraph flags={flags} />}

      {/* Lista de Flags */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Flags ({filteredFlags.length})
        </h2>

        {filteredFlags.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No se encontraron flags que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredFlags.map((flag) => (
              <FeatureFlagCard
                key={flag.key}
                flag={flag}
                allFlags={flags}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 🔧 Componentes de Soporte

#### 1. **Filtros y Búsqueda**

```typescript
// src/features/admin/feature-flags/ui/components/FlagFilters.tsx
"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { FEATURE_FLAG_CATEGORIES } from "../../config/metadata";

interface FlagFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FlagFilters({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: FlagFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <h3 className="font-medium text-gray-900 flex items-center space-x-2">
        <Filter size={20} />
        <span>Filtros</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar flags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Categoría */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            {Object.entries(FEATURE_FLAG_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
```

#### 2. **Estadísticas del Sistema**

```typescript
// src/features/admin/feature-flags/ui/components/FlagStats.tsx
"use client";

import React from "react";
import {
  CheckCircle,
  XCircle,
  Crown,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";

interface FlagStatsProps {
  stats: {
    total: number;
    enabled: number;
    disabled: number;
    premium: number;
  };
}

export function FlagStats({ stats }: FlagStatsProps) {
  const enabledPercentage =
    stats.total > 0 ? Math.round((stats.enabled / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Flags</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Habilitados */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Habilitados</p>
            <p className="text-2xl font-bold text-green-600">{stats.enabled}</p>
            <p className="text-xs text-gray-500">
              {enabledPercentage}% del total
            </p>
          </div>
        </div>
      </div>

      {/* Deshabilitados */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <XCircle className="text-red-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Deshabilitados</p>
            <p className="text-2xl font-bold text-red-600">{stats.disabled}</p>
            <p className="text-xs text-gray-500">
              {100 - enabledPercentage}% del total
            </p>
          </div>
        </div>
      </div>

      {/* Premium */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Crown className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Premium</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.premium}
            </p>
            <p className="text-xs text-gray-500">
              {stats.total > 0
                ? Math.round((stats.premium / stats.total) * 100)
                : 0}
              % del total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 3. **Formulario de Creación/Edición**

```typescript
// src/features/admin/feature-flags/ui/components/FlagForm.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui/components/Button";
import { Input } from "@/shared/ui/components/Input";
import { Textarea } from "@/shared/ui/components/Textarea";
import { Select } from "@/shared/ui/components/Select";
import { Switch } from "@/shared/ui/components/Switch";
import {
  FEATURE_FLAG_CATEGORIES,
  ROLLOUT_STRATEGIES,
} from "../../config/metadata";

interface FlagFormProps {
  flag?: FeatureFlag;
  onSave: (flagData: Partial<FeatureFlag>) => Promise<void>;
  onCancel: () => void;
}

export function FlagForm({ flag, onSave, onCancel }: FlagFormProps) {
  const [formData, setFormData] = useState({
    key: flag?.key || "",
    name: flag?.name || "",
    description: flag?.description || "",
    category: flag?.category || "ui",
    premium: flag?.premium || false,
    rollout_percentage: flag?.rollout_percentage || 0,
    rollout_strategy: flag?.rollout_strategy || "percentage",
    dependencies: flag?.dependencies || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving flag:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key del Flag *
          </label>
          <Input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            placeholder="darkMode"
            required
            disabled={!!flag} // No permitir cambiar key en flags existentes
          />
          <p className="text-xs text-gray-500 mt-1">
            Identificador único del flag (no se puede cambiar)
          </p>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Dark Mode"
            required
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe qué hace este feature flag..."
            rows={3}
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            {Object.entries(FEATURE_FLAG_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {/* Estrategia de Rollout */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estrategia de Rollout
          </label>
          <Select
            value={formData.rollout_strategy}
            onValueChange={(value) =>
              setFormData({ ...formData, rollout_strategy: value })
            }
          >
            {Object.entries(ROLLOUT_STRATEGIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {/* Porcentaje de Rollout */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Porcentaje de Usuarios
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            value={formData.rollout_percentage}
            onChange={(e) =>
              setFormData({
                ...formData,
                rollout_percentage: parseInt(e.target.value) || 0,
              })
            }
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            0-100% de usuarios verán este flag
          </p>
        </div>

        {/* Premium */}
        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.premium}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, premium: checked })
            }
          />
          <div>
            <label className="text-sm font-medium text-gray-700">
              Funcionalidad Premium
            </label>
            <p className="text-xs text-gray-500">
              Solo para usuarios con plan premium
            </p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Guardando..." : "Guardar Flag"}
        </Button>
      </div>
    </form>
  );
}
```

### 🚀 Server Actions con Validación Completa

```typescript
// src/features/admin/feature-flags/server/actions/index.ts
"use server";

import { revalidateTag } from "next/cache";
import { DependencyValidator } from "../../utils/dependency-validator";
import {
  getAllFeatureFlagsFromDatabase,
  updateFeatureFlagInDatabase,
  createFeatureFlagInDatabase,
  deleteFeatureFlagFromDatabase,
} from "../queries";
import { FEATURE_FLAG_METADATA } from "../../config/metadata";

// Toggle con validación completa
export async function toggleFeatureFlagServerAction(formData: FormData) {
  try {
    const flagKey = formData.get("flagKey") as string;
    const newState = formData.get("enabled") === "true";

    // 🛡️ Validar dependencias ANTES de cambiar en DB
    const allFlags = await getAllFeatureFlagsFromDatabase();
    const validator = new DependencyValidator(allFlags);
    const validation = validator.validateToggle(flagKey, newState);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        dependents: validation.dependents,
        missingDependencies: validation.missingDependencies,
      };
    }

    // ⚠️ Mostrar advertencias si las hay
    if (validation.warnings) {
      // En un sistema real, podrías loguear estas advertencias
      console.warn("Feature flag toggle warnings:", validation.warnings);
    }

    // ✅ Dependencias validadas, proceder con cambio
    await updateFeatureFlagInDatabase(flagKey, newState);

    // 🔄 Invalidar cache y revalidar
    revalidateTag("feature-flags");

    return {
      success: true,
      warnings: validation.warnings,
    };
  } catch (error) {
    console.error("Error toggling feature flag:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

// Crear nuevo flag
export async function createFeatureFlagServerAction(formData: FormData) {
  try {
    const flagData = {
      key: formData.get("key") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      premium: formData.get("premium") === "true",
      rollout_percentage:
        parseInt(formData.get("rollout_percentage") as string) || 0,
      rollout_strategy: formData.get("rollout_strategy") as string,
      enabled: false, // Siempre empezar desactivado
    };

    // Validar que el key no exista
    const existingFlags = await getAllFeatureFlagsFromDatabase();
    if (existingFlags.find((f) => f.key === flagData.key)) {
      return {
        success: false,
        error: "Ya existe un flag con ese key",
      };
    }

    // Crear en base de datos
    await createFeatureFlagInDatabase(flagData);

    // 🔄 Invalidar cache
    revalidateTag("feature-flags");

    return { success: true };
  } catch (error) {
    console.error("Error creating feature flag:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

// Actualizar flag existente
export async function updateFeatureFlagServerAction(formData: FormData) {
  try {
    const flagKey = formData.get("flagKey") as string;
    const updates = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      premium: formData.get("premium") === "true",
      rollout_percentage:
        parseInt(formData.get("rollout_percentage") as string) || 0,
      rollout_strategy: formData.get("rollout_strategy") as string,
    };

    // Actualizar en base de datos
    await updateFeatureFlagInDatabase(flagKey, updates);

    // 🔄 Invalidar cache
    revalidateTag("feature-flags");

    return { success: true };
  } catch (error) {
    console.error("Error updating feature flag:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

// Eliminar flag (con validación de dependencias)
export async function deleteFeatureFlagServerAction(formData: FormData) {
  try {
    const flagKey = formData.get("flagKey") as string;

    // 🛡️ Verificar que no haya dependientes activos
    const allFlags = await getAllFeatureFlagsFromDatabase();
    const validator = new DependencyValidator(allFlags);
    const dependents = validator.findDependentFlags(flagKey);

    if (dependents.length > 0) {
      const dependentNames = dependents.map((dep) => {
        const metadata = FEATURE_FLAG_METADATA[dep];
        return metadata?.name || dep;
      });

      return {
        success: false,
        error: `No se puede eliminar: ${dependentNames.join(
          ", "
        )} dependen de este flag`,
        dependents,
      };
    }

    // ✅ Sin dependientes, proceder con eliminación
    await deleteFeatureFlagFromDatabase(flagKey);

    // 🔄 Invalidar cache
    revalidateTag("feature-flags");

    return { success: true };
  } catch (error) {
    console.error("Error deleting feature flag:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

// Bulk operations
export async function bulkToggleFeatureFlagsServerAction(formData: FormData) {
  try {
    const flagKeys = JSON.parse(formData.get("flagKeys") as string) as string[];
    const newState = formData.get("enabled") === "true";

    const allFlags = await getAllFeatureFlagsFromDatabase();
    const validator = new DependencyValidator(allFlags);

    const results: Array<{ key: string; success: boolean; error?: string }> =
      [];

    // Validar cada flag individualmente
    for (const flagKey of flagKeys) {
      const validation = validator.validateToggle(flagKey, newState);

      if (validation.valid) {
        try {
          await updateFeatureFlagInDatabase(flagKey, { enabled: newState });
          results.push({ key: flagKey, success: true });
        } catch (error) {
          results.push({
            key: flagKey,
            success: false,
            error: "Error de base de datos",
          });
        }
      } else {
        results.push({ key: flagKey, success: false, error: validation.error });
      }
    }

    // 🔄 Invalidar cache
    revalidateTag("feature-flags");

    return {
      success: true,
      results,
      summary: {
        total: flagKeys.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    };
  } catch (error) {
    console.error("Error in bulk toggle:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}
```

### 📊 Analytics y Tracking

```typescript
// src/features/admin/feature-flags/utils/analytics.ts
import { FEATURE_FLAG_METADATA } from "../config/metadata";

export interface FlagAnalytics {
  flagKey: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  lastUpdated: string;
}

export class FeatureFlagAnalytics {
  // Registrar impresión de flag
  static async trackImpression(flagKey: string, context: any = {}) {
    const metadata = FEATURE_FLAG_METADATA[flagKey];

    if (!metadata?.analytics?.trackImpressions) {
      return; // No tracking configurado
    }

    try {
      // En un sistema real, enviarías esto a tu servicio de analytics
      await fetch("/api/analytics/feature-flag-impression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flag: flagKey,
          category: metadata.category,
          timestamp: new Date().toISOString(),
          context,
        }),
      });
    } catch (error) {
      console.warn("Failed to track feature flag impression:", error);
    }
  }

  // Registrar conversión de flag
  static async trackConversion(
    flagKey: string,
    goal: string,
    context: any = {}
  ) {
    const metadata = FEATURE_FLAG_METADATA[flagKey];

    if (!metadata?.analytics?.trackConversions) {
      return; // No tracking configurado
    }

    try {
      await fetch("/api/analytics/feature-flag-conversion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flag: flagKey,
          goal,
          category: metadata.category,
          timestamp: new Date().toISOString(),
          context,
        }),
      });
    } catch (error) {
      console.warn("Failed to track feature flag conversion:", error);
    }
  }

  // Obtener analytics de un flag
  static async getFlagAnalytics(
    flagKey: string
  ): Promise<FlagAnalytics | null> {
    try {
      const response = await fetch(`/api/analytics/feature-flags/${flagKey}`);

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.warn("Failed to get flag analytics:", error);
      return null;
    }
  }

  // Obtener analytics de todos los flags
  static async getAllFlagsAnalytics(): Promise<FlagAnalytics[]> {
    try {
      const response = await fetch("/api/analytics/feature-flags");

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.warn("Failed to get all flags analytics:", error);
      return [];
    }
  }
}
```

---

## ➕ Agregar Nuevo Feature Flag

### 📋 Checklist Completo

#### 1. **📝 Definir el Flag**

```typescript
// src/core/config/feature-flags.ts
export const FEATURE_FLAGS = {
  // ... existing flags

  // 🆕 Nuevo flag
  notificationsPush: process.env.FEATURE_PUSH_NOTIFICATIONS === "true",
} as const;
```

#### 2. **🗄️ Agregar a Base de Datos**

```sql
INSERT INTO feature_flags (
  key, name, description, enabled, category, version, rollout_percentage
) VALUES (
  'notificationsPush',
  'Push Notifications',
  'Notificaciones push del navegador',
  false,
  'ui',
  '1.0.0',
  0  -- Empezar desactivado
);
```

#### 3. **🔧 Environment Variable**

```bash
# .env.local
FEATURE_PUSH_NOTIFICATIONS=false
```

#### 4. **🎨 Crear Componente**

```typescript
// src/features/notifications/PushNotificationSetup.tsx
"use client";

import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

export function PushNotificationSetup() {
  const pushEnabled = useIsEnabled("notificationsPush");

  if (!pushEnabled) {
    return null; // O mostrar mensaje de "próximamente"
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3>🔔 Push Notifications</h3>
      <button onClick={requestPermission}>Activar Notificaciones</button>
    </div>
  );
}
```

#### 5. **🛡️ Server-Side Guard**

```typescript
// src/app/api/notifications/subscribe/route.ts
import { isFeatureEnabled } from "@/core/config/server-feature-flags";

export async function POST(request: Request) {
  // 🛡️ Verificar flag antes de procesar
  const enabled = await isFeatureEnabled("notificationsPush");

  if (!enabled) {
    return NextResponse.json(
      { error: "Feature not available" },
      { status: 403 }
    );
  }

  // ... lógica de subscription
}
```

#### 6. **📱 Navigation Integration**

```typescript
// src/core/navigation/constants.ts
export const ADMIN_NAVIGATION_ITEMS: NavigationItem[] = [
  // ... otros items
  {
    id: "notifications",
    label: "Notificaciones",
    href: "/dashboard/notifications",
    icon: Bell,
    requiredFeatureFlag: "notificationsPush", // 🎯 Flag requerido
  },
];
```

---

## 🎪 Casos de Uso Avanzados

### 🎲 A/B Testing

```typescript
// Server Component
async function ExperimentComponent({ userId }: { userId: string }) {
  const variant = await getExperimentVariant("homepage-hero", userId, [
    "control",
    "variant-a",
    "variant-b",
  ]);

  switch (variant) {
    case "variant-a":
      return <HeroVariantA />;
    case "variant-b":
      return <HeroVariantB />;
    default:
      return <HeroControl />;
  }
}
```

### 📊 Rollout Gradual

```sql
-- Activar para 25% de usuarios
UPDATE feature_flags
SET rollout_percentage = 25
WHERE key = 'newDashboard';

-- Incrementar gradualmente
UPDATE feature_flags
SET rollout_percentage = 50
WHERE key = 'newDashboard';
```

### 🌍 Feature por País

```typescript
// En middleware.ts
const flagContext = {
  userId: session.userId,
  country: request.geo?.country || "unknown",
};

// En server-feature-flags.ts - evaluateFeatureFlagsWithContext
if (flag.targetAudience?.length > 0) {
  shouldEnable = flag.targetAudience.includes(context.country || "unknown");
}
```

### 👑 Feature por Rol

```typescript
// Guard por rol
const isAdminFeatureEnabled = await isFeatureEnabled("adminAnalytics", {
  userRole: session.user.role,
});
```

---

## ✅ Best Practices

### 🎯 Naming Conventions

```typescript
// ✅ Buenos nombres
const FEATURE_FLAGS = {
  // Acción clara
  darkMode: true,
  pushNotifications: true,

  // Contexto específico
  adminDashboardV2: true,
  checkoutFlowOptimized: true,

  // Experimento temporal
  homepageExperimentA: true,
};

// ❌ Malos nombres
const FEATURE_FLAGS = {
  flag1: true, // No descriptivo
  test: true, // Muy genérico
  newThing: true, // Ambiguo
};
```

### 🔄 Lifecycle Management

```typescript
// 1. 🧪 Experimental (rollout: 0-25%)
experimentalChat: false,

// 2. 🚀 Beta (rollout: 25-75%)
betaChat: process.env.FEATURE_BETA_CHAT === "true",

// 3. ✅ Stable (rollout: 75-100%)
stableChat: true,

// 4. 🗑️ Deprecated (preparar para eliminación)
legacyChat: false, // TODO: Remove in v2.0
```

### 🛡️ Error Handling

```typescript
// ✅ Siempre tener fallback
function FeatureComponent() {
  try {
    const enabled = useIsEnabled("experimentalFeature");

    if (enabled) {
      return <ExperimentalComponent />;
    }
  } catch (error) {
    console.warn("Feature flag check failed:", error);
  }

  // 🛟 Fallback seguro
  return <StableComponent />;
}
```

### ⚡ Performance

```typescript
// ✅ Memoize flag checks
const MyComponent = React.memo(() => {
  const isEnabled = useIsEnabled();

  const features = useMemo(
    () => ({
      darkMode: isEnabled("darkMode"),
      notifications: isEnabled("notifications"),
      analytics: isEnabled("analytics"),
    }),
    [isEnabled]
  );

  return (
    <div>
      {features.darkMode && <ThemeToggle />}
      {features.notifications && <NotificationCenter />}
    </div>
  );
});
```

---

## 🔍 Troubleshooting

### ❌ Problemas Comunes

#### 1. **Flag no aparece en admin**

```bash
# Verificar en base de datos
SELECT * FROM feature_flags WHERE key = 'myFlag';

# Si no existe, insertar
INSERT INTO feature_flags (key, name, enabled) VALUES ('myFlag', 'My Flag', false);
```

#### 2. **Hydration mismatch**

```typescript
// ❌ Malo - puede causar mismatch
function Component() {
  const enabled = useIsEnabled("flag");
  return enabled ? <NewUI /> : <OldUI />;
}

// ✅ Bueno - hidration-safe
function Component() {
  const enabled = useIsEnabled("flag");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <Skeleton />;
  return enabled ? <NewUI /> : <OldUI />;
}
```

#### 3. **Cache no se invalida**

```typescript
// Invalidar cache manualmente
import { invalidateFeatureFlagsCache } from "@/core/config/server-feature-flags";

await invalidateFeatureFlagsCache();
```

### 🔧 Debug Helpers

```typescript
// En desarrollo - ver todos los flags
import { FeatureFlagsDebug } from "@/core/config/server-feature-flags";

// En Server Component
const debugInfo = await FeatureFlagsDebug.getAllWithMetadata({
  userId: "user-123",
  userRole: "admin",
});

console.log("Feature Flags Debug:", debugInfo);
```

---

## 🛠️ Implementación Completa del Admin UI

### 🎛️ Estructura del Directorio Admin UI

```
📁 features/admin/feature-flags/
├── 🧠 config/
│   ├── metadata.ts              → Definición de flags + dependencias
│   ├── categories.ts            → Categorías y organización
│   └── constants.ts             → Constantes del sistema
├── 🪝 hooks/
│   ├── useFeatureFlagAdmin.ts   → Hook principal del admin
│   ├── useDependencyGraph.ts    → Gestión del grafo
│   └── useFlagAnalytics.ts      → Analytics y métricas
├── 🎨 ui/
│   ├── components/
│   │   ├── FeatureFlagCard.tsx  → Card individual con validación
│   │   ├── DependencyGraph.tsx  → Visualización de dependencias
│   │   ├── FlagToggle.tsx       → Toggle con validación
│   │   ├── FlagForm.tsx         → Formulario de creación/edición
│   │   ├── FlagStats.tsx        → Estadísticas del sistema
│   │   ├── FlagFilters.tsx      → Filtros y búsqueda
│   │   └── BulkActions.tsx      → Acciones masivas
│   └── routes/
│       ├── index.screen.tsx     → Pantalla principal
│       ├── create.screen.tsx    → Crear nuevo flag
│       └── analytics.screen.tsx → Analytics y reportes
├── 🔧 utils/
│   ├── dependency-validator.ts  → Validación de dependencias
│   ├── flag-analytics.ts        → Utilidades de analytics
│   └── bulk-operations.ts       → Operaciones masivas
└── 📊 server-actions/
    ├── flag-actions.ts          → CRUD de flags
    ├── bulk-actions.ts          → Acciones masivas
    └── analytics-actions.ts     → Server actions de analytics
```

### 🎯 Componente Principal del Admin

```typescript
// src/features/admin/feature-flags/ui/routes/index.screen.tsx
"use client";

import React, { useState, useEffect } from "react";
import { FeatureFlagCard } from "../components/FeatureFlagCard";
import { DependencyGraph } from "../components/DependencyGraph";
import { FlagStats } from "../components/FlagStats";
import { FlagFilters } from "../components/FlagFilters";
import { BulkActions } from "../components/BulkActions";
import { useFeatureFlagsServer } from "@/shared/hooks/useFeatureFlagsServerActions";
import {
  FEATURE_FLAG_CATEGORIES,
  FEATURE_FLAG_METADATA,
} from "../../config/metadata";

export default function FeatureFlagsAdminScreen() {
  const [flags, setFlags] = useState([]);
  const [filteredFlags, setFilteredFlags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDependencies, setShowDependencies] = useState(false);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);

  const { getAllFlags, toggleFlag, isPending } = useFeatureFlagsServer();

  // Cargar flags al montar
  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      const result = await getAllFlags();
      if (result?.flags) {
        setFlags(result.flags);
      }
    } catch (error) {
      console.error("Error loading flags:", error);
    }
  };

  // Filtrar flags por categoría y búsqueda
  useEffect(() => {
    let filtered = flags;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((flag) => {
        const metadata = FEATURE_FLAG_METADATA[flag.key];
        return metadata?.category === selectedCategory;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((flag) => {
        const metadata = FEATURE_FLAG_METADATA[flag.key];
        return (
          flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          metadata?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          metadata?.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      });
    }

    setFilteredFlags(filtered);
  }, [flags, selectedCategory, searchQuery]);

  const handleToggle = async (flagKey: string, newState: boolean) => {
    try {
      const result = await toggleFlag({ flagKey, enabled: newState });

      if (result?.success) {
        await loadFlags(); // Recargar para mostrar estado actualizado

        // Mostrar warnings si las hay
        if (result.warnings) {
          console.warn("Toggle warnings:", result.warnings);
          // Aquí podrías mostrar un toast con las advertencias
        }
      } else {
        console.error("Toggle failed:", result?.error);
        // Mostrar error al usuario
      }
    } catch (error) {
      console.error("Error toggling flag:", error);
    }
  };

  const handleBulkToggle = async (flagKeys: string[], enabled: boolean) => {
    try {
      // Implementar bulk toggle
      const promises = flagKeys.map((key) => handleToggle(key, enabled));
      await Promise.all(promises);
      setSelectedFlags([]); // Limpiar selección
    } catch (error) {
      console.error("Error in bulk toggle:", error);
    }
  };

  const stats = {
    total: flags.length,
    enabled: flags.filter((f) => f.enabled).length,
    disabled: flags.filter((f) => !f.enabled).length,
    premium: flags.filter((f) => {
      const metadata = FEATURE_FLAG_METADATA[f.key];
      return metadata?.premium;
    }).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Feature Flags Admin
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona y controla las funcionalidades de tu aplicación
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowDependencies(!showDependencies)}
            className={`
              px-4 py-2 rounded-lg border transition-colors
              ${
                showDependencies
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            {showDependencies
              ? "🔗 Ocultar Dependencias"
              : "🔗 Mostrar Dependencias"}
          </button>

          <button
            onClick={loadFlags}
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Cargando..." : "🔄 Actualizar"}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <FlagStats stats={stats} />

      {/* Filtros */}
      <FlagFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Acciones Masivas */}
      {selectedFlags.length > 0 && (
        <BulkActions
          selectedFlags={selectedFlags}
          onBulkToggle={handleBulkToggle}
          onClearSelection={() => setSelectedFlags([])}
        />
      )}

      {/* Grafo de Dependencias */}
      {showDependencies && <DependencyGraph flags={flags} />}

      {/* Lista de Flags */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Flags ({filteredFlags.length})
        </h2>

        {filteredFlags.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No se encontraron feature flags</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-blue-600 hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredFlags.map((flag) => (
              <FeatureFlagCard
                key={flag.key}
                flag={flag}
                metadata={FEATURE_FLAG_METADATA[flag.key]}
                onToggle={handleToggle}
                isSelected={selectedFlags.includes(flag.key)}
                onSelect={(selected) => {
                  if (selected) {
                    setSelectedFlags([...selectedFlags, flag.key]);
                  } else {
                    setSelectedFlags(
                      selectedFlags.filter((k) => k !== flag.key)
                    );
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 🔗 Visualización de Dependencias

```typescript
// src/features/admin/feature-flags/ui/components/DependencyGraph.tsx
"use client";

import React, { useMemo } from "react";
import { FEATURE_FLAG_METADATA } from "../../config/metadata";

interface DependencyGraphProps {
  flags: Array<{ key: string; enabled: boolean }>;
}

export function DependencyGraph({ flags }: DependencyGraphProps) {
  const dependencyMap = useMemo(() => {
    const map = new Map();

    // Construir mapa de dependencias
    Object.entries(FEATURE_FLAG_METADATA).forEach(([flagKey, metadata]) => {
      if (metadata.dependencies && metadata.dependencies.length > 0) {
        map.set(flagKey, metadata.dependencies);
      }
    });

    return map;
  }, []);

  const renderFlag = (flagKey: string, level = 0) => {
    const flag = flags.find((f) => f.key === flagKey);
    const metadata = FEATURE_FLAG_METADATA[flagKey];
    const dependencies = dependencyMap.get(flagKey) || [];

    if (!flag || !metadata) return null;

    return (
      <div key={flagKey} className={`ml-${level * 4}`}>
        <div
          className={`
          p-3 rounded-lg border mb-2 flex items-center justify-between
          ${
            flag.enabled
              ? "bg-green-50 border-green-200"
              : "bg-gray-50 border-gray-200"
          }
        `}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`
              w-3 h-3 rounded-full
              ${flag.enabled ? "bg-green-500" : "bg-gray-400"}
            `}
            />
            <div>
              <span className="font-medium">{metadata.name}</span>
              <span className="text-gray-500 ml-2">({flagKey})</span>
            </div>
          </div>

          {dependencies.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {dependencies.length} dependencia
              {dependencies.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Renderizar dependencias */}
        {dependencies.length > 0 && (
          <div className="ml-4 border-l-2 border-gray-200 pl-4">
            {dependencies.map((depKey) => renderFlag(depKey, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFlags = flags.filter((flag) => {
    // Flags que no son dependencias de otros
    return !Object.values(FEATURE_FLAG_METADATA).some((metadata) =>
      metadata.dependencies?.includes(flag.key)
    );
  });

  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          🔗 Grafo de Dependencias
        </h3>
        <span className="text-sm text-gray-500">
          {dependencyMap.size} flags con dependencias
        </span>
      </div>

      {dependencyMap.size === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay dependencias configuradas</p>
          <p className="text-sm mt-1">
            Configura dependencias en metadata.ts para verlas aquí
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rootFlags.map((flag) => renderFlag(flag.key))}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">
          💡 Cómo leer el grafo:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <strong>Verde:</strong> Flag habilitado
          </li>
          <li>
            • <strong>Gris:</strong> Flag deshabilitado
          </li>
          <li>
            • <strong>Indentado:</strong> Dependencia requerida
          </li>
          <li>
            • Para habilitar un flag, todas sus dependencias deben estar activas
          </li>
        </ul>
      </div>
    </div>
  );
}
```

### ⚡ Validación de Dependencias en Tiempo Real

```typescript
// src/features/admin/feature-flags/utils/dependency-validator.ts
import { FEATURE_FLAG_METADATA } from "../config/metadata";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
  affectedFlags?: string[];
}

export class DependencyValidator {
  private flags: Array<{ key: string; enabled: boolean }>;

  constructor(flags: Array<{ key: string; enabled: boolean }>) {
    this.flags = flags;
  }

  /**
   * Valida si un flag puede ser activado/desactivado
   */
  validateToggle(flagKey: string, newState: boolean): ValidationResult {
    const metadata = FEATURE_FLAG_METADATA[flagKey];

    if (!metadata) {
      return { valid: false, error: "Metadata no encontrada para el flag" };
    }

    if (newState) {
      // Validar dependencias para ACTIVAR
      return this.validateActivation(flagKey);
    } else {
      // Validar dependientes para DESACTIVAR
      return this.validateDeactivation(flagKey);
    }
  }

  /**
   * Valida si un flag puede ser activado (todas sus dependencias están activas)
   */
  private validateActivation(flagKey: string): ValidationResult {
    const metadata = FEATURE_FLAG_METADATA[flagKey];
    const dependencies = metadata.dependencies || [];

    if (dependencies.length === 0) {
      return { valid: true };
    }

    const inactiveDependencies = dependencies.filter((depKey) => {
      const depFlag = this.flags.find((f) => f.key === depKey);
      return !depFlag?.enabled;
    });

    if (inactiveDependencies.length > 0) {
      const depNames = inactiveDependencies.map((key) => {
        const depMetadata = FEATURE_FLAG_METADATA[key];
        return depMetadata?.name || key;
      });

      return {
        valid: false,
        error: `Dependencias inactivas: ${depNames.join(
          ", "
        )}. Actívalas primero.`,
        affectedFlags: inactiveDependencies,
      };
    }

    return { valid: true };
  }

  /**
   * Valida si un flag puede ser desactivado (ningún dependiente está activo)
   */
  private validateDeactivation(flagKey: string): ValidationResult {
    const dependentFlags = this.findDependentFlags(flagKey);
    const activeDependents = dependentFlags.filter((depKey) => {
      const depFlag = this.flags.find((f) => f.key === depKey);
      return depFlag?.enabled;
    });

    if (activeDependents.length > 0) {
      const depNames = activeDependents.map((key) => {
        const depMetadata = FEATURE_FLAG_METADATA[key];
        return depMetadata?.name || key;
      });

      return {
        valid: false,
        error: `Flags dependientes activos: ${depNames.join(
          ", "
        )}. Desactívalos primero.`,
        affectedFlags: activeDependents,
      };
    }

    return { valid: true };
  }

  /**
   * Encuentra todos los flags que dependen del flag dado
   */
  findDependentFlags(flagKey: string): string[] {
    return Object.entries(FEATURE_FLAG_METADATA)
      .filter(([_, metadata]) => metadata.dependencies?.includes(flagKey))
      .map(([key, _]) => key);
  }

  /**
   * Obtiene el orden de activación recomendado para un conjunto de flags
   */
  getActivationOrder(flagKeys: string[]): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (flagKey: string) => {
      if (visited.has(flagKey)) return;
      visited.add(flagKey);

      const metadata = FEATURE_FLAG_METADATA[flagKey];
      const dependencies = metadata?.dependencies || [];

      // Visitar dependencias primero
      dependencies.forEach((dep) => visit(dep));

      // Luego agregar el flag actual
      if (flagKeys.includes(flagKey)) {
        order.push(flagKey);
      }
    };

    flagKeys.forEach(visit);
    return order;
  }

  /**
   * Simula el impacto de activar/desactivar múltiples flags
   */
  simulateChanges(
    changes: Array<{ key: string; enabled: boolean }>
  ): ValidationResult {
    // Crear copia de flags con cambios aplicados
    const simulatedFlags = this.flags.map((flag) => {
      const change = changes.find((c) => c.key === flag.key);
      return change ? { ...flag, enabled: change.enabled } : flag;
    });

    const validator = new DependencyValidator(simulatedFlags);
    const warnings: string[] = [];

    // Validar cada cambio
    for (const change of changes) {
      const result = validator.validateToggle(change.key, change.enabled);
      if (!result.valid) {
        return result;
      }
      if (result.warnings) {
        warnings.push(...result.warnings);
      }
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
```

### 🎯 Casos de Uso Prácticos Completos

```typescript
// Ejemplo 1: Validación antes de toggle
const validator = new DependencyValidator(allFlags);

// ❌ Intentar activar newDashboard sin darkMode
const result = validator.validateToggle("newDashboard", true);
if (!result.valid) {
  console.error(result.error);
  // "Dependencias inactivas: Dark Mode. Actívala primero."
}

// ✅ Activar dependencias en orden correcto
const order = validator.getActivationOrder(["newDashboard", "darkMode"]);
console.log(order); // ["darkMode", "newDashboard"]

// Ejemplo 2: Bulk operations con validación
const changes = [
  { key: "darkMode", enabled: true },
  { key: "newDashboard", enabled: true },
  { key: "advancedFeatures", enabled: true },
];

const simulation = validator.simulateChanges(changes);
if (simulation.valid) {
  // Aplicar cambios en orden
  const order = validator.getActivationOrder(changes.map((c) => c.key));
  for (const flagKey of order) {
    await toggleFeatureFlag(flagKey, true);
  }
}
```

---

## 🚀 Mejores Prácticas y Patrones Avanzados

### 🎯 Patrones de Diseño Recomendados

#### 1. **Feature Flag Facade Pattern**

```typescript
// src/shared/utils/feature-facade.ts
export class FeatureFacade {
  static async canUseAdvancedFeatures(userId: string): Promise<boolean> {
    const hasBasicAccess = await isFeatureEnabled("basicFeatures");
    const hasPremium = await isFeatureEnabled("premiumFeatures");
    const userTier = await getUserTier(userId);

    return hasBasicAccess && (hasPremium || userTier === "enterprise");
  }

  static async getDashboardVariant(
    userId: string
  ): Promise<"classic" | "modern" | "premium"> {
    if (
      (await isFeatureEnabled("premiumDashboard")) &&
      (await isPremiumUser(userId))
    ) {
      return "premium";
    }
    if (await isFeatureEnabled("modernDashboard")) {
      return "modern";
    }
    return "classic";
  }
}
```

#### 2. **Feature Flag Strategy Pattern**

```typescript
// src/shared/strategies/rollout-strategies.ts
export interface RolloutStrategy {
  shouldEnable(context: { userId: string; [key: string]: any }): boolean;
}

export class PercentageRollout implements RolloutStrategy {
  constructor(private percentage: number) {}

  shouldEnable({ userId }: { userId: string }): boolean {
    const hash = createHash("md5").update(userId).digest("hex");
    const userNumber = parseInt(hash.substring(0, 8), 16);
    return userNumber % 100 < this.percentage;
  }
}

export class WhitelistRollout implements RolloutStrategy {
  constructor(private allowedUsers: string[]) {}

  shouldEnable({ userId }: { userId: string }): boolean {
    return this.allowedUsers.includes(userId);
  }
}

export class RegionRollout implements RolloutStrategy {
  constructor(private allowedRegions: string[]) {}

  shouldEnable({ region }: { region: string }): boolean {
    return this.allowedRegions.includes(region);
  }
}
```

#### 3. **Feature Flag Observer Pattern**

```typescript
// src/shared/observers/flag-observer.ts
export interface FlagObserver {
  onFlagChange(flagKey: string, oldValue: boolean, newValue: boolean): void;
}

export class AnalyticsObserver implements FlagObserver {
  onFlagChange(flagKey: string, oldValue: boolean, newValue: boolean): void {
    analytics.track("feature_flag_changed", {
      flag: flagKey,
      from: oldValue,
      to: newValue,
      timestamp: new Date().toISOString(),
    });
  }
}

export class CacheInvalidationObserver implements FlagObserver {
  onFlagChange(flagKey: string, oldValue: boolean, newValue: boolean): void {
    // Invalidar caches relacionados
    const relatedCacheKeys = this.getRelatedCacheKeys(flagKey);
    relatedCacheKeys.forEach((key) => cache.delete(key));
  }

  private getRelatedCacheKeys(flagKey: string): string[] {
    // Lógica para determinar qué caches invalidar
    return [`user_features_${flagKey}`, `dashboard_config_${flagKey}`];
  }
}
```

### 🛡️ Seguridad y Validaciones

#### 1. **Validación de Permisos**

```typescript
// src/features/admin/feature-flags/middleware/permissions.ts
export async function validateFlagPermissions(
  userId: string,
  flagKey: string,
  action: "read" | "write" | "delete"
): Promise<boolean> {
  const user = await getUserById(userId);
  const metadata = FEATURE_FLAG_METADATA[flagKey];

  // Validar rol mínimo
  if (!hasMinimumRole(user.role, metadata.minimumRole || "admin")) {
    return false;
  }

  // Validar permisos específicos del flag
  if (metadata.requiresSpecialPermission) {
    return await hasSpecialPermission(userId, flagKey, action);
  }

  // Validar flags premium
  if (metadata.premium && action === "write") {
    return await hasEnterpriseAccess(userId);
  }

  return true;
}
```

#### 2. **Auditoría y Logging**

```typescript
// src/features/admin/feature-flags/utils/audit-logger.ts
export class FlagAuditLogger {
  static async logFlagChange(
    flagKey: string,
    oldState: boolean,
    newState: boolean,
    userId: string,
    metadata?: any
  ): Promise<void> {
    const auditEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: "flag_toggle",
      flagKey,
      oldState,
      newState,
      userId,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
      reason: metadata?.reason || "Manual toggle",
    };

    // Guardar en base de datos de auditoría
    await saveAuditEntry(auditEntry);

    // Enviar a sistema de monitoreo
    await sendToMonitoring("feature_flag_changed", auditEntry);

    // Log estructurado
    logger.info("Feature flag changed", {
      flagKey,
      oldState,
      newState,
      userId,
      correlationId: metadata?.correlationId,
    });
  }

  static async getFlagHistory(
    flagKey: string,
    limit = 50
  ): Promise<AuditEntry[]> {
    return await getAuditEntries({
      flagKey,
      action: "flag_toggle",
      limit,
      orderBy: "timestamp DESC",
    });
  }
}
```

### 📊 Monitoreo y Alertas

#### 1. **Health Checks**

```typescript
// src/features/admin/feature-flags/health/health-checker.ts
export class FeatureFlagHealthChecker {
  static async performHealthCheck(): Promise<HealthCheckResult> {
    const checks = await Promise.allSettled([
      this.checkDatabaseConnection(),
      this.checkCacheHealth(),
      this.checkFlagConsistency(),
      this.checkDependencyIntegrity(),
    ]);

    const results = checks.map((check, index) => ({
      name: ["database", "cache", "consistency", "dependencies"][index],
      status: check.status === "fulfilled" ? "healthy" : "unhealthy",
      details: check.status === "fulfilled" ? check.value : check.reason,
    }));

    const overallHealth = results.every((r) => r.status === "healthy")
      ? "healthy"
      : "unhealthy";

    return {
      status: overallHealth,
      timestamp: new Date().toISOString(),
      checks: results,
    };
  }

  private static async checkFlagConsistency(): Promise<string> {
    const dbFlags = await getAllFeatureFlagsFromDatabase();
    const staticFlags = Object.keys(FEATURE_FLAGS);

    const missingInDb = staticFlags.filter(
      (key) => !dbFlags.find((f) => f.key === key)
    );

    const extraInDb = dbFlags.filter((f) => !staticFlags.includes(f.key));

    if (missingInDb.length > 0 || extraInDb.length > 0) {
      return `Inconsistency detected: ${missingInDb.length} missing, ${extraInDb.length} extra`;
    }

    return "All flags consistent";
  }
}
```

#### 2. **Alertas Automáticas**

```typescript
// src/features/admin/feature-flags/alerts/alert-manager.ts
export class FlagAlertManager {
  static async checkAndSendAlerts(): Promise<void> {
    const flags = await getAllFeatureFlagsFromDatabase();

    for (const flag of flags) {
      await Promise.all([
        this.checkToggleFrequency(flag),
        this.checkErrorRates(flag),
        this.checkPerformanceImpact(flag),
        this.checkDependencyViolations(flag),
      ]);
    }
  }

  private static async checkToggleFrequency(flag: FeatureFlag): Promise<void> {
    const recent = await getFlagHistory(flag.key, 10);
    const last24h = recent.filter(
      (entry) =>
        Date.now() - new Date(entry.timestamp).getTime() < 24 * 60 * 60 * 1000
    );

    if (last24h.length > 5) {
      await sendAlert({
        type: "high_toggle_frequency",
        flagKey: flag.key,
        count: last24h.length,
        message: `Flag ${flag.key} toggled ${last24h.length} times in last 24h`,
        severity: "warning",
      });
    }
  }

  private static async checkErrorRates(flag: FeatureFlag): Promise<void> {
    if (!flag.enabled) return;

    const errorRate = await getErrorRateForFlag(flag.key);

    if (errorRate > 0.05) {
      // 5% error rate
      await sendAlert({
        type: "high_error_rate",
        flagKey: flag.key,
        errorRate,
        message: `High error rate (${(errorRate * 100).toFixed(2)}%) for flag ${
          flag.key
        }`,
        severity: "critical",
      });
    }
  }
}
```

### 🔄 Migraciones y Cleanup

#### 1. **Flag Retirement Process**

```typescript
// src/features/admin/feature-flags/migrations/flag-retirement.ts
export class FlagRetirementProcess {
  static async retireFlag(flagKey: string): Promise<RetirementResult> {
    const steps = [
      () => this.validateRetirement(flagKey),
      () => this.disableFlag(flagKey),
      () => this.waitForPropagation(flagKey),
      () => this.verifyNoUsage(flagKey),
      () => this.removeFromCode(flagKey),
      () => this.removeFromDatabase(flagKey),
      () => this.updateDocumentation(flagKey),
    ];

    const results = [];

    for (const [index, step] of steps.entries()) {
      try {
        const result = await step();
        results.push({ step: index + 1, status: "success", result });
      } catch (error) {
        results.push({ step: index + 1, status: "failed", error });
        break; // Stop on first failure
      }
    }

    return {
      flagKey,
      completed: results.every((r) => r.status === "success"),
      steps: results,
    };
  }

  private static async validateRetirement(flagKey: string): Promise<void> {
    // Verificar que no hay dependientes activos
    const dependents = findDependentFlags(flagKey);
    if (dependents.length > 0) {
      throw new Error(
        `Cannot retire: ${dependents.length} dependent flags exist`
      );
    }

    // Verificar que el flag está estable (no se ha modificado recientemente)
    const recentChanges = await getFlagHistory(flagKey, 5);
    const lastChange = recentChanges[0];
    if (
      lastChange &&
      Date.now() - new Date(lastChange.timestamp).getTime() <
        7 * 24 * 60 * 60 * 1000
    ) {
      throw new Error(
        "Flag was changed recently, wait 7 days before retirement"
      );
    }
  }

  private static async removeFromCode(flagKey: string): Promise<string[]> {
    // Buscar referencias en el código
    const references = await findCodeReferences(flagKey);

    if (references.length > 0) {
      throw new Error(`Code references still exist: ${references.join(", ")}`);
    }

    return [];
  }
}
```

#### 2. **Automated Cleanup**

```typescript
// src/features/admin/feature-flags/cleanup/auto-cleanup.ts
export class AutoCleanupService {
  static async performCleanup(): Promise<CleanupReport> {
    const report = {
      staleFlagsRemoved: 0,
      unusedFlagsDisabled: 0,
      dependencyViolationsFixed: 0,
      errors: [] as string[],
    };

    try {
      // Limpiar flags que no se han usado en meses
      const staleFlags = await findStaleFlags(90); // 90 days
      for (const flag of staleFlags) {
        if (await canSafelyRemove(flag.key)) {
          await removeFlag(flag.key);
          report.staleFlagsRemoved++;
        }
      }

      // Deshabilitar flags sin referencias en código
      const unusedFlags = await findUnusedFlags();
      for (const flag of unusedFlags) {
        if (flag.enabled) {
          await disableFlag(flag.key);
          report.unusedFlagsDisabled++;
        }
      }

      // Arreglar violaciones de dependencias
      const violations = await findDependencyViolations();
      for (const violation of violations) {
        await fixDependencyViolation(violation);
        report.dependencyViolationsFixed++;
      }
    } catch (error) {
      report.errors.push(error.message);
    }

    return report;
  }

  private static async findStaleFlags(days: number): Promise<FeatureFlag[]> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await getFlags({
      lastModified: { before: cutoffDate },
      enabled: false,
    });
  }
}
```

### 🎯 Casos de Uso Empresariales

#### 1. **Multi-Tenant Support**

```typescript
// src/features/admin/feature-flags/multi-tenant/tenant-flags.ts
export class TenantFlagManager {
  static async getFeatureFlagsForTenant(
    tenantId: string,
    userId?: string
  ): Promise<Record<string, boolean>> {
    const [globalFlags, tenantFlags, userFlags] = await Promise.all([
      getGlobalFlags(),
      getTenantFlags(tenantId),
      userId ? getUserFlags(userId) : {},
    ]);

    // Orden de precedencia: User > Tenant > Global
    return {
      ...globalFlags,
      ...tenantFlags,
      ...userFlags,
    };
  }

  static async setTenantFlag(
    tenantId: string,
    flagKey: string,
    enabled: boolean,
    options?: {
      rolloutPercentage?: number;
      schedule?: { startDate: Date; endDate?: Date };
    }
  ): Promise<void> {
    await setTenantFlag({
      tenantId,
      flagKey,
      enabled,
      rolloutPercentage: options?.rolloutPercentage || 100,
      scheduledStart: options?.schedule?.startDate,
      scheduledEnd: options?.schedule?.endDate,
    });

    // Invalidar cache del tenant
    await invalidateTenantCache(tenantId);
  }
}
```

### 📈 Performance Optimization

#### 1. **Batch Loading**

```typescript
// src/shared/hooks/useBatchFeatureFlags.ts
export function useBatchFeatureFlags(flagKeys: string[]) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlags = async () => {
      try {
        setLoading(true);
        // Cargar todos los flags en una sola llamada
        const result = await getBatchFlags(flagKeys);
        setFlags(result);
      } catch (error) {
        console.error("Error loading batch flags:", error);
      } finally {
        setLoading(false);
      }
    };

    if (flagKeys.length > 0) {
      loadFlags();
    }
  }, [flagKeys.join(",")]);

  return { flags, loading };
}
```

---

## 📚 Resumen

### 🎯 Puntos Clave

1. **🏗️ Arquitectura Híbrida**: Static config + Database + Cache + Metadata
2. **⚡ Performance**: Evaluación en Edge, cache agresivo, batch loading
3. **🔄 Real-time**: Sync entre pestañas, optimistic UI, invalidación automática
4. **🎪 Enterprise**: A/B testing, rollouts graduales, multi-tenant
5. **🛡️ Seguridad**: Guards server-side y client-side, auditoría completa
6. **🔗 Dependencias**: Validación automática, grafo visual, orden de activación
7. **📊 Observabilidad**: Monitoreo, alertas, health checks automáticos
8. **🧹 Mantenimiento**: Cleanup automático, proceso de retirement

### 🚀 Para Empezar

1. **Definir**: Agrega tu flag en `feature-flags.ts` con fallback
2. **Enriquecer**: Configura metadata en `metadata.ts` con dependencias
3. **Persistir**: Crea entrada en base de datos con estado inicial
4. **Consumir**: Usa `useIsEnabled("flagName")` en components
5. **Gestionar**: Administra desde `/admin/feature-flags` con validaciones
6. **Monitorear**: Revisa analytics y logs de cambios

### 🎨 Ejemplo Completo

```typescript
// 1. Definir en feature-flags.ts
export const FEATURE_FLAGS = {
  newDashboard: process.env.FEATURE_NEW_DASHBOARD === "true",
  darkMode: process.env.FEATURE_DARK_MODE === "true",
};

// 2. Metadata en metadata.ts
export const FEATURE_FLAG_METADATA = {
  newDashboard: {
    name: "Dashboard Moderno",
    description: "Nueva interfaz del dashboard con mejor UX",
    icon: "📊",
    category: "ui",
    premium: false,
    dependencies: ["darkMode"], // Requiere dark mode
    analytics: { trackImpressions: true },
  },
};

// 3. Usar en componente
function DashboardPage() {
  const hasNewDashboard = useIsEnabled("newDashboard");
  const hasDarkMode = useIsEnabled("darkMode");

  if (hasNewDashboard && hasDarkMode) {
    return <ModernDashboard />;
  }
  return <ClassicDashboard />;
}

// 4. Gestionar con validación
const result = await toggleFeatureFlagServerAction({
  flagKey: "newDashboard",
  enabled: true,
});

if (!result.success) {
  console.error(result.error); // "Dependencias inactivas: Dark Mode"
}
```

### 📖 Índice de Referencia Rápida

| Sección             | Descripción                  | Archivos Clave                                |
| ------------------- | ---------------------------- | --------------------------------------------- |
| **🏗️ Arquitectura** | Flujo completo del sistema   | `feature-flags.ts`, `server-feature-flags.ts` |
| **🧠 Metadata**     | Configuración y dependencias | `metadata.ts`, `dependency-validator.ts`      |
| **🎛️ Admin UI**     | Interfaz de gestión          | `index.screen.tsx`, `DependencyGraph.tsx`     |
| **🔗 Dependencias** | Validación y orden           | `DependencyValidator`, `getActivationOrder()` |
| **📊 Analytics**    | Métricas y monitoreo         | `flag-analytics.ts`, `FlagAnalytics`          |
| **⚡ Performance**  | Optimización y cache         | `useBatchFeatureFlags`, cache invalidation    |
| **🛡️ Seguridad**    | Permisos y auditoría         | `validateFlagPermissions`, `FlagAuditLogger`  |
| **🔄 Cleanup**      | Mantenimiento                | `FlagRetirementProcess`, `AutoCleanupService` |

### 🔧 Comandos Útiles

```bash
# Crear nuevo flag
npm run create-flag

# Listar todos los flags
npm run flags:list

# Sincronizar flags con DB
npm run flags:sync

# Health check del sistema
curl /api/health/feature-flags

# Ver historial de cambios
curl /api/admin/feature-flags/audit/{flagKey}
```

### 📚 Documentación Adicional

- **[Guía de Ejemplos](./FEATURE_FLAGS_EXAMPLES.md)** - Implementaciones prácticas
- **[Tutorial Dark Mode](./FEATURE_FLAGS_DARK_MODE_TUTORIAL.md)** - Paso a paso
- **[Referencia Rápida](./FEATURE_FLAGS_QUICK_REFERENCE.md)** - Comandos y patrones
- **[README Principal](./FEATURE_FLAGS_README.md)** - Índice general

---

¡El sistema está listo para escalar con tu aplicación! 🚀

Con **dependencias validadas**, **admin UI completo**, **monitoreo automático** y **cleanup inteligente**, tienes todo lo necesario para manejar feature flags a nivel empresarial.
