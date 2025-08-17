# ⚡ **REDUCERS - REFERENCIA RÁPIDA**

## 🎯 **CHEAT SHEET - REDUCERS ESENCIAL**

### **📊 Estructura Básica**

```typescript
// 🎯 Reducer Function
export function usersOptimisticReducer(
  state: UsersOptimisticState,
  action: UsersOptimisticAction
): UsersOptimisticState {
  switch (action.type) {
    case USERS_ACTIONS.CREATE_USER:
      return { ...state, users: [...state.users, newUser] };
    default:
      return state;
  }
}

// 📊 State Interface
export interface UsersOptimisticState {
  users: User[];
  totalUsers: number;
  activeOperations: number;
  stats: { totalActive: number; totalBanned: number; totalAdmins: number };
}

// 🎭 Action Types
export type UsersOptimisticAction =
  | { type: "CREATE_USER"; tempUser: Omit<User, "id">; tempId: string }
  | { type: "UPDATE_USER"; userId: string; updates: Partial<User> }
  | { type: "DELETE_USER"; userId: string };
```

### **🔍 Uso en Hooks**

```typescript
const useUsers = () => {
  const [optimisticState, addOptimistic] = useOptimistic(
    createInitialUsersOptimisticState(),
    usersOptimisticReducer
  );

  const createUser = useCallback(
    async (userData) => {
      // ⚡ Update optimista inmediato
      startTransition(() => {
        addOptimistic({
          type: USERS_ACTIONS.CREATE_USER,
          tempUser: userData,
          tempId: generateTempUserId(),
        });
      });

      // 🌐 Server action en background
      const result = await createUserServerAction(userData);
      return result;
    },
    [addOptimistic]
  );

  return { users: optimisticState.users, createUser };
};
```

### **🔍 Selectors Comunes**

```typescript
// 📊 Selectors básicos
const users = usersOptimisticSelectors.getAllUsers(state);
const totalUsers = usersOptimisticSelectors.getTotalUsers(state);
const stats = usersOptimisticSelectors.getStats(state);

// 🎯 Selectors de filtrado
const activeUsers = usersOptimisticSelectors.getActiveUsers(state);
const bannedUsers = usersOptimisticSelectors.getBannedUsers(state);
const adminUsers = usersOptimisticSelectors.getAdminUsers(state);

// 🔍 Selectors de búsqueda
const searchResults = usersOptimisticSelectors.searchUsers(state, "term");
const userById = usersOptimisticSelectors.getUserById(state, "user-123");

// 🔄 Selectors de estado
const isLoading = usersOptimisticSelectors.isLoading(state);
const hasErrors = usersOptimisticSelectors.hasErrors(state);
```

---

## 🔧 **SNIPPETS DE CÓDIGO RÁPIDO**

### **🎯 Crear Reducer Simple**

```typescript
export function moduleOptimisticReducer(
  state: ModuleState,
  action: ModuleAction
): ModuleState {
  switch (action.type) {
    case MODULE_ACTIONS.CREATE_ITEM:
      return {
        ...state,
        items: [...state.items, action.item],
        totalItems: state.totalItems + 1,
        lastUpdated: new Date().toISOString(),
      };

    case MODULE_ACTIONS.UPDATE_ITEM:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, ...action.updates } : item
        ),
        lastUpdated: new Date().toISOString(),
      };

    case MODULE_ACTIONS.DELETE_ITEM:
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
        totalItems: Math.max(0, state.totalItems - 1),
        lastUpdated: new Date().toISOString(),
      };

    default:
      return state;
  }
}
```

### **📊 Estado Inicial**

```typescript
export function createInitialState(): ModuleState {
  return {
    items: [],
    totalItems: 0,
    lastUpdated: new Date().toISOString(),
    activeOperations: 0,
    errors: {},
  };
}
```

### **🔍 Selectors Básicos**

```typescript
export const selectors = {
  getAllItems: (state) => state.items,
  getTotalItems: (state) => state.totalItems,
  getActiveItems: (state) => state.items.filter((item) => item.active),
  isLoading: (state) => state.activeOperations > 0,
  hasErrors: (state) => Object.keys(state.errors).length > 0,
};
```

### **🪝 Hook con Reducer**

```typescript
export const useModule = () => {
  const [optimisticState, addOptimistic] = useOptimistic(
    createInitialState(),
    moduleOptimisticReducer
  );

  const createItem = useCallback(
    async (itemData) => {
      const tempId = generateTempId();

      startTransition(() => {
        addOptimistic({
          type: MODULE_ACTIONS.CREATE_ITEM,
          item: { ...itemData, id: tempId },
        });
      });

      const result = await createItemServerAction(itemData);
      return result;
    },
    [addOptimistic]
  );

  return {
    items: optimisticState.items,
    isLoading: selectors.isLoading(optimisticState),
    createItem,
  };
};
```

