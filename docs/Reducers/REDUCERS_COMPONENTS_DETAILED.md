---
title: Componentes
slug: /reducers/componentes
---

# 🔧 **COMPONENTES DEL SISTEMA DE REDUCERS - ANÁLISIS DETALLADO**

## 📖 **ÍNDICE DE COMPONENTES**

- [🎯 Reducer Functions](#-reducer-functions---el-núcleo)
- [📊 State Interfaces](#-state-interfaces---estructura-de-datos)
- [🎭 Action Types](#-action-types---operaciones-disponibles)
- [🔍 Selectors](#-selectors---consultas-especializadas)
- [🏗️ Helper Functions](#-helper-functions---funciones-auxiliares)
- [📦 Factory Functions](#-factory-functions---constructores)
- [🔄 Integration Patterns](#-integration-patterns---patrones-de-integración)

---

## 🎯 **REDUCER FUNCTIONS - EL NÚCLEO**

### **🏗️ Anatomía de un Reducer**

```typescript
/**
 * 🎯 ESTRUCTURA BÁSICA DE UN REDUCER
 */
export function usersOptimisticReducer(
  state: UsersOptimisticState, // 📊 Estado actual
  action: UsersOptimisticAction // 🎭 Acción a procesar
): UsersOptimisticState {
  // 📊 Nuevo estado

  // 1. 📝 LOGGING (Debugging y auditoría)
  usersOptimisticLogger.debug(`Action: ${action.type}`, {
    currentUsers: state.users.length,
    activeOperations: state.activeOperations,
  });

  // 2. 🔀 SWITCH STATEMENT (Procesamiento de acciones)
  switch (action.type) {
    case USERS_ACTIONS.CREATE_USER:
      return handleCreateUser(state, action);

    case USERS_ACTIONS.UPDATE_USER:
      return handleUpdateUser(state, action);

    // ... más casos

    default:
      return state; // 🛡️ Fallback seguro
  }
}
```

### **🔍 Ejemplo Detallado: CREATE_USER**

```typescript
case USERS_ACTIONS.CREATE_USER: {
  // 🏗️ PASO 1: Construir usuario temporal
  const tempUser: User = {
    ...action.tempUser,                    // 📋 Datos del formulario
    id: action.tempId,                     // 🆔 ID temporal único
    createdAt: new Date().toISOString(),   // ⏰ Timestamp actual
    updatedAt: new Date().toISOString(),   // ⏰ Timestamp actual
    emailVerified: false,                  // 📧 Estado inicial
    banned: false,                         // 🚫 Estado inicial
    banReason: null,                       // 🚫 Sin razón de ban
    banExpires: null,                      // 🚫 Sin expiración
    image: null,                           // 🖼️ Sin imagen inicial
    status: "active",                      // ✅ Estado activo
  };

  // 🔄 PASO 2: Crear nueva lista inmutablemente
  const nextUsers = [...state.users, tempUser];

  // 📊 PASO 3: Recalcular estadísticas
  const nextStats = calculateStats(nextUsers);

  // 📝 PASO 4: Logging de la operación
  usersOptimisticLogger.info(`Creating user optimistically`, {
    tempId: action.tempId,
    email: tempUser.email,
    role: tempUser.role,
  });

  // 🎯 PASO 5: Retornar nuevo estado inmutable
  return {
    ...state,                              // 📋 Copia estado base
    users: nextUsers,                      // 👥 Nueva lista de usuarios
    totalUsers: state.totalUsers + 1,      // 🔢 Incrementar contador
    activeOperations: state.activeOperations + 1, // 🔄 Incrementar operaciones
    lastUpdated: new Date().toISOString(), // ⏰ Timestamp de actualización
    stats: nextStats,                      // 📊 Estadísticas actualizadas
  };
}
```

### **⚡ Optimizaciones de Performance**

```typescript
case USERS_ACTIONS.UPDATE_USER: {
  // 🔍 OPTIMIZACIÓN 1: Early return si no hay cambios
  const currentUser = state.users.find(u => u.id === action.userId);
  if (!currentUser) return state; // Usuario no existe

  const hasChanges = Object.keys(action.updates).some(
    key => currentUser[key as keyof User] !== action.updates[key as keyof User]
  );
  if (!hasChanges) return state; // No hay cambios reales

  // 🔄 OPTIMIZACIÓN 2: Solo actualizar si es necesario
  const nextUsers = updateUserInArray(state.users, action.userId, action.updates);

  // 📊 OPTIMIZACIÓN 3: Solo recalcular stats si afectan las métricas
  const affectsStats = ['role', 'banned', 'status'].some(
    key => key in action.updates
  );
  const nextStats = affectsStats
    ? calculateStats(nextUsers)
    : state.stats; // Reutilizar stats existentes

  return {
    ...state,
    users: nextUsers,
    stats: nextStats,
    lastUpdated: new Date().toISOString(),
  };
}
```

---

## 📊 **STATE INTERFACES - ESTRUCTURA DE DATOS**

### **👥 Users State (CORE Module)**

```typescript
/**
 * 📊 ESTADO OPTIMISTA PARA USUARIOS
 *
 * Estado complejo para módulo crítico con múltiples entidades,
 * operaciones avanzadas y analytics en tiempo real.
 */
export interface UsersOptimisticState {
  // 👥 DATOS PRINCIPALES
  users: User[]; // Lista principal de usuarios
  totalUsers: number; // Contador total (incluye no cargados)

  // ⏰ METADATOS
  lastUpdated: string; // Timestamp última actualización

  // 🔄 ESTADO DE OPERACIONES
  activeOperations: number; // Operaciones en curso
  errors: Record<string, string>; // Errores por operación específica

  // 📊 ANALYTICS EN TIEMPO REAL
  stats: {
    totalActive: number; // Usuarios activos (no baneados)
    totalBanned: number; // Usuarios baneados
    totalAdmins: number; // Administradores y super admins
  };
}

/**
 * 🎯 EJEMPLO DE ESTADO EN RUNTIME
 */
const exampleUsersState: UsersOptimisticState = {
  users: [
    {
      id: "user-1",
      name: "Ana García",
      email: "ana@empresa.com",
      role: "admin",
      banned: false,
      // ... más campos
    },
    {
      id: "temp-123", // 👻 Usuario optimista (temporal)
      name: "Juan Pérez",
      email: "juan@empresa.com",
      role: "user",
      banned: false,
      // ... más campos
    },
  ],
  totalUsers: 150, // Total en base de datos
  lastUpdated: "2025-01-17T10:30:00Z",
  activeOperations: 1, // Una operación en curso
  errors: {}, // Sin errores actualmente
  stats: {
    totalActive: 145, // 145 usuarios activos
    totalBanned: 5, // 5 usuarios baneados
    totalAdmins: 12, // 12 administradores
  },
};
```

### **📁 File-Upload State (FEATURE FLAG Module)**

```typescript
/**
 * 📁 ESTADO OPTIMISTA PARA FILE UPLOAD
 *
 * Estado más simple enfocado en una funcionalidad específica.
 * Menos complejidad pero más configurable con feature flags.
 */
export interface OptimisticState {
  // 📤 DATOS PRINCIPALES
  uploadProgress: UploadProgress[]; // Lista de uploads en progreso

  // ⏰ METADATOS
  lastUpdated: string; // Timestamp última actualización

  // 📊 MÉTRICAS SIMPLES
  totalActiveUploads: number; // Uploads activos (calculado)
}

/**
 * 📤 ESTRUCTURA DE PROGRESO DE UPLOAD
 */
export interface UploadProgress {
  fileId: string; // ID único del archivo
  progress: number; // Progreso 0-100
  status: "pending" | "uploading" | "completed" | "error";
  filename: string; // Nombre del archivo
  error?: string; // Error si falló
}

/**
 * 🎯 EJEMPLO DE ESTADO EN RUNTIME
 */
const exampleFileUploadState: OptimisticState = {
  uploadProgress: [
    {
      fileId: "temp-upload-1",
      progress: 75,
      status: "uploading",
      filename: "documento.pdf",
    },
    {
      fileId: "temp-upload-2",
      progress: 100,
      status: "completed",
      filename: "imagen.jpg",
    },
    {
      fileId: "temp-upload-3",
      progress: 0,
      status: "error",
      filename: "video.mp4",
      error: "File size too large",
    },
  ],
  lastUpdated: "2025-01-17T10:30:00Z",
  totalActiveUploads: 1, // Solo 1 upload activo
};
```

### **🔍 Comparación: CORE vs FEATURE FLAG**

| Aspecto            | **CORE (Users)**             | **FEATURE FLAG (File-Upload)**          |
| ------------------ | ---------------------------- | --------------------------------------- |
| **Complejidad**    | Alta - Múltiples entidades   | Baja - Una funcionalidad                |
| **Analytics**      | Estadísticas completas       | Métricas simples                        |
| **Error Handling** | Por operación específica     | Global o por archivo                    |
| **Extensibilidad** | Muy extensible               | Moderadamente extensible                |
| **Performance**    | Optimizado para muchos datos | Optimizado para operaciones específicas |

---

## 🎭 **ACTION TYPES - OPERACIONES DISPONIBLES**

### **🏗️ Estructura de Action Types**

```typescript
/**
 * 🎭 UNION TYPE PARA TODAS LAS ACCIONES POSIBLES
 *
 * Cada acción es un objeto con:
 * - type: Identificador único de la acción
 * - payload: Datos específicos para esa acción
 */
export type UsersOptimisticAction =
  // 👤 OPERACIONES CRUD
  | {
      type: typeof USERS_ACTIONS.CREATE_USER;
      tempUser: Omit<User, "id">; // Datos del usuario sin ID
      tempId: string; // ID temporal único
    }
  | {
      type: typeof USERS_ACTIONS.UPDATE_USER;
      userId: string; // ID del usuario a actualizar
      updates: Partial<User>; // Campos a modificar
    }
  | {
      type: typeof USERS_ACTIONS.DELETE_USER;
      userId: string; // ID del usuario a eliminar
    }

  // 🚫 OPERACIONES DE ESTADO
  | {
      type: typeof USERS_ACTIONS.BAN_USER;
      userId: string; // ID del usuario a banear
      reason: string; // Razón del ban
    }
  | {
      type: typeof USERS_ACTIONS.UNBAN_USER;
      userId: string; // ID del usuario a desbanear
    }

  // 🎭 OPERACIONES DE ROL
  | {
      type: typeof USERS_ACTIONS.UPDATE_ROLE;
      userId: string; // ID del usuario
      newRole: User["role"]; // Nuevo rol
      oldRole?: User["role"]; // Rol anterior (para logging)
    }

  // 🔄 OPERACIONES MASIVAS
  | {
      type: typeof USERS_ACTIONS.BULK_UPDATE;
      userIds: string[]; // IDs de usuarios afectados
      newRole: User["role"]; // Nuevo rol para todos
    }
  | {
      type: typeof USERS_ACTIONS.BULK_DELETE;
      userIds: string[]; // IDs de usuarios a eliminar
    }

  // 🔄 OPERACIONES DE UI
  | {
      type: typeof USERS_ACTIONS.START_LOADING;
      operation: string; // Nombre de la operación
    }
  | {
      type: typeof USERS_ACTIONS.COMPLETE_LOADING;
      operation: string; // Operación completada
    }
  | {
      type: typeof USERS_ACTIONS.FAIL_LOADING;
      operation: string; // Operación fallida
      error: string; // Mensaje de error
    }

  // 🧹 OPERACIONES DE LIMPIEZA
  | {
      type: typeof USERS_ACTIONS.CLEAR_ERRORS;
    }
  | {
      type: typeof USERS_ACTIONS.REFRESH_DATA;
      users: User[]; // Datos frescos del servidor
    };
```

### **📤 File-Upload Actions (Más Simple)**

```typescript
/**
 * 📤 ACCIONES PARA FILE UPLOAD
 *
 * Más simple que users porque se enfoca en una sola funcionalidad.
 */
export type OptimisticAction =
  | {
      type: typeof FILE_UPLOAD_ACTIONS.START_UPLOAD;
      files: File[]; // Archivos a subir
      tempIds: string[]; // IDs temporales únicos
    }
  | {
      type: typeof FILE_UPLOAD_ACTIONS.UPDATE_PROGRESS;
      tempId: string; // ID del archivo
      progress: number; // Progreso 0-100
    }
  | {
      type: typeof FILE_UPLOAD_ACTIONS.COMPLETE_UPLOAD;
      tempId: string; // ID del archivo completado
    }
  | {
      type: typeof FILE_UPLOAD_ACTIONS.FAIL_UPLOAD;
      tempId: string; // ID del archivo fallido
      error: string; // Mensaje de error
    }
  | {
      type: typeof FILE_UPLOAD_ACTIONS.CLEAR_COMPLETED;
    };
```

### **🎯 Patterns de Action Design**

**1. 🆔 Identificadores Únicos**

```typescript
// ✅ BIEN: Cada acción tiene identificador único
export const USERS_ACTIONS = {
  CREATE_USER: "CREATE_USER",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
  // ...
} as const;

// ❌ MAL: Strings hardcodeados
addOptimistic({ type: "create" }); // Sin tipado
```

**2. 📦 Payload Específico**

```typescript
// ✅ BIEN: Payload específico para cada acción
type CreateUserAction = {
  type: "CREATE_USER";
  tempUser: Omit<User, "id">; // Solo datos necesarios
  tempId: string; // ID temporal
};

// ❌ MAL: Payload genérico
type GenericAction = {
  type: string;
  payload: any; // ❌ Sin tipado específico
};
```

**3. 🔒 Type Safety**

```typescript
// ✅ BIEN: Union types que garantizan tipo correcto
export type UsersOptimisticAction =
  | CreateUserAction
  | UpdateUserAction
  | DeleteUserAction;

// TypeScript garantiza que solo se usen acciones válidas
const action: UsersOptimisticAction = {
  type: USERS_ACTIONS.CREATE_USER,
  tempUser: userData,
  tempId: "temp-123",
};
```

---

## 🔍 **SELECTORS - CONSULTAS ESPECIALIZADAS**

### **📊 Categorías de Selectors**

**1. 🔍 Basic Selectors (Acceso Directo)**

```typescript
/**
 * 🔍 SELECTORS BÁSICOS
 * Acceso directo a propiedades del estado sin transformación.
 */
export const basicSelectors = {
  // 📊 Datos principales
  getAllUsers: (state: UsersOptimisticState): User[] => state.users,

  getTotalUsers: (state: UsersOptimisticState): number => state.totalUsers,

  getLastUpdated: (state: UsersOptimisticState): string => state.lastUpdated,

  // 🔄 Estado de operaciones
  getActiveOperations: (state: UsersOptimisticState): number =>
    state.activeOperations,

  getErrors: (state: UsersOptimisticState): Record<string, string> =>
    state.errors,

  // 📊 Estadísticas
  getStats: (state: UsersOptimisticState) => state.stats,
};
```

**2. 🎯 Filter Selectors (Filtros)**

```typescript
/**
 * 🎯 SELECTORS DE FILTRADO
 * Filtran la lista de usuarios según criterios específicos.
 */
export const filterSelectors = {
  // 👤 Filtros por estado
  getActiveUsers: (state: UsersOptimisticState): User[] =>
    state.users.filter((user) => !user.banned),

  getBannedUsers: (state: UsersOptimisticState): User[] =>
    state.users.filter((user) => user.banned),

  getVerifiedUsers: (state: UsersOptimisticState): User[] =>
    state.users.filter((user) => user.emailVerified),

  // 🎭 Filtros por rol
  getAdminUsers: (state: UsersOptimisticState): User[] =>
    state.users.filter(
      (user) => user.role === "admin" || user.role === "super_admin"
    ),

  getUsersByRole: (state: UsersOptimisticState, role: User["role"]): User[] =>
    state.users.filter((user) => user.role === role),

  // ⏰ Filtros por fecha
  getRecentUsers: (state: UsersOptimisticState, days: number = 7): User[] => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return state.users.filter((user) => new Date(user.createdAt) >= cutoff);
  },
};
```

**3. 🔍 Search Selectors (Búsquedas)**

```typescript
/**
 * 🔍 SELECTORS DE BÚSQUEDA
 * Búsquedas complejas con múltiples criterios.
 */
export const searchSelectors = {
  // 🔍 Búsqueda simple
  searchUsers: (state: UsersOptimisticState, searchTerm: string): User[] => {
    const term = searchTerm.toLowerCase();

    return state.users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  },

  // 🔍 Búsqueda por ID
  getUserById: (
    state: UsersOptimisticState,
    userId: string
  ): User | undefined => state.users.find((user) => user.id === userId),

  // 🔍 Búsqueda múltiple
  getUsersByIds: (state: UsersOptimisticState, userIds: string[]): User[] =>
    state.users.filter((user) => userIds.includes(user.id)),

  // 🔍 Búsqueda avanzada
  searchUsersAdvanced: (
    state: UsersOptimisticState,
    criteria: {
      searchTerm?: string;
      role?: User["role"];
      banned?: boolean;
      verified?: boolean;
    }
  ): User[] => {
    let users = state.users;

    // Filtrar por término de búsqueda
    if (criteria.searchTerm) {
      const term = criteria.searchTerm.toLowerCase();
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    }

    // Filtrar por rol
    if (criteria.role) {
      users = users.filter((user) => user.role === criteria.role);
    }

    // Filtrar por estado de ban
    if (typeof criteria.banned === "boolean") {
      users = users.filter((user) => user.banned === criteria.banned);
    }

    // Filtrar por verificación
    if (typeof criteria.verified === "boolean") {
      users = users.filter((user) => user.emailVerified === criteria.verified);
    }

    return users;
  },
};
```

**4. 📊 Analytics Selectors (Métricas Calculadas)**

```typescript
/**
 * 📊 SELECTORS DE ANALYTICS
 * Cálculos complejos para métricas y dashboards.
 */
export const analyticsSelectors = {
  // 📈 Porcentajes
  getActiveUserPercentage: (state: UsersOptimisticState): number => {
    if (state.totalUsers === 0) return 0;
    return Math.round((state.stats.totalActive / state.totalUsers) * 100);
  },

  getBannedUserPercentage: (state: UsersOptimisticState): number => {
    if (state.totalUsers === 0) return 0;
    return Math.round((state.stats.totalBanned / state.totalUsers) * 100);
  },

  getAdminPercentage: (state: UsersOptimisticState): number => {
    if (state.totalUsers === 0) return 0;
    return Math.round((state.stats.totalAdmins / state.totalUsers) * 100);
  },

  // 📊 Distribución por rol
  getRoleDistribution: (state: UsersOptimisticState) => {
    const distribution = state.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<User["role"], number>);

    return distribution;
  },

  // 📅 Datos temporales
  getUsersByCreationMonth: (state: UsersOptimisticState) => {
    const monthlyData = new Map<string, number>();

    state.users.forEach((user) => {
      const month = new Date(user.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
    });

    return Object.fromEntries(monthlyData);
  },

  // 📊 Métricas de crecimiento
  getGrowthMetrics: (
    state: UsersOptimisticState,
    previousPeriodUsers?: User[]
  ) => {
    if (!previousPeriodUsers) {
      return {
        currentTotal: state.totalUsers,
        growth: 0,
        growthPercentage: 0,
      };
    }

    const currentTotal = state.totalUsers;
    const previousTotal = previousPeriodUsers.length;
    const growth = currentTotal - previousTotal;
    const growthPercentage =
      previousTotal > 0 ? Math.round((growth / previousTotal) * 100) : 0;

    return {
      currentTotal,
      previousTotal,
      growth,
      growthPercentage,
    };
  },
};
```

**5. 🔄 State Selectors (Estado de UI)**

```typescript
/**
 * 🔄 SELECTORS DE ESTADO
 * Estado de la aplicación y operaciones en curso.
 */
export const stateSelectors = {
  // 🔄 Estados de loading
  isLoading: (state: UsersOptimisticState): boolean =>
    state.activeOperations > 0,

  isIdle: (state: UsersOptimisticState): boolean =>
    state.activeOperations === 0,

  // ❌ Estados de error
  hasErrors: (state: UsersOptimisticState): boolean =>
    Object.keys(state.errors).length > 0,

  getErrorForOperation: (
    state: UsersOptimisticState,
    operation: string
  ): string | undefined => state.errors[operation],

  getAllErrors: (state: UsersOptimisticState): string[] =>
    Object.values(state.errors).filter(Boolean),

  // 🔍 Validaciones de estado
  hasUser: (state: UsersOptimisticState, userId: string): boolean =>
    state.users.some((user) => user.id === userId),

  isUserOptimistic: (state: UsersOptimisticState, userId: string): boolean =>
    userId.startsWith("temp-"), // IDs temporales empiezan con 'temp-'

  // 📊 Métricas de estado
  getStateMetrics: (state: UsersOptimisticState) => ({
    usersLoaded: state.users.length,
    totalUsers: state.totalUsers,
    loadedPercentage:
      state.totalUsers > 0
        ? Math.round((state.users.length / state.totalUsers) * 100)
        : 0,
    activeOperations: state.activeOperations,
    errorCount: Object.keys(state.errors).length,
    lastUpdated: state.lastUpdated,
  }),
};
```

### **🎯 Uso de Selectors en Componentes**

```typescript
const UsersDashboard = () => {
  const { users, optimisticState } = useUsers();

  // 🔍 Usar selectors para extraer datos específicos
  const activeUsers = usersOptimisticSelectors.getActiveUsers(optimisticState);
  const bannedUsers = usersOptimisticSelectors.getBannedUsers(optimisticState);
  const adminUsers = usersOptimisticSelectors.getAdminUsers(optimisticState);

  // 📊 Métricas calculadas
  const activePercentage =
    usersOptimisticSelectors.getActiveUserPercentage(optimisticState);
  const roleDistribution =
    usersOptimisticSelectors.getRoleDistribution(optimisticState);

  // 🔄 Estado de la aplicación
  const isLoading = usersOptimisticSelectors.isLoading(optimisticState);
  const hasErrors = usersOptimisticSelectors.hasErrors(optimisticState);

  return (
    <div className="dashboard">
      <div className="metrics">
        <MetricCard
          title="Usuarios Activos"
          value={activeUsers.length}
          percentage={activePercentage}
        />
        <MetricCard title="Usuarios Baneados" value={bannedUsers.length} />
        <MetricCard title="Administradores" value={adminUsers.length} />
      </div>

      {isLoading && <LoadingSpinner />}
      {hasErrors && <ErrorAlert />}

      <RoleDistributionChart data={roleDistribution} />
    </div>
  );
};
```

---

## 🏗️ **HELPER FUNCTIONS - FUNCIONES AUXILIARES**

Las helper functions mantienen el reducer limpio y facilitan el testing:

### **🧮 Cálculo de Estadísticas**

```typescript
/**
 * 🧮 FUNCIÓN HELPER PARA CALCULAR ESTADÍSTICAS
 *
 * Separada del reducer para facilitar testing y reutilización.
 */
function calculateStats(users: User[]) {
  return users.reduce(
    (stats, user) => {
      // Usuarios activos (no baneados)
      if (!user.banned) {
        stats.totalActive++;
      }

      // Usuarios baneados
      if (user.banned) {
        stats.totalBanned++;
      }

      // Administradores (admin y super_admin)
      if (user.role === "admin" || user.role === "super_admin") {
        stats.totalAdmins++;
      }

      return stats;
    },
    {
      totalActive: 0,
      totalBanned: 0,
      totalAdmins: 0,
    }
  );
}

// 🧪 Testing helper function independientemente
describe("calculateStats", () => {
  it("should calculate correct stats", () => {
    const users = [
      { id: "1", banned: false, role: "user" },
      { id: "2", banned: true, role: "user" },
      { id: "3", banned: false, role: "admin" },
    ];

    const stats = calculateStats(users);

    expect(stats.totalActive).toBe(2);
    expect(stats.totalBanned).toBe(1);
    expect(stats.totalAdmins).toBe(1);
  });
});
```

### **🔄 Operaciones de Array Inmutables**

```typescript
/**
 * 🔄 HELPERS PARA OPERACIONES INMUTABLES
 */

// ✏️ Actualizar usuario en array
function updateUserInArray(
  users: User[],
  userId: string,
  updates: Partial<User>
): User[] {
  return users.map((user) =>
    user.id === userId
      ? {
          ...user,
          ...updates,
          updatedAt: new Date().toISOString(), // 📅 Timestamp automático
        }
      : user
  );
}

// 🗑️ Eliminar usuario de array
function removeUserFromArray(users: User[], userId: string): User[] {
  return users.filter((user) => user.id !== userId);
}

// 🗑️ Eliminar múltiples usuarios
function removeUsersFromArray(users: User[], userIds: string[]): User[] {
  return users.filter((user) => !userIds.includes(user.id));
}

// 🔄 Aplicar updates masivos
function applyBulkUpdates(
  users: User[],
  userIds: string[],
  updates: Partial<User>
): User[] {
  return users.map((user) =>
    userIds.includes(user.id)
      ? {
          ...user,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      : user
  );
}
```

### **🆔 Generadores de IDs**

```typescript
/**
 * 🆔 HELPER PARA GENERAR IDS TEMPORALES
 */
export function generateTempUserId(): string {
  return `temp-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateTempUploadId(): string {
  return `temp-upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 🔍 Verificar si es ID temporal
export function isTempId(id: string): boolean {
  return id.startsWith("temp-");
}
```

---

## 📦 **FACTORY FUNCTIONS - CONSTRUCTORES**

### **🏗️ Estados Iniciales**

```typescript
/**
 * 🏗️ FACTORY PARA ESTADO INICIAL DE USUARIOS
 */
export function createInitialUsersOptimisticState(): UsersOptimisticState {
  return {
    users: [],
    totalUsers: 0,
    lastUpdated: new Date().toISOString(),
    activeOperations: 0,
    errors: {},
    stats: {
      totalActive: 0,
      totalBanned: 0,
      totalAdmins: 0,
    },
  };
}

/**
 * 📁 FACTORY PARA ESTADO INICIAL DE FILE UPLOAD
 */
export function createInitialOptimisticState(): OptimisticState {
  return {
    uploadProgress: [],
    lastUpdated: new Date().toISOString(),
    totalActiveUploads: 0,
  };
}
```

### **🎯 Factory con Configuración**

```typescript
/**
 * 🎯 FACTORY CONFIGURABLE PARA TESTING
 */
export function createUsersStateForTesting(
  options: {
    userCount?: number;
    bannedCount?: number;
    adminCount?: number;
    withErrors?: boolean;
    activeOperations?: number;
  } = {}
): UsersOptimisticState {
  const {
    userCount = 0,
    bannedCount = 0,
    adminCount = 0,
    withErrors = false,
    activeOperations = 0,
  } = options;

  // Generar usuarios de prueba
  const users: User[] = [];

  // Usuarios normales
  for (let i = 0; i < userCount; i++) {
    users.push({
      id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@test.com`,
      role: "user",
      banned: false,
      // ... más campos
    });
  }

  // Usuarios baneados
  for (let i = 0; i < bannedCount; i++) {
    users.push({
      id: `banned-${i + 1}`,
      name: `Banned User ${i + 1}`,
      email: `banned${i + 1}@test.com`,
      role: "user",
      banned: true,
      banReason: "Test ban",
      // ... más campos
    });
  }

  // Administradores
  for (let i = 0; i < adminCount; i++) {
    users.push({
      id: `admin-${i + 1}`,
      name: `Admin ${i + 1}`,
      email: `admin${i + 1}@test.com`,
      role: "admin",
      banned: false,
      // ... más campos
    });
  }

  const stats = calculateStats(users);

  return {
    users,
    totalUsers: users.length,
    lastUpdated: new Date().toISOString(),
    activeOperations,
    errors: withErrors ? { createUser: "Test error" } : {},
    stats,
  };
}

// 🧪 Uso en tests
describe("Users Reducer", () => {
  it("should handle user creation", () => {
    const initialState = createUsersStateForTesting({
      userCount: 5,
      bannedCount: 2,
      adminCount: 1,
    });

    expect(initialState.users).toHaveLength(8);
    expect(initialState.stats.totalActive).toBe(6);
    expect(initialState.stats.totalBanned).toBe(2);
    expect(initialState.stats.totalAdmins).toBe(1);
  });
});
```

---

## 🔄 **INTEGRATION PATTERNS - PATRONES DE INTEGRACIÓN**

### **🎯 Integración con useOptimistic**

```typescript
/**
 * 🎯 PATRÓN ESTÁNDAR EN HOOKS
 */
export const useUsers = () => {
  // 1. 🏗️ Crear estado optimista
  const [optimisticState, addOptimistic] = useOptimistic(
    createInitialUsersOptimisticState(), // Estado inicial
    usersOptimisticReducer // Reducer function
  );

  // 2. 🎯 Función para disparar acciones optimistas
  const createUser = useCallback(async (userData: CreateUserForm) => {
    const tempId = generateTempUserId();

    // 3. ⚡ Optimistic update (inmediato)
    startTransition(() => {
      addOptimistic({
        type: USERS_ACTIONS.CREATE_USER,
        tempUser: userData,
        tempId,
      });
    });

    // 4. 🌐 Server action (background)
    const result = await createUserServerAction(userData);

    // 5. 🔄 useOptimistic automáticamente sincroniza
    if (result.success) {
      // Refresh data from server
      startTransition(() => {
        usersAction(); // Re-fetch real data
      });
    }

    return result;
  }, []);

  // 6. 🔍 Usar selectors para extraer datos
  const activeUsers = usersOptimisticSelectors.getActiveUsers(optimisticState);
  const isLoading = usersOptimisticSelectors.isLoading(optimisticState);

  return {
    users: optimisticState.users,
    activeUsers,
    isLoading,
    createUser,
    // ... más funciones
  };
};
```

### **🔄 Integración con Server Actions**

```typescript
/**
 * 🔄 PATRÓN DE SINCRONIZACIÓN CON SERVIDOR
 */
const syncWithServer = useCallback(
  async (action: UsersOptimisticAction) => {
    // 1. ⚡ Aplicar cambio optimista inmediatamente
    addOptimistic(action);

    // 2. 🌐 Determinar qué server action llamar
    let serverAction: Promise<ActionResult>;

    switch (action.type) {
      case USERS_ACTIONS.CREATE_USER:
        serverAction = createUserServerAction(action.tempUser);
        break;
      case USERS_ACTIONS.UPDATE_USER:
        serverAction = updateUserServerAction(action.userId, action.updates);
        break;
      case USERS_ACTIONS.DELETE_USER:
        serverAction = deleteUserServerAction(action.userId);
        break;
      default:
        return;
    }

    // 3. 🎯 Ejecutar server action
    try {
      const result = await serverAction;

      if (result.success) {
        // 4. ✅ Éxito: Refresh datos reales
        startTransition(() => {
          addOptimistic({
            type: USERS_ACTIONS.REFRESH_DATA,
            users: result.data,
          });
        });
      } else {
        // 5. ❌ Error: useOptimistic revierte automáticamente
        usersOptimisticLogger.error("Server action failed", result.error);
      }
    } catch (error) {
      // 6. 🚨 Exception: También revierte automáticamente
      usersOptimisticLogger.error("Server action exception", error);
    }
  },
  [addOptimistic]
);
```

---

## 💡 **MEJORES PRÁCTICAS**

### **✅ DO (Hacer)**

1. **Mantener inmutabilidad siempre**

   ```typescript
   // ✅ CORRECTO
   return { ...state, users: [...state.users, newUser] };
   ```

2. **Usar helper functions para lógica compleja**

   ```typescript
   // ✅ CORRECTO
   const nextStats = calculateStats(nextUsers);
   ```

3. **Incluir logging para debugging**

   ```typescript
   // ✅ CORRECTO
   usersOptimisticLogger.info("User created", { tempId, email });
   ```

4. **Recalcular métricas cuando sea necesario**
   ```typescript
   // ✅ CORRECTO
   const nextStats = calculateStats(nextUsers);
   return { ...state, users: nextUsers, stats: nextStats };
   ```

### **❌ DON'T (No hacer)**

1. **No mutar estado directamente**

   ```typescript
   // ❌ INCORRECTO
   state.users.push(newUser);
   return state;
   ```

2. **No olvidar el caso default**

   ```typescript
   // ❌ INCORRECTO - Sin default case
   switch (action.type) {
     case "CREATE_USER":
       return newState;
   }
   ```

3. **No usar any en action types**

   ```typescript
   // ❌ INCORRECTO
   function reducer(state: State, action: any) { ... }
   ```

4. **No hacer cálculos costosos en cada acción**
   ```typescript
   // ❌ INCORRECTO - Recalcular siempre
   const stats = calculateExpensiveMetrics(users);
   ```

¿Te gustaría que profundice en algún componente específico o que añada más ejemplos de implementación?
