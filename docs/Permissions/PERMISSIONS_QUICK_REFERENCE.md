# ⚡ **REFERENCIA RÁPIDA DE PERMISOS**

## 🎯 **IMPORTS PRINCIPALES**

```typescript
// 🔐 Sistema de permisos consolidado
import {
  hasPermission,
  ROLE_INFO,
  ROLE_HIERARCHY,
  type RoleName,
  type AnyPermission,
  type Permission,
} from "@/core/auth/permissions";

// 🪝 Hooks simplificados
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useAuth } from "@/shared/hooks/useAuth";

// 🛡️ Componentes de protección
import {
  Protected,
  AdminOnly,
  SuperAdminOnly,
  RoleProtected,
  LevelProtected,
  NoAccess,
} from "@/shared/components/Protected";

// 🖥️ Servidor
import { getServerSession, requireAuth } from "@/core/auth/server";
```

---

## 🪝 **HOOK PRINCIPAL: usePermissions**

```typescript
const {
  // 🔍 Verificaciones
  checkPermission, // (permission: AnyPermission) => boolean
  canAccess, // (permissions: Permission) => boolean

  // 👑 Información de rol
  currentRole, // RoleName
  currentLevel, // number
  isAdmin, // boolean
  isSuperAdmin, // boolean
  isAuthenticated, // boolean

  // 🎯 Gestión de roles
  canManageRole, // (targetRole: RoleName) => boolean
  getManageableRoles, // () => RoleName[]
} = usePermissions();
```

---

## ✅ **VERIFICACIONES DE PERMISOS**

### **🔍 Verificación Simple**

```typescript
// ⚡ Un permiso específico
const canDelete = checkPermission("user:delete");
const canUpload = checkPermission("files:upload");
const canWriteFlags = checkPermission("feature_flags:write");

if (canDelete) {
  // Usuario puede eliminar
}
```

### **🎯 Verificación Múltiple**

```typescript
// 🎯 Múltiples permisos (con shortcut super_admin)
const canManageUsers = canAccess({
  user: ["create", "update", "delete"],
});

const canWorkWithFiles = canAccess({
  user: ["create"],
  files: ["upload", "delete"],
});

const canAdminSystem = canAccess({
  user: ["create", "delete", "ban"],
  feature_flags: ["write"],
});
```

### **👑 Verificación de Roles**

```typescript
// ✅ Verificaciones directas
if (isAdmin) {
  // Es admin o super_admin
}

if (isSuperAdmin) {
  // Solo super_admin
}

// ✅ Verificación de nivel
if (currentLevel >= 80) {
  // Admin level o superior
}

// ✅ Gestión de roles
const canPromoteToAdmin = canManageRole("admin");
const assignableRoles = getManageableRoles(); // ["user"] para admin
```

---

## 🛡️ **COMPONENTES DE PROTECCIÓN**

### **🎯 Protected - Permisos Específicos**

```typescript
<Protected
  permissions={{ user: ["delete"] }}
  fallback={<div>Sin permisos para eliminar</div>}
  showFallback={true}
>
  <DeleteButton />
</Protected>

<Protected permissions={{
  user: ["create", "update"],
  files: ["upload"]
}}>
  <UserForm />
</Protected>
```

### **👑 AdminOnly - Solo Administradores**

```typescript
<AdminOnly fallback={<div>Solo admins</div>}>
  <AdminPanel />
</AdminOnly>

<AdminOnly showFallback={false}>
  <SecretFeature />
</AdminOnly>
```

### **🔱 SuperAdminOnly - Solo Super Administradores**

```typescript
<SuperAdminOnly fallback={<NoAccess />}>
  <SystemSettings />
</SuperAdminOnly>
```

### **🎭 RoleProtected - Roles Específicos**

```typescript
<RoleProtected
  roles={["admin", "super_admin"]}
  fallback={<div>Solo staff</div>}
>
  <StaffPanel />
</RoleProtected>

<RoleProtected
  roles={["admin"]}
  requireAll={false}
>
  <AdminFeature />
</RoleProtected>
```