---

## 🎯 **PATRONES COMUNES**

### **🔄 CRUD Operations**

```typescript
// ✅ CREATE
case ACTIONS.CREATE:
  return {
    ...state,
    items: [...state.items, newItem],
    totalItems: state.totalItems + 1,
  };

// ✅ UPDATE
case ACTIONS.UPDATE:
  return {
    ...state,
    items: state.items.map(item =>
      item.id === action.id ? { ...item, ...action.updates } : item
    ),
  };

// ✅ DELETE
case ACTIONS.DELETE:
  return {
    ...state,
    items: state.items.filter(item => item.id !== action.id),
    totalItems: Math.max(0, state.totalItems - 1),
  };
```

### **📊 Stats Calculation**

```typescript
// 🧮 Helper function para calcular stats
const calculateStats = (items) => ({
  total: items.length,
  active: items.filter(item => item.active).length,
  inactive: items.filter(item => !item.active).length,
});

// 📊 Usar en reducer
case ACTIONS.UPDATE_ITEM: {
  const nextItems = updateItemInArray(state.items, action.id, action.updates);
  const nextStats = calculateStats(nextItems);

  return {
    ...state,
    items: nextItems,
    stats: nextStats,
  };
}
```

### **🔄 Loading States**

```typescript
// 🔄 Manejar loading states
case ACTIONS.START_LOADING:
  return {
    ...state,
    activeOperations: state.activeOperations + 1,
  };

case ACTIONS.COMPLETE_LOADING:
  return {
    ...state,
    activeOperations: Math.max(0, state.activeOperations - 1),
    errors: { ...state.errors, [action.operation]: undefined },
  };

case ACTIONS.FAIL_LOADING:
  return {
    ...state,
    activeOperations: Math.max(0, state.activeOperations - 1),
    errors: { ...state.errors, [action.operation]: action.error },
  };
```

### **🔍 Search & Filter**

```typescript
// 🔍 Selectors para búsqueda
const searchSelectors = {
  searchItems: (state, searchTerm) =>
    state.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),

  filterByStatus: (state, status) =>
    state.items.filter((item) => item.status === status),

  getItemsByCategory: (state, category) =>
    state.items.filter((item) => item.category === category),
};
```

---

## 🚨 **TROUBLESHOOTING RÁPIDO**

### **❌ Problema: Estado no se actualiza**

```typescript
// ❌ MAL: Mutar estado directamente
state.items.push(newItem);
return state;

// ✅ BIEN: Inmutabilidad
return {
  ...state,
  items: [...state.items, newItem],
};
```

### **❌ Problema: Re-renders excesivos**

```typescript
// ❌ MAL: Selector sin memoización
const activeItems = state.items.filter((item) => item.active);

// ✅ BIEN: Selector memoizado
const activeItems = useMemo(
  () => selectors.getActiveItems(state),
  [state.items]
);
```

### **❌ Problema: Pérdida de datos temporales**

```typescript
// ❌ MAL: Reemplazar todo el estado
case ACTIONS.REFRESH_DATA:
  return { ...initialState, items: action.items };

// ✅ BIEN: Preservar datos temporales
case ACTIONS.REFRESH_DATA: {
  const tempItems = state.items.filter(item => item.id.startsWith('temp-'));
  return {
    ...state,
    items: [...action.items, ...tempItems],
    activeOperations: 0,
    errors: {},
  };
}
```

### **❌ Problema: Stats desactualizadas**

```typescript
// ❌ MAL: No recalcular stats
case ACTIONS.UPDATE_ITEM:
  return {
    ...state,
    items: updatedItems,
    // ❌ Stats quedan obsoletas
  };

// ✅ BIEN: Recalcular stats automáticamente
case ACTIONS.UPDATE_ITEM: {
  const nextItems = updateItemInArray(state.items, action.id, action.updates);
  const nextStats = calculateStats(nextItems);

  return {
    ...state,
    items: nextItems,
    stats: nextStats,
  };
}
```

---

## 💡 **TIPS DE PERFORMANCE**

### **✅ HACER**

```typescript
// ✅ Memoizar selectors complejos
const expensiveData = useMemo(
  () => selectors.getComplexData(state),
  [state.lastUpdated]
);

// ✅ Usar dependencias específicas
const activeItems = useMemo(
  () => selectors.getActiveItems(state),
  [state.items] // Solo recalcular si cambian items
);

// ✅ Helper functions fuera del reducer
const calculateStats = (items) => {
  /* ... */
};

// ✅ Batch updates cuando sea posible
startTransition(() => {
  addOptimistic(action1);
  addOptimistic(action2);
  addOptimistic(action3);
});
```

### **❌ EVITAR**

