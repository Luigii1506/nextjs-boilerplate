---
title: Referencia
slug: /permisos/referencia
---

# ⚡ **REFERENCIA RÁPIDA DE PERMISOS**

## 🎯 **VERIFICACIONES BÁSICAS**

### **🔍 Hook Principal**

```typescript
import { usePermissions } from "@/shared/hooks/usePermissions";

const {
  checkPermission, // Un permiso específico
  canAccess, // Múltiples permisos + shortcut super_admin
  hasPermissionAsync, // Validación servidor (uso limitado)
  isAdmin,
  isSuperAdmin,
  currentRole,
} = usePermissions();
```

### **✅ Verificar Permisos**

```typescript
// ⚡ Un permiso específico (más rápido)
const canDelete = checkPermission("user:delete");
const canUpload = checkPermission("files:upload");

// 🎯 Múltiples permisos (con shortcut super_admin)
const canManageUsers = canAccess({
  user: ["create", "update", "delete"],
});

const canWorkWithFiles = canAccess({
  user: ["create"],
  files: ["upload"],
});

// 🌐 Validación servidor (solo casos críticos)
const hasAccess = await hasPermissionAsync({
  admin: ["system_reset"],
});
```

### **👑 Verificar Roles**

```typescript
isAdmin(); // admin o super_admin
isSuperAdmin(); // solo super_admin
currentRole; // string del rol actual
```

---

## 🛡️ **COMPONENTES PROTEGIDOS**

### **🔐 Importar Componentes**

```typescript
import {
  Protected, // Por permisos específicos
  AdminOnly, // Solo admins
  SuperAdminOnly, // Solo super admins
  RoleProtected, // Por roles específicos
  LevelProtected, // Por nivel de rol
  NoAccess, // Mensaje de acceso denegado
} from "@/shared/components/Protected";
```

### **🎯 Protección por Permisos**

```typescript
<Protected permissions={{ user: ["create"] }}>
  <CreateUserForm />
</Protected>

<Protected
  permissions={{ user: ["delete"] }}
  fallback={<div>Sin permisos</div>}
  showFallback={true}
>
  <DeleteButton />
</Protected>
```

### **👑 Protección por Roles**

```typescript
<AdminOnly>
  <AdminPanel />
</AdminOnly>

<SuperAdminOnly
  fallback={<div>Solo super admins</div>}
>
  <DangerZone />
</SuperAdminOnly>

<RoleProtected roles={["admin", "moderator"]}>
  <ModerationTools />
</RoleProtected>
```

### **📊 Protección por Nivel**

```typescript
<LevelProtected minLevel={80}>
  <AdvancedFeatures />
</LevelProtected>
```

---

## 📊 **RECURSOS Y ACCIONES**

### **👥 Usuarios**

```typescript
checkPermission("user:create"); // ➕ Crear
checkPermission("user:read"); // 👁️ Ver detalles
checkPermission("user:list"); // 📋 Listar
checkPermission("user:update"); // ✏️ Actualizar
checkPermission("user:delete"); // 🗑️ Eliminar
checkPermission("user:ban"); // 🚫 Banear
checkPermission("user:impersonate"); // 🎭 Impersonar
checkPermission("user:set-role"); // 👑 Cambiar rol
checkPermission("user:set-password"); // 🔑 Cambiar contraseña
```

### **🔐 Sesiones**

```typescript
checkPermission("session:list"); // 📋 Ver sesiones
checkPermission("session:revoke"); // ❌ Revocar
checkPermission("session:delete"); // 🗑️ Eliminar
```

### **📁 Archivos**

```typescript
checkPermission("files:read"); // 👁️ Ver archivos
checkPermission("files:upload"); // 📤 Subir
checkPermission("files:delete"); // 🗑️ Eliminar
```

### **🚩 Feature Flags**

```typescript
checkPermission("feature_flags:read"); // 👁️ Ver flags
checkPermission("feature_flags:write"); // ✏️ Modificar flags
```

---

## 🎭 **ROLES Y JERARQUÍA**

### **👑 Roles Disponibles**

```typescript
"super_admin"; // Nivel 100 - 👑 Acceso total
"admin"; // Nivel 80  - 🛡️ Gestión sistema
"user"; // Nivel 20  - 👤 Usuario estándar
```

### **🔧 Utilidades de Roles**

```typescript
const { canManageRole, getManageableRoles, currentLevel } = usePermissions();

// ¿Puede cambiar este rol?
canManageRole("admin"); // boolean

// ¿Qué roles puede asignar?
getManageableRoles(); // string[]

// ¿Qué nivel tiene?
currentLevel; // number
```

---

## 🌐 **PROTECCIÓN SERVER-SIDE**

### **🔒 Server Actions**

```typescript
import { hasPermission } from "@/core/auth/config/utils";
import { getCurrentUser } from "@/core/auth/server/auth";

export async function createUserAction(formData: FormData) {
  const user = await getCurrentUser();

  // 🛡️ Verificar permiso
  if (!hasPermission(user, "user:create")) {
    throw new Error("No tienes permisos para crear usuarios");
  }

  // ✅ Continuar si tiene permiso
  // ...lógica de creación
}
```

### **📄 Páginas Protegidas**

```typescript
// app/admin/users/page.tsx
import { hasPermission } from "@/core/auth/config/utils";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  // 🛡️ Proteger toda la página
  if (!hasPermission(user, "user:list")) {
    redirect("/unauthorized");
  }

  return <UsersList />;
}
```

