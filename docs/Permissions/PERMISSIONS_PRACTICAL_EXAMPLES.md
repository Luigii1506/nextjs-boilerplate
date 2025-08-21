# 🧪 **EJEMPLOS PRÁCTICOS DE PERMISOS**

> **🚀 SISTEMA CONSOLIDADO**: Todos los ejemplos actualizados para la nueva arquitectura simplificada.

## 🎯 **CASOS DE USO COMUNES**

### **1. 👤 GESTIÓN DE USUARIOS**

#### **📋 Lista de Usuarios con Acciones Condicionales**

```typescript
import { usePermissions } from "@/shared/hooks/usePermissions";
import { AdminOnly, Protected } from "@/shared/components/Protected";

function UsersList() {
  const { checkPermission, canManageRole } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);

  return (
    <div className="users-list">
      <div className="header">
        <h2>Gestión de Usuarios</h2>
        
        {/* ✅ Solo admins pueden crear usuarios */}
        <Protected permissions={{ user: ["create"] }}>
          <CreateUserButton />
        </Protected>
      </div>

      <div className="users-grid">
        {users.map(user => (
          <UserCard 
            key={user.id} 
            user={user}
            canEdit={checkPermission("user:update")}
            canDelete={checkPermission("user:delete")}
            canBan={checkPermission("user:ban")}
            canChangeRole={canManageRole(user.role)}
          />
        ))}
      </div>
    </div>
  );
}
```

#### **🔧 Server Action con Validación**

```typescript
import { hasPermission } from "@/core/auth/permissions";
import { requireAuth } from "@/core/auth/server";

export async function deleteUserAction(userId: string) {
  const session = await requireAuth();
  
  // ✅ Verificar permisos
  if (!hasPermission(session.user, "user:delete")) {
    throw new Error("Sin permisos para eliminar usuarios");
  }
  
  // ✅ Reglas de negocio
  if (session.user.id === userId) {
    throw new Error("No puedes eliminar tu propia cuenta");
  }
  
  // Proceder con la eliminación...
  await prisma.user.delete({ where: { id: userId } });
  
  revalidatePath("/admin/users");
  return { success: true };
}
```

### **2. 🛡️ PROTECCIÓN DE COMPONENTES**

#### **📱 Dashboard con Secciones Protegidas**

```typescript
import { AdminOnly, SuperAdminOnly, Protected } from "@/shared/components/Protected";

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Panel de Administración</h1>
      
      {/* ✅ Estadísticas básicas - Solo admins */}
      <AdminOnly>
        <StatsSection />
      </AdminOnly>

      {/* ✅ Gestión de usuarios - Permisos específicos */}
      <Protected 
        permissions={{ user: ["list"] }}
        fallback={<div>Sin acceso a gestión de usuarios</div>}
      >
        <UsersSection />
      </Protected>

      {/* ✅ Feature Flags - Solo super admins */}
      <SuperAdminOnly fallback={<div>Solo super administradores</div>}>
        <FeatureFlagsSection />
      </SuperAdminOnly>
    </div>
  );
}
```

#### **🔐 Página con Auto-Protección**

```typescript
import { useAuth, usePermissions } from "@/shared/hooks";

function UserProfilePage({ userId }: { userId: string }) {
  const { user: currentUser } = useAuth();
  const { checkPermission } = usePermissions();

  // ✅ Verificar si puede ver este perfil
  const canViewProfile = useMemo(() => {
    if (!currentUser) return false;
    
    // Puede ver su propio perfil
    if (currentUser.id === userId) return true;
    
    // O si tiene permisos de admin
    return checkPermission("user:read");
  }, [currentUser, userId, checkPermission]);

  if (!canViewProfile) {
    return <div>Acceso denegado</div>;
  }

  return <ProfileContent userId={userId} />;
}
```

### **3. 🖥️ API PROTECTION**

#### **🛡️ API Route Protection**

```typescript
// app/api/users/[id]/route.ts
import { getServerSession } from "@/core/auth/server";
import { hasPermission } from "@/core/auth/permissions";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  // ✅ Verificar permisos
  if (!hasPermission(session.user, "user:delete")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }
  
  // ✅ Reglas de negocio
  if (session.user.id === params.id) {
    return NextResponse.json({ 
      error: "No puedes eliminar tu propia cuenta" 
    }, { status: 400 });
  }
  
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

### **4. 🎯 HOOKS PERSONALIZADOS**

#### **🔧 Hook para Gestión de Usuarios**

```typescript
export function useUserManagement(targetUser?: User) {
  const { user: currentUser } = useAuth();
  const { checkPermission, canManageRole } = usePermissions();

  const permissions = useMemo(() => {
    if (!targetUser) return {};

    const isOwnProfile = currentUser?.id === targetUser.id;

    return {
      canRead: checkPermission("user:read") || isOwnProfile,
      canUpdate: checkPermission("user:update") || isOwnProfile,
      canDelete: checkPermission("user:delete") && !isOwnProfile,
      canBan: checkPermission("user:ban") && canManageRole(targetUser.role),
      canChangeRole: checkPermission("user:set-role") && canManageRole(targetUser.role),
    };
  }, [targetUser, currentUser, checkPermission, canManageRole]);

  return { permissions };
}
```

### **5. 🧪 TESTING**

#### **🔍 Tests Unitarios**

```typescript
import { hasPermission } from "@/core/auth/permissions";

describe("Permission System", () => {
  it("should allow super_admin all permissions", () => {
    const superAdmin = { role: "super_admin" };
    expect(hasPermission(superAdmin, "user:delete")).toBe(true);
  });
  
  it("should restrict user permissions", () => {
    const user = { role: "user" };
    expect(hasPermission(user, "user:create")).toBe(false);
    expect(hasPermission(user, "files:read")).toBe(true);
  });
});
```

#### **🧪 Tests de Componentes**

```typescript
import { render, screen } from "@testing-library/react";
import { Protected } from "@/shared/components/Protected";

jest.mock("@/shared/hooks/usePermissions", () => ({
  usePermissions: () => ({
    canAccess: jest.fn(() => mockHasPermissions),
  })
}));

describe("Protected Component", () => {
  it("should show content when user has permissions", () => {
    mockHasPermissions = true;
    
    render(
      <Protected permissions={{ user: ["create"] }}>
        <div>Protected Content</div>
      </Protected>
    );
    
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
```

---

## 📚 **RECURSOS ADICIONALES**

- **[⚡ Referencia Rápida](./PERMISSIONS_QUICK_REFERENCE.md)** - API completa
- **[🔐 Guía Completa](./PERMISSIONS_SYSTEM_COMPLETE_GUIDE.md)** - Conceptos detallados
- **[🏗️ Arquitectura](./PERMISSIONS_NEW_ARCHITECTURE.md)** - Decisiones de diseño

---

**¡Ejemplos listos para implementar! 🎯**
