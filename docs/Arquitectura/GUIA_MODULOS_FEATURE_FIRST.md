# 📚 Guía de Arquitectura de Módulos

## 🎯 Estándar de Módulos Feature-First

Esta guía define la estructura estándar para módulos en nuestro proyecto, con dos patrones según la complejidad.

---

## 📏 Criterios de Decisión

### ✅ **Módulo Simple** cuando:
- **Funcionalidad directa** (principalmente CRUD o UI)
- **Lógica straightforward** sin reglas complejas de negocio
- **Pocos archivos** (< 10 archivos totales)
- **Desarrollo rápido** es prioridad
- **Ejemplos**: feature-flags, dashboard, notifications

### ✅ **Módulo Complejo** cuando:
- **Lógica de negocio rica** (reglas, validaciones, cálculos)
- **Múltiples responsabilidades** bien definidas
- **Muchos archivos** (10+ archivos)
- **Separación de capas** necesaria
- **Ejemplos**: users, orders, payments, audit

---

## 🚀 Estructura: Módulo Simple

```
src/features/[module-name]/
├── index.ts                     # 📦 API pública (barrel export)
├── [module].config.ts           # ⚙️ Configuración estática
├── [module].types.ts            # 📝 Tipos y interfaces
├── [module].hooks.ts            # 🪝 Client hooks
├── [module].actions.ts          # 🚀 Server actions
├── [module].screen.tsx          # 🎨 UI principal
├── [module].server.ts           # 🏢 Server utilities (opcional)
└── components/                  # 🎨 Componentes específicos
    ├── [Module]Card.tsx
    └── [Module]Modal.tsx
```

### 📋 **Ejemplo: Feature Flags**
```
src/features/feature-flags/
├── index.ts                     # API pública
├── feature-flags.config.ts      # Configuración estática
├── feature-flags.types.ts       # Tipos del dominio
├── feature-flags.hooks.ts       # useFeatureFlags, useIsEnabled
├── feature-flags.actions.ts     # toggleFeatureFlagAction
├── feature-flags.screen.tsx     # Admin UI
├── feature-flags.server.ts      # Server utilities & cache
└── components/
    ├── FeatureFlagCard.tsx
    └── FeatureFlagToggle.tsx
```

### 📋 **Ejemplo: Dashboard**
```
src/features/admin/dashboard/
├── index.ts                     # API pública
├── dashboard.types.ts           # DashboardStats, OptimisticState
├── dashboard.hooks.ts           # useDashboard, useDashboardStats
├── dashboard.actions.ts         # getDashboardStatsAction
├── dashboard.screen.tsx         # Dashboard UI
└── components/
    ├── StatsCard.tsx
    └── ActivityChart.tsx
```

---

## 🏗️ Estructura: Módulo Complejo

```
src/features/[module-name]/
├── index.ts                     # 📦 API pública (barrel export)
├── types.ts                     # 📝 Tipos consolidados
├── schemas.ts                   # ✅ Validaciones consolidadas
├── constants.ts                 # 📋 Constantes consolidadas
├── utils.ts                     # 🛠️ Utilidades consolidadas
├── config.ts                    # ⚙️ Configuración consolidada
├── hooks/                       # 🪝 Múltiples hooks (3+ archivos)
│   ├── use[Module].ts           # Hook principal
│   ├── use[Module]Filters.ts    # Filtros
│   └── use[Module]Actions.ts    # Acciones
├── server/                      # 🏢 Server logic (5+ archivos)
│   ├── actions.ts               # Server Actions
│   ├── queries.ts               # DB queries
│   ├── services.ts              # Lógica de negocio
│   ├── mappers.ts               # Transformaciones
│   ├── validators.ts            # Validaciones server
│   └── index.ts                 # Barrel export
└── ui/                          # 🎨 Múltiples componentes (5+ archivos)
    ├── [Module]List.tsx         # Lista principal
    ├── [Module]Card.tsx         # Tarjeta individual
    ├── [Module]Modal.tsx        # Modal de edición
    ├── [Module]Filters.tsx      # Filtros
    └── [Module]Actions.tsx      # Acciones masivas
```

