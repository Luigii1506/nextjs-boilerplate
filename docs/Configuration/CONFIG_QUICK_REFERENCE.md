---
title: Referencia rápida
slug: /Configuracion/referencia
---

# ⚡ **CONFIGURACIONES - REFERENCIA RÁPIDA**

## 🎯 **CHEAT SHEET - CONFIGURACIÓN ESENCIAL**

### **📊 Acceso Básico**

```typescript
// Obtener instancia del ConfigManager
const config = UsersConfigManager.getInstance();

// Configuración completa actual
const fullConfig = config.getConfig();

// Configuración específica
const itemsPerPage = config.getUISetting("itemsPerPage");
const debounceMs = config.getPerformanceSetting("debounceMs");
const isLoggingEnabled = config.isSettingEnabled("advancedLogging");
```

### **⚙️ Aplicar Cambios**

```typescript
// Cambios temporales
config.setOverrides({
  ui: { itemsPerPage: 50 },
  performance: { debounceMs: 200 },
});

// Resetear a defaults
config.resetToDefaults();

// Modos predefinidos
config.enableDevMode(); // Desarrollo
config.enableProductionMode(); // Producción
config.enableHighPerformanceMode(); // Alta performance
```

### **🎯 En Hooks**

```typescript
// Hook con configuración personalizada
const { users } = useUsers({
  ui: { itemsPerPage: 100 },
  performance: { debounceMs: 150 },
});

// Hook con configuración dinámica
const getConfig = () =>
  user.role === "admin"
    ? { ui: { itemsPerPage: 100 } }
    : { ui: { itemsPerPage: 20 } };

const { users } = useUsers(getConfig());
```

---

## 🔧 **CONFIGURACIONES RÁPIDAS POR ESCENARIO**

### **👥 Por Tipo de Usuario**

```typescript
// Super Admin
const superAdminConfig = {
  ui: { itemsPerPage: 200, maxUsersPerBatch: 100 },
  performance: { debounceMs: 50, cacheTimeout: 120000 },
  settings: { advancedLogging: true, performanceTracking: true },
};

// Admin
const adminConfig = {
  ui: { itemsPerPage: 50, maxUsersPerBatch: 25 },
  performance: { debounceMs: 150, cacheTimeout: 300000 },
};

// Usuario Normal
const userConfig = {
  ui: { itemsPerPage: 20, maxUsersPerBatch: 5 },
  performance: { debounceMs: 300, cacheTimeout: 600000 },
  settings: { advancedLogging: false },
};
```

### **📱 Por Dispositivo**

```typescript
// Móvil
const mobileConfig = {
  ui: { itemsPerPage: 8, updateInterval: 1000 },
  performance: { debounceMs: 500, cacheTimeout: 900000 },
  settings: { autoRefresh: false, optimisticUpdates: true },
};

// Tablet
const tabletConfig = {
  ui: { itemsPerPage: 20, updateInterval: 500 },
  performance: { debounceMs: 300, cacheTimeout: 480000 },
};

// Desktop
const desktopConfig = {
  ui: { itemsPerPage: 50, updateInterval: 200 },
  performance: { debounceMs: 150, cacheTimeout: 300000 },
  settings: { autoRefresh: true, performanceTracking: true },
};
```

### **⚡ Por Performance**

```typescript
// Alta Performance
const highPerfConfig = {
  performance: { debounceMs: 100, maxRetries: 2, cacheTimeout: 1800000 },
  ui: { itemsPerPage: 100, updateInterval: 50 },
  settings: { optimisticUpdates: true, autoRefresh: false },
};

// Bajo Consumo
const lowPowerConfig = {
  performance: { debounceMs: 800, maxRetries: 1, cacheTimeout: 3600000 },
  ui: { itemsPerPage: 10, updateInterval: 1000 },
  settings: { optimisticUpdates: false, autoRefresh: false },
};

// Balanceado
const balancedConfig = {
  performance: { debounceMs: 300, maxRetries: 3, cacheTimeout: 600000 },
  ui: { itemsPerPage: 20, updateInterval: 300 },
};
```

---

## 📊 **VALORES DE CONFIGURACIÓN COMUNES**

### **⚡ Performance**

| Setting        | Rápido  | Balanceado | Lento    | Descripción              |
| -------------- | ------- | ---------- | -------- | ------------------------ |
| `debounceMs`   | 100-150 | 250-300    | 400-500  | Delay antes de búsqueda  |
| `maxRetries`   | 1-2     | 3          | 4-5      | Reintentos en fallos     |
| `cacheTimeout` | 2min    | 5-10min    | 15-30min | Tiempo de vida del cache |

### **📱 UI/UX**

| Setting          | Móvil  | Desktop | Admin  | Descripción                 |
| ---------------- | ------ | ------- | ------ | --------------------------- |
| `itemsPerPage`   | 8-10   | 20-25   | 50-100 | Elementos por página        |
| `searchMinChars` | 3      | 2       | 1      | Mín. caracteres para buscar |
| `updateInterval` | 1000ms | 300ms   | 100ms  | Frecuencia de updates       |

