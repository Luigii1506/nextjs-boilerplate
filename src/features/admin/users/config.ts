/**
 * 👥 USERS CORE CONFIG MANAGER
 * =============================
 *
 * Configuration Manager para el módulo CORE de usuarios
 * Sin feature flags - Todas las funcionalidades siempre activas
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

// Configuración práctica sin dependencias innecesarias

// 🎯 Opciones de ordenamiento prácticas
export const SORT_OPTIONS = {
  'name': 'Nombre',
  'email': 'Email', 
  'createdAt': 'Fecha de creación',
  'lastLogin': 'Último acceso',
  'role': 'Rol',
  'status': 'Estado',
} as const;

// 🎯 CONFIGURACIÓN PRÁCTICA DE USUARIOS (Solo lo que realmente usarás)
export interface UsersModuleConfig {
  // 📊 Configuración de Display (lo que más cambias)
  display: {
    itemsPerPage: 5 | 10 | 20 | 50 | 100;
    defaultSort: keyof typeof SORT_OPTIONS;
    sortDirection: 'asc' | 'desc';
    showAvatars: boolean;
    showLastLogin: boolean;
    showCreatedDate: boolean;
    showUserStats: boolean;
    compactView: boolean; // Vista compacta vs expandida
  };

  // 🔍 Configuración de Búsqueda y Filtros
  search: {
    minChars: 1 | 2 | 3;
    searchFields: Array<'name' | 'email' | 'both'>;
    instantSearch: boolean;
    caseSensitive: boolean;
  };

  // 🎨 Configuración de Filtros
  filters: {
    showRoleFilter: boolean;
    showStatusFilter: boolean;
    showDateRangeFilter: boolean;
    defaultRole: 'all' | 'user' | 'admin' | 'super_admin';
    defaultStatus: 'all' | 'active' | 'banned';
    rememberFilters: boolean; // Recordar filtros entre sesiones
  };

  // 📝 Configuración de Formularios
  forms: {
    showAdvancedFields: boolean;
    requireEmailVerification: boolean;
    allowBulkOperations: boolean;
    confirmDangerousActions: boolean;
  };

  // 🔔 Configuración de UI/UX
  notifications: {
    showSuccessMessages: boolean;
    showLoadingStates: boolean;
    autoHideAfterMs: 2000 | 3000 | 5000;
    position: 'top-right' | 'top-center' | 'bottom-right';
  };
}

// 🎯 Configuración por defecto práctica
const DEFAULT_CORE_CONFIG: UsersModuleConfig = {
  display: {
    itemsPerPage: 20,
    defaultSort: 'createdAt',
    sortDirection: 'desc', // Más recientes primero
    showAvatars: true,
    showLastLogin: true,
    showCreatedDate: true,
    showUserStats: true,
    compactView: false,
  },
  
  search: {
    minChars: 2,
    searchFields: ['both'], // Buscar en nombre y email
    instantSearch: true,
    caseSensitive: false,
  },
  
  filters: {
    showRoleFilter: true,
    showStatusFilter: true,
    showDateRangeFilter: false, // Puede ser complejo, empezar desactivado
    defaultRole: 'all',
    defaultStatus: 'all',
    rememberFilters: true, // Recordar preferencias del usuario
  },
  
  forms: {
    showAdvancedFields: false, // Empezar simple
    requireEmailVerification: false,
    allowBulkOperations: true,
    confirmDangerousActions: true, // Seguridad
  },
  
  notifications: {
    showSuccessMessages: true,
    showLoadingStates: true,
    autoHideAfterMs: 3000,
    position: 'top-right',
  },
};

// 🎯 PRESETS PRÁCTICOS (Configuraciones predefinidas útiles)
export const PRACTICAL_PRESETS = {
  // 📱 Para móvil o pantallas pequeñas
  mobile: {
    ...DEFAULT_CORE_CONFIG,
    display: {
      ...DEFAULT_CORE_CONFIG.display,
      itemsPerPage: 10,
      showAvatars: false,
      showLastLogin: false,
      showCreatedDate: false,
      compactView: true,
    },
    search: {
      ...DEFAULT_CORE_CONFIG.search,
      instantSearch: false, // Mejor rendimiento en móvil
    },
  } as UsersModuleConfig,

  // 🚀 Para listas grandes (rendimiento)
  performance: {
    ...DEFAULT_CORE_CONFIG,
    display: {
      ...DEFAULT_CORE_CONFIG.display,
      itemsPerPage: 100,
      showAvatars: false, // Menos carga de imágenes
      showUserStats: false,
    },
    search: {
      ...DEFAULT_CORE_CONFIG.search,
      minChars: 3, // Menos búsquedas
      instantSearch: false,
    },
    notifications: {
      ...DEFAULT_CORE_CONFIG.notifications,
      showLoadingStates: false, // Menos animaciones
      autoHideAfterMs: 2000,
    },
  } as UsersModuleConfig,

  // 🎯 Para administradores avanzados
  advanced: {
    ...DEFAULT_CORE_CONFIG,
    display: {
      ...DEFAULT_CORE_CONFIG.display,
      itemsPerPage: 50,
      showUserStats: true,
    },
    filters: {
      ...DEFAULT_CORE_CONFIG.filters,
      showDateRangeFilter: true,
    },
    forms: {
      ...DEFAULT_CORE_CONFIG.forms,
      showAdvancedFields: true,
      allowBulkOperations: true,
    },
  } as UsersModuleConfig,

  // 🎨 Vista simple y limpia
  simple: {
    ...DEFAULT_CORE_CONFIG,
    display: {
      ...DEFAULT_CORE_CONFIG.display,
      itemsPerPage: 10,
      showLastLogin: false,
      showCreatedDate: false,
      showUserStats: false,
      compactView: false,
    },
    filters: {
      ...DEFAULT_CORE_CONFIG.filters,
      showRoleFilter: false,
      showStatusFilter: false,
      showDateRangeFilter: false,
    },
    forms: {
      ...DEFAULT_CORE_CONFIG.forms,
      showAdvancedFields: false,
      allowBulkOperations: false,
    },
  } as UsersModuleConfig,
};

/**
 * 🛠️ MANAGER SIMPLIFICADO Y PRÁCTICO
 * 
 * Solo métodos que realmente usarás para configurar la interfaz de usuarios.
 * Sin over-engineering, solo funcionalidad práctica.
 */
