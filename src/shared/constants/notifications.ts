/**
 * 🔔 NOTIFICATION CONSTANTS
 *
 * Mensajes centralizados para notificaciones del sistema
 */

// 🎯 Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  LOADING: "loading",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// ⏱️ Duraciones por defecto
export const NOTIFICATION_DURATIONS = {
  SUCCESS: 4000,
  ERROR: 6000,
  WARNING: 5000,
  INFO: 4000,
  LOADING: Infinity, // Se cierra manualmente
} as const;

// 🎨 Posiciones disponibles
export const NOTIFICATION_POSITIONS = {
  TOP_LEFT: "top-left",
  TOP_CENTER: "top-center",
  TOP_RIGHT: "top-right",
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_CENTER: "bottom-center",
  BOTTOM_RIGHT: "bottom-right",
} as const;

export type NotificationPosition =
  (typeof NOTIFICATION_POSITIONS)[keyof typeof NOTIFICATION_POSITIONS];

// 📝 Mensajes predefinidos por categoría
export const NOTIFICATION_MESSAGES = {
  // 👥 Usuarios
  USERS: {
    CREATE_LOADING: "Creando usuario...",
    CREATE_SUCCESS: "✅ Usuario creado exitosamente",
    CREATE_ERROR: "❌ Error al crear usuario",
    UPDATE_LOADING: "Actualizando usuario...",
    UPDATE_SUCCESS: "✅ Usuario actualizado correctamente",
    UPDATE_ERROR: "❌ Error al actualizar usuario",
    DELETE_LOADING: "Eliminando usuario...",
    DELETE_SUCCESS: "✅ Usuario eliminado exitosamente",
    DELETE_ERROR: "❌ Error al eliminar usuario",
    BAN_LOADING: "Baneando usuario...",
    BAN_SUCCESS: "✅ Usuario baneado exitosamente",
    BAN_ERROR: "❌ Error al banear usuario",
    UNBAN_LOADING: "Desbaneando usuario...",
    UNBAN_SUCCESS: "✅ Usuario desbaneado exitosamente",
    UNBAN_ERROR: "❌ Error al desbanear usuario",
    ROLE_CHANGE_LOADING: "Cambiando rol...",
    ROLE_CHANGE_SUCCESS: "✅ Rol actualizado exitosamente",
    ROLE_CHANGE_ERROR: "❌ Error al cambiar rol",
    LOAD_ERROR: "❌ Error al cargar usuarios",
  },

  // 📁 Archivos
  FILES: {
    UPLOAD_LOADING: "Subiendo archivo...",
    UPLOAD_SUCCESS: "✅ Archivo subido exitosamente",
    UPLOAD_ERROR: "❌ Error al subir archivo",
    DELETE_LOADING: "Eliminando archivo...",
    DELETE_SUCCESS: "✅ Archivo eliminado exitosamente",
    DELETE_ERROR: "❌ Error al eliminar archivo",
    LOAD_ERROR: "❌ Error al cargar archivos",
    SIZE_ERROR: "❌ El archivo es demasiado grande",
    TYPE_ERROR: "❌ Tipo de archivo no permitido",
  },

  // 🔐 Sesiones y Autenticación
  AUTH: {
    LOGIN_SUCCESS: "Sesión iniciada exitosamente",
    LOGIN_ERROR: "Error al iniciar sesión",
    LOGOUT_SUCCESS: "Sesión cerrada exitosamente",
    LOGOUT_ERROR: "Error al cerrar sesión",
    SESSION_EXPIRED: "Tu sesión ha expirado",
    UNAUTHORIZED: "No tienes permisos para esta acción",
    SESSION_REVOKED: "Sesión revocada exitosamente",
    SESSION_REVOKE_ERROR: "Error al revocar sesión",
  },

  // 🛡️ Permisos
  PERMISSIONS: {
    ACCESS_DENIED: "Acceso denegado - Permisos insuficientes",
    ROLE_REQUIRED: "Se requiere un rol específico para esta acción",
    ADMIN_REQUIRED: "Se requieren permisos de administrador",
    SUPER_ADMIN_REQUIRED:
      "Solo super administradores pueden realizar esta acción",
    PERMISSION_UPDATED: "Permisos actualizados exitosamente",
  },

  // 🔄 Operaciones generales
  GENERAL: {
    SAVE_SUCCESS: "Guardado exitosamente",
    SAVE_ERROR: "Error al guardar",
    LOAD_ERROR: "Error al cargar datos",
    NETWORK_ERROR: "Error de conexión",
    VALIDATION_ERROR: "Error de validación",
    OPERATION_CANCELLED: "Operación cancelada",
    COPYING: "Copiando al portapapeles...",
    COPIED: "Copiado al portapapeles",
    PROCESSING: "Procesando...",
    PLEASE_WAIT: "Por favor espera...",
  },

  // 🚩 Feature Flags
  FEATURE_FLAGS: {
    UPDATE_SUCCESS: "Feature flag actualizado exitosamente",
    UPDATE_ERROR: "Error al actualizar feature flag",
    LOAD_ERROR: "Error al cargar feature flags",
  },

  // 🔧 Sistema
  SYSTEM: {
    MAINTENANCE: "Sistema en mantenimiento",
    UPDATE_AVAILABLE: "Actualización disponible",
    BACKUP_SUCCESS: "Backup creado exitosamente",
    BACKUP_ERROR: "Error al crear backup",
    RESTORE_SUCCESS: "Sistema restaurado exitosamente",
    RESTORE_ERROR: "Error al restaurar sistema",
  },
} as const;

// 🎯 Tipos derivados para TypeScript
export type NotificationMessageKey = keyof typeof NOTIFICATION_MESSAGES;
export type UserNotificationKey = keyof typeof NOTIFICATION_MESSAGES.USERS;
export type FileNotificationKey = keyof typeof NOTIFICATION_MESSAGES.FILES;
export type AuthNotificationKey = keyof typeof NOTIFICATION_MESSAGES.AUTH;
export type PermissionNotificationKey =
  keyof typeof NOTIFICATION_MESSAGES.PERMISSIONS;
export type GeneralNotificationKey = keyof typeof NOTIFICATION_MESSAGES.GENERAL;

// 📊 Configuración por defecto
export const DEFAULT_NOTIFICATION_CONFIG = {
  position: NOTIFICATION_POSITIONS.TOP_RIGHT,
  duration: NOTIFICATION_DURATIONS.SUCCESS,
  richColors: true,
  closeButton: true,
  dismissible: true,
  pauseWhenPageIsHidden: true,
} as const;

// 🔗 URLs de ayuda para errores específicos
export const HELP_URLS = {
  PERMISSIONS: "/docs/permissions",
  FILE_UPLOAD: "/docs/file-upload",
  USER_MANAGEMENT: "/docs/users",
  AUTHENTICATION: "/docs/auth",
  SYSTEM: "/docs/system",
} as const;
