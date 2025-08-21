# 🎯 Configuración Práctica desde el Hook `useUsers`

> **Guía completa de cómo usar la configuración práctica directamente en tus vistas con el hook `useUsers`**

## 📋 Índice

1. [Introducción](#introducción)
2. [Configuración Básica](#configuración-básica)
3. [Display: Lo que más cambiarás](#display)
4. [Búsqueda: Optimización práctica](#búsqueda)
5. [Filtros: Solo los necesarios](#filtros)
6. [Formularios: Funcionalidades avanzadas](#formularios)
7. [Presets: Configuraciones predefinidas](#presets)
8. [Ejemplos de Vistas Reales](#ejemplos-de-vistas-reales)
9. [Casos de Uso Comunes](#casos-de-uso-comunes)
10. [Mejores Prácticas](#mejores-prácticas)

---

## 🚀 Introducción

El hook `useUsers` ahora acepta configuraciones prácticas que realmente vas a usar. En lugar de configuraciones técnicas complejas, tienes opciones simples y útiles que afectan directamente la experiencia del usuario.

### ✅ Beneficios de la nueva configuración:

- **Simplicidad:** Solo configuraciones que realmente cambias
- **Practicidad:** Opciones que afectan la UX directamente
- **Flexibilidad:** Fácil de ajustar según el contexto
- **Rendimiento:** Optimizaciones automáticas

---

## 🏗️ Configuración Básica

### Uso básico del hook

```typescript
import { useUsers } from "@/features/admin/users";

function UsersPage() {
  const { users, isLoading, error } = useUsers();

  // Usar con configuración por defecto
  return (
    <div>
      {users?.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

### Uso con configuración personalizada

```typescript
import { useUsers } from "@/features/admin/users";

function UsersPage() {
  const { users, isLoading, error } = useUsers({
    display: {
      itemsPerPage: 50, // Más usuarios por página
      defaultSort: "name", // Ordenar por nombre
      sortDirection: "asc", // A-Z
      showAvatars: true, // Mostrar avatares
      compactView: false, // Vista expandida
    },
  });

  return (
    <div>
      {users?.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

---

## 📊 Display: Lo que más cambiarás

### 1. **Items por página**

```typescript
// 🎯 Para equipos pequeños (10 usuarios)
const { users } = useUsers({
  display: { itemsPerPage: 10 },
});

// 🎯 Para equipos medianos (20-50 usuarios)
const { users } = useUsers({
  display: { itemsPerPage: 20 },
});

// 🎯 Para equipos grandes (100+ usuarios)
const { users } = useUsers({
  display: { itemsPerPage: 100 },
});
```

**Beneficios:**

- **10 items:** Mejor para móvil, carga rápida
- **20 items:** Balance perfecto para desktop
- **50 items:** Para power users que quieren ver más
- **100 items:** Para administradores con muchos usuarios

### 2. **Ordenamiento por defecto**

```typescript
// 🎯 Mostrar usuarios más recientes primero
const { users } = useUsers({
  display: {
    defaultSort: "createdAt",
    sortDirection: "desc",
  },
});

// 🎯 Ordenar alfabéticamente por nombre
const { users } = useUsers({
  display: {
    defaultSort: "name",
    sortDirection: "asc",
  },
});

// 🎯 Ver actividad reciente (último login)
const { users } = useUsers({
  display: {
    defaultSort: "lastLogin",
    sortDirection: "desc",
  },
});
```

**Opciones de ordenamiento:**

- **`name`:** Alfabético (útil para encontrar usuarios específicos)
- **`email`:** Por email (útil para administradores)
- **`createdAt`:** Por fecha de creación (ver nuevos usuarios)
- **`lastLogin`:** Por último acceso (ver actividad)
- **`role`:** Por rol (agrupar por permisos)
- **`status`:** Por estado (ver usuarios activos/inactivos)

### 3. **Vista y elementos visuales**

```typescript
// 🎯 Vista compacta para ver más usuarios
const { users } = useUsers({
  display: {
    compactView: true, // Filas más pequeñas
    showAvatars: false, // Sin avatares (mejor rendimiento)
    showLastLogin: true, // Mostrar último acceso
    showCreatedDate: false, // Ocultar fecha de creación
    showUserStats: false, // Sin estadísticas adicionales
  },
});

// 🎯 Vista completa con toda la información
const { users } = useUsers({
  display: {
    compactView: false, // Vista expandida
    showAvatars: true, // Con avatares
    showLastLogin: true, // Último acceso
    showCreatedDate: true, // Fecha de creación
    showUserStats: true, // Estadísticas del usuario
  },
});
```

**Beneficios por elemento:**

- **`compactView`:** Más usuarios visibles, mejor para listas grandes
- **`showAvatars`:** Mejor identificación visual vs rendimiento
- **`showLastLogin`:** Ver actividad de usuarios
- **`showCreatedDate`:** Útil para auditorías
- **`showUserStats`:** Info adicional para administradores

---

## 🔍 Búsqueda: Optimización práctica

### 1. **Búsqueda instantánea**

```typescript
// 🎯 Para equipos pequeños (búsqueda mientras escribes)
const { users } = useUsers({
  search: {
    instantSearch: true, // Busca mientras escribes
    minChars: 1, // Desde el primer carácter
    searchFields: ["both"], // Buscar en nombre y email
  },
});

// 🎯 Para equipos grandes (optimizada)
const { users } = useUsers({
  search: {
    instantSearch: false, // Buscar al presionar Enter
    minChars: 3, // Mínimo 3 caracteres
    searchFields: ["name"], // Solo en nombres
  },
});
```

**Cuándo usar cada opción:**

- **`instantSearch: true`:** Equipos < 100 usuarios, mejor UX
- **`instantSearch: false`:** Equipos > 100 usuarios, mejor rendimiento
- **`minChars: 1`:** Búsquedas precisas, pocos usuarios
- **`minChars: 3`:** Menos búsquedas, mejor rendimiento

### 2. **Campos de búsqueda**

```typescript
// 🎯 Búsqueda completa (nombre y email)
const { users } = useUsers({
  search: {
    searchFields: ["both"], // Buscar en ambos campos
    caseSensitive: false, // No distinguir mayúsculas
  },
});

// 🎯 Búsqueda específica por nombre
const { users } = useUsers({
  search: {
    searchFields: ["name"], // Solo nombres
    caseSensitive: false,
  },
});

// 🎯 Búsqueda específica por email
const { users } = useUsers({
  search: {
    searchFields: ["email"], // Solo emails
    caseSensitive: false,
  },
});
```

**Beneficios por campo:**

- **`['both']`:** Búsqueda más flexible, encuentra más resultados
- **`['name']`:** Más rápido, útil cuando buscas personas específicas
- **`['email']`:** Útil para administradores técnicos

---

## 🎨 Filtros: Solo los necesarios

### 1. **Filtros básicos**

```typescript
// 🎯 Solo filtros esenciales
const { users } = useUsers({
  filters: {
    showRoleFilter: true, // Filtrar por rol
    showStatusFilter: true, // Filtrar por estado
    showDateRangeFilter: false, // Sin filtro de fechas
    defaultRole: "all", // Mostrar todos los roles
    defaultStatus: "all", // Mostrar todos los estados
    rememberFilters: true, // Recordar filtros entre sesiones
  },
});

// 🎯 Vista administrativa avanzada
const { users } = useUsers({
  filters: {
    showRoleFilter: true,
    showStatusFilter: true,
    showDateRangeFilter: true, // Filtro de fechas para auditorías
    defaultRole: "admin", // Mostrar solo admins por defecto
    defaultStatus: "active", // Solo usuarios activos
    rememberFilters: true,
  },
});
```

### 2. **Filtros por contexto**

```typescript
// 🎯 Para soporte técnico (ver usuarios con problemas)
const { users } = useUsers({
  filters: {
    showRoleFilter: false, // No importa el rol
    showStatusFilter: true, // Importante el estado
    defaultStatus: "banned", // Ver usuarios bloqueados
    rememberFilters: false, // No recordar (vista temporal)
  },
});

// 🎯 Para gestión de permisos
const { users } = useUsers({
  filters: {
    showRoleFilter: true, // Filtrar por rol es clave
    showStatusFilter: false, // Estado no importa
    defaultRole: "user", // Ver usuarios normales
    rememberFilters: true, // Recordar configuración
  },
});
```

**Beneficios por filtro:**

- **`showRoleFilter`:** Esencial para gestión de permisos
- **`showStatusFilter`:** Útil para soporte y moderación
- **`showDateRangeFilter`:** Para auditorías y reportes
- **`rememberFilters`:** Mejor UX, mantiene preferencias

---

## 📝 Formularios: Funcionalidades avanzadas

### 1. **Campos y operaciones**

```typescript
// 🎯 Vista básica para usuarios normales
const { users } = useUsers({
  forms: {
    showAdvancedFields: false, // Solo campos básicos
    requireEmailVerification: false,
    allowBulkOperations: false, // Sin operaciones masivas
    confirmDangerousActions: true, // Confirmar acciones peligrosas
  },
});

// 🎯 Vista avanzada para administradores
const { users } = useUsers({
  forms: {
    showAdvancedFields: true, // Todos los campos
    requireEmailVerification: true,
    allowBulkOperations: true, // Operaciones masivas
    confirmDangerousActions: true,
  },
});
```

**Beneficios por opción:**

- **`showAdvancedFields`:** Más opciones vs simplicidad
- **`allowBulkOperations`:** Eficiencia para administradores
- **`confirmDangerousActions`:** Seguridad siempre activada

### 2. **Notificaciones**

```typescript
// 🎯 Notificaciones discretas
const { users } = useUsers({
  notifications: {
    showSuccessMessages: true,
    showLoadingStates: false, // Sin indicadores de carga
    autoHideAfterMs: 2000, // Ocultar rápido
    position: "bottom-right", // Posición discreta
  },
});

// 🎯 Notificaciones completas
const { users } = useUsers({
  notifications: {
    showSuccessMessages: true,
    showLoadingStates: true, // Con indicadores de carga
    autoHideAfterMs: 5000, // Más tiempo para leer
    position: "top-center", // Posición prominente
  },
});
```

---

## 🚀 Presets: Configuraciones predefinidas

### 1. **Preset Mobile**

```typescript
// 🎯 Optimizado para móviles y tablets
const { users } = useUsers({
  preset: "mobile",
});

// Equivale a:
const { users } = useUsers({
  display: {
    itemsPerPage: 10,
    compactView: true,
    showAvatars: false,
    showLastLogin: false,
    showCreatedDate: false,
  },
  search: {
    instantSearch: false,
    minChars: 3,
  },
});
```

**Cuándo usar:** Aplicaciones móviles, tablets, pantallas pequeñas

### 2. **Preset Performance**

```typescript
// 🎯 Optimizado para muchos usuarios
const { users } = useUsers({
  preset: "performance",
});

// Equivale a:
const { users } = useUsers({
  display: {
    itemsPerPage: 100,
    showAvatars: false,
    showUserStats: false,
  },
  search: {
    minChars: 3,
    instantSearch: false,
  },
  notifications: {
    showLoadingStates: false,
    autoHideAfterMs: 2000,
  },
});
```

**Cuándo usar:** Equipos grandes (100+ usuarios), conexiones lentas

### 3. **Preset Advanced**

```typescript
// 🎯 Todas las funcionalidades para power users
const { users } = useUsers({
  preset: "advanced",
});

// Equivale a:
const { users } = useUsers({
  display: {
    itemsPerPage: 50,
    showUserStats: true,
  },
  filters: {
    showRoleFilter: true,
    showStatusFilter: true,
    showDateRangeFilter: true,
  },
  forms: {
    showAdvancedFields: true,
    allowBulkOperations: true,
  },
});
```

**Cuándo usar:** Administradores, power users, vistas administrativas

### 4. **Preset Simple**

```typescript
// 🎯 Vista limpia y básica
const { users } = useUsers({
  preset: "simple",
});

// Equivale a:
const { users } = useUsers({
  display: {
    itemsPerPage: 10,
    showLastLogin: false,
    showCreatedDate: false,
    showUserStats: false,
  },
  filters: {
    showRoleFilter: false,
    showStatusFilter: false,
    showDateRangeFilter: false,
  },
  forms: {
    showAdvancedFields: false,
    allowBulkOperations: false,
  },
});
```

**Cuándo usar:** Usuarios básicos, vistas públicas, interfaces simples

---

## 💡 Ejemplos de Vistas Reales

### 1. **Lista de Empleados (HR)**

```typescript
function EmployeeListPage() {
  const { users, isLoading, error } = useUsers({
    display: {
      itemsPerPage: 20,
      defaultSort: "name",
      sortDirection: "asc",
      showAvatars: true,
      showLastLogin: true,
      showCreatedDate: true,
      compactView: false,
    },
    search: {
      instantSearch: true,
      minChars: 2,
      searchFields: ["both"],
    },
    filters: {
      showRoleFilter: true,
      showStatusFilter: true,
      defaultRole: "all",
      defaultStatus: "active",
      rememberFilters: true,
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-4">
      <h1>Lista de Empleados</h1>
      <div className="grid gap-4">
        {users?.map((user) => (
          <EmployeeCard
            key={user.id}
            user={user}
            showAvatar={true}
            showLastLogin={true}
            showCreatedDate={true}
          />
        ))}
      </div>
    </div>
  );
}
```

### 2. **Dashboard de Administración**

```typescript
function AdminDashboard() {
  const { users, stats } = useUsers({
    preset: "advanced",
    display: {
      itemsPerPage: 50,
      defaultSort: "lastLogin",
      sortDirection: "desc",
    },
  });

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <StatCard title="Total Usuarios" value={stats?.total} />
        <StatCard title="Activos" value={stats?.active} />
        <StatCard title="Administradores" value={stats?.admins} />
      </div>

      <div className="users-section">
        <h2>Actividad Reciente</h2>
        {users?.map((user) => (
          <AdminUserCard
            key={user.id}
            user={user}
            showAdvancedActions={true}
            allowBulkOperations={true}
          />
        ))}
      </div>
    </div>
  );
}
```

### 3. **Vista Móvil**

```typescript
function MobileUsersPage() {
  const { users, isLoading } = useUsers({
    preset: "mobile",
    search: {
      minChars: 2,
      searchFields: ["name"],
    },
  });

  return (
    <div className="mobile-users">
      <SearchBar placeholder="Buscar por nombre..." />

      {isLoading ? (
        <MobileLoadingSkeleton />
      ) : (
        <div className="user-list">
          {users?.map((user) => (
            <MobileUserCard
              key={user.id}
              user={user}
              compact={true}
              showAvatar={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 4. **Selector de Usuarios**

```typescript
function UserSelector({ onSelect }: { onSelect: (user: User) => void }) {
  const { users } = useUsers({
    preset: "simple",
    display: {
      itemsPerPage: 20,
      showAvatars: true,
      compactView: true,
    },
    search: {
      instantSearch: true,
      minChars: 1,
      searchFields: ["both"],
    },
  });

  return (
    <div className="user-selector">
      <SearchInput placeholder="Buscar usuario..." />
      <div className="user-options">
        {users?.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            className="user-option"
          >
            <Avatar user={user} size="sm" />
            <span>{user.name}</span>
            <span className="text-gray-500">{user.email}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Casos de Uso Comunes

### 1. **Equipo Pequeño (< 20 usuarios)**

```typescript
const { users } = useUsers({
  display: {
    itemsPerPage: 10,
    showAvatars: true,
    showUserStats: true,
    compactView: false,
  },
  search: {
    instantSearch: true,
    minChars: 1,
    searchFields: ["both"],
  },
});
```

**Beneficios:** UX óptima, búsqueda instantánea, toda la información visible

### 2. **Equipo Mediano (20-100 usuarios)**

```typescript
const { users } = useUsers({
  display: {
    itemsPerPage: 20,
    showAvatars: true,
    compactView: false,
  },
  search: {
    instantSearch: true,
    minChars: 2,
    searchFields: ["both"],
  },
  filters: {
    showRoleFilter: true,
    showStatusFilter: true,
  },
});
```

**Beneficios:** Balance entre rendimiento y funcionalidad, filtros útiles

### 3. **Empresa Grande (100+ usuarios)**

```typescript
const { users } = useUsers({
  preset: "performance",
  display: {
    itemsPerPage: 100,
  },
  filters: {
    showRoleFilter: true,
    showStatusFilter: true,
    rememberFilters: true,
  },
});
```

**Beneficios:** Rendimiento optimizado, filtros esenciales, configuración persistente

### 4. **Vista Pública/Limitada**

```typescript
const { users } = useUsers({
  preset: "simple",
  display: {
    showAvatars: true,
    showLastLogin: false,
    showCreatedDate: false,
  },
  forms: {
    allowBulkOperations: false,
    showAdvancedFields: false,
  },
});
```

**Beneficios:** Interfaz limpia, sin funcionalidades administrativas

---

## ✅ Mejores Prácticas

### 1. **Elige el preset correcto**

```typescript
// ✅ Bueno: Usar preset como base
const { users } = useUsers({
  preset: "mobile",
  display: {
    itemsPerPage: 15, // Personalizar solo lo necesario
  },
});

// ❌ Malo: Configurar todo manualmente
const { users } = useUsers({
  display: { itemsPerPage: 10, compactView: true, showAvatars: false },
  search: { instantSearch: false, minChars: 3 },
  // ... muchas más configuraciones
});
```

### 2. **Optimiza según el contexto**

```typescript
// ✅ Para móvil
const { users } = useUsers({ preset: "mobile" });

// ✅ Para administradores
const { users } = useUsers({ preset: "advanced" });

// ✅ Para muchos usuarios
const { users } = useUsers({ preset: "performance" });
```

### 3. **Personaliza solo lo necesario**

```typescript
// ✅ Bueno: Cambiar solo lo específico
const { users } = useUsers({
  preset: "advanced",
  display: {
    defaultSort: "lastLogin", // Solo cambiar el ordenamiento
  },
});

// ❌ Malo: Sobrescribir todo el preset
const { users } = useUsers({
  preset: "advanced",
  display: {
    itemsPerPage: 50,
    showAvatars: true,
    compactView: false,
    // ... redefinir todo
  },
});
```

### 4. **Considera el rendimiento**

```typescript
// ✅ Para equipos grandes
const { users } = useUsers({
  display: {
    itemsPerPage: 100,
    showAvatars: false, // Mejor rendimiento
  },
  search: {
    instantSearch: false, // Menos peticiones
    minChars: 3,
  },
});

// ✅ Para equipos pequeños
const { users } = useUsers({
  display: {
    itemsPerPage: 10,
    showAvatars: true,
  },
  search: {
    instantSearch: true, // Mejor UX
    minChars: 1,
  },
});
```

### 5. **Usa filtros inteligentemente**

```typescript
// ✅ Solo filtros que realmente usas
const { users } = useUsers({
  filters: {
    showRoleFilter: true, // Útil para gestión
    showStatusFilter: false, // No necesario en este contexto
    showDateRangeFilter: false, // Demasiado complejo
  },
});
```

---

## 📚 Resumen de Beneficios

| Configuración           | Beneficio Principal   | Cuándo Usar                        |
| ----------------------- | --------------------- | ---------------------------------- |
| `itemsPerPage: 10`      | Carga rápida          | Móvil, equipos pequeños            |
| `itemsPerPage: 20`      | Balance perfecto      | Desktop, uso general               |
| `itemsPerPage: 100`     | Ver muchos usuarios   | Administradores, equipos grandes   |
| `instantSearch: true`   | Mejor UX              | Equipos pequeños (< 100 usuarios)  |
| `instantSearch: false`  | Mejor rendimiento     | Equipos grandes (> 100 usuarios)   |
| `showAvatars: true`     | Identificación visual | Equipos pequeños, interfaces ricas |
| `showAvatars: false`    | Mejor rendimiento     | Equipos grandes, móvil             |
| `compactView: true`     | Ver más usuarios      | Listas largas, pantallas pequeñas  |
| `preset: 'mobile'`      | Optimización móvil    | Aplicaciones móviles               |
| `preset: 'performance'` | Máximo rendimiento    | Equipos grandes, conexiones lentas |
| `preset: 'advanced'`    | Todas las funciones   | Administradores, power users       |
| `preset: 'simple'`      | Interfaz limpia       | Usuarios básicos, vistas públicas  |

---

**Conclusión:** La nueva configuración te permite ajustar exactamente lo que necesitas para cada vista, optimizando tanto la experiencia del usuario como el rendimiento según tu contexto específico. 🎯
