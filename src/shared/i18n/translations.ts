/**
 * 🌍 TRANSLATIONS SYSTEM
 * =====================
 *
 * Simple translation system for Spanish/English support.
 * This is a basic implementation that can be extended later.
 *
 * Created: 2025-01-17 - I18n feature implementation
 */

// 🎯 Supported languages
export const SUPPORTED_LANGUAGES = {
  es: "Español",
  en: "English",
} as const;

export type Language = keyof typeof SUPPORTED_LANGUAGES;

// 📝 Translation keys and values
export interface Translations {
  // 🔗 Navigation
  nav: {
    dashboard: string;
    users: string;
    featureFlags: string;
    files: string;
    settings: string;
    logout: string;
  };

  // 🌙 Dark mode
  darkMode: {
    toggle: string;
    light: string;
    dark: string;
    tooltip: string;
  };

  // 🌍 Language
  language: {
    toggle: string;
    spanish: string;
    english: string;
    tooltip: string;
    current: string;
  };

  // 📊 Dashboard
  dashboard: {
    title: string;
    welcome: string;
    stats: string;
  };

  // 👥 Users
  users: {
    title: string;
    create: string;
    edit: string;
    delete: string;
    search: string;
    noUsers: string;
  };

  // 🎛️ Feature Flags
  featureFlags: {
    title: string;
    enable: string;
    disable: string;
    search: string;
    noFlags: string;
    category: string;
    total: string;
    active: string;
    inactive: string;
    modules: string;
    refresh: string;
    allCategories: string;
    all: string;
    enabled: string;
    disabled: string;
    errorLoading: string;
    noFlagsFound: string;
    adjustFilters: string;
    loading: string;
  };

  // 📁 Files
  files: {
    title: string;
    upload: string;
    download: string;
    delete: string;
    noFiles: string;
  };

  // 🔔 Notifications
  notifications: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };

  // 🔐 Auth
  auth: {
    login: string;
    logout: string;
    register: string;
    forgotPassword: string;
    unauthorized: string;
  };

  // 🎨 Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    yes: string;
    no: string;
    close: string;
    open: string;
  };
}

// 🇪🇸 Spanish translations (default)
export const esTranslations: Translations = {
  nav: {
    dashboard: "Dashboard",
    users: "Usuarios",
    featureFlags: "Feature Flags",
    files: "Archivos",
    settings: "Configuración",
    logout: "Cerrar Sesión",
  },

  darkMode: {
    toggle: "Cambiar Tema",
    light: "Modo Claro",
    dark: "Modo Oscuro",
    tooltip: "Cambiar entre modo claro y oscuro",
  },

  language: {
    toggle: "Cambiar Idioma",
    spanish: "Español",
    english: "Inglés",
    tooltip: "Cambiar idioma de la aplicación",
    current: "Idioma actual",
  },

  dashboard: {
    title: "Dashboard",
    welcome: "Bienvenido",
    stats: "Estadísticas",
  },

  users: {
    title: "Gestión de Usuarios",
    create: "Crear Usuario",
    edit: "Editar Usuario",
    delete: "Eliminar Usuario",
    search: "Buscar usuarios...",
    noUsers: "No hay usuarios disponibles",
  },

  featureFlags: {
    title: "Módulos y UI del Sistema",
    enable: "Activar",
    disable: "Desactivar",
    search: "Buscar módulos...",
    noFlags: "No hay módulos disponibles",
    category: "Categoría",
    total: "Total",
    active: "Activos",
    inactive: "Inactivos",
    modules: "Módulos",
    refresh: "Actualizar",
    allCategories: "Todas las categorías",
    all: "Todos",
    enabled: "Activos",
    disabled: "Inactivos",
    errorLoading: "Error al cargar feature flags",
    noFlagsFound: "No se encontraron feature flags",
    adjustFilters:
      "Intenta ajustar los filtros o verifica que existan feature flags configurados.",
    loading: "Cargando feature flags...",
  },

  files: {
    title: "Gestión de Archivos",
    upload: "Subir Archivo",
    download: "Descargar",
    delete: "Eliminar Archivo",
    noFiles: "No hay archivos disponibles",
  },

  notifications: {
    success: "Éxito",
    error: "Error",
    warning: "Advertencia",
    info: "Información",
  },

  auth: {
    login: "Iniciar Sesión",
    logout: "Cerrar Sesión",
    register: "Registrarse",
    forgotPassword: "Olvidé mi Contraseña",
    unauthorized: "No Autorizado",
  },

  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    search: "Buscar",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    yes: "Sí",
    no: "No",
    close: "Cerrar",
    open: "Abrir",
  },
};

// 🇺🇸 English translations
export const enTranslations: Translations = {
  nav: {
    dashboard: "Dashboard",
    users: "Users",
    featureFlags: "Feature Flags",
    files: "Files",
    settings: "Settings",
    logout: "Logout",
  },

  darkMode: {
    toggle: "Toggle Theme",
    light: "Light Mode",
    dark: "Dark Mode",
    tooltip: "Switch between light and dark mode",
  },

  language: {
    toggle: "Change Language",
    spanish: "Spanish",
    english: "English",
    tooltip: "Change application language",
    current: "Current language",
  },

  dashboard: {
    title: "Dashboard",
    welcome: "Welcome",
    stats: "Statistics",
  },

  users: {
    title: "User Management",
    create: "Create User",
    edit: "Edit User",
    delete: "Delete User",
    search: "Search users...",
    noUsers: "No users available",
  },

  featureFlags: {
    title: "System Modules & UI",
    enable: "Enable",
    disable: "Disable",
    search: "Search modules...",
    noFlags: "No modules available",
    category: "Category",
    total: "Total",
    active: "Active",
    inactive: "Inactive",
    modules: "Modules",
    refresh: "Refresh",
    allCategories: "All categories",
    all: "All",
    enabled: "Active",
    disabled: "Inactive",
    errorLoading: "Error loading feature flags",
    noFlagsFound: "No feature flags found",
    adjustFilters:
      "Try adjusting the filters or verify that feature flags are configured.",
    loading: "Loading feature flags...",
  },

  files: {
    title: "File Management",
    upload: "Upload File",
    download: "Download",
    delete: "Delete File",
    noFiles: "No files available",
  },

  notifications: {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Information",
  },

  auth: {
    login: "Login",
    logout: "Logout",
    register: "Register",
    forgotPassword: "Forgot Password",
    unauthorized: "Unauthorized",
  },

  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    yes: "Yes",
    no: "No",
    close: "Close",
    open: "Open",
  },
};

// 🗂️ All translations
export const translations = {
  es: esTranslations,
  en: enTranslations,
} as const;

// 🎯 Default language
export const DEFAULT_LANGUAGE: Language = "es";

// 💾 Storage key for language preference
export const LANGUAGE_STORAGE_KEY = "app-language";

// 📡 Broadcast channel for language changes
export const LANGUAGE_BROADCAST_CHANNEL = "language-change";
