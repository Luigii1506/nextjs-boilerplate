---
title: Ejemplos
slug: /Configuracion/ejemplos
---

# 🎯 **EJEMPLOS PRÁCTICOS DEL SISTEMA DE CONFIGURACIÓN**

## 📚 **ÍNDICE DE ESCENARIOS**

- [🚀 Casos Básicos de Uso](#-casos-básicos-de-uso)
- [👥 Configuración por Tipo de Usuario](#-configuración-por-tipo-de-usuario)
- [📱 Configuración Responsive](#-configuración-responsive)
- [🌍 Configuración por Región/Idioma](#-configuración-por-regiónidioma)
- [⚡ Performance Optimization](#-performance-optimization)
- [🧪 Testing con Configuraciones](#-testing-con-configuraciones)
- [🎭 Feature Flags Dinámicos](#-feature-flags-dinámicos)
- [🏢 Configuraciones Empresariales](#-configuraciones-empresariales)

---

## 🚀 **CASOS BÁSICOS DE USO**

### **📝 Escenario 1: Lista de Usuarios para Admin**

```typescript
// components/admin/UsersList.tsx
import { useUsers } from "@/features/admin/users/hooks";

const AdminUsersList = () => {
  // Admin necesita ver más usuarios por página y búsquedas más rápidas
  const { users, isLoading, searchUsers } = useUsers({
    ui: {
      itemsPerPage: 100, // Ver más usuarios
      searchMinChars: 1, // Buscar desde el primer carácter
    },
    performance: {
      debounceMs: 150, // Búsquedas más ágiles
    },
  });

  return (
    <div>
      <h1>Panel de Administración - {users.length} usuarios</h1>
      {/* Componente mostrará 100 usuarios por página */}
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

### **📱 Escenario 2: Lista de Usuarios para Móvil**

```typescript
// components/mobile/UsersList.tsx
import { useUsers } from "@/features/admin/users/hooks";

const MobileUsersList = () => {
  // Móvil necesita menos elementos y actualizaciones menos frecuentes
  const { users, isLoading } = useUsers({
    ui: {
      itemsPerPage: 10, // Menos elementos para móvil
      updateInterval: 500, // Updates menos frecuentes
    },
    performance: {
      cacheTimeout: 5 * 60 * 1000, // Cache más corto (5 min)
      debounceMs: 400, // Búsquedas más lentas para ahorrar batería
    },
  });

  return (
    <div className="mobile-users-list">
      <h2>Usuarios ({users.length})</h2>
      {/* Solo 10 usuarios por página, optimizado para móvil */}
      {users.map((user) => (
        <MobileUserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

### **⚡ Escenario 3: Dashboard en Tiempo Real**

```typescript
// components/dashboard/RealTimeDashboard.tsx
import { useUsers } from "@/features/admin/users/hooks";

const RealTimeDashboard = () => {
  // Dashboard necesita datos súper frescos
  const { users, stats } = useUsers({
    performance: {
      cacheTimeout: 30 * 1000, // Cache muy corto (30 segundos)
      debounceMs: 100, // Respuesta inmediata
    },
    settings: {
      autoRefresh: true, // Refresco automático
      performanceTracking: true, // Métricas para optimizar
    },
  });

  return (
    <div className="dashboard">
      <h1>Dashboard en Tiempo Real</h1>
      <div className="stats">
        <div>👥 Usuarios Activos: {stats.active}</div>
        <div>🚫 Usuarios Baneados: {stats.banned}</div>
        <div>👑 Administradores: {stats.admins}</div>
      </div>
      {/* Datos siempre frescos */}
    </div>
  );
};
```

---

## 👥 **CONFIGURACIÓN POR TIPO DE USUARIO**

### **🎭 Hook Personalizado por Rol**

```typescript
// hooks/useUsersForRole.ts
import { useAuth } from "@/core/auth/hooks";
import { useUsers } from "@/features/admin/users/hooks";

export const useUsersForRole = () => {
  const { user } = useAuth();

  // Configuración dinámica basada en el rol del usuario
  const getConfigForRole = () => {
    switch (user.role) {
      case "super_admin":
        return {
          ui: {
            itemsPerPage: 200, // Super admin ve TODO
            maxUsersPerBatch: 100, // Operaciones masivas grandes
          },
          performance: {
            debounceMs: 100, // Búsquedas inmediatas
            cacheTimeout: 2 * 60 * 1000, // Cache corto para datos frescos
          },
          settings: {
            advancedLogging: true, // Logging detallado
            performanceTracking: true,
          },
        };

      case "admin":
        return {
          ui: {
            itemsPerPage: 50, // Admin ve muchos
            maxUsersPerBatch: 25, // Operaciones medianas
          },
          performance: {
            debounceMs: 200,
            cacheTimeout: 5 * 60 * 1000,
          },
        };

      case "user":
      default:
        return {
          ui: {
            itemsPerPage: 20, // Usuario normal ve pocos
            maxUsersPerBatch: 5, // Operaciones pequeñas
          },
          performance: {
            debounceMs: 300,
            cacheTimeout: 10 * 60 * 1000, // Cache más largo
          },
          settings: {
            advancedLogging: false, // Sin logging para usuarios
          },
        };
    }
  };

  return useUsers(getConfigForRole());
};

// Uso en componente:
const UserManagement = () => {
  const { users, createUser, deleteUser } = useUsersForRole();
  // Automáticamente configurado según el rol del usuario actual
};
```

### **🏢 Configuración Empresarial por Departamento**

```typescript
// config/departmentConfigs.ts
export const DEPARTMENT_CONFIGS = {
  HR: {
    ui: {
      itemsPerPage: 100, // HR maneja muchos empleados
      searchMinChars: 2, // Búsquedas detalladas
    },
    settings: {
      optimisticUpdates: false, // HR prefiere confirmación de server
    },
  },

  IT: {
    ui: { itemsPerPage: 50 },
    performance: {
      debounceMs: 150, // IT quiere respuesta rápida
      maxRetries: 5, // Más tolerante a fallos de red
    },
    settings: {
      advancedLogging: true, // IT necesita debugging
      performanceTracking: true,
    },
  },

  SALES: {
    ui: { itemsPerPage: 25 },
    performance: {
      cacheTimeout: 2 * 60 * 1000, // Sales quiere datos frescos
      debounceMs: 200,
    },
  },
};

// hooks/useUsersForDepartment.ts
export const useUsersForDepartment = (
  department: keyof typeof DEPARTMENT_CONFIGS
) => {
  return useUsers(DEPARTMENT_CONFIGS[department]);
};

// Uso:
const HRUsersPanel = () => {
  const { users } = useUsersForDepartment("HR");
  // Configuración automática para HR
};
```

---

## 📱 **CONFIGURACIÓN RESPONSIVE**

### **📐 Hook Responsive con Breakpoints**

```typescript
// hooks/useResponsiveUsers.ts
import { useState, useEffect } from "react";
import { useUsers } from "@/features/admin/users/hooks";

const useResponsiveUsers = () => {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize("mobile");
      else if (width < 1024) setScreenSize("tablet");
      else setScreenSize("desktop");
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  const getResponsiveConfig = () => {
    switch (screenSize) {
      case "mobile":
        return {
          ui: {
            itemsPerPage: 8, // Muy pocos en móvil
            updateInterval: 1000, // Updates menos frecuentes
            searchMinChars: 3, // Evitar búsquedas excesivas
          },
          performance: {
            debounceMs: 500, // Más lento para ahorrar batería
            cacheTimeout: 15 * 60 * 1000, // Cache largo
            maxRetries: 2, // Menos reintentos
          },
          settings: {
            optimisticUpdates: true, // UI más responsiva en móvil
            autoRefresh: false, // Sin refresco automático
          },
        };

      case "tablet":
        return {
          ui: {
            itemsPerPage: 20,
            updateInterval: 500,
          },
          performance: {
            debounceMs: 300,
            cacheTimeout: 8 * 60 * 1000,
          },
        };

      case "desktop":
      default:
        return {
          ui: {
            itemsPerPage: 50, // Más elementos en desktop
            updateInterval: 200, // Updates frecuentes
          },
          performance: {
            debounceMs: 150, // Búsquedas rápidas
            cacheTimeout: 5 * 60 * 1000,
            maxRetries: 3,
          },
          settings: {
            autoRefresh: true, // Refresco automático
            performanceTracking: true,
          },
        };
    }
  };

  return useUsers(getResponsiveConfig());
};

// Uso en componente:
const ResponsiveUsersList = () => {
  const { users, isLoading } = useResponsiveUsers();

  return (
    <div className="responsive-users-list">
      {/* Se adapta automáticamente al tamaño de pantalla */}
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

### **🎨 Configuración con Tema y Preferencias**

```typescript
// hooks/useThemedUsers.ts
import { useTheme } from "@/shared/hooks/useTheme";
import { useUserPreferences } from "@/shared/hooks/useUserPreferences";

export const useThemedUsers = () => {
  const { theme, isDarkMode } = useTheme();
  const { preferences } = useUserPreferences();

  const getThemedConfig = () => {
    const baseConfig = {
      ui: {
        itemsPerPage: preferences.itemsPerPage || 20,
        searchMinChars: preferences.searchMinChars || 2,
      },
      performance: {
        debounceMs: preferences.fastSearch ? 150 : 300,
      },
    };

    // Ajustes específicos para tema oscuro
    if (isDarkMode) {
      return {
        ...baseConfig,
        ui: {
          ...baseConfig.ui,
          updateInterval: 300, // Animaciones más suaves en dark mode
        },
        performance: {
          ...baseConfig.performance,
          cacheTimeout: 8 * 60 * 1000, // Cache más largo para reducir flashes
        },
      };
    }

    return baseConfig;
  };

  return useUsers(getThemedConfig());
};
```

---

## 🌍 **CONFIGURACIÓN POR REGIÓN/IDIOMA**

### **🗺️ Configuraciones Regionales**

```typescript
// config/regionConfigs.ts
export const REGION_CONFIGS = {
  US: {
    ui: {
      itemsPerPage: 50, // Conexiones rápidas en US
    },
    performance: {
      debounceMs: 200,
      cacheTimeout: 5 * 60 * 1000,
      maxRetries: 3,
    },
  },

  EU: {
    ui: {
      itemsPerPage: 30, // Balance para EU
    },
    performance: {
      debounceMs: 300,
      cacheTimeout: 8 * 60 * 1000, // Cache más largo por GDPR
      maxRetries: 4,
    },
    settings: {
      advancedLogging: false, // Restricciones GDPR
    },
  },

  LATAM: {
    ui: {
      itemsPerPage: 20, // Conexiones más lentas
    },
    performance: {
      debounceMs: 500, // Debounce más largo
      cacheTimeout: 15 * 60 * 1000, // Cache muy largo
      maxRetries: 5, // Más tolerante a problemas de red
    },
  },

  ASIA: {
    ui: {
      itemsPerPage: 25,
    },
    performance: {
      debounceMs: 350,
      cacheTimeout: 10 * 60 * 1000,
      maxRetries: 4,
    },
  },
};

// hooks/useRegionalUsers.ts
export const useRegionalUsers = () => {
  const userRegion = getUserRegion(); // Función que detecta región
  const config = REGION_CONFIGS[userRegion] || REGION_CONFIGS["US"];

  return useUsers(config);
};

// utils/regionDetection.ts
export const getUserRegion = (): keyof typeof REGION_CONFIGS => {
  // Detecta región por IP, timezone, o configuración de usuario
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (timezone.includes("America")) return "LATAM";
  if (timezone.includes("Europe")) return "EU";
  if (timezone.includes("Asia")) return "ASIA";

  return "US"; // Default
};
```

### **🌐 Configuración por Idioma**

```typescript
// config/languageConfigs.ts
export const LANGUAGE_CONFIGS = {
  en: {
    ui: {
      searchMinChars: 2, // Inglés: búsquedas desde 2 caracteres
      itemsPerPage: 25,
    },
    performance: {
      debounceMs: 200,
    },
  },

  es: {
    ui: {
      searchMinChars: 3, // Español: palabras más largas
      itemsPerPage: 20,
    },
    performance: {
      debounceMs: 300,
    },
  },

  zh: {
    ui: {
      searchMinChars: 1, // Chino: cada carácter tiene significado
      itemsPerPage: 30,
    },
    performance: {
      debounceMs: 400, // Más tiempo para input methods
    },
  },

  ar: {
    ui: {
      searchMinChars: 3, // Árabe: escritura de derecha a izquierda
      itemsPerPage: 20,
    },
    performance: {
      debounceMs: 350,
    },
  },
};

// hooks/useLocalizedUsers.ts
export const useLocalizedUsers = () => {
  const { language } = useLocalization();
  const config = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS["en"];

  return useUsers(config);
};
```

---

## ⚡ **PERFORMANCE OPTIMIZATION**

### **🚀 Configuración de Alta Performance**

```typescript
// hooks/useHighPerformanceUsers.ts
export const useHighPerformanceUsers = () => {
  const config = {
    performance: {
      debounceMs: 100, // Búsquedas súper rápidas
      maxRetries: 2, // Falla rápido
      cacheTimeout: 30 * 60 * 1000, // Cache largo (30 min)
    },
    ui: {
      itemsPerPage: 100, // Muchos elementos (menos paginación)
      updateInterval: 50, // Updates muy frecuentes
    },
    settings: {
      optimisticUpdates: true, // UI instantánea
      performanceTracking: true, // Para monitorear
      autoRefresh: false, // Manual refresh para control
    },
  };

  return useUsers(config);
};

// Uso con memoización para máximo performance:
const HighPerformanceUsersList = React.memo(() => {
  const { users, createUser, updateUser } = useHighPerformanceUsers();

  // Memoizar operaciones costosas
  const sortedUsers = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );

  const handleCreateUser = useCallback(
    (userData) => {
      createUser(userData);
    },
    [createUser]
  );

  return (
    <VirtualizedList items={sortedUsers} onCreateUser={handleCreateUser} />
  );
});
```

### **🔋 Configuración de Bajo Consumo**

```typescript
// hooks/useBatteryFriendlyUsers.ts
export const useBatteryFriendlyUsers = () => {
  const config = {
    performance: {
      debounceMs: 800, // Búsquedas lentas
      maxRetries: 1, // Pocos reintentos
      cacheTimeout: 60 * 60 * 1000, // Cache muy largo (1 hora)
    },
    ui: {
      itemsPerPage: 10, // Pocos elementos
      updateInterval: 1000, // Updates espaciados
    },
    settings: {
      optimisticUpdates: false, // Esperar confirmación del servidor
      performanceTracking: false, // Sin tracking
      autoRefresh: false, // Sin refresco automático
    },
  };

  return useUsers(config);
};
```

### **📊 Configuración con Métricas**

```typescript
// hooks/useUsersWithMetrics.ts
export const useUsersWithMetrics = () => {
  const [metrics, setMetrics] = useState({
    searchTime: 0,
    renderTime: 0,
    cacheHitRate: 0,
  });

  const config = {
    performance: {
      debounceMs: 250,
      cacheTimeout: 10 * 60 * 1000,
    },
    settings: {
      performanceTracking: true,
      advancedLogging: true, // Para capturar métricas
    },
  };

  const usersResult = useUsers(config);

  // Capturar métricas de performance
  useEffect(() => {
    const captureMetrics = () => {
      // Simular captura de métricas reales
      setMetrics({
        searchTime: performance.now() - searchStartTime,
        renderTime: performance.now() - renderStartTime,
        cacheHitRate: calculateCacheHitRate(),
      });
    };

    // Capturar métricas después de cada operación
    captureMetrics();
  }, [usersResult.users]);

  return {
    ...usersResult,
    metrics,
  };
};

// Componente con monitoreo:
const MonitoredUsersList = () => {
  const { users, metrics } = useUsersWithMetrics();

  return (
    <div>
      <div className="metrics-panel">
        <div>🔍 Search Time: {metrics.searchTime}ms</div>
        <div>🎨 Render Time: {metrics.renderTime}ms</div>
        <div>💾 Cache Hit Rate: {metrics.cacheHitRate}%</div>
      </div>

      <div className="users-list">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};
```

---

## 🧪 **TESTING CON CONFIGURACIONES**

### **🔬 Test Utils para Configuraciones**

```typescript
// utils/testConfigUtils.ts
export const createTestConfig = (overrides = {}) => {
  return {
    ui: {
      itemsPerPage: 5, // Pocos items para testing
      searchMinChars: 1, // Búsquedas fáciles
      updateInterval: 100, // Updates rápidos
    },
    performance: {
      debounceMs: 0, // Sin debounce en tests
      maxRetries: 1, // Falla rápido
      cacheTimeout: 100, // Cache corto
    },
    settings: {
      optimisticUpdates: false, // Comportamiento predecible
      advancedLogging: true, // Para debugging de tests
      performanceTracking: false,
      autoRefresh: false, // Sin side effects
    },
    ...overrides,
  };
};

// Test wrapper
export const TestUsersProvider = ({
  children,
  config = {},
}: {
  children: React.ReactNode;
  config?: Partial<UsersConfig>;
}) => {
  const testConfig = createTestConfig(config);

  return (
    <UsersConfigProvider value={testConfig}>{children}</UsersConfigProvider>
  );
};
```

### **🧪 Tests con Diferentes Configuraciones**

```typescript
// __tests__/useUsers.test.tsx
import { renderHook, act } from "@testing-library/react";
import { useUsers } from "../hooks/useUsers";
import { TestUsersProvider, createTestConfig } from "../utils/testConfigUtils";

describe("useUsers with different configurations", () => {
  it("should work with fast search configuration", async () => {
    const fastConfig = createTestConfig({
      performance: { debounceMs: 0 }, // Sin debounce
      ui: { searchMinChars: 1 }, // Buscar desde 1 carácter
    });

    const { result } = renderHook(() => useUsers(fastConfig));

    await act(async () => {
      result.current.searchUsers("j"); // Buscar inmediatamente
    });

    expect(result.current.users).toHaveLength(3); // Usuarios con 'j'
  });

  it("should respect pagination settings", () => {
    const paginationConfig = createTestConfig({
      ui: { itemsPerPage: 2 }, // Solo 2 items por página
    });

    const { result } = renderHook(() => useUsers(paginationConfig));

    expect(result.current.users).toHaveLength(2); // Solo 2 usuarios
    expect(result.current.pagination.total).toBe(10); // Total disponible
    expect(result.current.pagination.pages).toBe(5); // 5 páginas
  });

  it("should handle optimistic updates correctly", async () => {
    const optimisticConfig = createTestConfig({
      settings: { optimisticUpdates: true },
    });

    const { result } = renderHook(() => useUsers(optimisticConfig));

    await act(async () => {
      result.current.createUser({
        name: "Test User",
        email: "test@example.com",
      });
    });

    // Con optimistic updates, el usuario aparece inmediatamente
    expect(result.current.users.some((u) => u.name === "Test User")).toBe(true);
  });

  it("should work with different cache settings", async () => {
    const noCacheConfig = createTestConfig({
      performance: { cacheTimeout: 0 }, // Sin cache
    });

    const { result, rerender } = renderHook(() => useUsers(noCacheConfig));

    const initialFetchTime = Date.now();

    // Rerender para simular re-fetch
    rerender();

    // Sin cache, debería hacer nueva request
    expect(mockFetchUsers).toHaveBeenCalledTimes(2);
  });
});
```

### **🎭 Mock Configurations**

```typescript
// __mocks__/configMocks.ts
export const MOCK_CONFIGS = {
  FAST: createTestConfig({
    performance: { debounceMs: 0, maxRetries: 1 },
    settings: { optimisticUpdates: true },
  }),

  SLOW: createTestConfig({
    performance: { debounceMs: 1000, maxRetries: 5 },
    settings: { optimisticUpdates: false },
  }),

  MOBILE: createTestConfig({
    ui: { itemsPerPage: 5, searchMinChars: 3 },
    performance: { debounceMs: 500 },
  }),

  ADMIN: createTestConfig({
    ui: { itemsPerPage: 100, maxUsersPerBatch: 50 },
    performance: { debounceMs: 100 },
    settings: { advancedLogging: true },
  }),
};

// Uso en tests:
it("should work with mobile configuration", () => {
  const { result } = renderHook(() => useUsers(MOCK_CONFIGS.MOBILE));
  expect(result.current.config.ui.itemsPerPage).toBe(5);
});
```

---

## 🎭 **FEATURE FLAGS DINÁMICOS**

### **🔧 Sistema de Feature Flags**

```typescript
// services/featureFlags.ts
export class FeatureFlagService {
  private flags: Map<string, boolean> = new Map();

  async loadFlags(userId: string) {
    // Cargar flags desde API, base de datos, o servicio externo
    const response = await fetch(`/api/feature-flags/${userId}`);
    const flags = await response.json();

    flags.forEach((flag) => {
      this.flags.set(flag.name, flag.enabled);
    });
  }

  isEnabled(flagName: string): boolean {
    return this.flags.get(flagName) ?? false;
  }

  setFlag(flagName: string, enabled: boolean) {
    this.flags.set(flagName, enabled);
  }
}

export const featureFlagService = new FeatureFlagService();

// hooks/useFeatureFlagUsers.ts
export const useFeatureFlagUsers = () => {
  const { user } = useAuth();
  const [flags, setFlags] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    const loadUserFlags = async () => {
      await featureFlagService.loadFlags(user.id);
      setFlags(new Map(featureFlagService.flags));
    };

    loadUserFlags();
  }, [user.id]);

  const getDynamicConfig = () => {
    const baseConfig = {
      ui: { itemsPerPage: 20 },
      performance: { debounceMs: 300 },
    };

    // Aplicar flags dinámicamente
    if (flags.get("FAST_SEARCH")) {
      baseConfig.performance.debounceMs = 100;
    }

    if (flags.get("LARGE_LISTS")) {
      baseConfig.ui.itemsPerPage = 100;
    }

    if (flags.get("OPTIMISTIC_UI")) {
      baseConfig.settings = {
        ...baseConfig.settings,
        optimisticUpdates: true,
      };
    }

    return baseConfig;
  };

  return {
    ...useUsers(getDynamicConfig()),
    flags: Object.fromEntries(flags),
    toggleFlag: (flagName: string, enabled: boolean) => {
      featureFlagService.setFlag(flagName, enabled);
      setFlags(new Map(featureFlagService.flags));
    },
  };
};

// Uso:
const DynamicUsersList = () => {
  const { users, flags, toggleFlag } = useFeatureFlagUsers();

  return (
    <div>
      <div className="feature-flags-panel">
        <label>
          <input
            type="checkbox"
            checked={flags.FAST_SEARCH}
            onChange={(e) => toggleFlag("FAST_SEARCH", e.target.checked)}
          />
          Fast Search
        </label>

        <label>
          <input
            type="checkbox"
            checked={flags.LARGE_LISTS}
            onChange={(e) => toggleFlag("LARGE_LISTS", e.target.checked)}
          />
          Large Lists
        </label>
      </div>

      <div className="users-list">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};
```

### **🎛️ A/B Testing con Configuraciones**

```typescript
// services/abTesting.ts
export class ABTestingService {
  private userVariant: Map<string, string> = new Map();

  getVariant(userId: string, testName: string): string {
    const key = `${testName}_${userId}`;

    if (!this.userVariant.has(key)) {
      // Asignar variante aleatoriamente
      const variants = this.getTestVariants(testName);
      const variant = variants[Math.floor(Math.random() * variants.length)];
      this.userVariant.set(key, variant);
    }

    return this.userVariant.get(key)!;
  }

  private getTestVariants(testName: string): string[] {
    switch (testName) {
      case "PAGINATION_TEST":
        return ["control", "large_pages", "infinite_scroll"];
      case "SEARCH_TEST":
        return ["control", "instant_search", "delayed_search"];
      default:
        return ["control", "variant"];
    }
  }
}

// hooks/useABTestUsers.ts
export const useABTestUsers = () => {
  const { user } = useAuth();
  const abService = new ABTestingService();

  const getABTestConfig = () => {
    const paginationVariant = abService.getVariant(user.id, "PAGINATION_TEST");
    const searchVariant = abService.getVariant(user.id, "SEARCH_TEST");

    const config = {
      ui: { itemsPerPage: 20 },
      performance: { debounceMs: 300 },
    };

    // Aplicar variantes de paginación
    switch (paginationVariant) {
      case "large_pages":
        config.ui.itemsPerPage = 50;
        break;
      case "infinite_scroll":
        config.ui.itemsPerPage = 1000; // Cargar todo
        break;
    }

    // Aplicar variantes de búsqueda
    switch (searchVariant) {
      case "instant_search":
        config.performance.debounceMs = 0;
        break;
      case "delayed_search":
        config.performance.debounceMs = 500;
        break;
    }

    return config;
  };

  return useUsers(getABTestConfig());
};
```

---

## 🏢 **CONFIGURACIONES EMPRESARIALES**

### **🏭 Multi-tenant Configuration**

```typescript
// services/tenantConfig.ts
export interface TenantConfig {
  id: string;
  name: string;
  limits: {
    maxUsers: number;
    maxUsersPerPage: number;
    maxBatchSize: number;
  };
  features: {
    advancedSearch: boolean;
    bulkOperations: boolean;
    analytics: boolean;
  };
  performance: {
    debounceMs: number;
    cacheTimeout: number;
  };
}

export class TenantConfigService {
  private tenantConfigs: Map<string, TenantConfig> = new Map();

  async loadTenantConfig(tenantId: string): Promise<TenantConfig> {
    if (!this.tenantConfigs.has(tenantId)) {
      const response = await fetch(`/api/tenants/${tenantId}/config`);
      const config = await response.json();
      this.tenantConfigs.set(tenantId, config);
    }

    return this.tenantConfigs.get(tenantId)!;
  }
}

// hooks/useTenantUsers.ts
export const useTenantUsers = () => {
  const { tenant } = useTenant();
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await tenantConfigService.loadTenantConfig(tenant.id);
      setTenantConfig(config);
    };

    loadConfig();
  }, [tenant.id]);

  const getConfigForTenant = () => {
    if (!tenantConfig) return {};

    return {
      ui: {
        itemsPerPage: Math.min(tenantConfig.limits.maxUsersPerPage, 50),
        maxUsersPerBatch: tenantConfig.limits.maxBatchSize,
      },
      performance: {
        debounceMs: tenantConfig.performance.debounceMs,
        cacheTimeout: tenantConfig.performance.cacheTimeout,
      },
      settings: {
        advancedLogging: tenantConfig.features.analytics,
        bulkOperationsEnabled: tenantConfig.features.bulkOperations,
      },
    };
  };

  return useUsers(getConfigForTenant());
};
```

### **🎯 Role-based Configuration Matrix**

```typescript
// config/roleConfigMatrix.ts
export const ROLE_CONFIG_MATRIX = {
  // Configuraciones base por rol
  ROLES: {
    super_admin: {
      ui: { itemsPerPage: 200, maxUsersPerBatch: 100 },
      performance: { debounceMs: 50, cacheTimeout: 2 * 60 * 1000 },
      settings: { advancedLogging: true, performanceTracking: true },
    },
    admin: {
      ui: { itemsPerPage: 50, maxUsersPerBatch: 25 },
      performance: { debounceMs: 150, cacheTimeout: 5 * 60 * 1000 },
      settings: { advancedLogging: false, performanceTracking: true },
    },
    user: {
      ui: { itemsPerPage: 20, maxUsersPerBatch: 5 },
      performance: { debounceMs: 300, cacheTimeout: 10 * 60 * 1000 },
      settings: { advancedLogging: false, performanceTracking: false },
    },
  },

  // Modificadores por departamento
  DEPARTMENTS: {
    IT: {
      settings: { advancedLogging: true, performanceTracking: true },
      performance: { debounceMs: 100 },
    },
    HR: {
      ui: { itemsPerPage: 100 },
      settings: { bulkOperations: true },
    },
    SALES: {
      performance: { cacheTimeout: 2 * 60 * 1000 },
      ui: { refreshInterval: 30 * 1000 },
    },
  },

  // Modificadores por región
  REGIONS: {
    US: { performance: { debounceMs: 150 } },
    EU: {
      performance: { cacheTimeout: 15 * 60 * 1000 },
      settings: { gdprMode: true },
    },
    ASIA: {
      performance: { debounceMs: 400, maxRetries: 5 },
      ui: { itemsPerPage: 25 },
    },
  },
};

// hooks/useEnterpriseUsers.ts
export const useEnterpriseUsers = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const getEnterpriseConfig = () => {
    // 1. Configuración base por rol
    const roleConfig =
      ROLE_CONFIG_MATRIX.ROLES[user.role] || ROLE_CONFIG_MATRIX.ROLES.user;

    // 2. Modificadores por departamento
    const deptConfig = ROLE_CONFIG_MATRIX.DEPARTMENTS[user.department] || {};

    // 3. Modificadores por región
    const regionConfig = ROLE_CONFIG_MATRIX.REGIONS[tenant.region] || {};

    // 4. Merge inteligente de todas las configuraciones
    return deepMerge(roleConfig, deptConfig, regionConfig);
  };

  return useUsers(getEnterpriseConfig());
};

// utils/deepMerge.ts
const deepMerge = (...configs) => {
  return configs.reduce((result, config) => {
    Object.keys(config).forEach((key) => {
      if (typeof config[key] === "object" && !Array.isArray(config[key])) {
        result[key] = deepMerge(result[key] || {}, config[key]);
      } else {
        result[key] = config[key];
      }
    });
    return result;
  }, {});
};
```

### **📊 Analytics y Monitoreo Empresarial**

```typescript
// hooks/useUsersWithAnalytics.ts
export const useUsersWithAnalytics = () => {
  const { user, tenant } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({
    searchFrequency: 0,
    averageLoadTime: 0,
    cacheHitRate: 0,
    userEngagement: 0,
  });

  const config = {
    performance: {
      debounceMs: 250,
      cacheTimeout: 8 * 60 * 1000,
    },
    settings: {
      performanceTracking: true,
      advancedLogging: true,
      analyticsEnabled: true,
    },
  };

  const usersResult = useUsers(config);

  // Capturar analytics empresariales
  useEffect(() => {
    const trackMetrics = () => {
      const metrics = {
        searchFrequency: calculateSearchFrequency(),
        averageLoadTime: calculateAverageLoadTime(),
        cacheHitRate: calculateCacheHitRate(),
        userEngagement: calculateUserEngagement(),
      };

      setAnalytics(metrics);

      // Enviar a servicio de analytics empresarial
      sendToAnalytics({
        tenantId: tenant.id,
        userId: user.id,
        metrics,
        timestamp: Date.now(),
      });
    };

    const interval = setInterval(trackMetrics, 60000); // Cada minuto
    return () => clearInterval(interval);
  }, []);

  return {
    ...usersResult,
    analytics,
    // Métodos adicionales para dashboard empresarial
    exportAnalytics: () => exportAnalyticsReport(analytics),
    resetAnalytics: () => setAnalytics(initialAnalyticsState),
  };
};

// Uso en dashboard empresarial:
const EnterpriseUsersDashboard = () => {
  const { users, analytics, exportAnalytics } = useUsersWithAnalytics();

  return (
    <div className="enterprise-dashboard">
      <div className="analytics-panel">
        <h3>Performance Analytics</h3>
        <div>Search Frequency: {analytics.searchFrequency}/min</div>
        <div>Avg Load Time: {analytics.averageLoadTime}ms</div>
        <div>Cache Hit Rate: {analytics.cacheHitRate}%</div>
        <button onClick={exportAnalytics}>Export Report</button>
      </div>

      <div className="users-panel">
        <h3>Users Management</h3>
        {users.map((user) => (
          <EnterpriseUserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};
```

---

## 🎯 **RESUMEN DE MEJORES PRÁCTICAS**

### **✅ DO (Hacer)**

1. **Configuración específica por contexto**

   ```typescript
   const config = getConfigForRole(user.role, user.department, user.region);
   ```

2. **Usar hooks personalizados**

   ```typescript
   const useUsersForContext = () => useUsers(getContextualConfig());
   ```

3. **Memoizar configuraciones complejas**

   ```typescript
   const config = useMemo(() => buildComplexConfig(), [dependencies]);
   ```

4. **Testing con configuraciones controladas**
   ```typescript
   const testConfig = createTestConfig({ ui: { itemsPerPage: 5 } });
   ```

### **❌ DON'T (No hacer)**

1. **Configuraciones hardcodeadas**

   ```typescript
   // ❌ MAL
   const users = useUsers({ ui: { itemsPerPage: 50 } }); // Siempre 50
   ```

2. **Ignorar el contexto del usuario**

   ```typescript
   // ❌ MAL - Misma config para admin y usuario normal
   const users = useUsers(staticConfig);
   ```

3. **No considerar performance**
   ```typescript
   // ❌ MAL - Config que recalcula en cada render
   const config = { ui: { itemsPerPage: Math.random() * 100 } };
   ```

---

¿Te gustaría que profundice en algún escenario específico o que añada más ejemplos para casos particulares de tu aplicación?