### 📋 **Ejemplo: Users**
```
src/features/admin/users/
├── index.ts                     # API pública
├── types.ts                     # User, UserStats, UserFilters
├── schemas.ts                   # userCreateSchema, userUpdateSchema
├── constants.ts                 # USER_ROLES, USER_STATUS
├── utils.ts                     # formatUserName, validateEmail
├── config.ts                    # Configuración del módulo
├── hooks/                       # Múltiples hooks
│   ├── useUsers.ts              # Hook principal
│   ├── useUserFilters.ts        # Filtros y búsqueda
│   ├── useUserActions.ts        # CRUD actions
│   └── useUserPermissions.ts    # Permisos
├── server/                      # Server logic
│   ├── actions.ts               # createUser, updateUser, deleteUser
│   ├── queries.ts               # getUsers, getUserById, searchUsers
│   ├── services.ts              # UserService, PermissionService
│   ├── mappers.ts               # dbToApi, apiToDb
│   ├── validators.ts            # Server-side validations
│   └── index.ts                 # Barrel export
└── ui/                          # Componentes UI
    ├── UsersList.tsx            # Lista principal
    ├── UserCard.tsx             # Tarjeta de usuario
    ├── UserModal.tsx            # Modal crear/editar
    ├── UserFilters.tsx          # Filtros avanzados
    └── UserBulkActions.tsx      # Acciones masivas
```

---

## 📦 Barrel Exports (index.ts)

### 🚀 **Módulo Simple**
```typescript
/**
 * 🎛️ [MODULE NAME] - PUBLIC API
 * =============================
 * 
 * Barrel export que define la API pública del módulo.
 * Solo exporta lo que otros módulos pueden usar.
 */

// 🪝 Hooks públicos
export {
  use[Module],
  use[Module]Actions,
} from "./[module].hooks";

// 🚀 Server Actions públicos
export {
  get[Module]Action,
  create[Module]Action,
} from "./[module].actions";

// 📝 Tipos públicos
export type {
  [Module],
  [Module]Data,
} from "./[module].types";

// 🎨 Componentes públicos (si otros módulos los necesitan)
export { default as [Module]Screen } from "./[module].screen";
```

### 🏗️ **Módulo Complejo**
```typescript
/**
 * 👥 [MODULE NAME] - PUBLIC API
 * =============================
 * 
 * Barrel export que define la API pública del módulo.
 * Solo exporta lo que otros módulos pueden usar.
 */

// 🪝 Hooks públicos
export {
  use[Module],
  use[Module]Filters,
  use[Module]Actions,
} from "./hooks";

// 🏢 Server utilities públicos
export {
  get[Module]Action,
  create[Module]Action,
  update[Module]Action,
  delete[Module]Action,
} from "./server";

// 📝 Tipos públicos
export type {
  [Module],
  [Module]Data,
  [Module]Filters,
  [Module]Stats,
} from "./types";

// ✅ Schemas públicos (para validación en otros módulos)
export {
  [module]CreateSchema,
  [module]UpdateSchema,
} from "./schemas";

// 🎨 Componentes públicos (si otros módulos los necesitan)
export { default as [Module]List } from "./ui/[Module]List";
```

---

## 🎯 Convenciones de Nombres

### 📝 **Archivos**
- **Config**: `config.ts` (no `[module].config.ts` dentro del módulo)
- **Types**: `types.ts` (no `[module].types.ts` dentro del módulo)
- **Hooks**: `hooks.ts` o `use[Module].ts`
- **Actions**: `actions.ts` (Server Actions)
- **Screen**: `screen.tsx` (UI principal)
- **Components**: `[Module]Card.tsx`, `[Module]Modal.tsx`

### 📁 **Folders**
- **Solo usar folders** cuando tienes **3+ archivos** relacionados
- **Nombres descriptivos**: `hooks/`, `server/`, `ui/`, `components/`
- **Evitar folders** para 1-2 archivos (usar archivos directos)

### 🔤 **Imports**
```typescript
// ✅ Desde API pública
import { useUsers, UserData } from "@/features/admin/users";

// ❌ Desde rutas internas
import { useUsers } from "@/features/admin/users/hooks/useUsers";
```

---

## 🔄 Migración entre Patrones

### 📈 **Simple → Complejo** (cuando crece)
1. **Identificar archivos** que necesitan separación
2. **Crear folders** para grupos de 3+ archivos
3. **Mover contenido** manteniendo la API pública
4. **Actualizar barrel exports**

