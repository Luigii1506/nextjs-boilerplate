/**
 * 🏗️ EJEMPLOS DE CONFIGURACIÓN DEL HOOK useUsers
 * ===============================================
 *
 * Muestra diferentes formas de configurar el hook para diferentes casos de uso
 */

import { useUsers } from "../hooks/useUsers";

// 🎯 EJEMPLO 1: Configuración BÁSICA (Dashboard)
export const DashboardUsersExample = () => {
  const { users, stats, isLoading, activeUsers, bannedUsers } = useUsers({
    // ✅ Solo cargar datos básicos
    autoLoad: true,

    // 🎛️ UI optimizada para dashboard
    ui: {
      itemsPerPage: 5, // Solo 5 usuarios en dashboard
      showAdvancedFilters: false, // Sin filtros complejos
    },

    // 📊 Solo analytics básicas
    features: {
      analytics: true,
      bulkOperations: false, // No bulk operations en dashboard
      exportData: false,
    },

    // ⚡ Performance para dashboard
    settings: {
      performanceTracking: false,
      cacheEnabled: true,
      autoRefreshInterval: 30000, // Refresh cada 30 segundos
    },
  });

  return (
    <div className="dashboard-users">
      <h3>Usuarios Activos: {stats.active}</h3>
      <h3>Usuarios Baneados: {stats.banned}</h3>
      {/* Solo mostrar datos básicos */}
    </div>
  );
};

// 🎯 EJEMPLO 2: Configuración COMPLETA (Admin Panel)
export const AdminPanelUsersExample = () => {
  const {
    users,
    stats,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    banUser,
    unbanUser,
    bulkUpdateUsers,
    searchUsers,
    filterUsersByRole,
    config, // Para debug
  } = useUsers({
    // 🚀 Carga automática
    autoLoad: true,
    enableRealTimeUpdates: true,

    // 🎛️ UI completa para admin
    ui: {
      itemsPerPage: 25, // Más usuarios por página
      showAdvancedFilters: true,
      enableBulkSelection: true,
    },

    // 📊 Todas las features enterprise
    features: {
      analytics: true,
      bulkOperations: true,
      exportData: true,
      advancedSearch: true,
    },

    // ⚡ Performance tracking para admin
    settings: {
      performanceTracking: true, // Debug info disponible
      cacheEnabled: true,
      autoRefreshInterval: 15000, // Refresh más frecuente
      optimisticUI: true,
    },
  });

  return (
    <div className="admin-panel">
      {/* Todas las operaciones disponibles */}
      {config.settings.performanceTracking && (
        <div className="debug-info">
          <p>Items per page: {config.ui.itemsPerPage}</p>
          <p>Analytics enabled: {config.features.analytics.toString()}</p>
        </div>
      )}
    </div>
  );
};

// 🎯 EJEMPLO 3: Configuración MÓVIL (App móvil)
export const MobileUsersExample = () => {
  const { users, stats, isLoading, searchUsers } = useUsers({
    autoLoad: true,

    // 📱 UI optimizada para móvil
    ui: {
      itemsPerPage: 10, // Menos items en móvil
      showAdvancedFilters: false,
      enableBulkSelection: false, // No bulk selection en móvil
    },

    // ⚡ Features limitadas para móvil
    features: {
      analytics: false, // Sin analytics pesadas
      bulkOperations: false,
      exportData: false,
      advancedSearch: false, // Solo búsqueda básica
    },

    // 🔋 Performance optimizada para móvil
    settings: {
      performanceTracking: false,
      cacheEnabled: true,
      autoRefreshInterval: 60000, // Refresh menos frecuente para ahorrar batería
      optimisticUI: false, // Menos optimistic UI para conexiones lentas
    },
  });

  return <div className="mobile-users">{/* UI simplificada para móvil */}</div>;
};

