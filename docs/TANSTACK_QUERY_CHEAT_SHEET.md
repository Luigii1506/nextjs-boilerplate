# 🚀 **TANSTACK QUERY CHEAT SHEET**

## Referencia Rápida para Implementación

---

## 📋 **QUICK REFERENCE INDEX**

1. [⚡ Setup Rápido](#setup-rápido)
2. [🎯 Patterns Esenciales](#patterns-esenciales)
3. [🔑 Query Keys](#query-keys)
4. [💾 Cache Configuration](#cache-configuration)
5. [🔄 Mutations](#mutations)
6. [🎨 UI Patterns](#ui-patterns)
7. [🚨 Error Handling](#error-handling)
8. [📊 Loading States](#loading-states)
9. [🔍 Search & Filters](#search--filters)
10. [📝 Checklist Implementación](#checklist-implementación)

---

## ⚡ **SETUP RÁPIDO**

### 1. Instalar TanStack Query

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 2. Setup Provider

```typescript
// lib/providers/QueryProvider.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 3,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

### 3. Wrap App

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

---

## 🎯 **PATTERNS ESENCIALES**

### Basic Query

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});
```

### Query con Parámetros

```typescript
const { data: user } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // Solo ejecutar si hay userId
});
```

### Query con Filtros

```typescript
const { data: users } = useQuery({
  queryKey: ["users", { role, status, page }],
  queryFn: () => fetchUsers({ role, status, page }),
});
```

### Mutation Básica

```typescript
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});
```

### Mutation con Optimistic Update

```typescript
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    await queryClient.cancelQueries({ queryKey: ["users"] });
    const previous = queryClient.getQueryData(["users"]);
    queryClient.setQueryData(["users"], (old) => [...old, newUser]);
    return { previous };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(["users"], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});
```

---

## 🔑 **QUERY KEYS**

### Query Keys Factory Pattern

```typescript
export const USERS_QUERY_KEYS = {
  all: () => ["users"] as const,
  lists: () => [...USERS_QUERY_KEYS.all(), "list"] as const,
  list: (filters: UserFilters) =>
    [...USERS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...USERS_QUERY_KEYS.all(), "details"] as const,
  detail: (id: string) => [...USERS_QUERY_KEYS.details(), id] as const,
  search: (term: string) =>
    [...USERS_QUERY_KEYS.all(), "search", term] as const,
} as const;
```

### Invalidation Patterns

```typescript
// Invalidar todo
queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.all() });

// Invalidar solo listas
queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });

// Invalidar usuario específico
queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.detail(userId) });
```

---

## 💾 **CACHE CONFIGURATION**

### Por Tipo de Dato

```typescript
// Datos críticos (user profile, navigation)
staleTime: 30 * 1000,     // 30s fresh
gcTime: 5 * 60 * 1000,    // 5min cache

// Datos standard (users, orders)
staleTime: 60 * 1000,     // 1min fresh
gcTime: 10 * 60 * 1000,   // 10min cache

// Datos estáticos (settings, config)
staleTime: 10 * 60 * 1000,  // 10min fresh
gcTime: 30 * 60 * 1000,     // 30min cache
```

### Network Modes

```typescript
networkMode: 'online',      // Solo ejecutar con conexión
networkMode: 'always',      // Ejecutar siempre
networkMode: 'offlineFirst', // Offline first
```

---

## 🔄 **MUTATIONS**

### Basic Mutation

```typescript
const createUserMutation = useMutation({
  mutationFn: async (userData: CreateUserForm) => {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await createUserAction(formData);
    if (!result.success) throw new Error(result.error);
    return result.data;
  },
});
```

### Mutation con Notificaciones

```typescript
const { notify } = useNotifications();

const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    notify("Usuario creado exitosamente", "success");
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
  onError: (error) => {
    notify(error.message, "error");
  },
});
```

### Template Completo Hook

```typescript
export const useUsersQuery = () => {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();

  // Main query
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: USERS_QUERY_KEYS.lists(),
    queryFn: fetchUsers,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Create mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const result = await createUserAction(userData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      const previousUsers = queryClient.getQueryData(USERS_QUERY_KEYS.lists());
      queryClient.setQueryData(USERS_QUERY_KEYS.lists(), (old) => [
        ...old,
        newUser,
      ]);
      return { previousUsers };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }
      notify(err.message, "error");
    },
    onSuccess: () => {
      notify("Usuario creado exitosamente", "success");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });

  return {
    // Data
    users,

    // States
    isLoading,
    error,
    isCreating: createUserMutation.isPending,

    // Actions
    createUser: createUserMutation.mutateAsync,
    refresh: refetch,
  };
};
```

---

## 🎨 **UI PATTERNS**

### Loading States

```typescript
// Component con loading states granulares
const UsersScreen = () => {
  const { users, isLoading, isCreating, isDeleting } = useUsersQuery();

  if (isLoading) {
    return <UsersSkeleton />;
  }

  return (
    <div>
      {/* Loading overlay para operaciones */}
      {(isCreating || isDeleting) && <LoadingOverlay />}

      {/* Lista de usuarios */}
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

### Error Boundary

```typescript
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-container">
    <h2>Algo salió mal:</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Reintentar</button>
  </div>
);

// Wrap component
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <UsersScreen />
</ErrorBoundary>;
```

### Skeleton Loading

```typescript
const UsersSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);
```

---

## 🚨 **ERROR HANDLING**

### Query Error Handling

```typescript
const { data, error, isError } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  throwOnError: false, // Manejar en component
});

if (isError) {
  return <ErrorComponent error={error} />;
}
```

### Global Error Handling

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        console.error("Query error:", error);
        // Log to monitoring service
      },
    },
    mutations: {
      onError: (error) => {
        console.error("Mutation error:", error);
        // Show notification
      },
    },
  },
});
```

### Retry Configuration

```typescript
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  retry: 3, // 3 reintentos
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

---

## 📊 **LOADING STATES**

### Estados Específicos

```typescript
const useUsersQuery = () => {
  const query = useQuery(/* ... */);
  const createMutation = useMutation(/* ... */);
  const deleteMutation = useMutation(/* ... */);

  return {
    ...query,
    // ✅ Estados específicos
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,

    // ❌ NO usar estado genérico
    // isProcessing: createMutation.isPending || deleteMutation.isPending
  };
};
```

### Loading Overlay Pattern

```typescript
const UsersScreen = () => {
  const { users, isLoading, isDeleting } = useUsersQuery();

  return (
    <div className="relative">
      {/* Content */}
      <div className={isDeleting ? "opacity-50" : ""}>
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {/* Loading overlay */}
      {isDeleting && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Eliminando usuario...</span>
        </div>
      )}
    </div>
  );
};
```

---

## 🔍 **SEARCH & FILTERS**

### Search con Debounce

```typescript
const useUsersSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedTerm = useDebounce(searchTerm, 300);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: USERS_QUERY_KEYS.search(debouncedTerm),
    queryFn: () => searchUsers(debouncedTerm),
    enabled: debouncedTerm.length >= 2,
    keepPreviousData: true, // ✅ Evita flickering
  });

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching: isLoading,
  };
};
```

### useDebounce Hook

```typescript
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

### Filter Pattern

```typescript
const useUsersWithFilters = () => {
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    search: "",
  });

  const { data: users } = useQuery({
    queryKey: USERS_QUERY_KEYS.list(filters),
    queryFn: () => fetchUsers(filters),
  });

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return {
    users,
    filters,
    updateFilter,
    clearFilters: () => setFilters({ role: "all", status: "all", search: "" }),
  };
};
```

---

## 📝 **CHECKLIST IMPLEMENTACIÓN**

### ✅ **Antes de Empezar**

- [ ] QueryProvider configurado en root
- [ ] React Query DevTools habilitado (desarrollo)
- [ ] Constants file creado con query keys
- [ ] Server actions implementadas

### ✅ **Query Implementation**

- [ ] Query keys usando factory pattern
- [ ] Cache configuration apropiada (staleTime, gcTime)
- [ ] Error handling implementado
- [ ] Loading states específicos (no genéricos)
- [ ] `enabled` condition para queries condicionales

### ✅ **Mutations Implementation**

- [ ] Optimistic updates implementadas
- [ ] Error handling con rollback
- [ ] Success notifications
- [ ] Cache invalidation después de mutations
- [ ] Loading states específicos para cada mutation

### ✅ **UX Implementation**

- [ ] Skeleton loading para initial load
- [ ] Loading overlays para mutations
- [ ] Error boundaries para error handling
- [ ] keepPreviousData para search results
- [ ] Debounce en search inputs

### ✅ **Performance**

- [ ] Query keys estables (no recrear en cada render)
- [ ] Prefetching implementado para UX críticos
- [ ] Background refetch configurado apropiadamente
- [ ] Cache cleanup para datos obsoletos

### ✅ **Testing**

- [ ] Tests para hooks principales
- [ ] Mock data para testing
- [ ] Error scenarios cubiertos

---

## 🚀 **COMANDOS ÚTILES**

### Query Client Commands

```typescript
// Invalidar queries
queryClient.invalidateQueries({ queryKey: ["users"] });

// Prefetch query
queryClient.prefetchQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
});

// Set query data manually
queryClient.setQueryData(["user", userId], userData);

// Get query data
const user = queryClient.getQueryData(["user", userId]);

// Remove query from cache
queryClient.removeQueries({ queryKey: ["user", userId] });

// Clear all cache
queryClient.clear();
```

### DevTools Commands

```typescript
// Show query cache contents
queryClient.getQueryCache().getAll()

// Show mutation cache contents
queryClient.getMutationCache().getAll()

// Get cache stats
{
  total: queryClient.getQueryCache().getAll().length,
  stale: queryClient.getQueryCache().getAll().filter(q => q.isStale()).length
}
```

---

## 🎯 **COMMON PATTERNS QUICK COPY**

### Template: Basic Module Hook

```typescript
export const use[Module]Query = () => {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();

  // Main query
  const query = useQuery({
    queryKey: [MODULE]_QUERY_KEYS.lists(),
    queryFn: fetch[Module]s,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: create[Module]Action,
    onMutate: async (new[Module]) => {
      // Optimistic update
    },
    onError: (err) => notify(err.message, 'error'),
    onSuccess: () => notify('Creado exitosamente', 'success'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: [MODULE]_QUERY_KEYS.lists() }),
  });

  return {
    // Data
    [modules]: query.data || [],

    // States
    isLoading: query.isLoading,
    error: query.error,
    isCreating: createMutation.isPending,

    // Actions
    create[Module]: createMutation.mutateAsync,
    refresh: query.refetch,
  };
};
```

### Template: Constants File

```typescript
export const [MODULE]_QUERY_KEYS = {
  all: () => ['[modules]'] as const,
  lists: () => [...[MODULE]_QUERY_KEYS.all(), 'list'] as const,
  list: (filters: [Module]Filters) => [...[MODULE]_QUERY_KEYS.lists(), filters] as const,
  details: () => [...[MODULE]_QUERY_KEYS.all(), 'details'] as const,
  detail: (id: string) => [...[MODULE]_QUERY_KEYS.details(), id] as const,
} as const;

export const [MODULE]_CONFIG = {
  STALE_TIME: 30 * 1000,
  CACHE_TIME: 5 * 60 * 1000,
  DEFAULT_PAGE_SIZE: 20,
} as const;
```

---

## 🎉 **¡LISTO PARA IMPLEMENTAR!**

Con esta documentación completa tienes:

- ✅ **Guía arquitectural completa**
- ✅ **Patrones para módulos grandes y pequeños**
- ✅ **Configuraciones avanzadas de performance**
- ✅ **Referencia rápida para implementación**
- ✅ **Templates copy-paste listos**

**¿Siguiente paso?** ¡Empezar con el módulo **Dashboard** usando estos patrones! 🚀