### 📉 **Complejo → Simple** (cuando se simplifica)
1. **Consolidar folders** con pocos archivos
2. **Mantener folders** con múltiples archivos
3. **Simplificar barrel exports**

---

## ✅ Checklist de Validación

### 🚀 **Para Módulo Simple**
- [ ] ¿Tiene menos de 10 archivos totales?
- [ ] ¿La lógica es straightforward?
- [ ] ¿No necesita separación de capas?
- [ ] ¿El desarrollo rápido es prioridad?

### 🏗️ **Para Módulo Complejo**
- [ ] ¿Tiene 10+ archivos?
- [ ] ¿Hay lógica de negocio rica?
- [ ] ¿Necesita separación clara de responsabilidades?
- [ ] ¿Hay múltiples hooks/components/services?

---

## 🎯 Ejemplos de Uso

### 🚀 **Crear Módulo Simple**
```bash
# 1. Crear estructura
mkdir -p src/features/notifications
touch src/features/notifications/{index.ts,notifications.types.ts,notifications.hooks.ts,notifications.actions.ts,notifications.screen.tsx}
mkdir src/features/notifications/components

# 2. Implementar siguiendo el patrón simple
```

### 🏗️ **Crear Módulo Complejo**
```bash
# 1. Crear estructura
mkdir -p src/features/orders/{hooks,server,ui}
touch src/features/orders/{index.ts,types.ts,schemas.ts,constants.ts,utils.ts,config.ts}
touch src/features/orders/server/{actions.ts,queries.ts,services.ts,mappers.ts,validators.ts,index.ts}

# 2. Implementar siguiendo el patrón complejo
```

---

## 🎛️ Integración con Feature Flags

Todos los módulos pueden ser controlados por feature flags:

```typescript
// En navigation o routing
{
  path: "/[module]",
  component: [Module]Screen,
  featureFlag: "[module]UI",        // Controla la UI
  permission: "admin:[module]"      // Controla el acceso
}
```

---

## 🔧 Reglas de Refactoring

### 📁 **Folders vs Archivos**
```typescript
// ❌ Folder con 1 archivo
server/
└── actions/
    └── index.ts

// ✅ Archivo directo
server/
└── actions.ts

// ✅ Folder con múltiples archivos
server/
└── actions/
    ├── user-crud.actions.ts
    ├── user-bulk.actions.ts
    └── user-permissions.actions.ts
```

### 🔄 **Cuándo Consolidar**
- Folder tiene **1-2 archivos** únicamente
- No esperas **crecimiento** significativo
- **Navegación** se vuelve tediosa

### 🔄 **Cuándo Separar**
- Archivo supera **500+ líneas**
- **Responsabilidades** claramente diferentes
- **Testing** requiere separación

---

## 🎨 Patrones de UI

### 🚀 **Módulo Simple**
```typescript
// [module].screen.tsx - UI principal
export default function [Module]Screen() {
  const { data, isLoading } = use[Module]();
  
  return (
    <div>
      <[Module]Header />
      <[Module]Content data={data} />
    </div>
  );
}
```

### 🏗️ **Módulo Complejo**
```typescript
// ui/[Module]List.tsx - Lista principal
export default function [Module]List() {
  const { data, filters, actions } = use[Module]();
  
  return (
    <div>
      <[Module]Filters filters={filters} />
      <[Module]Table data={data} actions={actions} />
      <[Module]Pagination />
    </div>
  );
}
```

---

## 🧪 Patrones de Testing

### 🚀 **Módulo Simple**
```
src/features/[module]/
├── __tests__/
│   ├── [module].hooks.test.ts
│   ├── [module].actions.test.ts
│   └── [module].screen.test.tsx
```

### 🏗️ **Módulo Complejo**
```
src/features/[module]/
├── hooks/__tests__/
├── server/__tests__/
├── ui/__tests__/
└── __tests__/
    └── integration.test.ts
```

---

Esta guía asegura **consistencia**, **escalabilidad** y **mantenibilidad** en todos los módulos del proyecto.

## 📚 Referencias

- [Feature-First Architecture](./FEATURE_FIRST_ARCHITECTURE.md)
- [Hexagonal Architecture](./HEXAGONAL_ARCHITECTURE.md)
- [Testing Patterns](../Testing/TESTING_PATTERNS.md)
- [Code Standards](../Standards/CODE_STANDARDS.md)
