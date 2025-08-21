# 🔐 **SISTEMA DE PERMISOS SIMPLIFICADO**

> **🚀 ARQUITECTURA CONSOLIDADA**: Sistema completamente refactorizado en un solo archivo para máxima simplicidad y mantenibilidad.

## 🎯 **OVERVIEW DEL SISTEMA**

Este es un sistema **RBAC (Role-Based Access Control)** simple y profesional que te permite controlar:

- **🎯 QUÉ puede hacer cada usuario** (acciones permitidas)
- **🖥️ QUÉ partes de la UI puede ver** (componentes condicionales)
- **🌐 A QUÉ endpoints puede acceder** (protección de APIs)
- **📊 QUÉ datos puede manipular** (autorización granular)

---

## 📁 **ESTRUCTURA SIMPLIFICADA**

```
src/core/auth/
├── permissions.ts           ✅ TODO consolidado aquí
├── server/
│   ├── auth.ts             ✅ Configuración Better Auth
│   └── index.ts            ✅ Utilidades del servidor
├── components/             ✅ Componentes UI de auth
├── auth-client.ts          ✅ Cliente de auth
└── index.ts                ✅ Barrel exports

src/shared/
├── hooks/
│   ├── useAuth.ts          ✅ Hook de autenticación
│   └── usePermissions.ts   ✅ Hook de permisos (simplificado)
└── components/
    └── Protected.tsx       ✅ Componentes de protección
```

---

## 🚀 **INICIO RÁPIDO**

### **1. Verificar Permisos en Componentes**

```typescript
import { usePermissions } from "@/shared/hooks/usePermissions";

function MyComponent() {
  const { checkPermission, isAdmin, canAccess } = usePermissions();

  // ✅ Verificación simple
  const canDelete = checkPermission("user:delete");

  // ✅ Verificación de rol
  if (isAdmin) {
    return <AdminPanel />;
  }

  // ✅ Verificación múltiple
  const canManageUsers = canAccess({
    user: ["create", "update", "delete"],
  });

  return <div>Content</div>;
}
```

### **2. Proteger Componentes**

```typescript
import { AdminOnly, Protected } from "@/shared/components/Protected";

// ✅ Solo para admins
<AdminOnly fallback={<div>No autorizado</div>}>
  <AdminPanel />
</AdminOnly>

// ✅ Permisos específicos
<Protected
  permissions={{ user: ["delete"] }}
  fallback={<div>Sin permisos</div>}
>
  <DeleteButton />
</Protected>
```

### **3. Verificar en Server Actions**

```typescript
import { hasPermission } from "@/core/auth/permissions";
import { getServerSession } from "@/core/auth/server";

export async function deleteUser(userId: string) {
  const session = await getServerSession();

  if (!hasPermission(session?.user, "user:delete")) {
    throw new Error("Sin permisos");
  }

  // Proceder con la eliminación...
}
```

---

## 📚 **DOCUMENTACIÓN DISPONIBLE**

### **🚀 Para Empezar**

- **[⚡ Referencia Rápida](./PERMISSIONS_QUICK_REFERENCE.md)** ⭐

  - API completa del sistema
  - Hooks y componentes disponibles
  - Ejemplos de uso común

- **[🧪 Ejemplos Prácticos](./PERMISSIONS_PRACTICAL_EXAMPLES.md)**
  - Casos de uso reales
  - Patrones de implementación
  - Mejores prácticas

### **🏗️ Para Entender la Arquitectura**

- **[🔐 Guía Completa del Sistema](./PERMISSIONS_SYSTEM_COMPLETE_GUIDE.md)**

  - Conceptos fundamentales
  - Roles y jerarquías
  - Recursos y acciones
  - Integración con Better Auth

- **[📊 Estructura Detallada](./PERMISSIONS_STRUCTURE_DETAILED.md)**
  - Arquitectura interna
  - Tipos TypeScript
  - Flujos de verificación

### **🔧 Para Desarrolladores**

- **[🏗️ Arquitectura Consolidada](./PERMISSIONS_NEW_ARCHITECTURE.md)**

  - Decisiones de diseño
  - Simplificaciones implementadas
  - Guía de migración

- **[📖 Guía Maestra](./PERMISSIONS_MASTER_GUIDE.md)**
  - Documentación completa
  - Casos avanzados
  - Troubleshooting

---

## 🎯 **ROLES DISPONIBLES**

| Rol             | Nivel | Descripción         | Permisos                             |
| --------------- | ----- | ------------------- | ------------------------------------ |
| **super_admin** | 100   | Acceso total        | Todos los permisos                   |
| **admin**       | 80    | Gestión de usuarios | user:_, session:_, files:read/upload |
| **user**        | 20    | Usuario estándar    | session:\*, files:read               |

---

## 🔧 **RECURSOS Y ACCIONES**

### **👤 User (Usuarios)**

- `user:create` - Crear usuarios
- `user:read` - Ver información de usuarios
- `user:list` - Listar usuarios
- `user:update` - Actualizar usuarios
- `user:delete` - Eliminar usuarios
- `user:ban` - Banear usuarios
- `user:set-role` - Cambiar roles
- `user:set-password` - Cambiar contraseñas
- `user:impersonate` - Suplantar usuarios

### **🔐 Session (Sesiones)**

- `session:list` - Ver sesiones
- `session:revoke` - Revocar sesiones
- `session:delete` - Eliminar sesiones

### **📁 Files (Archivos)**

- `files:read` - Ver archivos
- `files:upload` - Subir archivos
- `files:delete` - Eliminar archivos

### **🎛️ Feature Flags**

- `feature_flags:read` - Ver feature flags
- `feature_flags:write` - Modificar feature flags

---

## 🔍 **IMPORTS PRINCIPALES**

```typescript
// 🔐 Sistema de permisos
import {
  hasPermission,
  ROLE_INFO,
  ROLE_HIERARCHY,
  type RoleName,
  type AnyPermission,
} from "@/core/auth/permissions";

// 🪝 Hooks
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useAuth } from "@/shared/hooks/useAuth";

// 🛡️ Componentes de protección
import {
  Protected,
  AdminOnly,
  SuperAdminOnly,
} from "@/shared/components/Protected";

// 🖥️ Servidor
import { getServerSession, requireAuth } from "@/core/auth/server";
```

---

## 🚀 **PRÓXIMOS PASOS**

1. **Lee la [Referencia Rápida](./PERMISSIONS_QUICK_REFERENCE.md)** para ver toda la API
2. **Revisa los [Ejemplos Prácticos](./PERMISSIONS_PRACTICAL_EXAMPLES.md)** para casos de uso
3. **Consulta la [Guía Completa](./PERMISSIONS_SYSTEM_COMPLETE_GUIDE.md)** para conceptos avanzados

---

**¡El sistema está listo para usar! 🎯**
