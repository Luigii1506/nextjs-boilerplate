# 🚀 **TANSTACK QUERY ARCHITECTURE GUIDE**

## La Guía Completa para Módulos Enterprise

> **Versión:** 2.0 - Enterprise Edition  
> **Fecha:** Enero 2025  
> **Autor:** Arquitectura Optimizada  
> **Propósito:** Guía maestra para implementar TanStack Query en todos los módulos

---

## 📋 **TABLA DE CONTENIDO**

1. [🎯 Introducción a TanStack Query](#introducción)
2. [🏗️ Arquitectura Enterprise](#arquitectura-enterprise)
3. [📊 Módulos Grandes vs Pequeños](#módulos-grandes-vs-pequeños)
4. [💾 Sistema de Cache Inteligente](#sistema-de-cache)
5. [🎨 Patrones de Implementación](#patrones-de-implementación)
6. [⚡ Hooks Especializados](#hooks-especializados)
7. [🔧 Configuración Central](#configuración-central)
8. [📝 Guías Paso a Paso](#guías-paso-a-paso)
9. [🎯 Mejores Prácticas](#mejores-prácticas)
10. [🚨 Troubleshooting Common](#troubleshooting)

---

## 🎯 **INTRODUCCIÓN A TANSTACK QUERY**

### ¿Qué es TanStack Query?

TanStack Query (anteriormente React Query) es **la librería estándar de la industria** para:

- ✅ **Data Fetching** inteligente
- ✅ **Caching** automático y configurable
- ✅ **Background Updates** transparentes
- ✅ **Optimistic Updates** instantáneos
- ✅ **Error Handling** robusto
- ✅ **Loading States** profesionales

### ¿Por qué lo elegimos?

```typescript
// ❌ ANTES: Código legacy complejo
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetchUsers()
    .then(setUsers)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

// ✅ DESPUÉS: TanStack Query simple y poderoso
const { data: users, isLoading, error } = useUsersQuery();
```

**Beneficios inmediatos:**

- 📉 **-90% menos código** para data fetching
- ⚡ **Cache automático** sin configuración extra
- 🔄 **Background sync** automático
- 🎯 **TypeScript perfecto** out-of-the-box
- 📊 **DevTools profesionales** incluidos

---

## 🏗️ **ARQUITECTURA ENTERPRISE**

### Estructura de Directorio Estándar

```
src/features/[module]/
├── 📁 hooks/                    # ← TanStack Query Hooks
│   ├── use[Module]Query.ts      # Core data fetching
│   ├── use[Module]Details.ts    # Individual items + prefetching
│   ├── use[Module]Search.ts     # Search + debouncing
│   ├── use[Module]Infinite.ts   # Pagination + virtual scroll
│   ├── use[Module]Bulk.ts       # Bulk operations
│   ├── use[Module]Cache.ts      # Cache management
│   ├── use[Module]Modal.ts      # Form modals
│   └── index.ts                 # Clean exports
├── 📁 server/
│   ├── actions.ts               # Next.js Server Actions
│   └── service.ts               # Business logic
├── 📁 ui/
│   ├── components/              # UI components
│   └── routes/                  # Screen components
├── 📄 types.ts                  # TypeScript definitions
├── 📄 schemas.ts                # Zod validation
├── 📄 constants.ts              # Module constants
└── 📄 index.ts                  # Module exports
```

### Principios Arquitecturales

#### 1. **Single Source of Truth**

```typescript
// ✅ TanStack Query como única fuente de verdad
const useUsersQuery = () => {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.lists(),
    queryFn: fetchUsers,
    // Cache configuration
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
```

#### 2. **Separation of Concerns**

```typescript
// 🎯 Separación clara de responsabilidades
const useUsersQuery = () => {
  const query = useQuery(/* ... */); // Data fetching
  const createMutation = useCreateUser(); // Mutations
  const deleteMutation = useDeleteUser(); // Mutations

  return {
    ...query,
    // Actions
    createUser: createMutation.mutate,
    deleteUser: deleteMutation.mutate,
    // States
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
```

#### 3. **Optimistic Updates por Defecto**

```typescript
// ⚡ Optimistic updates automáticos
const createUserMutation = useMutation({
  mutationFn: createUserAction,
  onMutate: async (newUser) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

    // Snapshot previous value
    const previousUsers = queryClient.getQueryData(USERS_QUERY_KEYS.lists());

    // Optimistically update
    queryClient.setQueryData(USERS_QUERY_KEYS.lists(), (old) => [
      ...old,
      newUser,
    ]);

    return { previousUsers };
  },
  onError: (err, newUser, context) => {
    // Rollback on error
    queryClient.setQueryData(USERS_QUERY_KEYS.lists(), context.previousUsers);
  },
  onSettled: () => {
    // Refetch to sync with server
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
  },
});
```

---

## 📊 **MÓDULOS GRANDES VS PEQUEÑOS**

### 🏢 **Módulos Grandes (Ej: Users, Products, Orders)**

**Características:**

- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Búsqueda avanzada + filtros múltiples
- ✅ Paginación + scroll infinito
- ✅ Operaciones masivas (bulk operations)
- ✅ Cache management avanzado
- ✅ Prefetching inteligente

**Estructura de Hooks:**

```typescript
// 📁 hooks/index.ts - Módulo Grande
export {
  useUsersQuery, // Core data fetching
  useUserDetails, // Individual + prefetch
  useUsersSearch, // Search + debounce
  useUsersInfinite, // Infinite scroll
  useUsersBulk, // Bulk operations
  useUsersCacheManager, // Advanced cache
  useUserModal, // Form logic
} from "./[specific-files]";
```

**Ejemplo: Hook Principal Completo**

```typescript
// 🎯 useUsersQuery.ts - Full Featured Hook
export const useUsersQuery = () => {
  const queryClient = useQueryClient();

  // Main query
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: USERS_QUERY_KEYS.lists(),
    queryFn: fetchUsers,
    staleTime: USERS_CONFIG.STALE_TIME,
    gcTime: USERS_CONFIG.CACHE_TIME,
  });

  // Mutations with optimistic updates
  const createUserMutation = useMutation({/* ... */});
  const updateUserMutation = useMutation({/* ... */});
  const deleteUserMutation = useMutation({/* ... */});
  const banUserMutation = useMutation({/* ... */});

  // Advanced features
  const stats = useMemo(() => calculateUserStats(users), [users]);
  const searchUsers = useCallback(/* ... */, [users]);
  const filterUsers = useCallback(/* ... */, [users]);

  return {
    // Data
    users,
    stats,

    // States
    isLoading,
    error,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,

    // Actions
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    banUser: banUserMutation.mutate,

    // Utilities
    searchUsers,
    filterUsers,
    refresh: refetch,
  };
};
```

### 🏠 **Módulos Pequeños (Ej: Dashboard, Settings, Profile)**

**Características:**

- ✅ Principalmente lectura de datos
- ✅ Pocas operaciones de escritura
- ✅ Cache simple
- ✅ Estructura simplificada

**Estructura de Hooks:**

```typescript
// 📁 hooks/index.ts - Módulo Pequeño
export {
  useDashboardQuery, // Main data fetching
  useDashboardStats, // Statistics
  useDashboardActions, // Simple actions (if any)
} from "./[specific-files]";
```

**Ejemplo: Hook Simplificado**

```typescript
// 🎯 useDashboardQuery.ts - Simplified Hook
export const useDashboardQuery = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 2 * 60 * 1000, // 2 minutes (data changes less frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
  });

  // Simple derived data
  const stats = useMemo(
    () => ({
      totalUsers: dashboardData?.userCount || 0,
      totalRevenue: dashboardData?.revenue || 0,
      growthRate: dashboardData?.growth || 0,
    }),
    [dashboardData]
  );

  return {
    data: dashboardData,
    stats,
    isLoading,
    error,
  };
};
```

---

## 💾 **SISTEMA DE CACHE INTELIGENTE**

### Configuración de Cache por Tipo de Datos

```typescript
// 🎯 Cache Strategies by Data Type

// 1. User Data (frecuentemente actualizado)
const USER_CACHE_CONFIG = {
  staleTime: 30 * 1000, // 30s - considerar datos frescos
  gcTime: 5 * 60 * 1000, // 5min - tiempo en cache
  refetchOnWindowFocus: true, // Revalidar al enfocar ventana
};

// 2. Dashboard Stats (actualizado menos frecuente)
const DASHBOARD_CACHE_CONFIG = {
  staleTime: 2 * 60 * 1000, // 2min - stats cambian lentamente
  gcTime: 10 * 60 * 1000, // 10min - mantener más tiempo
  refetchOnWindowFocus: false, // No revalidar automáticamente
};

// 3. Configuration Data (raramente cambia)
const CONFIG_CACHE_CONFIG = {
  staleTime: 10 * 60 * 1000, // 10min - configuración estable
  gcTime: 30 * 60 * 1000, // 30min - mantener mucho tiempo
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};
```

### Query Keys Estratégicos

```typescript
// 🔑 Query Keys Hierarchy
export const USERS_QUERY_KEYS = {
  // Base
  all: () => ["users"] as const,
  lists: () => [...USERS_QUERY_KEYS.all(), "list"] as const,

  // Specific queries
  list: (filters: UserFilters) =>
    [...USERS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...USERS_QUERY_KEYS.all(), "details"] as const,
  detail: (id: string) => [...USERS_QUERY_KEYS.details(), id] as const,

  // Search and filters
  searches: () => [...USERS_QUERY_KEYS.all(), "search"] as const,
  search: (term: string) => [...USERS_QUERY_KEYS.searches(), term] as const,

  // Related data
  stats: () => [...USERS_QUERY_KEYS.all(), "stats"] as const,
  analytics: () => [...USERS_QUERY_KEYS.all(), "analytics"] as const,
} as const;
```

### Cache Invalidation Patterns

```typescript
// 🔄 Smart Cache Invalidation
export const invalidateUsersCache = {
  // Invalidate all user-related data
  all: () =>
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.all() }),

  // Invalidate only lists (after create/delete)
  lists: () =>
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() }),

  // Invalidate specific user (after update)
  user: (userId: string) =>
    queryClient.invalidateQueries({
      queryKey: USERS_QUERY_KEYS.detail(userId),
    }),

  // Invalidate stats (after any change)
  stats: () =>
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() }),
};
```

### Background Updates Automáticos

```typescript
// 🔄 Background Sync Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch strategies
      refetchOnWindowFocus: true, // Usuario regresa a la ventana
      refetchOnReconnect: true, // Se reconecta internet
      refetchOnMount: "always", // Siempre al montar componente

      // Retry strategies
      retry: 3, // 3 reintentos automáticos
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Network strategies
      networkMode: "online", // Solo ejecutar con conexión
    },
  },
});
```

---

## 🎨 **PATRONES DE IMPLEMENTACIÓN**

### Patrón 1: Query + Mutations Combinadas

```typescript
// 🎯 Pattern: Combined Query + Mutations
export const useUsersQuery = () => {
  // Main query
  const usersQuery = useQuery({
    queryKey: USERS_QUERY_KEYS.lists(),
    queryFn: fetchUsers,
  });

  // Mutations with optimistic updates
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  return {
    // Query data
    ...usersQuery,

    // Mutation actions
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
```

### Patrón 2: Hooks Especializados

```typescript
// 🎯 Pattern: Specialized Hooks
export const useUserDetails = (userId: string) => {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.detail(userId),
    queryFn: () => fetchUserDetails(userId),
    enabled: !!userId, // Solo ejecutar si hay userId
  });
};

export const useUsersSearch = (searchTerm: string) => {
  const debouncedTerm = useDebounce(searchTerm, 300);

  return useQuery({
    queryKey: USERS_QUERY_KEYS.search(debouncedTerm),
    queryFn: () => searchUsers(debouncedTerm),
    enabled: debouncedTerm.length >= 2, // Mínimo 2 caracteres
    keepPreviousData: true, // Mantener datos anteriores mientras carga
  });
};
```

### Patrón 3: Infinite Queries

```typescript
// 🎯 Pattern: Infinite Scroll
export const useUsersInfinite = () => {
  return useInfiniteQuery({
    queryKey: USERS_QUERY_KEYS.infinite(),
    queryFn: ({ pageParam = 0 }) => fetchUsers({ page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    // Performance optimization
    getPreviousPageParam: (firstPage, allPages) => {
      return firstPage.page > 0 ? firstPage.page - 1 : undefined;
    },
  });
};
```

### Patrón 4: Prefetching Inteligente

```typescript
// 🎯 Pattern: Smart Prefetching
export const prefetchUserDetails = (userId: string) => {
  return queryClient.prefetchQuery({
    queryKey: USERS_QUERY_KEYS.detail(userId),
    queryFn: () => fetchUserDetails(userId),
    staleTime: 60 * 1000, // 1 minuto
  });
};

// Usage en componentes
const UserCard = ({ user }) => {
  return (
    <div
      onMouseEnter={() => prefetchUserDetails(user.id)} // Prefetch on hover
      onClick={() => router.push(`/users/${user.id}`)}
    >
      {user.name}
    </div>
  );
};
```

---

## ⚡ **HOOKS ESPECIALIZADOS**

### Hook para Modales y Formularios

```typescript
// 🎯 useUserModal.ts - Modal Logic Hook
export const useUserModal = () => {
  const [formData, setFormData] = useState<CreateUserForm>({
    name: "",
    email: "",
    role: "user",
  });

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const handleSubmit = async (mode: "create" | "edit", userId?: string) => {
    if (mode === "create") {
      await createMutation.mutateAsync(formData);
    } else {
      await updateMutation.mutateAsync({ id: userId, ...formData });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", role: "user" });
  };

  return {
    formData,
    setFormData,
    handleSubmit,
    resetForm,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    error: createMutation.error || updateMutation.error,
  };
};
```

### Hook para Cache Management

```typescript
// 🎯 useUsersCacheManager.ts - Advanced Cache Hook
export const useUsersCacheManager = () => {
  const queryClient = useQueryClient();

  const prefetchUser = useCallback(
    (userId: string) => {
      return queryClient.prefetchQuery({
        queryKey: USERS_QUERY_KEYS.detail(userId),
        queryFn: () => fetchUserDetails(userId),
        staleTime: 60 * 1000,
      });
    },
    [queryClient]
  );

  const updateUserInCache = useCallback(
    (userId: string, updates: Partial<User>) => {
      queryClient.setQueryData(
        USERS_QUERY_KEYS.detail(userId),
        (oldData: User | undefined) =>
          oldData ? { ...oldData, ...updates } : undefined
      );

      // Also update in lists
      queryClient.setQueryData(
        USERS_QUERY_KEYS.lists(),
        (oldData: User[] | undefined) =>
          oldData?.map((user) =>
            user.id === userId ? { ...user, ...updates } : user
          )
      );
    },
    [queryClient]
  );

  const removeUserFromCache = useCallback(
    (userId: string) => {
      queryClient.removeQueries({ queryKey: USERS_QUERY_KEYS.detail(userId) });
      queryClient.setQueryData(
        USERS_QUERY_KEYS.lists(),
        (oldData: User[] | undefined) =>
          oldData?.filter((user) => user.id !== userId)
      );
    },
    [queryClient]
  );

  return {
    prefetchUser,
    updateUserInCache,
    removeUserFromCache,
    invalidateAll: () => invalidateUsersCache.all(),
    getCachedUser: (userId: string) =>
      queryClient.getQueryData(USERS_QUERY_KEYS.detail(userId)),
  };
};
```

### Hook para Bulk Operations

```typescript
// 🎯 useUsersBulk.ts - Bulk Operations Hook
export const useUsersBulk = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const results = [];
      for (let i = 0; i < userIds.length; i++) {
        const result = await deleteUserAction(userIds[i]);
        results.push(result);
        setProgress(((i + 1) / userIds.length) * 100);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      setSelectedIds([]);
      setProgress(0);
    },
  });

  const toggleSelection = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = (users: User[]) => {
    setSelectedIds(users.map((u) => u.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return {
    selectedIds,
    progress,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    isBulkDeleting: bulkDeleteMutation.isPending,
    selectedCount: selectedIds.length,
  };
};
```

---

## 🔧 **CONFIGURACIÓN CENTRAL**

### QueryClient Global

```typescript
// 📄 lib/query-client.ts - Central Configuration
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: 30 * 1000, // 30s - datos frescos por defecto
      gcTime: 5 * 60 * 1000, // 5min - garbage collection

      // Retry configuration
      retry: 3, // 3 reintentos
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch configuration
      refetchOnWindowFocus: true, // Refetch al enfocar ventana
      refetchOnReconnect: true, // Refetch al reconectar
      refetchOnMount: "always", // Siempre refetch al montar

      // Error handling
      throwOnError: false, // Manejar errores en components
      networkMode: "online", // Solo ejecutar online
    },
    mutations: {
      retry: 1, // 1 reintento para mutaciones
      networkMode: "online",
      throwOnError: false,
    },
  },
});

// Utility functions
export const invalidateAll = () => {
  return queryClient.invalidateQueries();
};

export const prefetchQuery = (
  queryKey: unknown[],
  queryFn: () => Promise<unknown>
) => {
  return queryClient.prefetchQuery({ queryKey, queryFn });
};

export const clearCache = () => {
  return queryClient.clear();
};
```

### Provider Setup

```typescript
// 📄 lib/providers/QueryProvider.tsx - Provider Setup
"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 3,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMount: "always",
            throwOnError: false,
            networkMode: "online",
          },
          mutations: {
            retry: 1,
            networkMode: "online",
            throwOnError: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
```

### Constants y Configuración

```typescript
// 📄 [module]/constants.ts - Module Configuration
export const USERS_CONFIG = {
  // TanStack Query defaults
  STALE_TIME: 30 * 1000, // 30s
  CACHE_TIME: 5 * 60 * 1000, // 5min

  // UI defaults
  DEFAULT_PAGE_SIZE: 20,
  SEARCH_DEBOUNCE_MS: 300,

  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MIN_NAME_LENGTH: 2,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Query Keys Factory
export const USERS_QUERY_KEYS = {
  all: () => ["users"] as const,
  lists: () => [...USERS_QUERY_KEYS.all(), "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...USERS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...USERS_QUERY_KEYS.all(), "details"] as const,
  detail: (id: string) => [...USERS_QUERY_KEYS.details(), id] as const,
  searches: () => [...USERS_QUERY_KEYS.all(), "search"] as const,
  search: (params: Record<string, unknown>) =>
    [...USERS_QUERY_KEYS.searches(), params] as const,
} as const;
```

---

_Continúa en la siguiente sección..._
