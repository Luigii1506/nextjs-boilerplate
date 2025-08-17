/**
 * 🔔 USE NOTIFICATIONS HOOK
 *
 * Hook principal para el sistema de notificaciones con métodos especializados
 */

"use client";

import { useCallback } from "react";
import { useNotificationContext } from "@/shared/providers/NotificationProvider";
import { NOTIFICATION_MESSAGES } from "@/shared/constants/notifications";
import type {
  UserNotifications,
  FileNotifications,
  AuthNotifications,
} from "@/shared/types/notifications";

/**
 * 🔔 useNotifications - Hook principal del sistema de notificaciones
 */
export const useNotifications = () => {
  const context = useNotificationContext();

  // 👥 Notificaciones específicas para usuarios
  const users: UserNotifications = {
    userCreated: useCallback(
      (userName?: string) => {
        const message = userName
          ? `Usuario "${userName}" creado exitosamente`
          : NOTIFICATION_MESSAGES.USERS.CREATE_SUCCESS;
        return context.success(message);
      },
      [context]
    ),

    userCreateError: useCallback(
      (error?: string) => {
        const message = error || NOTIFICATION_MESSAGES.USERS.CREATE_ERROR;
        return context.error(message, {
          action: {
            label: "Reintentar",
            onClick: () => window.location.reload(),
          },
        });
      },
      [context]
    ),

    userUpdated: useCallback(
      (userName?: string) => {
        const message = userName
          ? `Usuario "${userName}" actualizado correctamente`
          : NOTIFICATION_MESSAGES.USERS.UPDATE_SUCCESS;
        return context.success(message);
      },
      [context]
    ),

    userUpdateError: useCallback(
      (error?: string) => {
        const message = error || NOTIFICATION_MESSAGES.USERS.UPDATE_ERROR;
        return context.error(message);
      },
      [context]
    ),

    userDeleted: useCallback(
      (userName?: string) => {
        const message = userName
          ? `Usuario "${userName}" eliminado exitosamente`
          : NOTIFICATION_MESSAGES.USERS.DELETE_SUCCESS;
        return context.success(message);
      },
      [context]
    ),

    userDeleteError: useCallback(
      (error?: string) => {
        const message = error || NOTIFICATION_MESSAGES.USERS.DELETE_ERROR;
        return context.error(message);
      },
      [context]
    ),
  };

  // 📁 Notificaciones específicas para archivos
  const files: FileNotifications = {
    fileUploaded: useCallback(
      (fileName?: string) => {
        const message = fileName
          ? `Archivo "${fileName}" subido exitosamente`
          : NOTIFICATION_MESSAGES.FILES.UPLOAD_SUCCESS;
        return context.success(message);
      },
      [context]
    ),

    fileUploadError: useCallback(
      (error?: string) => {
        const message = error || NOTIFICATION_MESSAGES.FILES.UPLOAD_ERROR;
        return context.error(message, {
          action: {
            label: "Reintentar",
            onClick: () => window.location.reload(),
          },
        });
      },
      [context]
    ),

    fileDeleted: useCallback(
      (fileName?: string) => {
        const message = fileName
          ? `Archivo "${fileName}" eliminado exitosamente`
          : NOTIFICATION_MESSAGES.FILES.DELETE_SUCCESS;
        return context.success(message);
      },
      [context]
    ),

    fileDeleteError: useCallback(
      (error?: string) => {
        const message = error || NOTIFICATION_MESSAGES.FILES.DELETE_ERROR;
        return context.error(message);
      },
      [context]
    ),
  };

  // 🔐 Notificaciones específicas para autenticación
  const auth: AuthNotifications = {
    loginSuccess: useCallback(
      (userName?: string) => {
        const message = userName
          ? `¡Bienvenido, ${userName}!`
          : NOTIFICATION_MESSAGES.AUTH.LOGIN_SUCCESS;
        return context.success(message);
      },
      [context]
    ),

    loginError: useCallback(
      (error?: string) => {
        const message = error || NOTIFICATION_MESSAGES.AUTH.LOGIN_ERROR;
        return context.error(message, {
          action: {
            label: "Ir a Login",
            onClick: () => {
              window.location.href = "/login";
            },
          },
        });
      },
      [context]
    ),

    logoutSuccess: useCallback(() => {
      return context.info(NOTIFICATION_MESSAGES.AUTH.LOGOUT_SUCCESS);
    }, [context]),

    accessDenied: useCallback(
      (resource?: string) => {
        const message = resource
          ? `Acceso denegado a ${resource}`
          : NOTIFICATION_MESSAGES.PERMISSIONS.ACCESS_DENIED;
        return context.warning(message, {
          duration: 6000,
          action: {
            label: "Ver Permisos",
            onClick: () => {
              window.location.href = "/docs/permissions";
            },
          },
        });
      },
      [context]
    ),
  };

  // 🎯 Métodos de conveniencia con mensajes predefinidos
  const quick = {
    // ✅ Éxitos comunes
    saved: useCallback(
      () => context.success(NOTIFICATION_MESSAGES.GENERAL.SAVE_SUCCESS),
      [context]
    ),
    copied: useCallback(
      () =>
        context.success(NOTIFICATION_MESSAGES.GENERAL.COPIED, {
          duration: 2000,
        }),
      [context]
    ),
    updated: useCallback(
      () => context.success("Actualizado exitosamente"),
      [context]
    ),
    created: useCallback(
      () => context.success("Creado exitosamente"),
      [context]
    ),
    deleted: useCallback(
      () => context.success("Eliminado exitosamente"),
      [context]
    ),

    // ❌ Errores comunes
    saveError: useCallback(
      () => context.error(NOTIFICATION_MESSAGES.GENERAL.SAVE_ERROR),
      [context]
    ),
    loadError: useCallback(
      () => context.error(NOTIFICATION_MESSAGES.GENERAL.LOAD_ERROR),
      [context]
    ),
    networkError: useCallback(
      () =>
        context.error(NOTIFICATION_MESSAGES.GENERAL.NETWORK_ERROR, {
          action: {
            label: "Reintentar",
            onClick: () => window.location.reload(),
          },
        }),
      [context]
    ),
    validationError: useCallback(
      () => context.warning(NOTIFICATION_MESSAGES.GENERAL.VALIDATION_ERROR),
      [context]
    ),

    // ℹ️ Información común
    processing: useCallback(
      () => context.loading(NOTIFICATION_MESSAGES.GENERAL.PROCESSING),
      [context]
    ),
    copying: useCallback(
      () =>
        context.loading(NOTIFICATION_MESSAGES.GENERAL.COPYING, {
          duration: 1000,
        }),
      [context]
    ),
    pleaseWait: useCallback(
      () => context.info(NOTIFICATION_MESSAGES.GENERAL.PLEASE_WAIT),
      [context]
    ),

    // ⚠️ Advertencias comunes
    unauthorized: useCallback(
      () => context.warning(NOTIFICATION_MESSAGES.AUTH.UNAUTHORIZED),
      [context]
    ),
    sessionExpired: useCallback(
      () =>
        context.warning(NOTIFICATION_MESSAGES.AUTH.SESSION_EXPIRED, {
          action: {
            label: "Iniciar Sesión",
            onClick: () => {
              window.location.href = "/login";
            },
          },
        }),
      [context]
    ),
  };

  // 🛡️ Métodos específicos para permisos
  const permissions = {
    accessDenied: useCallback(
      (resource?: string) => {
        return auth.accessDenied(resource);
      },
      [auth]
    ),

    roleRequired: useCallback(
      (role: string) => {
        return context.warning(`Se requiere rol de ${role} para esta acción`, {
          action: {
            label: "Ver Roles",
            onClick: () => {
              window.location.href = "/docs/permissions#roles";
            },
          },
        });
      },
      [context]
    ),

    adminRequired: useCallback(() => {
      return context.warning(NOTIFICATION_MESSAGES.PERMISSIONS.ADMIN_REQUIRED, {
        action: {
          label: "Contactar Admin",
          onClick: () => {
            window.location.href = "/contact";
          },
        },
      });
    }, [context]),

    superAdminRequired: useCallback(() => {
      return context.error(
        NOTIFICATION_MESSAGES.PERMISSIONS.SUPER_ADMIN_REQUIRED
      );
    }, [context]),
  };

  // 🔄 Método para operaciones con promesas
  const withPromise = useCallback(
    <T>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
    ) => {
      return context.promise(promise, options);
    },
    [context]
  );

  // 📊 Método para mostrar progreso de operaciones
  const withProgress = useCallback(
    (
      operation: () => Promise<unknown>,
      messages: {
        starting: string;
        success: string;
        error?: string;
      }
    ) => {
      const loadingId = context.loading(messages.starting);

      return operation()
        .then((result) => {
          context.dismiss(loadingId);
          context.success(messages.success);
          return result;
        })
        .catch((error) => {
          context.dismiss(loadingId);
          const errorMessage = messages.error || `Error: ${error.message}`;
          context.error(errorMessage);
          throw error;
        });
    },
    [context]
  );

  // 🎯 Retornar API completa
  return {
    // 🔄 Métodos principales del contexto
    ...context,

    // 👥 Categorías especializadas
    users,
    files,
    auth,
    permissions,

    // ⚡ Métodos de conveniencia
    quick,
    withPromise,
    withProgress,

    // 🎨 Métodos con alias más cortos
    notify: context.show,
    ok: context.success,
    fail: context.error,
    warn: context.warning,
    tell: context.info,
    wait: context.loading,
  };
};

// 🎯 Export por defecto
export default useNotifications;
