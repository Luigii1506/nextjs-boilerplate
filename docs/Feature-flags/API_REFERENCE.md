# 🔧 Feature Flags - API Reference Completa

> **Referencia técnica completa de todas las APIs, hooks, tipos y utilidades del sistema de feature flags**

## 📋 **Índice**

1. [🪝 Client Hooks](#-client-hooks)
2. [⚙️ Server Utilities](#️-server-utilities)
3. [🎬 Server Actions](#-server-actions)
4. [📝 Types & Interfaces](#-types--interfaces)
5. [⚙️ Configuration](#️-configuration)
6. [📡 Broadcast System](#-broadcast-system)
7. [🔧 Internal APIs](#-internal-apis)

---

## 🪝 **Client Hooks**

### **`useFeatureFlags()`**

Hook principal para gestionar feature flags en componentes client-side.

```typescript
function useFeatureFlags(): FeatureFlagsContextType;
```

**Returns:**

```typescript
{
  flags: FeatureFlagData[];           // Array de todos los flags con metadata
  flagsMap: Record<string, boolean>;  // Map para lookups rápidos
  isEnabled: (flag: FeatureFlag) => boolean;  // Función para verificar flags
  toggleFlag: (flagKey: string) => Promise<void>;  // Función para toggle
  refreshFlags: () => Promise<void>;  // Función para recargar
  isLoading: boolean;                 // Estado de carga
  error: string | null;               // Error si existe
}
```

**Ejemplo:**

```typescript
"use client";
import { useFeatureFlags } from "@/core/feature-flags";

export function MyComponent() {
  const { flags, isEnabled, toggleFlag, isLoading } = useFeatureFlags();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {flags.map((flag) => (
        <div key={flag.key}>
          <span>
            {flag.name}: {isEnabled(flag.key) ? "ON" : "OFF"}
          </span>
          <button onClick={() => toggleFlag(flag.key)}>Toggle</button>
        </div>
      ))}
    </div>
  );
}
```

---

### **`useIsEnabled()`**

Hook simple para verificar si un feature flag está activo. **Más eficiente** para casos simples.

```typescript
function useIsEnabled(): (flag: FeatureFlag) => boolean;
```

**Returns:** Función que acepta un flag key y retorna boolean.

**Ejemplo:**

```typescript
"use client";
import { useIsEnabled } from "@/core/feature-flags";

export function MyComponent() {
  const isEnabled = useIsEnabled();

  if (!isEnabled("myFeature")) {
    return null; // No renderizar si está desactivado
  }

  return <div>Feature activa!</div>;
}
```

---

### **`useToggleFlag()`**

Hook para obtener solo la función de toggle.

```typescript
function useToggleFlag(): (flagKey: string) => Promise<void>;
```

**Ejemplo:**

```typescript
"use client";
import { useToggleFlag } from "@/core/feature-flags";

export function ToggleButton({ flagKey }: { flagKey: string }) {
  const toggleFlag = useToggleFlag();

  return <button onClick={() => toggleFlag(flagKey)}>Toggle {flagKey}</button>;
}
```

---

### **`useFeatureFlagsData()`**

Hook para obtener solo los datos de flags sin funciones de mutación.

```typescript
function useFeatureFlagsData(): {
  flags: FeatureFlagData[];
  isLoading: boolean;
  error: string | null;
  refreshFlags: () => Promise<void>;
};
```

**Ejemplo:**

```typescript
"use client";
import { useFeatureFlagsData } from "@/core/feature-flags";

export function FlagsList() {
  const { flags, isLoading, error } = useFeatureFlagsData();

  if (error) return <div>Error: {error}</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {flags.map((flag) => (
        <li key={flag.key}>{flag.name}</li>
      ))}
    </ul>
  );
}
```

---

### **`useFeatureFlag(flagKey)`**

Hook para trabajar con un flag específico.

```typescript
function useFeatureFlag(flagKey: FeatureFlag): {
  enabled: boolean;
  data: FeatureFlagData | undefined;
};
```

**Ejemplo:**

```typescript
"use client";
import { useFeatureFlag } from "@/core/feature-flags";

export function SpecificFeature() {
  const { enabled, data } = useFeatureFlag("myFeature");

  if (!enabled) return null;

  return (
    <div>
      <h3>{data?.name}</h3>
      <p>{data?.description}</p>
    </div>
  );
}
```

---

### **`useFeatureFlagsByCategory(category)`**

Hook para obtener flags de una categoría específica.

```typescript
function useFeatureFlagsByCategory(category: string): FeatureFlagData[];
```

**Ejemplo:**

```typescript
"use client";
import { useFeatureFlagsByCategory } from "@/core/feature-flags";

export function ExperimentalFeatures() {
  const experimentalFlags = useFeatureFlagsByCategory("experimental");

  return (
    <div>
      <h3>Funcionalidades Experimentales</h3>
      {experimentalFlags.map((flag) => (
        <div key={flag.key}>{flag.name}</div>
      ))}
    </div>
  );
}
```

---

### **`useBatchFeatureFlags()`**

Hook para operaciones batch en múltiples flags.

```typescript
function useBatchFeatureFlags(): {
  batchUpdateFlags: (
    updates: FeatureFlagBatchUpdate[]
  ) => Promise<ActionResult>;
  enableAll: (flagKeys: string[]) => Promise<ActionResult>;
  disableAll: (flagKeys: string[]) => Promise<ActionResult>;
};
```

**Ejemplo:**

```typescript
"use client";
import { useBatchFeatureFlags } from "@/core/feature-flags";

export function BatchControls() {
  const { batchUpdateFlags, enableAll, disableAll } = useBatchFeatureFlags();

  const handleEnableExperimental = async () => {
    await enableAll(["feature1", "feature2", "feature3"]);
  };

  return (
    <button onClick={handleEnableExperimental}>Activar Experimentales</button>
  );
}
```

---

## ⚙️ **Server Utilities**

### **`isServerFeatureEnabled(flagKey)`**

Verifica si un feature flag está activo en el servidor. **Con caching automático**.

```typescript
async function isServerFeatureEnabled(flagKey: FeatureFlag): Promise<boolean>;
```

**Ejemplo:**

```typescript
// src/app/(admin)/my-feature/page.tsx
import { isServerFeatureEnabled } from "@/core/feature-flags/server";
import { notFound } from "next/navigation";

export default async function MyFeaturePage() {
  const enabled = await isServerFeatureEnabled("myFeature");
  if (!enabled) notFound();

  return <MyFeatureContent />;
}
```

---

### **`getServerFeatureFlags()`**

Obtiene todos los feature flags en el servidor.

```typescript
async function getServerFeatureFlags(): Promise<Record<FeatureFlag, boolean>>;
```

**Ejemplo:**

```typescript
// src/app/api/config/route.ts
import { getServerFeatureFlags } from "@/core/feature-flags/server";

export async function GET() {
  const flags = await getServerFeatureFlags();

  return Response.json({
    features: flags,
    timestamp: Date.now(),
  });
}
```

---

### **`getFeatureFlagsWithMetadata()`**

Obtiene flags con metadata completa para admin UI.

```typescript
async function getFeatureFlagsWithMetadata(): Promise<FeatureFlagData[]>;
```

**Ejemplo:**

```typescript
// src/app/(admin)/feature-flags/page.tsx
import { getFeatureFlagsWithMetadata } from "@/core/feature-flags/server";

export default async function FeatureFlagsPage() {
  const flags = await getFeatureFlagsWithMetadata();

  return <FeatureFlagsAdmin initialFlags={flags} />;
}
```

---

### **`invalidateFeatureFlagsCache()`**

Invalida el cache de feature flags manualmente.

```typescript
async function invalidateFeatureFlagsCache(): Promise<void>;
```

**Ejemplo:**

```typescript
// src/app/api/admin/refresh-cache/route.ts
import { invalidateFeatureFlagsCache } from "@/core/feature-flags/server";

export async function POST() {
  await invalidateFeatureFlagsCache();

  return Response.json({ success: true });
}
```

---

## 🎬 **Server Actions**

### **`getFeatureFlagsAction()`**

Server action para obtener flags desde el cliente.

```typescript
async function getFeatureFlagsAction(): Promise<
  ActionResult<FeatureFlagData[]>
>;
```

**Returns:**

```typescript
{
  success: boolean;
  data?: FeatureFlagData[];
  error?: string;
}
```

---

### **`toggleFeatureFlagAction(flagKey)`**

Server action para toggle de un flag específico.

```typescript
async function toggleFeatureFlagAction(flagKey: string): Promise<ActionResult>;
```

**Ejemplo:**

```typescript
"use client";
import { toggleFeatureFlagAction } from "@/core/feature-flags";

export function ToggleButton({ flagKey }: { flagKey: string }) {
  const handleToggle = async () => {
    const result = await toggleFeatureFlagAction(flagKey);
    if (!result.success) {
      console.error("Error:", result.error);
    }
  };

  return <button onClick={handleToggle}>Toggle</button>;
}
```

---

### **`updateFeatureFlagAction(flagKey, data)`**

Server action para actualizar metadata de un flag.

```typescript
async function updateFeatureFlagAction(
  flagKey: string,
  data: Partial<FeatureFlagData>
): Promise<ActionResult>;
```

---

### **`batchUpdateFeatureFlagsAction(updates)`**

Server action para actualizar múltiples flags.

```typescript
async function batchUpdateFeatureFlagsAction(
  updates: FeatureFlagBatchUpdate[]
): Promise<ActionResult>;
```

**Ejemplo:**

```typescript
const updates = [
  { key: "feature1", enabled: true },
  { key: "feature2", enabled: false },
];

const result = await batchUpdateFeatureFlagsAction(updates);
```

---

### **`deleteFeatureFlagAction(flagKey)`**

Server action para eliminar un flag de la base de datos.

```typescript
async function deleteFeatureFlagAction(flagKey: string): Promise<ActionResult>;
```

---

## 📝 **Types & Interfaces**

### **`FeatureFlag`**

Tipo union de todos los feature flags disponibles.

```typescript
type FeatureFlag =
  | "userManagement"
  | "fileUpload"
  | "analytics"
  | "reports"
  | "billing"
  | "notifications";
// ... más flags según configuración
```

---

### **`FeatureFlagData`**

Interface completa de un feature flag con metadata.

```typescript
interface FeatureFlagData {
  key: string; // Identificador único
  name: string; // Nombre display
  description: string; // Descripción
  enabled: boolean; // Estado actual
  category: FeatureCategory; // Categoría
  isStatic: boolean; // Si viene de config estático
  version?: string; // Versión
  dependencies?: string[]; // Dependencias
  conflicts?: string[]; // Conflictos
  rolloutPercentage?: number; // Porcentaje de rollout
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Fecha de actualización
}
```

---

### **`FeatureCategory`**

Categorías disponibles para organizar flags.

```typescript
type FeatureCategory = "core" | "module" | "experimental" | "admin";
// ... más categorías según configuración
```

---

### **`FeatureFlagsContextType`**

Tipo del contexto de React para feature flags.

```typescript
interface FeatureFlagsContextType {
  flags: FeatureFlagData[];
  flagsMap: Record<string, boolean>;
  isEnabled: (flag: FeatureFlag) => boolean;
  toggleFlag: (flagKey: string) => Promise<void>;
  refreshFlags: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

---

### **`FeatureFlagBatchUpdate`**

Interface para actualizaciones batch.

```typescript
interface FeatureFlagBatchUpdate {
  key: string;
  enabled: boolean;
}
```

---

### **`ActionResult<T>`**

Tipo de respuesta estándar para server actions.

```typescript
interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

### **`FeatureFlagCardProps`**

Props para el componente de card de admin UI.

```typescript
interface FeatureFlagCardProps {
  flag: FeatureFlagData;
  onToggle: (flagKey: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}
```

---

## ⚙️ **Configuration**

### **`FEATURE_FLAGS`**

Configuración estática de feature flags.

```typescript
export const FEATURE_FLAGS = {
  userManagement: true,
  fileUpload: true,
  analytics: false,
  // ... más flags
} as const;
```

---

### **`FEATURE_CATEGORIES`**

Configuración de categorías para organización.

```typescript
export const FEATURE_CATEGORIES = {
  core: {
    name: "Core",
    description: "Funcionalidades principales",
    color: "blue",
  },
  module: {
    name: "Módulos",
    description: "Módulos de negocio",
    color: "green",
  },
  // ... más categorías
} as const;
```

---

### **Utility Functions**

```typescript
// Obtener categoría de un flag
function getFeatureCategory(flagKey: string): FeatureCategory | null;

// Verificar si flag está habilitado estáticamente
function isFeatureEnabled(flagKey: string): boolean;
```

---

## 📡 **Broadcast System**

### **`useFeatureFlagsBroadcast()`**

Hook especializado para broadcast de feature flags.

```typescript
function useFeatureFlagsBroadcast(): {
  notifyFlagChange: (flagKey: string) => void;
  onFlagChange: (callback: (flagKey: string) => void) => () => void;
};
```

**Ejemplo:**

```typescript
"use client";
import { useFeatureFlagsBroadcast } from "@/shared/hooks/useBroadcast";

export function MyComponent() {
  const { notifyFlagChange, onFlagChange } = useFeatureFlagsBroadcast();

  useEffect(() => {
    return onFlagChange((flagKey) => {
      console.log(`Flag ${flagKey} changed!`);
      // Actualizar UI
    });
  }, [onFlagChange]);

  const handleChange = () => {
    notifyFlagChange("myFlag");
  };

  return <button onClick={handleChange}>Notify Change</button>;
}
```

---

### **`useBroadcast(channelName)`**

Hook genérico para broadcast entre pestañas.

```typescript
function useBroadcast(channelName: string): {
  send: (type: string, data?: unknown) => void;
  listen: (callback: (type: string, data?: unknown) => void) => () => void;
};
```

---

## 🔧 **Internal APIs**

### **Cache Configuration**

```typescript
const CACHE_CONFIG = {
  tags: ["feature-flags"] as const,
  revalidate: 300, // 5 minutos
} as const;
```

---

### **Database Queries**

```typescript
// Obtener flag de la base de datos
async function getFeatureFlagFromDB(key: string): Promise<FeatureFlagDB | null>;

// Obtener todos los flags de la base de datos
async function getAllFeatureFlagsFromDB(): Promise<FeatureFlagDB[]>;

// Actualizar flag en la base de datos
async function updateFeatureFlagInDB(
  key: string,
  data: Partial<FeatureFlagDB>
): Promise<void>;
```

---

### **Validation Helpers**

```typescript
// Validar permisos de admin
async function requireAdminAuth(): Promise<Session>;

// Validar que el flag existe
function validateFeatureFlagKey(key: string): key is FeatureFlag;

// Formatear nombre de flag para display
function formatFlagName(key: string): string;
```

---

## 🎯 **Patrones de Uso Recomendados**

### **✅ Client-Side Check**

```typescript
// Para componentes que pueden no renderizarse
function OptionalFeature() {
  const isEnabled = useIsEnabled();

  if (!isEnabled("myFeature")) return null;

  return <FeatureContent />;
}
```

### **✅ Server-Side Gate**

```typescript
// Para páginas completas
export default async function FeaturePage() {
  const enabled = await isServerFeatureEnabled("myFeature");
  if (!enabled) notFound();

  return <PageContent />;
}
```

### **✅ Conditional Rendering**

```typescript
// Para mostrar diferentes versiones
function AdaptiveFeature() {
  const isEnabled = useIsEnabled();

  return isEnabled("newVersion") ? (
    <NewVersionComponent />
  ) : (
    <LegacyVersionComponent />
  );
}
```

### **✅ Batch Operations**

```typescript
// Para operaciones múltiples
const { batchUpdateFlags } = useBatchFeatureFlags();

await batchUpdateFlags([
  { key: "feature1", enabled: true },
  { key: "feature2", enabled: false },
]);
```

---

## 🚨 **Error Handling**

### **Common Error Types**

```typescript
// Feature flag no encontrado
"Feature flag 'invalidFlag' not found";

// Permisos insuficientes
"Insufficient permissions to modify feature flags";

// Error de base de datos
"Database error while updating feature flag";

// Error de validación
"Invalid feature flag data provided";
```

### **Error Handling Pattern**

```typescript
try {
  const result = await toggleFeatureFlagAction("myFlag");
  if (!result.success) {
    console.error("Error:", result.error);
    // Manejar error específico
  }
} catch (error) {
  console.error("Unexpected error:", error);
  // Manejar error inesperado
}
```

---

_Última actualización: Enero 2025 - API Reference completa v2.0_
