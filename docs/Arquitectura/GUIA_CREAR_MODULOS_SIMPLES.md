# 🚀 Guía Completa: Crear Módulos Simples

> **Tutorial paso a paso para crear módulos simples siguiendo el patrón estándar**

## 📋 Índice

1. [Antes de empezar](#antes-de-empezar)
2. [Paso 1: Crear estructura](#paso-1-crear-estructura)
3. [Paso 2: Definir tipos](#paso-2-definir-tipos)
4. [Paso 3: Crear Server Actions](#paso-3-crear-server-actions)
5. [Paso 4: Crear hooks](#paso-4-crear-hooks)
6. [Paso 5: Crear componentes](#paso-5-crear-componentes)
7. [Paso 6: Crear página principal](#paso-6-crear-página-principal)
8. [Paso 7: Configurar exports](#paso-7-configurar-exports)
9. [Ejemplos completos](#ejemplos-completos)
10. [Checklist final](#checklist-final)

---

## 🤔 Antes de empezar

### ¿Es realmente un módulo simple?

**✅ Usa módulo simple si:**

- Funcionalidad básica o de presentación
- Principalmente UI con lógica mínima
- No requiere reglas de negocio complejas
- Pocas integraciones externas
- Funcionalidad de soporte o administrativa

**❌ Usa módulo hexagonal si:**

- Funcionalidad compleja con múltiples casos de uso
- Necesitas múltiples capas de validación
- Requiere reglas de negocio complejas
- Múltiples integraciones externas
- Es crítico para el negocio

### Ejemplos de módulos simples:

- `dashboard` - Resumen y estadísticas
- `feature-flags` - Configuración de funcionalidades
- `notifications` - Sistema de notificaciones
- `settings` - Configuración de la aplicación
- `reports` - Reportes básicos
- `logs` - Visualización de logs

---

## 🏗️ Paso 1: Crear estructura

### Comando para crear la estructura básica:

```bash
# Reemplaza [module-name] con el nombre de tu módulo
MODULE_NAME="[module-name]"
mkdir -p "src/features/admin/$MODULE_NAME"/{components,hooks}
touch "src/features/admin/$MODULE_NAME"/{index.ts,page.tsx,actions.ts,types.ts}
touch "src/features/admin/$MODULE_NAME/components/index.ts"
touch "src/features/admin/$MODULE_NAME/hooks/index.ts"
```

### Estructura resultante:

```
src/features/admin/[module-name]/
├── index.ts                 # Barrel exports
├── page.tsx                 # Página principal
├── actions.ts              # Server Actions
├── types.ts                # Tipos TypeScript
├── components/              # Componentes específicos
│   └── index.ts            # Barrel exports
└── hooks/                   # Hooks específicos
    └── index.ts            # Barrel exports
```

---

## 📝 Paso 2: Definir tipos

### Archivo: `types.ts`

```typescript
/**
 * 📝 [MODULE_NAME] TYPES
 *
 * Tipos TypeScript para el módulo simple de [module-name].
 */

// 🏠 Props del componente principal
export interface [ModuleName]PageProps {
  // Props específicas de la página
}

// 📊 Datos principales del módulo
export interface [ModuleName]Data {
  id: string;
  name: string;
  // ... propiedades específicas
  createdAt: Date;
  updatedAt: Date;
}

// 📈 Estadísticas o métricas
export interface [ModuleName]Stats {
  total: number;
  active: number;
  // ... estadísticas específicas
}

// 🔄 Estado del hook principal
export interface [ModuleName]HookState {
  data: [ModuleName]Data[] | null;
  stats: [ModuleName]Stats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

// 🧩 Props de componentes
export interface [ModuleName]CardProps {
  data: [ModuleName]Data;
  onAction?: (id: string) => void;
}

// ⚙️ Configuración del módulo (opcional)
export interface [ModuleName]Config {
  itemsPerPage?: number;
  autoRefresh?: boolean;
  // ... configuraciones específicas
}
```

### Ejemplo real (Notifications):

```typescript
/**
 * 📝 NOTIFICATIONS TYPES
 */

export interface NotificationsPageProps {
  userId?: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationsStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

export interface NotificationsHookState {
  notifications: NotificationData[] | null;
  stats: NotificationsStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}
```

---

## 🔧 Paso 3: Crear Server Actions

### Archivo: `actions.ts`

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { ActionResult } from "@/shared/types/actions";
import { [ModuleName]Data, [ModuleName]Stats } from "./types";

/**
 * 🔧 [MODULE_NAME] SERVER ACTIONS
 *
 * Server Actions para el módulo simple de [module-name].
 */

// 📊 Obtener datos principales
export async function get[ModuleName]DataAction(): Promise<ActionResult<[ModuleName]Data[]>> {
  try {
    // TODO: Implementar lógica real
    // const data = await db.[moduleName].findMany();

    // Datos mock para desarrollo
    const data: [ModuleName]Data[] = [
      {
        id: "1",
        name: "Ejemplo 1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching [module-name] data:", error);
    return {
      success: false,
      error: "Error al obtener datos de [module-name]",
    };
  }
}

// 📈 Obtener estadísticas
export async function get[ModuleName]StatsAction(): Promise<ActionResult<[ModuleName]Stats>> {
  try {
    // TODO: Implementar lógica real
    const stats: [ModuleName]Stats = {
      total: 10,
      active: 8,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching [module-name] stats:", error);
    return {
      success: false,
      error: "Error al obtener estadísticas de [module-name]",
    };
  }
}

// ✏️ Crear nuevo elemento
export async function create[ModuleName]Action(formData: FormData): Promise<ActionResult<[ModuleName]Data>> {
  try {
    const name = formData.get("name") as string;

    // TODO: Validar datos
    if (!name) {
      return {
        success: false,
        error: "El nombre es requerido",
      };
    }

    // TODO: Implementar lógica real
    // const newItem = await db.[moduleName].create({ data: { name } });

    const newItem: [ModuleName]Data = {
      id: Date.now().toString(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Revalidar páginas relacionadas
    revalidatePath("/admin/[module-name]");

    return {
      success: true,
      data: newItem,
    };
  } catch (error) {
    console.error("Error creating [module-name]:", error);
    return {
      success: false,
      error: "Error al crear [module-name]",
    };
  }
}

// 🗑️ Eliminar elemento
export async function delete[ModuleName]Action(id: string): Promise<ActionResult<void>> {
  try {
    // TODO: Implementar lógica real
    // await db.[moduleName].delete({ where: { id } });

    revalidatePath("/admin/[module-name]");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error deleting [module-name]:", error);
    return {
      success: false,
      error: "Error al eliminar [module-name]",
    };
  }
}

// 🔄 Actualizar datos
export async function refresh[ModuleName]Action(): Promise<ActionResult<void>> {
  try {
    // Simular tiempo de actualización
    await new Promise(resolve => setTimeout(resolve, 500));

    revalidatePath("/admin/[module-name]");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error refreshing [module-name]:", error);
    return {
      success: false,
      error: "Error al actualizar [module-name]",
    };
  }
}
```

---

## 🎯 Paso 4: Crear hooks

### Archivo: `hooks/use[ModuleName].ts`

```typescript
"use client";

import { useActionState, useOptimistic, useTransition } from "react";
import {
  get[ModuleName]DataAction,
  get[ModuleName]StatsAction,
  refresh[ModuleName]Action
} from "../actions";
import { [ModuleName]HookState, [ModuleName]Data, [ModuleName]Stats } from "../types";

/**
 * 🎯 HOOK PRINCIPAL DE [MODULE_NAME]
 *
 * Hook personalizado para manejar el estado y las acciones de [module-name].
 * Utiliza React 19 features: useActionState, useOptimistic, useTransition.
 */

export function use[ModuleName](): [ModuleName]HookState {
  // 🚀 REACT 19: useActionState for main data
  const [dataState, dataAction, isDataLoading] = useActionState(async () => {
    const result = await get[ModuleName]DataAction();
    return result;
  }, null);

  // 🚀 REACT 19: useActionState for stats
  const [statsState, statsAction, isStatsLoading] = useActionState(async () => {
    const result = await get[ModuleName]StatsAction();
    return result;
  }, null);

  // ⚡ REACT 19: useTransition for refresh
  const [isRefreshing, startRefresh] = useTransition();

  // 🎯 REACT 19: useOptimistic for instant UI feedback
  const [optimisticState, setOptimisticState] = useOptimistic(
    {
      data: dataState?.success ? (dataState.data as [ModuleName]Data[]) : null,
      stats: statsState?.success ? (statsState.data as [ModuleName]Stats) : null,
      isRefreshing: false,
    },
    (state, optimisticValue: Partial<typeof state>) => ({
      ...state,
      ...optimisticValue,
    })
  );

  // 🔄 Refresh handler with optimistic UI
  const refresh = async () => {
    startRefresh(() => {
      setOptimisticState({ isRefreshing: true });
    });

    startRefresh(async () => {
      try {
        await refresh[ModuleName]Action();
        dataAction();
        statsAction();
      } finally {
        startRefresh(() => {
          setOptimisticState({ isRefreshing: false });
        });
      }
    });
  };

  // 📊 Computed values
  const isLoading = isDataLoading || isStatsLoading;
  const hasError =
    (dataState?.success === false) ||
    (statsState?.success === false);

  const error = hasError
    ? (dataState?.error || statsState?.error || "Error desconocido")
    : null;

  return {
    data: optimisticState.data,
    stats: optimisticState.stats,
    isLoading: isLoading && !optimisticState.data,
    error,
    refresh,
  };
}

/**
 * 📊 HOOK ESPECÍFICO PARA DATOS
 *
 * Hook más específico si solo necesitas los datos principales.
 */
export function use[ModuleName]Data() {
  const [state, action, isPending] = useActionState(
    get[ModuleName]DataAction,
    null
  );

  return {
    data: state?.success ? state.data : null,
    error: state?.success === false ? state.error : null,
    isLoading: isPending,
    refresh: action,
  };
}
```

### Archivo: `hooks/index.ts`

```typescript
/**
 * 🎯 [MODULE_NAME] HOOKS BARREL
 */

export { use[ModuleName], use[ModuleName]Data } from "./use[ModuleName]";
```

---

## 🧩 Paso 5: Crear componentes

### Archivo: `components/[ModuleName]Card.tsx`

```typescript
import React from "react";
import { [ModuleName]CardProps } from "../types";

/**
 * 🧩 COMPONENTE DE TARJETA DE [MODULE_NAME]
 *
 * Componente reutilizable para mostrar elementos de [module-name].
 */

export function [ModuleName]Card({ data, onAction }: [ModuleName]CardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {data.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            ID: {data.id}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Creado: {data.createdAt.toLocaleDateString()}
          </p>
        </div>

        {onAction && (
          <button
            onClick={() => onAction(data.id)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Acción
          </button>
        )}
      </div>
    </div>
  );
}
```

### Archivo: `components/[ModuleName]Stats.tsx`

```typescript
import React from "react";
import { [ModuleName]Stats } from "../types";

/**
 * 📊 COMPONENTE DE ESTADÍSTICAS DE [MODULE_NAME]
 */

interface [ModuleName]StatsProps {
  stats: [ModuleName]Stats | null;
  isLoading?: boolean;
}

export function [ModuleName]StatsComponent({ stats, isLoading }: [ModuleName]StatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
            <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Total
        </p>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
          {stats.total}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Activos
        </p>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
          {stats.active}
        </p>
      </div>
    </div>
  );
}
```

### Archivo: `components/index.ts`

```typescript
/**
 * 🧩 [MODULE_NAME] COMPONENTS BARREL
 */

export { [ModuleName]Card } from "./[ModuleName]Card";
export { [ModuleName]StatsComponent } from "./[ModuleName]Stats";
```

---

## 🏠 Paso 6: Crear página principal

### Archivo: `page.tsx`

```typescript
"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { use[ModuleName] } from "./hooks";
import { [ModuleName]Card, [ModuleName]StatsComponent } from "./components";
import { [ModuleName]PageProps } from "./types";

/**
 * 🏠 PÁGINA PRINCIPAL DE [MODULE_NAME]
 *
 * Página principal del módulo simple de [module-name].
 */

export default function [ModuleName]Page({}: [ModuleName]PageProps) {
  const { data, stats, isLoading, error, refresh } = use[ModuleName]();

  const handleAction = (id: string) => {
    console.log("Action for:", id);
    // TODO: Implementar acción específica
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            [Module Name]
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gestión de [module-name]
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {/* Stats */}
      <[ModuleName]StatsComponent stats={stats} isLoading={isLoading} />

      {/* Content */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Lista de elementos
        </h2>

        {isLoading && !data ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid gap-4">
            {data.map((item) => (
              <[ModuleName]Card
                key={item.id}
                data={item}
                onAction={handleAction}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No hay elementos disponibles
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 📦 Paso 7: Configurar exports

### Archivo: `index.ts`

```typescript
/**
 * 📦 [MODULE_NAME] MODULE BARREL
 *
 * Módulo simple para [module-name].
 * Sigue el patrón estándar para módulos simples.
 */

// 🏠 Página principal
export { default } from "./page";

// 🧩 Componentes
export * from "./components";

// 🎯 Hooks
export * from "./hooks";

// 🔧 Server Actions
export * from "./actions";

// 📝 Tipos
export * from "./types";
```

---

## 💡 Ejemplos completos

### Ejemplo 1: Módulo de Notificaciones

```bash
# Crear estructura
MODULE_NAME="notifications"
mkdir -p "src/features/admin/$MODULE_NAME"/{components,hooks}
touch "src/features/admin/$MODULE_NAME"/{index.ts,page.tsx,actions.ts,types.ts}
touch "src/features/admin/$MODULE_NAME/components/index.ts"
touch "src/features/admin/$MODULE_NAME/hooks/index.ts"
```

**types.ts:**

```typescript
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

export interface NotificationsStats {
  total: number;
  unread: number;
}
```

**actions.ts:**

```typescript
export async function getNotificationsAction() {
  // Lógica para obtener notificaciones
}

export async function markAsReadAction(id: string) {
  // Lógica para marcar como leída
}
```

**hooks/useNotifications.ts:**

```typescript
export function useNotifications() {
  const [state, action] = useActionState(getNotificationsAction, null);

  return {
    notifications: state?.data || [],
    isLoading: !state,
    refresh: action,
  };
}
```

### Ejemplo 2: Módulo de Configuración

```bash
# Crear estructura
MODULE_NAME="settings"
mkdir -p "src/features/admin/$MODULE_NAME"/{components,hooks}
# ... resto de archivos
```

**types.ts:**

```typescript
export interface AppSettings {
  siteName: string;
  siteUrl: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
}
```

**actions.ts:**

```typescript
export async function getSettingsAction() {
  // Obtener configuración
}

export async function updateSettingsAction(formData: FormData) {
  // Actualizar configuración
}
```

---

## ✅ Checklist final

### Antes de considerar el módulo completo:

#### 📁 Estructura

- [ ] Carpeta creada en `src/features/admin/[module-name]/`
- [ ] Archivos principales: `index.ts`, `page.tsx`, `actions.ts`, `types.ts`
- [ ] Carpetas: `components/`, `hooks/`
- [ ] Barrel exports en cada carpeta

#### 📝 Tipos

- [ ] Tipos principales definidos
- [ ] Props de componentes definidas
- [ ] Estado del hook definido
- [ ] Interfaces de datos definidas

#### 🔧 Server Actions

- [ ] Acción para obtener datos principales
- [ ] Acción para obtener estadísticas (si aplica)
- [ ] Acciones CRUD básicas (crear, actualizar, eliminar)
- [ ] Acción de refresh
- [ ] Manejo de errores en todas las acciones
- [ ] `revalidatePath` en acciones que modifican datos

#### 🎯 Hooks

- [ ] Hook principal que usa `useActionState`
- [ ] Hook usa `useOptimistic` para UI instantánea
- [ ] Hook usa `useTransition` para refresh
- [ ] Hooks específicos si son necesarios
- [ ] Barrel export en `hooks/index.ts`

#### 🧩 Componentes

- [ ] Componente principal de tarjeta/item
- [ ] Componente de estadísticas (si aplica)
- [ ] Componentes con dark mode support
- [ ] Props tipadas correctamente
- [ ] Barrel export en `components/index.ts`

#### 🏠 Página

- [ ] Usa el hook principal
- [ ] Maneja estados de loading, error, vacío
- [ ] Header con título y botón refresh
- [ ] Diseño responsive
- [ ] Dark mode support

#### 📦 Exports

- [ ] Barrel export principal en `index.ts`
- [ ] Exporta página, componentes, hooks, actions, tipos
- [ ] Imports funcionan correctamente

#### 🎨 UI/UX

- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Dark mode support
- [ ] Responsive design
- [ ] Transiciones suaves

#### 🧪 Testing básico

- [ ] La página carga sin errores
- [ ] Los hooks funcionan correctamente
- [ ] Las acciones se ejecutan sin errores
- [ ] Los componentes se renderizan correctamente

---

## 🎯 Comandos útiles

### Crear módulo completo (script bash):

```bash
#!/bin/bash
# create-simple-module.sh

MODULE_NAME=$1
if [ -z "$MODULE_NAME" ]; then
  echo "Uso: ./create-simple-module.sh [module-name]"
  exit 1
fi

# Crear estructura
mkdir -p "src/features/admin/$MODULE_NAME"/{components,hooks}
touch "src/features/admin/$MODULE_NAME"/{index.ts,page.tsx,actions.ts,types.ts}
touch "src/features/admin/$MODULE_NAME/components/index.ts"
touch "src/features/admin/$MODULE_NAME/hooks/index.ts"

echo "✅ Módulo $MODULE_NAME creado en src/features/admin/$MODULE_NAME/"
echo "📝 Ahora completa los archivos siguiendo la guía"
```

### Verificar estructura:

```bash
# Verificar que la estructura sea correcta
find src/features/admin/[module-name] -type f -name "*.ts" -o -name "*.tsx" | sort
```

---

**¡Listo!** Ahora tienes todo lo necesario para crear módulos simples consistentes y bien estructurados. 🚀

**Recuerda:** Si tu módulo crece en complejidad, considera migrarlo a un módulo hexagonal completo.
