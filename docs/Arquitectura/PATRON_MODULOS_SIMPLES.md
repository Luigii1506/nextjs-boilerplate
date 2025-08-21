# 🎯 Patrón para Módulos Simples

> **Estructura estándar para módulos que no necesitan arquitectura hexagonal completa**

## 📋 Índice

1. [Cuándo usar cada patrón](#cuándo-usar-cada-patrón)
2. [Estructura de Módulos Simples](#estructura-de-módulos-simples)
3. [Comparación con Módulos Hexagonales](#comparación)
4. [Implementación paso a paso](#implementación)
5. [Ejemplos prácticos](#ejemplos-prácticos)
6. [Mejores prácticas](#mejores-prácticas)

---

## 🤔 Cuándo usar cada patrón

### 🏗️ **Módulos Hexagonales Completos** (como `users`)

**Usar cuando:**

- ✅ Funcionalidad compleja con múltiples casos de uso
- ✅ Necesitas múltiples capas (dominio, aplicación, infraestructura)
- ✅ Requiere validaciones complejas y reglas de negocio
- ✅ Tiene múltiples integraciones externas
- ✅ Necesita testing exhaustivo por capas
- ✅ Es un módulo crítico del sistema

**Ejemplos:** `users`, `orders`, `payments`, `inventory`

### 🎯 **Módulos Simples** (como `dashboard`, `feature-flags`)

**Usar cuando:**

- ✅ Funcionalidad básica o de presentación
- ✅ Principalmente UI con lógica mínima
- ✅ No requiere reglas de negocio complejas
- ✅ Pocas integraciones externas
- ✅ Funcionalidad de soporte o administrativa
- ✅ Configuraciones o utilidades

**Ejemplos:** `dashboard`, `feature-flags`, `settings`, `notifications`, `reports`

---

## 📁 Estructura de Módulos Simples

### Estructura Estándar

```
src/features/admin/[module-name]/
├── index.ts                        # Barrel exports
├── [module-name].screen.tsx        # Página principal (Next.js App Router)
├── components/                     # Componentes específicos del módulo
│   ├── index.ts                   # Barrel exports
│   ├── [ComponentName].tsx
│   └── [AnotherComponent].tsx
├── hooks/                          # Hooks específicos del módulo
│   ├── index.ts                   # Barrel exports
│   └── use[ModuleName].ts
├── [module-name].actions.ts        # Server Actions (Next.js 15)
├── [module-name].types.ts          # Tipos TypeScript
└── [module-name].utils.ts          # Utilidades específicas (opcional)
```

### Estructura Mínima (para módulos muy simples)

```
src/features/admin/[module-name]/
├── index.ts                        # Barrel exports
├── [module-name].screen.tsx        # Página principal
├── components/                     # Componentes
│   └── [ComponentName].tsx
└── [module-name].actions.ts        # Server Actions
```

---

## 📊 Comparación

| Aspecto           | Módulo Hexagonal | Módulo Simple |
| ----------------- | ---------------- | ------------- |
| **Archivos**      | 20-50+ archivos  | 5-15 archivos |
| **Carpetas**      | 8+ carpetas      | 3-5 carpetas  |
| **Complejidad**   | Alta             | Baja          |
| **Setup inicial** | 30+ min          | 5-10 min      |
| **Mantenimiento** | Complejo         | Simple        |
| **Testing**       | Por capas        | Básico        |
| **Casos de uso**  | Complejos        | Simples       |

### Módulo Hexagonal (users)

```
src/features/admin/users/
├── index.ts
├── config/                  # Configuraciones
├── constants/               # Constantes
├── hooks/                   # Hooks
├── schemas/                 # Validaciones
├── server/                  # Capa servidor
│   ├── actions/            # Server Actions
│   ├── queries/            # Consultas
│   ├── repositories/       # Repositorios
│   ├── services/           # Servicios
│   └── validators/         # Validadores
├── types/                   # Tipos
├── ui/                      # Capa UI
│   ├── components/         # Componentes
│   ├── forms/              # Formularios
│   └── layouts/            # Layouts
├── utils/                   # Utilidades
└── examples/               # Ejemplos
```

### Módulo Simple (dashboard)

```
src/features/admin/dashboard/
├── index.ts                    # Exports
├── dashboard.screen.tsx        # Página principal
├── components/                 # Componentes
│   ├── StatsCard.tsx
│   ├── ActivityChart.tsx
│   └── QuickActions.tsx
├── hooks/
│   └── useDashboard.ts
├── dashboard.actions.ts        # Server Actions
└── dashboard.types.ts          # Tipos
```

---

## 🛠️ Implementación paso a paso

### Paso 1: Crear estructura básica

```bash
mkdir -p src/features/admin/[module-name]/{components,hooks}
touch src/features/admin/[module-name]/{index.ts,[module-name].screen.tsx,[module-name].actions.ts,[module-name].types.ts}
touch src/features/admin/[module-name]/components/index.ts
touch src/features/admin/[module-name]/hooks/index.ts
```

### Paso 2: Definir tipos básicos

```typescript
// [module-name].types.ts
export interface [ModuleName]Data {
  id: string;
  // ... propiedades específicas
}

export interface [ModuleName]Stats {
  total: number;
  // ... estadísticas específicas
}

export interface [ModuleName]Props {
  // ... props de componentes
}
```

### Paso 3: Crear Server Actions

```typescript
// [module-name].actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function get[ModuleName]DataAction() {
  try {
    // Lógica para obtener datos
    const data = await fetchData();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function update[ModuleName]Action(formData: FormData) {
  try {
    // Lógica para actualizar
    await updateData(formData);
    revalidatePath('/admin/[module-name]');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Paso 4: Crear hook principal

```typescript
// hooks/use[ModuleName].ts
"use client";

import { useActionState } from "react";
import { get[ModuleName]DataAction } from "../actions";

export function use[ModuleName]() {
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

### Paso 5: Crear página principal

```typescript
// [module-name].screen.tsx
"use client";

import React from "react";
import { use[ModuleName] } from "./hooks/use[ModuleName]";
import { [ModuleName]Component } from "./components";

export default function [ModuleName]Page() {
  const { data, isLoading, error } = use[ModuleName]();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">[Module Name]</h1>
      <[ModuleName]Component data={data} />
    </div>
  );
}
```

### Paso 6: Crear componentes

```typescript
// components/[ModuleName]Component.tsx
import React from "react";
import { [ModuleName]Data } from "../types";

interface Props {
  data: [ModuleName]Data[] | null;
}

export function [ModuleName]Component({ data }: Props) {
  return (
    <div className="grid gap-4">
      {data?.map((item) => (
        <div key={item.id} className="p-4 border rounded">
          {/* Contenido del componente */}
        </div>
      ))}
    </div>
  );
}
```

### Paso 7: Configurar exports

```typescript
// index.ts
export { default } from "./[module-name].screen";
export * from "./components";
export * from "./hooks";
export * from "./[module-name].types";
export * from "./[module-name].actions";
```

---

## 💡 Ejemplos prácticos

### Ejemplo 1: Módulo de Notificaciones

```typescript
// src/features/admin/notifications/
// types.ts
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

// actions.ts
export async function getNotificationsAction() {
  const notifications = await db.notification.findMany();
  return { success: true, data: notifications };
}

export async function markAsReadAction(id: string) {
  await db.notification.update({
    where: { id },
    data: { read: true },
  });
  revalidatePath("/admin/notifications");
  return { success: true };
}

// hooks/useNotifications.ts
export function useNotifications() {
  const [state, action] = useActionState(getNotificationsAction, null);

  return {
    notifications: state?.data || [],
    isLoading: !state,
    refresh: action,
  };
}

// page.tsx
export default function NotificationsPage() {
  const { notifications, isLoading } = useNotifications();

  return (
    <div>
      <h1>Notificaciones</h1>
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
```

### Ejemplo 2: Módulo de Configuración

```typescript
// src/features/admin/settings/
// types.ts
export interface AppSettings {
  siteName: string;
  siteUrl: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
}

// actions.ts
export async function getSettingsAction() {
  const settings = await getAppSettings();
  return { success: true, data: settings };
}

export async function updateSettingsAction(formData: FormData) {
  const settings = Object.fromEntries(formData);
  await updateAppSettings(settings);
  revalidatePath("/admin/settings");
  return { success: true };
}

// page.tsx
export default function SettingsPage() {
  const { settings, isLoading } = useSettings();

  return (
    <div>
      <h1>Configuración</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
```

---

## ✅ Mejores prácticas

### 1. **Naming Conventions**

```typescript
// ✅ Consistente
src/features/admin/dashboard/
├── useDashboard.ts         # hook principal
├── DashboardStats.tsx      # componente específico
├── actions.ts              # server actions
└── types.ts               # tipos

// ❌ Inconsistente
├── dashboardHook.ts
├── stats-component.tsx
├── serverActions.ts
```

### 2. **Organización de componentes**

```typescript
// ✅ Un componente por archivo
components/
├── DashboardStats.tsx
├── ActivityChart.tsx
└── QuickActions.tsx

// ❌ Múltiples componentes en un archivo
components/
└── AllComponents.tsx
```

### 3. **Server Actions**

```typescript
// ✅ Acciones específicas y claras
export async function getDashboardStatsAction() {}
export async function refreshDashboardAction() {}

// ❌ Acciones genéricas
export async function dashboardAction(type: string) {}
```

### 4. **Hooks**

```typescript
// ✅ Un hook principal por módulo
export function useDashboard() {
  // Toda la lógica del dashboard
}

// ✅ Hooks específicos si es necesario
export function useDashboardStats() {}
export function useDashboardRefresh() {}
```

### 5. **Tipos**

```typescript
// ✅ Tipos específicos y bien nombrados
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
}

export interface DashboardProps {
  onViewChange?: (view: string) => void;
}

// ❌ Tipos genéricos
export interface Data {
  count: number;
}
```

### 6. **Estructura de archivos**

```typescript
// ✅ Mantener archivos pequeños y enfocados
// dashboard/
// ├── page.tsx (100-200 líneas)
// ├── components/
// │   ├── StatsCard.tsx (50-100 líneas)
// │   └── ActivityChart.tsx (50-100 líneas)

// ❌ Archivos muy grandes
// ├── page.tsx (500+ líneas)
```

---

## 🎯 Cuándo migrar de Simple a Hexagonal

**Migra cuando:**

- El módulo crece a más de 15 archivos
- Necesitas múltiples capas de validación
- Requiere reglas de negocio complejas
- Tiene múltiples integraciones externas
- Necesitas testing por capas
- Se vuelve crítico para el negocio

**Señales de que necesitas migrar:**

- Archivos de más de 300 líneas
- Lógica de negocio mezclada con UI
- Múltiples responsabilidades en un componente
- Dificultad para hacer testing
- Código duplicado entre componentes

---

**Conclusión:** Los módulos simples son perfectos para funcionalidades básicas, mientras que los hexagonales son para funcionalidades complejas. Usa el patrón correcto según la complejidad de tu módulo. 🎯