### **📊 LevelProtected - Nivel Mínimo**

```typescript
<LevelProtected minLevel={80} fallback={<div>Nivel insuficiente</div>}>
  <AdvancedFeature />
</LevelProtected>
```

### **🚫 NoAccess - Mensaje de Error**

```typescript
<NoAccess
  title="Acceso Denegado"
  message="No tienes permisos para esta sección"
  icon="🔒"
/>
```

---

## 🖥️ **VERIFICACIONES EN SERVIDOR**

### **🔍 Server Actions**

```typescript
import { hasPermission } from "@/core/auth/permissions";
import { getServerSession } from "@/core/auth/server";

export async function deleteUser(userId: string) {
  const session = await getServerSession();

  // ✅ Verificar permisos
  if (!hasPermission(session?.user, "user:delete")) {
    throw new Error("Sin permisos para eliminar usuarios");
  }

  // Proceder...
}

export async function createUser(userData: any) {
  const session = await requireAuth(); // Lanza error si no está autenticado

  if (!hasPermission(session.user, "user:create")) {
    throw new Error("Sin permisos para crear usuarios");
  }

  // Crear usuario...
}
```

### **🛡️ Middleware**

```typescript
// middleware.ts
import { getServerSession } from "@/core/auth/server";
import { hasPermission } from "@/core/auth/permissions";

export async function middleware(request: NextRequest) {
  const session = await getServerSession();

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!hasPermission(session?.user, "user:list")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}
```

### **🏗️ Server Components**

```typescript
import { requireAuth } from "@/core/auth/server";
import { hasPermission } from "@/core/auth/permissions";

export default async function AdminPage() {
  const session = await requireAuth();

  const canDeleteUsers = hasPermission(session.user, "user:delete");
  const canManageFlags = hasPermission(session.user, "feature_flags:write");

  return (
    <div>
      <h1>Admin Panel</h1>
      {canDeleteUsers && <DeleteUsersSection />}
      {canManageFlags && <FeatureFlagsPanel />}
    </div>
  );
}
```

---

## 🎯 **ROLES Y JERARQUÍA**

### **👑 Roles Disponibles**

```typescript
// Roles del sistema
type RoleName = "super_admin" | "admin" | "user";

// Jerarquía (mayor número = más permisos)
const ROLE_HIERARCHY = {
  super_admin: 100,
  admin: 80,
  user: 20,
};

// Información visual
const ROLE_INFO = {
  super_admin: {
    name: "Super Administrador",
    description: "Acceso completo al sistema",
    color: "red",
    icon: "👑",
  },
  admin: {
    name: "Administrador",
    description: "Gestión de usuarios",
    color: "orange",
    icon: "🛡️",
  },
  user: {
    name: "Usuario",
    description: "Usuario estándar",
    color: "green",
    icon: "👤",
  },
};
```

### **🔧 Utilidades de Roles**

```typescript
import {
  getRoleLevel,
  canManageRole,
  getAssignableRoles,
} from "@/core/auth/permissions";

// Obtener nivel de rol
const adminLevel = getRoleLevel("admin"); // 80

// Verificar si puede gestionar otro rol
const canPromote = canManageRole("admin", "user"); // true

// Obtener roles que puede asignar
const assignable = getAssignableRoles("admin"); // ["user"]
```

---

## 🔧 **RECURSOS Y ACCIONES**

### **📋 Permisos Disponibles**

```typescript
// 👤 Usuarios
"user:create"; // Crear usuarios
"user:read"; // Ver información de usuarios
"user:list"; // Listar usuarios
"user:update"; // Actualizar usuarios
"user:delete"; // Eliminar usuarios
"user:ban"; // Banear usuarios
"user:set-role"; // Cambiar roles
"user:set-password"; // Cambiar contraseñas
"user:impersonate"; // Suplantar usuarios

// 🔐 Sesiones
"session:list"; // Ver sesiones
"session:revoke"; // Revocar sesiones
"session:delete"; // Eliminar sesiones

// 📁 Archivos
"files:read"; // Ver archivos
"files:upload"; // Subir archivos
"files:delete"; // Eliminar archivos

// 🎛️ Feature Flags
"feature_flags:read"; // Ver feature flags
"feature_flags:write"; // Modificar feature flags
```

