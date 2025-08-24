# 🔐 **SISTEMA DE PERMISOS ESTANDARIZADO**

==================================

**Arquitectura consolidada para permisos granulares y escalables**

Este documento define el patrón oficial para implementar permisos en todos los módulos del sistema.

---

## 📊 **ESTADO ACTUAL**

### **✅ SISTEMA CORRECTO**

**Ubicación**: `src/core/auth/permissions.ts`

- 🎯 **Centralizado** - Un solo lugar para todos los permisos
- 🔥 **Granular** - Permisos específicos por recurso y acción
- 🛡️ **Type-safe** - Completamente tipado con TypeScript
- 🚀 **Escalable** - Fácil agregar nuevos módulos/permisos

### **❌ SISTEMAS A EVITAR**

1. **Validación básica por rol** - Solo check admin/no admin
2. **Permisos hardcoded** - Arrays de strings en validators
3. **Hooks frontend para backend** - `useAuthQuery` solo para UI

---

## 🎯 **PATRÓN ESTÁNDAR - Implementación por Módulo**

### **PASO 1: Definir Permisos en Core**

```typescript
// src/core/auth/permissions.ts

export const PERMISSIONS = {
  // ... permisos existentes

  // 📦 NUEVO MÓDULO - Ejemplo: Inventory
  inventory_product: [
    "create",
    "read",
    "list",
    "update",
    "delete",
    "set-stock",
    "view-cost",
    "view-profit", // permisos específicos
  ],
  inventory_category: ["create", "read", "list", "update", "delete"],
  // ... más recursos
} as const;
```

### **PASO 2: Asignar a Roles**

```typescript
export const ROLE_STATEMENTS = {
  super_admin: {
    // Acceso completo
    inventory_product: [
      "create",
      "read",
      "list",
      "update",
      "delete",
      "set-stock",
      "view-cost",
      "view-profit",
    ],
    inventory_category: ["create", "read", "list", "update", "delete"],
  },
  admin: {
    // Acceso casi completo
    inventory_product: [
      "create",
      "read",
      "list",
      "update",
      "delete",
      "set-stock",
      "view-cost",
      "view-profit",
    ],
    inventory_category: ["create", "read", "list", "update", "delete"],
  },
  user: {
    // Solo lectura
    inventory_product: ["read", "list"],
    inventory_category: ["read", "list"],
  },
} satisfies {
  [role in RoleName]: Partial<{ [R in Resource]: readonly ActionOf<R>[] }>;
};
```

### **PASO 3: Crear Helpers Específicos**

```typescript
// En permissions.ts - Opcional pero recomendado
export const inventoryPermissions = {
  canCreateProduct: (user: PermissionUser) =>
    hasPermission(user, "inventory_product:create"),
  canDeleteProduct: (user: PermissionUser) =>
    hasPermission(user, "inventory_product:delete"),
  // ... más helpers
} as const;
```

### **PASO 4: Refactorizar Validator del Módulo**

```typescript
// src/features/{module}/server/validators.ts

import {
  hasPermission,
  inventoryPermissions, // si existe
  type PermissionUser,
} from "@/core/auth/permissions";
import type { Session } from "@/core/auth/server";

// 🔄 CONVERTER OBLIGATORIO
export function sessionToPermissionUser(
  session: Session | null
): PermissionUser {
  if (!session?.user) {
    throw new ValidationError("Authentication required - no valid session");
  }

  return {
    id: session.user.id,
    role: session.user.role || "user",
    permissions: [], // Better Auth handles permissions via role
  } satisfies PermissionUser;
}

// 🛡️ VALIDATION FUNCTION
export function validateModulePermissions(
  user: PermissionUser,
  action: ModulePermissionAction // Define tu enum de acciones
): void {
  if (!user) {
    throw new ValidationError("Authentication required");
  }

  const actionMapping: Record<ModulePermissionAction, () => boolean> = {
    CREATE_RESOURCE: () => hasPermission(user, "module_resource:create"),
    DELETE_RESOURCE: () => hasPermission(user, "module_resource:delete"),
    // ... mapear todas las acciones
  };

  const permissionCheck = actionMapping[action];
  if (!permissionCheck) {
    throw new ValidationError(`Unknown module action: ${action}`);
  }

  if (!permissionCheck()) {
    throw new ValidationError(
      `Insufficient permissions for ${action}. User role: ${user.role} lacks module permissions.`
    );
  }
}

// 🎯 ENUM DE ACCIONES
export type ModulePermissionAction = "CREATE_RESOURCE" | "DELETE_RESOURCE";
// ... todas las acciones del módulo
```

### **PASO 5: Actualizar Service del Módulo**