```typescript
// ❌ Cálculos costosos en cada render
const stats = state.items.reduce((acc, item) => {
  /* ... */
}, {});

// ❌ Dependencias demasiado amplias
const activeItems = useMemo(
  () => selectors.getActiveItems(state),
  [state] // ❌ Se recalcula con cualquier cambio
);

// ❌ Múltiples acciones síncronas separadas
addOptimistic(action1);
addOptimistic(action2); // ❌ Causa múltiples re-renders
addOptimistic(action3);
```

---

## 📚 **REFERENCIAS RÁPIDAS**

### **🎯 Action Constants Template**

```typescript
export const MODULE_ACTIONS = {
  // CRUD operations
  CREATE_ITEM: "CREATE_ITEM",
  UPDATE_ITEM: "UPDATE_ITEM",
  DELETE_ITEM: "DELETE_ITEM",

  // Bulk operations
  BULK_UPDATE: "BULK_UPDATE",
  BULK_DELETE: "BULK_DELETE",

  // UI operations
  START_LOADING: "START_LOADING",
  COMPLETE_LOADING: "COMPLETE_LOADING",
  FAIL_LOADING: "FAIL_LOADING",
  CLEAR_ERRORS: "CLEAR_ERRORS",

  // Data operations
  REFRESH_DATA: "REFRESH_DATA",
} as const;
```

### **📊 State Interface Template**

```typescript
export interface ModuleOptimisticState {
  // 📊 Main data
  items: Item[];
  totalItems: number;

  // ⏰ Metadata
  lastUpdated: string;

  // 🔄 UI state
  activeOperations: number;
  errors: Record<string, string>;

  // 📈 Analytics
  stats: {
    totalActive: number;
    totalInactive: number;
    // ... más stats según necesidad
  };
}
```

### **🔍 Selectors Template**

```typescript
export const moduleOptimisticSelectors = {
  // 📊 Basic selectors
  getAllItems: (state) => state.items,
  getTotalItems: (state) => state.totalItems,
  getStats: (state) => state.stats,

  // 🎯 Filter selectors
  getActiveItems: (state) => state.items.filter((item) => item.active),
  getItemsByType: (state, type) =>
    state.items.filter((item) => item.type === type),

  // 🔍 Search selectors
  searchItems: (state, term) =>
    state.items.filter((item) =>
      item.name.toLowerCase().includes(term.toLowerCase())
    ),
  getItemById: (state, id) => state.items.find((item) => item.id === id),

  // 🔄 State selectors
  isLoading: (state) => state.activeOperations > 0,
  hasErrors: (state) => Object.keys(state.errors).length > 0,
  getErrors: (state) => state.errors,
};
```

### **⚡ Helper Functions Template**

```typescript
// 🧮 Calculation helpers
export const calculateStats = (items) => ({
  total: items.length,
  active: items.filter((item) => item.active).length,
  // ... más cálculos
});

// 🔄 Array manipulation helpers
export const updateItemInArray = (items, id, updates) =>
  items.map((item) => (item.id === id ? { ...item, ...updates } : item));

export const removeItemFromArray = (items, id) =>
  items.filter((item) => item.id !== id);

// 🆔 ID generation helpers
export const generateTempId = () =>
  `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const isTempId = (id) => id.startsWith("temp-");
```

---

## 🎯 **EJEMPLOS ONE-LINERS**

```typescript
// 🎯 Hook básico
const { items, createItem } = useModule();

// 📊 Estado con stats
const { items, stats, isLoading } = useModule();

// 🔍 Con selectors
const activeItems = moduleSelectors.getActiveItems(optimisticState);

// ⚡ Acción optimista
addOptimistic({ type: "CREATE_ITEM", item: newItem });

// 🧮 Cálculo rápido de stats
const stats = calculateStats(state.items);

// 🔄 Update inmutable
const nextItems = updateItemInArray(items, id, updates);

// 🆔 ID temporal
const tempId = generateTempId();
```

---

## 📖 **DOCUMENTACIÓN COMPLETA**

- 📚 **[REDUCERS_SYSTEM_COMPLETE_GUIDE.md](./REDUCERS_SYSTEM_COMPLETE_GUIDE.md)** - Guía completa del sistema
- 🔧 **[REDUCERS_COMPONENTS_DETAILED.md](./REDUCERS_COMPONENTS_DETAILED.md)** - Análisis detallado de componentes
- 💡 **[REDUCERS_PRACTICAL_EXAMPLES.md](./REDUCERS_PRACTICAL_EXAMPLES.md)** - Ejemplos prácticos y casos de uso
- 🔄 **[REDUCERS_HOOKS_INTEGRATION.md](./REDUCERS_HOOKS_INTEGRATION.md)** - Integración con hooks y useOptimistic

---

**💫 ¡Ya tienes todo lo necesario para dominar el sistema de reducers!** 🚀