export class UsersConfigManager {
  private static instance: UsersConfigManager;
  private config: UsersModuleConfig = DEFAULT_CORE_CONFIG;

  private constructor() {}

  public static getInstance(): UsersConfigManager {
    if (!UsersConfigManager.instance) {
      UsersConfigManager.instance = new UsersConfigManager();
    }
    return UsersConfigManager.instance;
  }

  // 🎯 MÉTODOS PRINCIPALES (Solo los que usarás)
  
  // Obtener configuración actual
  public getConfig(): UsersModuleConfig {
    return { ...this.config };
  }

  // Usar un preset predefinido
  public usePreset(preset: keyof typeof PRACTICAL_PRESETS): void {
    this.config = { ...PRACTICAL_PRESETS[preset] };
  }

  // 📊 CONFIGURACIÓN DE DISPLAY
  public setItemsPerPage(items: UsersModuleConfig['display']['itemsPerPage']): void {
    this.config.display.itemsPerPage = items;
  }

  public setDefaultSort(sort: keyof typeof SORT_OPTIONS, direction: 'asc' | 'desc' = 'desc'): void {
    this.config.display.defaultSort = sort;
    this.config.display.sortDirection = direction;
  }

  public toggleAvatars(): void {
    this.config.display.showAvatars = !this.config.display.showAvatars;
  }

  public toggleCompactView(): void {
    this.config.display.compactView = !this.config.display.compactView;
  }

  public toggleUserStats(): void {
    this.config.display.showUserStats = !this.config.display.showUserStats;
  }

  // 🔍 CONFIGURACIÓN DE BÚSQUEDA
  public setSearchMinChars(chars: UsersModuleConfig['search']['minChars']): void {
    this.config.search.minChars = chars;
  }

  public toggleInstantSearch(): void {
    this.config.search.instantSearch = !this.config.search.instantSearch;
  }

  public setSearchFields(fields: UsersModuleConfig['search']['searchFields']): void {
    this.config.search.searchFields = fields;
  }

  // 🎨 CONFIGURACIÓN DE FILTROS
  public toggleRoleFilter(): void {
    this.config.filters.showRoleFilter = !this.config.filters.showRoleFilter;
  }

  public toggleStatusFilter(): void {
    this.config.filters.showStatusFilter = !this.config.filters.showStatusFilter;
  }

  public toggleDateRangeFilter(): void {
    this.config.filters.showDateRangeFilter = !this.config.filters.showDateRangeFilter;
  }

  public setDefaultRole(role: UsersModuleConfig['filters']['defaultRole']): void {
    this.config.filters.defaultRole = role;
  }

  // 📝 CONFIGURACIÓN DE FORMULARIOS
  public toggleAdvancedFields(): void {
    this.config.forms.showAdvancedFields = !this.config.forms.showAdvancedFields;
  }

  public toggleBulkOperations(): void {
    this.config.forms.allowBulkOperations = !this.config.forms.allowBulkOperations;
  }

  // 🔔 CONFIGURACIÓN DE NOTIFICACIONES
  public setNotificationDuration(ms: UsersModuleConfig['notifications']['autoHideAfterMs']): void {
    this.config.notifications.autoHideAfterMs = ms;
  }

  public setNotificationPosition(position: UsersModuleConfig['notifications']['position']): void {
    this.config.notifications.position = position;
  }

  // 🎯 GETTERS ÚTILES (Solo los que necesitas)
  public getItemsPerPage(): number {
    return this.config.display.itemsPerPage;
  }

