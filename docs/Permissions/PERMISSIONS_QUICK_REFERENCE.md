---
title: Referencia
slug: /permisos/referencia
---

# ⚡ **REFERENCIA RÁPIDA DE PERMISOS**

## 🎯 **VERIFICACIONES BÁSICAS**

### **🔍 Hook Principal**

```typescript
import { usePermissions } from "@/shared/hooks/usePermissions";

const { canAccess, isAdmin, isSuperAdmin, currentRole } = usePermissions();
```

### **✅ Verificar Permisos**

```typescript
// Una acción
canAccess({ user: ["create"] });

// Múltiples acciones del mismo recurso
canAccess({ user: ["create", "update", "delete"] });

// Múltiples recursos
canAccess({
  user: ["create"],
  files: ["upload"],
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
  Protected,
  AdminOnly,
  SuperAdminOnly,
  RoleProtected,
  LevelProtected,
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
// Verificaciones
canAccess({ user: ["create"] }); // ➕ Crear
canAccess({ user: ["read"] }); // 👁️ Ver detalles
canAccess({ user: ["list"] }); // 📋 Listar
canAccess({ user: ["update"] }); // ✏️ Actualizar
canAccess({ user: ["delete"] }); // 🗑️ Eliminar
canAccess({ user: ["ban"] }); // 🚫 Banear
canAccess({ user: ["impersonate"] }); // 🎭 Impersonar
canAccess({ user: ["set-role"] }); // 👑 Cambiar rol
canAccess({ user: ["set-password"] }); // 🔑 Cambiar contraseña
```

### **🔐 Sesiones**

```typescript
canAccess({ session: ["list"] }); // 📋 Ver sesiones
canAccess({ session: ["revoke"] }); // ❌ Revocar
canAccess({ session: ["delete"] }); // 🗑️ Eliminar
```

### **📁 Archivos**

```typescript
canAccess({ files: ["read"] }); // 👁️ Ver archivos
canAccess({ files: ["upload"] }); // 📤 Subir
canAccess({ files: ["delete"] }); // 🗑️ Eliminar
```

### **🚩 Feature Flags**

```typescript
canAccess({ feature_flags: ["read"] }); // 👁️ Ver flags
canAccess({ feature_flags: ["write"] }); // ✏️ Modificar flags
```

---

## 🎭 **ROLES Y JERARQUÍA**

### **👑 Roles Disponibles**

```typescript
"super_admin"; // Nivel 100 - 👑 Acceso total
"admin"; // Nivel 80  - 🛡️ Gestión sistema
"moderator"; // Nivel 60  - 🔨 Moderación
"editor"; // Nivel 40  - ✏️ Edición contenido
"user"; // Nivel 20  - 👤 Usuario estándar
"guest"; // Nivel 10  - 👻 Solo lectura
```

### **🔧 Utilidades de Roles**

```typescript
const { canManageUserRole, getManageableRoles, currentLevel } =
  usePermissions();

// ¿Puede cambiar este rol?
canManageUserRole("admin"); // boolean

// ¿Qué roles puede asignar?
getManageableRoles(); // string[]

// ¿Qué nivel tiene?
currentLevel; // number
```

---

## 🪝 **HOOKS ESPECÍFICOS**

### **👥 Gestión de Usuarios**

```typescript
import { useUserManagement } from "@/shared/hooks/usePermissions";

const {
  canCreateUsers,
  canEditUsers,
  canDeleteUsers,
  canBanUsers,
  canSetUserRoles,
  canImpersonateUsers,
} = useUserManagement();
```

### **📁 Gestión de Archivos**

```typescript
import { useFileManagement } from "@/shared/hooks/usePermissions";

const { canViewFiles, canUploadFiles, canDeleteFiles } = useFileManagement();
```

### **🔐 Gestión de Sesiones**

```typescript
import { useSessionManagement } from "@/shared/hooks/usePermissions";

const { canViewSessions, canRevokeSessions, canDeleteSessions } =
  useSessionManagement();
```

---

## 🌐 **PROTECCIÓN SERVER-SIDE**

### **🔒 Server Actions**

```typescript
import { ensurePermission } from "@/core/auth/config/permissions";
import { getCurrentUser } from "@/core/auth/server/auth";

export async function createUserAction(formData: FormData) {
  const user = await getCurrentUser();

  // 🛡️ Verificar permiso
  await ensurePermission(user, "user:create");

  // ✅ Continuar si tiene permiso
  // ...lógica de creación
}
```

### **📄 Páginas Protegidas**

```typescript
// app/admin/users/page.tsx
import { ensurePermission } from "@/core/auth/config/permissions";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  // 🛡️ Proteger toda la página
  await ensurePermission(user, "user:list");

  return <UsersList />;
}
```

---

## ❌ **MANEJO DE ERRORES**

### **🚫 Componente Sin Acceso**

