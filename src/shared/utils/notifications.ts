/**
 * 🔔 NOTIFICATION UTILITIES
 *
 * Utilidades para el sistema de notificaciones
 */

import type {
  NotificationOptions,
  ServerActionNotificationOptions,
  NotificationConfig,
  NotificationStyle,
} from "@/shared/types/notifications";
import { NOTIFICATION_MESSAGES } from "@/shared/constants/notifications";

// 🎯 Formatear errores para notificaciones
export const formatError = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    // Manejar errores de formularios/validación
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }

    // Manejar errores de APIs
    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }

    // Manejar errores con código de estado
    if ("status" in error && "statusText" in error) {
      return `Error ${error.status}: ${error.statusText}`;
    }

    // Fallback para objetos
    return JSON.stringify(error);
  }

  return "Error desconocido";
};

// 🛡️ Formatear errores de permisos
export const formatPermissionError = (
  resource?: string,
  action?: string,
  userRole?: string
): string => {
  if (resource && action) {
    return `No tienes permisos para ${action} en ${resource}`;
  }

  if (resource) {
    return `Acceso denegado a ${resource}`;
  }

  if (userRole) {
    return `Tu rol actual (${userRole}) no tiene suficientes permisos`;
  }

  return NOTIFICATION_MESSAGES.PERMISSIONS.ACCESS_DENIED;
};

// 🔄 Formatear errores de server actions
export const formatServerActionError = (error: unknown): string => {
  const baseError = formatError(error);

  // Detectar tipos específicos de errores del servidor
  if (baseError.includes("unauthorized") || baseError.includes("permission")) {
    return NOTIFICATION_MESSAGES.AUTH.UNAUTHORIZED;
  }

  if (baseError.includes("network") || baseError.includes("fetch")) {
    return NOTIFICATION_MESSAGES.GENERAL.NETWORK_ERROR;
  }

  if (baseError.includes("validation")) {
    return NOTIFICATION_MESSAGES.GENERAL.VALIDATION_ERROR;
  }

  return baseError;
};

// 📁 Formatear errores de archivos
export const formatFileError = (error: unknown, fileName?: string): string => {
  const baseError = formatError(error);

  if (baseError.includes("size") || baseError.includes("large")) {
    return fileName
      ? `El archivo "${fileName}" es demasiado grande`
      : NOTIFICATION_MESSAGES.FILES.SIZE_ERROR;
  }

  if (baseError.includes("type") || baseError.includes("format")) {
    return fileName
      ? `Tipo de archivo no permitido: "${fileName}"`
      : NOTIFICATION_MESSAGES.FILES.TYPE_ERROR;
  }

  return fileName ? `Error al procesar "${fileName}": ${baseError}` : baseError;
};

// 🎯 Crear configuración optimizada por tipo de operación
export const createOperationConfig = (
  operation: "create" | "update" | "delete" | "upload" | "process",
  options?: Partial<NotificationConfig & NotificationStyle>
): NotificationConfig & NotificationStyle => {
  const baseConfig: NotificationConfig & NotificationStyle = {
    closeButton: true,
    dismissible: true,
    richColors: true,
  };

  switch (operation) {
    case "create":
      return {
        ...baseConfig,
        duration: 4000,
        ...options,
      };

    case "update":
      return {
        ...baseConfig,
        duration: 3000,
        ...options,
      };

    case "delete":
      return {
        ...baseConfig,
        duration: 4000,
        ...options,
      };

    case "upload":
      return {
        ...baseConfig,
        duration: 5000,
        ...options,
      };

    case "process":
      return {
        ...baseConfig,
        duration: Infinity, // Se cierra manualmente
        dismissible: false,
        ...options,
      };

    default:
      return { ...baseConfig, ...options };
  }
};

// 🔄 Crear notificación para server action
export const createServerActionNotification = (
  actionName: string,
  options?: ServerActionNotificationOptions
): {
  loading: string;
  success: string;
  error: string;
  config: NotificationConfig & NotificationStyle;
} => {
  const {
    loadingMessage,
    successMessage,
    errorMessage,
    config = {},
  } = options || {};

  return {
    loading: loadingMessage || `Ejecutando ${actionName}...`,
    success: successMessage || `${actionName} completado exitosamente`,
    error: errorMessage || `Error al ejecutar ${actionName}`,
    config: createOperationConfig("process", config),
  };
};