### **🔧 Settings**

| Setting               | Desarrollo | Producción | Descripción             |
| --------------------- | ---------- | ---------- | ----------------------- |
| `advancedLogging`     | `true`     | `false`    | Logging detallado       |
| `performanceTracking` | `true`     | `false`    | Métricas de rendimiento |
| `optimisticUpdates`   | `true`     | `true`     | UI instantánea          |
| `autoRefresh`         | `false`    | `true`     | Refresco automático     |

---

## 🎯 **PATTERNS COMUNES**

### **🔄 Hook Personalizado**

```typescript
export const useUsersForRole = () => {
  const { user } = useAuth();

  const config = useMemo(() => {
    return getRoleConfig(user.role);
  }, [user.role]);

  return useUsers(config);
};

// Uso simple:
const { users } = useUsersForRole(); // Auto-configurado por rol
```

### **📱 Hook Responsive**

```typescript
export const useResponsiveUsers = () => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  const config = useMemo(() => {
    if (isMobile) return MOBILE_CONFIG;
    if (isDesktop) return DESKTOP_CONFIG;
    return TABLET_CONFIG;
  }, [isDesktop, isMobile]);

  return useUsers(config);
};
```

### **🌍 Hook Multi-tenant**

```typescript
export const useTenantUsers = () => {
  const { tenant } = useTenant();

  const config = useMemo(() => {
    return getTenantConfig(tenant.id);
  }, [tenant.id]);

  return useUsers(config);
};
```

---

## 🔧 **UTILIDADES RÁPIDAS**

### **📊 ConfigUtils**

```typescript
import { configUtils } from "@/features/admin/users/config";

// Accessors rápidos
const itemsPerPage = configUtils.getItemsPerPage();
const cacheTimeout = configUtils.getCacheTimeout();
const debounceMs = configUtils.getDebounceMs();

// Feature checks
const isOptimisticEnabled = configUtils.isOptimisticUpdatesEnabled();
const isAutoRefreshEnabled = configUtils.isAutoRefreshEnabled();
const isLoggingEnabled = configUtils.isAdvancedLoggingEnabled();

// Modos
configUtils.enableDevMode();
configUtils.enableProductionMode();
configUtils.enableHighPerformanceMode();

// Resumen
const summary = configUtils.getSummary();
```

### **🔍 Debugging**

```typescript
// Ver configuración completa
console.log("Config:", configManager.getConfig());

// Ver solo overrides activos
console.log("Overrides:", configManager.overrides);

// Ver configuración base
console.log("Base:", configManager.config);

// Ver resumen ejecutivo
console.log("Summary:", configManager.getConfigSummary());
```

---

## 🚨 **TROUBLESHOOTING RÁPIDO**

### **❌ Problema: Configuración no se aplica**

```typescript
// ❌ MAL: Modifica referencia directa
const config = configManager.getConfig();
config.performance.debounceMs = 500;

// ✅ BIEN: Usar setOverrides
configManager.setOverrides({
  performance: { debounceMs: 500 },
});
```

### **❌ Problema: Hook no recibe configuración**

```typescript
// ❌ MAL: Configuración dinámica en cada render
const MyComponent = () => {
  const config = { ui: { itemsPerPage: Math.random() * 100 } }; // ❌
  const { users } = useUsers(config);
};

// ✅ BIEN: Configuración estable
const MyComponent = () => {
  const config = useMemo(
    () => ({
      ui: { itemsPerPage: 50 },
    }),
    []
  ); // ✅
  const { users } = useUsers(config);
};
```

### **❌ Problema: Overrides se acumulan**

```typescript
// ❌ PROBLEMA: Se acumulan overrides
configManager.setOverrides({ ui: { itemsPerPage: 100 } });
configManager.setOverrides({ performance: { debounceMs: 500 } });
// Ahora tiene AMBOS

// ✅ SOLUCIÓN: Reset explícito
configManager.resetToDefaults();
configManager.setOverrides({ performance: { debounceMs: 500 } });
// Solo tiene el último
```

---

## 📚 **REFERENCIA DE APIs**

### **🏗️ ConfigManager Methods**

```typescript
// Singleton
ConfigManager.getInstance()

// Configuración
.getConfig(): FullConfig
.setOverrides(overrides: PartialConfig): void
.resetToDefaults(): void

// Getters específicos
.getPerformanceSetting(key): value
.getUISetting(key): value
.isSettingEnabled(key): boolean
.getSecuritySetting(key): value
.getValidationRule(key): value

// Modos predefinidos
.enableDevMode(): void
.enableProductionMode(): void
.enableHighPerformanceMode(): void

// Utilidades
.getConfigSummary(): object
.validateConfig(): boolean (solo file-upload)
```

### **🎯 Hook APIs**