```typescript
import { NoAccess } from "@/shared/components/Protected";

<NoAccess
  title="Acceso Denegado"
  message="No tienes permisos para esta acción"
  icon="🚫"
/>;
```

### **🔄 Verificación con Loading**

```typescript
import { PermissionGate } from "@/shared/components/Protected";

<PermissionGate
  permissions={{ user: ["create"] }}
  loading={<div>🔄 Verificando...</div>}
  fallback={<NoAccess />}
>
  <CreateUserForm />
</PermissionGate>;
```

---

## 🧪 **DEBUGGING**

### **📊 Estadísticas (Desarrollo)**

```typescript
const { getPermissionStats } = usePermissions();

// 📊 Ver estadísticas
console.log(getPermissionStats());
/*
{
  totalChecks: 15,
  lastCheck: Date,
  cacheSize: 8,
  currentRole: "admin",
  currentLevel: 80,
  isAuthenticated: true
}
*/
```

### **🧹 Cache Management**

```typescript
const { clearPermissionCache, refreshPermissions } = usePermissions();

clearPermissionCache(); // 🧹 Limpiar cache
refreshPermissions(); // 🔄 Refrescar todo
```

---

## 🎯 **PATRONES COMUNES**

### **🔍 Verificación Condicional**

```typescript
const UserCard = ({ user }) => {
  const { canAccess, canManageUserRole } = usePermissions();

  const canEditThisUser = canAccess({ user: ["update"] });
  const canChangeThisRole = canManageUserRole(user.role);

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
import { usePermissionValidator } from "@/shared/hooks/usePermissions";

const { canProceed } = usePermissionValidator([
  {
    name: "user_management",
    permissions: { user: ["create", "update"] },
    required: true,
  },
  {
    name: "file_management",
    permissions: { files: ["upload"] },
    required: false,
  },
]);

if (!canProceed) {
  return <AccessDenied />;
}
```

### **🔄 Verificación Asíncrona**

```typescript
const { hasPermissionAsync } = usePermissions();

const handleAction = async () => {
  const canProceed = await hasPermissionAsync({ user: ["create"] });

  if (!canProceed) {
    alert("Sin permisos");
    return;
  }

  // ✅ Proceder con la acción
};
```

---

## 🚨 **TROUBLESHOOTING**

### **❌ Problemas Comunes**

**No se actualiza el permiso tras cambio de rol:**

```typescript
// 🔄 Refrescar permisos
const { refreshPermissions } = usePermissions();
refreshPermissions();
```

**Componente no se re-renderiza:**

```typescript
// ✅ Asegurar dependencias correctas
const canDelete = useMemo(
  () => canAccess({ user: ["delete"] }),
  [canAccess] // 🎯 Dependencia explícita
);
```

**Cache obsoleto:**

```typescript
// 🧹 Limpiar cache al cambiar usuario
useEffect(() => {
  if (user?.id !== previousUserId) {
    clearPermissionCache();
  }
}, [user?.id, clearPermissionCache]);
```

### **🔍 Verificar Estado**

```typescript
// Development only
if (process.env.NODE_ENV === "development") {
  console.log("Current role:", currentRole);
  console.log("Permissions:", getPermissionStats());
}
```

---

## ⚡ **SHORTCUTS ÚTILES**

### **📋 Verificaciones Rápidas**

```typescript
// En lugar de canAccess({ user: ["create"] })
const { canCreateUsers } = useUserManagement();

// En lugar de currentRole === "admin" || currentRole === "super_admin"
const { isAdmin } = usePermissions();

// En lugar de componente complejo
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
} from "@/core/auth/config/permissions";

// Uso tipado
const permission: AnyPermission = "user:create";
const role: RoleName = "admin";
const perms: Permission = { user: ["create", "update"] };
```

---

## 📝 **CHECKLIST DE IMPLEMENTACIÓN**

### **✅ Para Nuevos Componentes**

- [ ] ¿Necesita protección de permisos?
- [ ] ¿Usar `Protected` o verificar en hook?
- [ ] ¿Mostrar fallback o ocultar?
- [ ] ¿Verificar server-side también?

### **✅ Para Nuevas Funcionalidades**

- [ ] ¿Añadir nuevo recurso a `PERMISSIONS`?
- [ ] ¿Actualizar `ROLE_STATEMENTS`?
- [ ] ¿Crear hook específico?
- [ ] ¿Añadir protección server-side?
- [ ] ¿Escribir tests de permisos?

---

## 🔗 **ENLACES RÁPIDOS**

- **📖 [Guía Completa](./PERMISSIONS_SYSTEM_COMPLETE_GUIDE.md)**
- **🏗️ [Estructura Detallada](./PERMISSIONS_STRUCTURE_DETAILED.md)**
- **💡 [Ejemplos Prácticos](./PERMISSIONS_PRACTICAL_EXAMPLES.md)**
- **🏠 [README Principal](./PERMISSIONS_README.md)**

---

**💡 Tip: Guarda esta página como referencia rápida durante el desarrollo!**