// 🎯 EJEMPLO 4: Configuración READ-ONLY (Viewer)
export const ViewerUsersExample = () => {
  const {
    users,
    stats,
    isLoading,
    searchUsers,
    filterUsersByRole,
    filterUsersByStatus,
  } = useUsers({
    autoLoad: true,

    // 👁️ Solo lectura
    ui: {
      itemsPerPage: 20,
      showAdvancedFilters: true,
      enableBulkSelection: false,
    },

    // 📊 Solo features de lectura
    features: {
      analytics: true, // Stats son útiles
      bulkOperations: false, // Sin operaciones de escritura
      exportData: true, // Puede exportar
      advancedSearch: true,
    },

    // ⚡ Performance básica
    settings: {
      performanceTracking: false,
      cacheEnabled: true,
      autoRefreshInterval: 45000,
      optimisticUI: false, // No hay operaciones de escritura
    },
  });

  // ❌ Las operaciones de escritura no están disponibles
  // createUser, updateUser, etc. no se desestructuran

  return (
    <div className="viewer-users">{/* Solo operaciones de lectura */}</div>
  );
};

// 🎯 EJEMPLO 5: Configuración PERSONALIZADA (Custom)
export const CustomUsersExample = () => {
  const usersHook = useUsers({
    // 🎯 Datos iniciales (SSR/cache)
    initialUsers: [
      // Usuarios pre-cargados del servidor
    ],

    autoLoad: false, // Carga manual

    // 🎛️ UI completamente personalizada
    ui: {
      itemsPerPage: 50, // Muchos usuarios
      showAdvancedFilters: true,
      enableBulkSelection: true,
    },

    // 📊 Features selectivas
    features: {
      analytics: true,
      bulkOperations: true,
      exportData: true,
      advancedSearch: true,
    },

    // ⚡ Performance customizada
    settings: {
      performanceTracking: true,
      cacheEnabled: true,
      autoRefreshInterval: 10000, // Muy frecuente
      optimisticUI: true,
    },
  });

  // 🎯 Todas las funciones disponibles
  const {
    users,
    stats,
    isLoading,
    isPending,
    error,
    createUser,
    updateUser,
    deleteUser,
    banUser,
    unbanUser,
    updateUserRole,
    bulkUpdateUsers,
    searchUsers,
    filterUsersByRole,
    filterUsersByStatus,
    refresh,
    clearErrors,
    config,
    debug, // Disponible cuando performanceTracking: true
  } = usersHook;

  return (
    <div className="custom-users">
      {/* Implementación completamente personalizada */}
      {debug && (
        <div className="debug-panel">
          <h4>Debug Info:</h4>
          <pre>{JSON.stringify(debug, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// 🎯 CONFIGURACIONES PRE-DEFINIDAS (Presets)
export const USER_PRESETS = {
  // 📱 Móvil
  mobile: {
    ui: { itemsPerPage: 10, showAdvancedFilters: false },
    features: { analytics: false, bulkOperations: false },
    settings: { autoRefreshInterval: 60000, optimisticUI: false },
  },

  // 🖥️ Desktop
  desktop: {
    ui: { itemsPerPage: 25, showAdvancedFilters: true },
    features: { analytics: true, bulkOperations: true },
    settings: { autoRefreshInterval: 15000, optimisticUI: true },
  },

  // 👁️ Read-only
  readonly: {
    ui: { itemsPerPage: 20, enableBulkSelection: false },
    features: { analytics: true, bulkOperations: false, exportData: true },
    settings: { optimisticUI: false },
  },

  // ⚡ Performance
  performance: {
    ui: { itemsPerPage: 50 },
    features: { analytics: false, bulkOperations: false },
    settings: { performanceTracking: true, cacheEnabled: true },
  },
} as const;

// 🎯 USO DE PRESETS
export const PresetExample = () => {
  const usersHook = useUsers({
    ...USER_PRESETS.mobile, // Aplica preset móvil
    // Override específico
    ui: {
      ...USER_PRESETS.mobile.ui,
      itemsPerPage: 15, // Override solo este valor
    },
  });

  return <div>Uses mobile preset with custom itemsPerPage</div>;
};