```typescript
// Hook básico
useUsers(config?: PartialConfig): {
  // Data
  users: User[]
  optimisticState: User[]
  totalUsers: number

  // Loading
  isLoading: boolean
  isProcessing: boolean
  isPending: boolean

  // Stats
  stats: { total, active, banned, admins, ... }

  // Actions
  createUser: (data) => Promise<Result>
  updateUser: (data) => Promise<Result>
  deleteUser: (id) => Promise<Result>
  banUser: (data) => Promise<Result>
  unbanUser: (id) => Promise<Result>
  updateUserRole: (id, role) => Promise<Result>

  // Search & Filter
  searchUsers: (term) => User[]
  filterUsersByRole: (role) => User[]
  filterUsersByStatus: (status) => User[]

  // Utils
  refresh: () => void
  clearErrors: () => void
  config: FinalConfig
}
```

---

## 🎯 **SNIPPETS DE CÓDIGO**

### **⚡ Configuración rápida por ambiente**

```typescript
// Environment-aware config
const getEnvConfig = () => {
  if (process.env.NODE_ENV === "development") {
    return {
      settings: { advancedLogging: true, performanceTracking: true },
      performance: { cacheTimeout: 60000 },
    };
  }

  if (process.env.NODE_ENV === "production") {
    return {
      settings: { advancedLogging: false, performanceTracking: false },
      performance: { cacheTimeout: 900000 },
    };
  }

  return {};
};
```

### **🔧 Hook con configuración condicional**

```typescript
const useConditionalUsers = (condition: string) => {
  const config = useMemo(() => {
    switch (condition) {
      case "fast":
        return FAST_CONFIG;
      case "slow":
        return SLOW_CONFIG;
      case "mobile":
        return MOBILE_CONFIG;
      default:
        return DEFAULT_CONFIG;
    }
  }, [condition]);

  return useUsers(config);
};
```

### **📊 Wrapper con métricas**

```typescript
const useUsersWithMetrics = (baseConfig = {}) => {
  const [metrics, setMetrics] = useState({});

  const config = {
    ...baseConfig,
    settings: { ...baseConfig.settings, performanceTracking: true },
  };

  const result = useUsers(config);

  useEffect(() => {
    // Capturar métricas...
    setMetrics({ searchTime: 150, renderTime: 50 });
  }, [result.users]);

  return { ...result, metrics };
};
```

---

## 💡 **TIPS DE PERFORMANCE**

### **✅ HACER**

```typescript
// ✅ Memoizar configuraciones complejas
const config = useMemo(
  () => buildComplexConfig(user, tenant),
  [user.id, tenant.id]
);

// ✅ Usar configuraciones estáticas cuando sea posible
const ADMIN_CONFIG = { ui: { itemsPerPage: 100 } };

// ✅ Resetear overrides cuando no se necesiten
useEffect(() => {
  return () => configManager.resetToDefaults();
}, []);
```

### **❌ EVITAR**

```typescript
// ❌ Configuración nueva en cada render
const config = { ui: { itemsPerPage: user.isAdmin ? 100 : 20 } };

// ❌ Llamadas innecesarias a getConfig
const debounce1 = configManager.getConfig().performance.debounceMs;
const debounce2 = configManager.getConfig().performance.debounceMs; // Duplicado

// ❌ No usar memoización para configuraciones dinámicas
const config = buildDynamicConfig(props); // Se ejecuta en cada render
```

---

## 🎯 **EJEMPLOS ONE-LINERS**

```typescript
// Configuración rápida para admin
const { users } = useUsers({
  ui: { itemsPerPage: 100 },
  performance: { debounceMs: 100 },
});

// Configuración para móvil
const { users } = useUsers({
  ui: { itemsPerPage: 8 },
  performance: { cacheTimeout: 900000 },
});

// Solo cambiar debounce
const { users } = useUsers({ performance: { debounceMs: 0 } });

// Habilitar logging
const { users } = useUsers({ settings: { advancedLogging: true } });

// Configuración de prueba
const { users } = useUsers({
  ui: { itemsPerPage: 5 },
  performance: { debounceMs: 0 },
});
```

---

## 📖 **DOCUMENTACIÓN COMPLETA**

- 📚 **[CONFIG_SYSTEM_COMPLETE_GUIDE.md](./CONFIG_SYSTEM_COMPLETE_GUIDE.md)** - Guía completa del sistema
- 🎯 **[CONFIG_OPTIONS_DETAILED.md](./CONFIG_OPTIONS_DETAILED.md)** - Detalles de cada opción
- 🔧 **[CONFIG_METHODS_EXPLAINED.md](./CONFIG_METHODS_EXPLAINED.md)** - Explicación de métodos
- 💡 **[CONFIG_PRACTICAL_EXAMPLES.md](./CONFIG_PRACTICAL_EXAMPLES.md)** - Ejemplos prácticos

---

**💫 ¡Ya tienes todo lo necesario para dominar el sistema de configuración!** 🚀