  public getCurrentSort(): { field: keyof typeof SORT_OPTIONS; direction: 'asc' | 'desc' } {
    return {
      field: this.config.display.defaultSort,
      direction: this.config.display.sortDirection,
    };
  }

  public getSearchConfig(): UsersModuleConfig['search'] {
    return { ...this.config.search };
  }

  public shouldShowAvatars(): boolean {
    return this.config.display.showAvatars;
  }

  public shouldShowRoleFilter(): boolean {
    return this.config.filters.showRoleFilter;
  }

  public shouldShowStatusFilter(): boolean {
    return this.config.filters.showStatusFilter;
  }

  public isCompactView(): boolean {
    return this.config.display.compactView;
  }

  public allowsBulkOperations(): boolean {
    return this.config.forms.allowBulkOperations;
  }

  // 🚀 CONFIGURACIÓN RÁPIDA PARA DIFERENTES ESCENARIOS
  public configureForMobile(): void {
    this.usePreset('mobile');
  }

  public configureForPerformance(): void {
    this.usePreset('performance');
  }

  public configureForAdvancedUsers(): void {
    this.usePreset('advanced');
  }

  public configureForSimpleUse(): void {
    this.usePreset('simple');
  }

  // 📊 INFORMACIÓN ÚTIL
  public getSummary(): Record<string, unknown> {
    return {
      itemsPerPage: this.config.display.itemsPerPage,
      defaultSort: `${this.config.display.defaultSort}_${this.config.display.sortDirection}`,
      instantSearch: this.config.search.instantSearch,
      showAvatars: this.config.display.showAvatars,
      compactView: this.config.display.compactView,
      preset: this.detectCurrentPreset(),
    };
  }

  private detectCurrentPreset(): string {
    for (const [presetName, presetConfig] of Object.entries(PRACTICAL_PRESETS)) {
      if (JSON.stringify(this.config) === JSON.stringify(presetConfig)) {
        return presetName;
      }
    }
    return 'custom';
  }

  // 🔄 Reset a configuración por defecto
  public resetToDefaults(): void {
    this.config = { ...DEFAULT_CORE_CONFIG };
  }
}

// 🎯 Instancia global
export const usersConfig = UsersConfigManager.getInstance();

// 🔧 Adaptador simple para el hook
export function adaptConfigForHook(
  userConfig?: Partial<UsersModuleConfig>
): UsersModuleConfig {
  if (!userConfig) {
    return usersConfig.getConfig();
  }
  
  // Para configuraciones personalizadas, crear una instancia temporal
  const tempConfig = { ...usersConfig.getConfig(), ...userConfig };
  return tempConfig;
}

// 🚀 UTILIDADES RÁPIDAS (Solo las que realmente usarás)
export const quickConfig = {
  // 📊 Cambios rápidos de display
  show10Items: () => usersConfig.setItemsPerPage(10),
  show20Items: () => usersConfig.setItemsPerPage(20),
  show50Items: () => usersConfig.setItemsPerPage(50),
  show100Items: () => usersConfig.setItemsPerPage(100),
  
  // 🔄 Cambios rápidos de ordenamiento
  sortByName: () => usersConfig.setDefaultSort('name', 'asc'),
  sortByNewest: () => usersConfig.setDefaultSort('createdAt', 'desc'),
  sortByOldest: () => usersConfig.setDefaultSort('createdAt', 'asc'),
  sortByEmail: () => usersConfig.setDefaultSort('email', 'asc'),
  sortByLastLogin: () => usersConfig.setDefaultSort('lastLogin', 'desc'),
  
  // 🎨 Cambios rápidos de vista
  enableCompactView: () => usersConfig.toggleCompactView(),
  hideAvatars: () => usersConfig.toggleAvatars(),
  showAdvancedFields: () => usersConfig.toggleAdvancedFields(),
  enableBulkOps: () => usersConfig.toggleBulkOperations(),
  
  // 🔍 Cambios rápidos de búsqueda
  enableInstantSearch: () => usersConfig.toggleInstantSearch(),
  searchBothFields: () => usersConfig.setSearchFields(['both']),
  searchNameOnly: () => usersConfig.setSearchFields(['name']),
  searchEmailOnly: () => usersConfig.setSearchFields(['email']),
  
  // 🎯 Presets rápidos
  mobileMode: () => usersConfig.configureForMobile(),
  performanceMode: () => usersConfig.configureForPerformance(),
  advancedMode: () => usersConfig.configureForAdvancedUsers(),
  simpleMode: () => usersConfig.configureForSimpleUse(),
  
  // 📊 Info rápida
  getCurrentConfig: () => usersConfig.getSummary(),
  getItemsPerPage: () => usersConfig.getItemsPerPage(),
  getCurrentSort: () => usersConfig.getCurrentSort(),
  
  // 🔄 Reset
  resetToDefaults: () => usersConfig.resetToDefaults(),
};
