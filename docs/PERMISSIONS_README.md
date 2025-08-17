# 🔐 **SISTEMA DE PERMISOS Y ROLES - DOCUMENTACIÓN COMPLETA**

## 🎯 **OVERVIEW DEL SISTEMA**

Este es un sistema **RBAC (Role-Based Access Control)** completo y profesional que te permite controlar:

- **🎯 QUÉ puede hacer cada usuario** (acciones permitidas)
- **🖥️ QUÉ partes de la UI puede ver** (componentes condicionales)
- **🌐 A QUÉ endpoints puede acceder** (protección de APIs)
- **📊 QUÉ datos puede manipular** (autorización granular)

---

## 📚 **DOCUMENTACIÓN DISPONIBLE**

### **🚀 Para Empezar**

- **[🔐 Guía Completa del Sistema](./PERMISSIONS_SYSTEM_COMPLETE_GUIDE.md)**
  - Conceptos fundamentales
  - Roles disponibles (super_admin, admin, user)
  - Recursos y acciones (user, session, files)
  - Cómo usar permisos en componentes
  - Protección de APIs y server actions
  - Casos de uso avanzados

### **🏗️ Para Entender la Arquitectura**

- **[📊 Estructura Detallada](./PERMISSIONS_STRUCTURE_DETAILED.md)**
  - Arquitectura del sistema completo
  - Definición de recursos y acciones
  - Configuración de roles y jerarquías
  - Tipos TypeScript y flujos de verificación
  - Estructura de archivos y organización

### **💡 Para Implementar**

- **[🧪 Ejemplos Prácticos](./PERMISSIONS_PRACTICAL_EXAMPLES.md)**
  - 9 ejemplos completos de implementación
  - Gestión de usuarios, archivos, dashboard
  - Casos de uso complejos y workflows
  - Testing comprehensivo
  - Mejores prácticas y patterns

### **⚡ Para Consulta Rápida**

- **[📋 Referencia Rápida](./PERMISSIONS_QUICK_REFERENCE.md)**
  - Cheat sheet de APIs y métodos
  - Snippets de código listos para usar
  - Troubleshooting común
  - Checklist de implementación

---

## 🎯 **RUTAS DE APRENDIZAJE**

### **🚀 Para Desarrolladores Nuevos en el Proyecto**

1. **📖 Lee la [Guía Completa](./PERMISSIONS_SYSTEM_COMPLETE_GUIDE.md)** (30-45 min)

   - Entiende qué roles existen
   - Aprende qué puede hacer cada rol
   - Ve ejemplos básicos de uso

2. **🏗️ Estudia la [Estructura](./PERMISSIONS_STRUCTURE_DETAILED.md)** (20-30 min)

   - Comprende la arquitectura
   - Conoce dónde está cada cosa
   - Entiende los tipos TypeScript

3. **💡 Practica con los [Ejemplos](./PERMISSIONS_PRACTICAL_EXAMPLES.md)** (45-60 min)

   - Implementa casos reales
   - Aprende patterns avanzados
   - Ve cómo hacer testing

4. **⚡ Usa la [Referencia Rápida](./PERMISSIONS_QUICK_REFERENCE.md)** (durante desarrollo)
   - Consulta APIs específicas
   - Copia snippets de código
   - Resuelve problemas comunes

### **⚡ Para Desarrolladores Experimentados**

1. **📖 Revisa la [Guía Completa](./PERMISSIONS_SYSTEM_COMPLETE_GUIDE.md)** - Solo los conceptos nuevos
2. **🏗️ Escanea la [Estructura](./PERMISSIONS_STRUCTURE_DETAILED.md)** - Enfócate en extensibilidad
3. **💡 Busca en [Ejemplos](./PERMISSIONS_PRACTICAL_EXAMPLES.md)** - Casos específicos que necesites
4. **⚡ Bookmarkea la [Referencia](./PERMISSIONS_QUICK_REFERENCE.md)** - Para uso diario

---

## 🎭 **ROLES Y PERMISOS - OVERVIEW RÁPIDO**

### **👑 Super Admin (Nivel 100)**

```typescript
// ✅ PUEDE HACER TODO
- Gestionar usuarios (crear, editar, eliminar, banear, impersonar)
- Gestionar archivos (ver, subir, eliminar)
- Gestionar sesiones (ver, revocar, eliminar)
- Modificar feature flags
- Configurar sistema
```

### **🛡️ Admin (Nivel 80)**

```typescript
// ✅ GESTIÓN DEL SISTEMA (sin impersonar)
- Gestionar usuarios (crear, editar, eliminar, banear, cambiar roles)
- Gestionar archivos (ver, subir)
- Gestionar sesiones (ver, revocar, eliminar)
- Ver feature flags
```

### **👤 User (Nivel 20)**

```typescript
// ✅ OPERACIONES BÁSICAS
- Gestionar sus propias sesiones
- Ver archivos del sistema
```

---

## 🛠️ **IMPLEMENTACIÓN RÁPIDA**

### **1. 🔍 Verificar Permisos en Componentes**

```typescript
import { usePermissions } from "@/shared/hooks/usePermissions";

const MyComponent = () => {
  const { canAccess, isAdmin } = usePermissions();

  return (
    <div>
      {/* ✅ Solo mostrar si puede crear usuarios */}
      {canAccess({ user: ["create"] }) && <button>➕ Crear Usuario</button>}

      {/* ✅ Solo mostrar si es admin */}
      {isAdmin() && <AdminPanel />}
    </div>
  );
};
```

### **2. 🛡️ Proteger Componentes Declarativamente**