---

## ❌ **MANEJO DE ERRORES**

### **🚫 Componente Sin Acceso**

```typescript
<NoAccess
  title="Acceso Denegado"
  message="No tienes permisos para esta acción"
  icon="🚫"
/>
```

---

## 🧪 **DEBUGGING**

### **📊 Estadísticas (Desarrollo)**

```typescript
const { getCacheStats, currentRole, currentLevel, isAuthenticated } =
  usePermissions();

// 📊 Ver estado del cache
console.log(getCacheStats());
/*
{
  size: 8,
  keys: ["user123-user:create", "user123-files:upload", ...]
}
*/

// 📋 Información del usuario
console.log({
  currentRole, // "admin"
  currentLevel, // 80
  isAuthenticated, // true
});
```

### **🧹 Cache Management**

```typescript
const { clearCache } = usePermissions();

clearCache(); // 🧹 Limpiar cache completo
```

### **🔍 Debug con Logs**

```typescript
// Activar logs en desarrollo
const { checkPermission } = usePermissions({
  logPermissions: true,
});

checkPermission("user:create"); // Muestra: 🔐 user:create: ✅
```

---

## 🎯 **PATRONES COMUNES**

### **🔍 Verificación Condicional**

```typescript
const UserCard = ({ user }) => {
  const { checkPermission, canManageRole } = usePermissions();

  const canEditThisUser = checkPermission("user:update");
  const canChangeThisRole = canManageRole(user.role);

  return (
    <div>
      {canEditThisUser && <EditButton />}
      {canChangeThisRole && <RoleSelector />}
    </div>
  );
};
```

### **🎯 Verificación Múltiple**

```typescript
const UserManagement = () => {
  const { canAccess, checkPermission } = usePermissions();

  // ✅ Una verificación para múltiples acciones
  const canManageUsers = canAccess({
    user: ["create", "update", "delete"],
  });

  // ✅ O verificaciones individuales específicas
  const canCreate = checkPermission("user:create");
  const canDelete = checkPermission("user:delete");

  return (
    <div>
      {canCreate && <CreateButton />}
      {canDelete && <DeleteButton />}
      {canManageUsers && <ManagementPanel />}
    </div>
  );
};
```

---

## 🚨 **TROUBLESHOOTING**

### **❌ Problemas Comunes**

**No se actualiza el permiso tras cambio de rol:**

```typescript
// 🧹 Limpiar cache
const { clearCache } = usePermissions();
clearCache();
```

**Componente no se re-renderiza:**

```typescript
// ✅ Asegurar dependencias correctas
const canDelete = useMemo(
  () => checkPermission("user:delete"),
  [checkPermission] // 🎯 Dependencia explícita
);
```

**Cache obsoleto:**

```typescript
// 🧹 Limpiar cache al cambiar usuario
useEffect(() => {
  if (user?.id !== previousUserId) {
    clearCache();
  }
}, [user?.id, clearCache]);
```

### **🔍 Verificar Estado**

```typescript
// Development only
if (process.env.NODE_ENV === "development") {
  const { currentRole, getCacheStats } = usePermissions();
  console.log("Current role:", currentRole);
  console.log("Cache stats:", getCacheStats());
}
```

---

## ⚡ **SHORTCUTS ÚTILES**

### **📋 Verificaciones Rápidas**

```typescript
// ⚡ Para un permiso específico
const canCreate = checkPermission("user:create");

// 🎯 Para múltiples permisos del mismo recurso
const canManageUsers = canAccess({ user: ["create", "update", "delete"] });

// 👑 Verificación de rol simple
const { isAdmin } = usePermissions();
// En lugar de: currentRole === "admin" || currentRole === "super_admin"

// 🛡️ Componente protegido simple
<AdminOnly>
  <AdminFeatures />
</AdminOnly>;
```

### **🎯 Tipos TypeScript**

```typescript
import type {
  Permission,
  RoleName,
  AnyPermission,
  Resource,
} from "@/core/auth/config/permissions";

// Uso tipado
const permission: AnyPermission = "user:create";
const role: RoleName = "admin";
const perms: Permission = { user: ["create", "update"] };
const resource: Resource = "files";
```

---

## 📝 **CHECKLIST DE IMPLEMENTACIÓN**

### **✅ Para Nuevos Componentes**

- [ ] ¿Necesita protección de permisos?
- [ ] ¿Usar `Protected` o verificar directamente con hook?
- [ ] ¿Mostrar fallback o ocultar?
- [ ] ¿Verificar server-side también?

### **✅ Para Nuevas Funcionalidades**

- [ ] ¿Añadir nuevo recurso a `PERMISSIONS`?
- [ ] ¿Actualizar `ROLE_STATEMENTS`?
- [ ] ¿Añadir protección server-side?
- [ ] ¿Escribir tests de permisos?

---

## 🔗 **ENLACES RÁPIDOS**

- **🏗️ [Nueva Arquitectura](./PERMISSIONS_NEW_ARCHITECTURE.md)**
- **🏠 [README Principal](./PERMISSIONS_README.md)**
- **📊 [Estructura Detallada](./PERMISSIONS_STRUCTURE_DETAILED.md)**
- **💡 [Ejemplos Prácticos](./PERMISSIONS_PRACTICAL_EXAMPLES.md)**

---

**💡 Tip: Guarda esta página como referencia rápida durante el desarrollo!**