```typescript
// src/features/{module}/server/service.ts

import { requireAuth } from "@/core/auth/server";
import {
  validateModulePermissions,
  sessionToPermissionUser,
} from "./validators";

export class ResourceService {
  static async create(
    input: CreateInput,
    userId: string
  ): Promise<ActionResult<Resource>> {
    try {
      // 🛡️ AUTHENTICATION & AUTHORIZATION
      const session = await requireAuth();
      const user = sessionToPermissionUser(session); // Convertir tipos
      validateModulePermissions(user, "CREATE_RESOURCE"); // Validar permisos

      // ... resto de lógica de negocio
    } catch (error) {
      // ... manejo de errores
    }
  }

  static async delete(
    resourceId: string,
    userId: string
  ): Promise<ActionResult> {
    try {
      const session = await requireAuth();
      const user = sessionToPermissionUser(session);
      validateModulePermissions(user, "DELETE_RESOURCE");

      // ... resto de lógica
    } catch (error) {
      // ... manejo de errores
    }
  }
}
```

---

## 🔥 **EJEMPLO COMPLETO - Módulo Inventory**

### **1. Core Permissions** ✅ **YA IMPLEMENTADO**

```typescript
// src/core/auth/permissions.ts
export const PERMISSIONS = {
  inventory_product: [
    "create",
    "read",
    "list",
    "update",
    "delete",
    "set-stock",
    "view-cost",
    "view-profit",
  ],
  inventory_category: ["create", "read", "list", "update", "delete"],
  // ... etc
} as const;
```

### **2. Validator** ✅ **YA IMPLEMENTADO**

```typescript
// src/features/inventory/server/validators.ts
export function validateInventoryPermissions(
  user: PermissionUser,
  action: InventoryPermissionAction
): void {
  // ... implementación completa
}
```

### **3. Service** ✅ **YA IMPLEMENTADO**

```typescript
// src/features/inventory/server/service.ts
static async delete(productId: string, userId: string): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    const user = sessionToPermissionUser(session);
    validateInventoryPermissions(user, "DELETE_PRODUCT"); // ✅ CORRECTO

    // ... lógica de negocio
  }
}
```

---

## 📚 **GUÍA RÁPIDA - Checklist para Nuevos Módulos**

### **✅ IMPLEMENTACIÓN**

- [ ] **1.** Agregar permisos del módulo a `PERMISSIONS` en `core/auth/permissions.ts`
- [ ] **2.** Asignar permisos a roles en `ROLE_STATEMENTS`
- [ ] **3.** Crear `sessionToPermissionUser()` en validator del módulo
- [ ] **4.** Crear `validateModulePermissions()` función
- [ ] **5.** Definir `ModulePermissionAction` enum
- [ ] **6.** Actualizar todos los services para usar el nuevo sistema
- [ ] **7.** Reemplazar validaciones básicas por rol con sistema granular

### **🚨 QUE NO HACER**

- ❌ **NO** usar `user.role === "admin"` directamente
- ❌ **NO** hardcodear arrays de acciones en validators
- ❌ **NO** usar hooks de frontend (`useAuthQuery`) en backend
- ❌ **NO** pasar `Session` directamente a funciones de permisos
- ❌ **NO** crear sistemas de permisos separados por módulo

---

## 🔍 **COMPARACIÓN - ANTES vs DESPUÉS**

### **❌ ANTES (Sistema básico)**

```typescript
// Malo - Solo check por rol
const adminActions = ["DELETE_PRODUCT"];
if (adminActions.includes(action) && user.role !== "admin") {
  throw new Error(`Insufficient permissions for ${action}`);
}
```

### **✅ DESPUÉS (Sistema robusto)**

```typescript
// Excelente - Sistema granular y tipado
const session = await requireAuth();
const user = sessionToPermissionUser(session);
validateInventoryPermissions(user, "DELETE_PRODUCT");
```

---

## 🎯 **BENEFICIOS DEL NUEVO SISTEMA**

### **🔐 Seguridad**

- **Permisos granulares** - Control específico por acción
- **Tipado estricto** - Previene errores de permisos
- **Centralizado** - Un solo punto de configuración

### **🛠️ Mantenibilidad**

- **Consistencia** - Mismo patrón en todos los módulos
- **Escalabilidad** - Fácil agregar nuevos módulos/permisos
- **Debuggeable** - Errores claros y específicos

### **👨‍💻 Developer Experience**

- **IntelliSense completo** - Autocompletado de permisos
- **Refactoring seguro** - Cambios detectados por TypeScript
- **Documentación integrada** - Código autodocumentado

---

## 🚀 **PRÓXIMOS PASOS**

1. **✅ Inventory** - Ya implementado (ejemplo de referencia)
2. **📋 TODO**: Migrar módulo `users` al nuevo patrón (ya usa hasPermission pero puede mejorar)
3. **📋 TODO**: Implementar en futuros módulos (`orders`, `customers`, etc.)

---

**🎯 Este patrón es el ESTÁNDAR oficial para todos los módulos nuevos y refactorizaciones futuras.**