```typescript
import { Protected, AdminOnly } from "@/shared/components/Protected";

const MyApp = () => {
  return (
    <div>
      {/* 🛡️ Proteger con permisos específicos */}
      <Protected permissions={{ user: ["create"] }}>
        <CreateUserForm />
      </Protected>

      {/* 👑 Solo para admins */}
      <AdminOnly>
        <AdminDashboard />
      </AdminOnly>
    </div>
  );
};
```

### **3. 🌐 Proteger Server Actions**

```typescript
import { ensurePermission } from "@/core/auth/config/permissions";

export async function createUserAction(formData: FormData) {
  const user = await getCurrentUser();

  // 🛡️ Verificar permiso antes de proceder
  await ensurePermission(user, "user:create");

  // ✅ Solo llega aquí si tiene permiso
  const newUser = await createUser(formData);
  return { success: true, data: newUser };
}
```

---

## 📊 **RECURSOS DISPONIBLES**

| Recurso           | Acciones                                                       | Super Admin | Admin | User     |
| ----------------- | -------------------------------------------------------------- | ----------- | ----- | -------- |
| **user**          | create, read, list, update, delete, ban, impersonate, set-role | ✅          | ✅\*  | ❌       |
| **session**       | list, revoke, delete                                           | ✅          | ✅    | ✅\*\*   |
| **files**         | read, upload, delete                                           | ✅          | ✅\*  | ✅\*\*\* |
| **feature_flags** | read, write                                                    | ✅          | 👁️    | ❌       |

- \*Admin no puede impersonar
- \*\*User solo sus propias sesiones
- \*\*\*User solo lectura

---

## 🔧 **HERRAMIENTAS INCLUIDAS**

### **🪝 Hooks Especializados**

```typescript
// Gestión específica por módulo
useUserManagement(); // 👥 Permisos de usuarios
useFileManagement(); // 📁 Permisos de archivos
useSessionManagement(); // 🔐 Permisos de sesiones

// Validación avanzada
usePermissionValidator(); // 🎯 Múltiples verificaciones
```

### **🛡️ Componentes de Protección**

```typescript
<Protected />           // 🔐 Por permisos específicos
<RoleProtected />      // 👑 Por roles
<LevelProtected />     // 📊 Por nivel de rol
<AdminOnly />          // 🛡️ Solo admins
<SuperAdminOnly />     // 👑 Solo super admins
<PermissionGate />     // 🔄 Con loading states
```

### **🧪 Utilidades de Testing**

```typescript
// Helpers para tests
createMockUser(); // 🏗️ Usuarios de prueba
renderWithPermissions(); // 🧪 Renderizado con contexto
testPermissionFlow(); // 🔍 Testing de flujos
```

---

## 🚨 **TROUBLESHOOTING COMÚN**

### **❌ El componente no se actualiza tras cambio de rol**

```typescript
const { refreshPermissions } = usePermissions();
refreshPermissions(); // 🔄 Refrescar manualmente
```

### **❌ Verificación muy lenta**

```typescript
// ✅ Usar hook específico en lugar de genérico
const { canCreateUsers } = useUserManagement();
// En lugar de: canAccess({ user: ["create"] })
```

### **❌ Permission denied inesperado**

```typescript
// 🔍 Debug en desarrollo
const { getPermissionStats } = usePermissions();
console.log(getPermissionStats());
```

---

## 🎯 **NEXT STEPS**

### **📚 Si eres nuevo:**

1. Comienza con la **[Guía Completa](./PERMISSIONS_SYSTEM_COMPLETE_GUIDE.md)**
2. Practica con ejemplos simples
3. Implementa tu primer componente protegido

### **🚀 Si tienes experiencia:**

1. Ve directo a **[Ejemplos Prácticos](./PERMISSIONS_PRACTICAL_EXAMPLES.md)**
2. Busca el caso de uso que necesites
3. Adapta el código a tu implementación

### **⚡ Para uso diario:**

1. Bookmarkea la **[Referencia Rápida](./PERMISSIONS_QUICK_REFERENCE.md)**
2. Úsala para consultas específicas
3. Consulta troubleshooting cuando tengas problemas

---

## 💡 **FILOSOFÍA DEL SISTEMA**

Este sistema está diseñado para ser:

- **🔐 Seguro por defecto** - Sin permisos = sin acceso
- **🎯 Granular** - Control preciso sobre cada acción
- **📊 Escalable** - Fácil añadir nuevos recursos y roles
- **🧪 Testeable** - Cada componente se puede probar independientemente
- **🛠️ Mantenible** - Código declarativo y reutilizable
- **📖 Documentado** - Todo está explicado claramente

### **✅ Principios Clave**

1. **Verificación doble** - Cliente y servidor siempre
2. **UI declarativa** - Los permisos se ven en el código
3. **TypeScript estricto** - Prevenir errores en compile-time
4. **Cache inteligente** - Performance sin sacrificar seguridad
5. **Extensibilidad** - Fácil añadir nuevas funcionalidades

---

## 🔗 **ENLACES ÚTILES**

- **🏠 [Estructura del Proyecto](../README.md)** - Información general
- **🧪 [Testing Guide](../TESTING.md)** - Cómo hacer tests
- **⚡ [Performance Guide](../PERFORMANCE.md)** - Optimizaciones
- **🔧 [Contributing](../CONTRIBUTING.md)** - Cómo contribuir

---

**🎉 ¡Con esta documentación tienes todo lo necesario para dominar el sistema de permisos!**

¿Tienes alguna pregunta específica o necesitas ayuda con un caso de uso particular? ¡Consulta la documentación correspondiente o abre una issue!