// 📊 Extraer información relevante de errores para analytics
export const extractErrorInfo = (
  error: unknown
): {
  type: string;
  message: string;
  stack?: string;
  metadata: Record<string, unknown>;
} => {
  if (error instanceof Error) {
    return {
      type: error.constructor.name,
      message: error.message,
      stack: error.stack,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  if (typeof error === "object" && error !== null) {
    return {
      type: "Object",
      message: formatError(error),
      metadata: {
        timestamp: new Date().toISOString(),
        originalError: error,
      },
    };
  }

  return {
    type: "Unknown",
    message: formatError(error),
    metadata: {
      timestamp: new Date().toISOString(),
      originalType: typeof error,
    },
  };
};

// 🎨 Crear opciones de notificación optimizadas
export const createNotificationOptions = (
  type: "success" | "error" | "warning" | "info" | "loading",
  message: string,
  overrides?: Partial<NotificationOptions>
): NotificationOptions => {
  const baseOptions: NotificationOptions = {
    type,
    message,
    closeButton: true,
    dismissible: true,
    richColors: true,
  };

  // Configuraciones específicas por tipo
  switch (type) {
    case "success":
      return {
        ...baseOptions,
        duration: 4000,
        ...overrides,
      };

    case "error":
      return {
        ...baseOptions,
        duration: 6000,
        action: {
          label: "Reportar",
          onClick: () => {
            // Lógica para reportar error
            console.log("Error reported:", message);
          },
        },
        ...overrides,
      };

    case "warning":
      return {
        ...baseOptions,
        duration: 5000,
        ...overrides,
      };

    case "info":
      return {
        ...baseOptions,
        duration: 4000,
        ...overrides,
      };

    case "loading":
      return {
        ...baseOptions,
        duration: Infinity,
        dismissible: false,
        ...overrides,
      };

    default:
      return { ...baseOptions, ...overrides };
  }
};

// 🔗 Crear enlace de ayuda para tipos de error
export const createHelpLink = (errorType: string): string | undefined => {
  const helpMap: Record<string, string> = {
    permission: "/docs/permissions",
    upload: "/docs/file-upload",
    auth: "/docs/authentication",
    validation: "/docs/validation",
    network: "/docs/troubleshooting#network",
    server: "/docs/troubleshooting#server",
  };

  const type = errorType.toLowerCase();
  for (const [key, url] of Object.entries(helpMap)) {
    if (type.includes(key)) {
      return url;
    }
  }

  return undefined;
};

// 🎯 Determinar severidad de error
export const getErrorSeverity = (
  error: unknown
): "low" | "medium" | "high" | "critical" => {
  const message = formatError(error).toLowerCase();

  if (message.includes("permission") || message.includes("unauthorized")) {
    return "medium";
  }

  if (message.includes("network") || message.includes("connection")) {
    return "high";
  }

  if (message.includes("server") || message.includes("internal")) {
    return "critical";
  }

  if (message.includes("validation") || message.includes("format")) {
    return "low";
  }

  return "medium";
};

// 🔄 Debounce para notificaciones repetitivas
const notificationCache = new Map<string, number>();
const DEBOUNCE_TIME = 3000; // 3 segundos

export const shouldShowNotification = (message: string): boolean => {
  const now = Date.now();
  const lastShown = notificationCache.get(message);

  if (lastShown && now - lastShown < DEBOUNCE_TIME) {
    return false;
  }

  notificationCache.set(message, now);
  return true;
};

// 🧹 Limpiar cache de debounce
export const clearNotificationCache = (): void => {
  notificationCache.clear();
};

// 📱 Detectar si está en dispositivo móvil para ajustar notificaciones
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 768;
};

// 🎨 Crear configuración responsiva
export const createResponsiveConfig = (
  baseConfig: NotificationConfig & NotificationStyle
): NotificationConfig & NotificationStyle => {
  if (isMobileDevice()) {
    return {
      ...baseConfig,
      position: "top-center",
      duration: baseConfig.duration ? baseConfig.duration * 0.8 : undefined, // Duración un poco menor en móvil
    };
  }

  return baseConfig;
};