### **🎯 Permisos por Rol**

```typescript
// 👑 Super Admin - TODOS los permisos
const SUPER_ADMIN_PERMISSIONS = [
  "user:*",
  "session:*",
  "files:*",
  "feature_flags:*",
];

// 🛡️ Admin - Gestión de usuarios y archivos básicos
const ADMIN_PERMISSIONS = [
  "user:create",
  "user:read",
  "user:list",
  "user:update",
  "user:delete",
  "user:ban",
  "user:set-role",
  "user:set-password",
  "session:list",
  "session:revoke",
  "session:delete",
  "files:read",
  "files:upload",
  "feature_flags:read",
];

// 👤 User - Solo sesiones propias y lectura de archivos
const USER_PERMISSIONS = [
  "session:list",
  "session:revoke",
  "session:delete",
  "files:read",
];
```

---

## 🚀 **PATRONES COMUNES**

### **🔍 Verificación Condicional**

```typescript
function UserActions({ user }: { user: User }) {
  const { checkPermission, canManageRole } = usePermissions();

  const canEdit = checkPermission("user:update");
  const canDelete = checkPermission("user:delete");
  const canChangeRole = canManageRole(user.role);

  return (
    <div>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
      {canChangeRole && <RoleSelector />}
    </div>
  );
}
```

### **🛡️ Protección Múltiple**

```typescript
function AdminSection() {
  return (
    <AdminOnly>
      <div>
        <h2>Panel de Administración</h2>

        <Protected permissions={{ user: ["create"] }}>
          <CreateUserForm />
        </Protected>

        <Protected permissions={{ user: ["list"] }}>
          <UsersList />
        </Protected>

        <SuperAdminOnly>
          <SystemSettings />
        </SuperAdminOnly>
      </div>
    </AdminOnly>
  );
}
```

### **🎯 Hook Personalizado**

```typescript
function useUserPermissions(targetUser: User) {
  const { checkPermission, canManageRole, currentRole } = usePermissions();

  return {
    canEdit: checkPermission("user:update"),
    canDelete:
      checkPermission("user:delete") && targetUser.id !== currentUser?.id,
    canBan: checkPermission("user:ban") && canManageRole(targetUser.role),
    canChangeRole: canManageRole(targetUser.role),
    canImpersonate:
      checkPermission("user:impersonate") && currentRole === "super_admin",
  };
}
```

---

## 🔍 **DEBUGGING Y DESARROLLO**

### **🐛 Verificar Estado**

```typescript
function DebugPermissions() {
  const permissions = usePermissions();

  console.log("Current permissions state:", {
    role: permissions.currentRole,
    level: permissions.currentLevel,
    isAdmin: permissions.isAdmin,
    isSuperAdmin: permissions.isSuperAdmin,
    canDeleteUsers: permissions.checkPermission("user:delete"),
    manageableRoles: permissions.getManageableRoles(),
  });

  return null;
}
```

### **🧪 Testing**

```typescript
import { hasPermission } from "@/core/auth/permissions";

describe("Permissions", () => {
  it("should allow admin to delete users", () => {
    const adminUser = { role: "admin" };
    expect(hasPermission(adminUser, "user:delete")).toBe(true);
  });

  it("should not allow user to delete users", () => {
    const regularUser = { role: "user" };
    expect(hasPermission(regularUser, "user:delete")).toBe(false);
  });
});
```

---

## 📚 **RECURSOS ADICIONALES**

- **[🧪 Ejemplos Prácticos](./PERMISSIONS_PRACTICAL_EXAMPLES.md)** - Casos de uso reales
- **[🔐 Guía Completa](./PERMISSIONS_SYSTEM_COMPLETE_GUIDE.md)** - Documentación detallada
- **[🏗️ Arquitectura](./PERMISSIONS_NEW_ARCHITECTURE.md)** - Decisiones de diseño

---

**¡Sistema listo para usar! 🎯**
