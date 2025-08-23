/**
 * 🔔 NOTIFICATION PROVIDER
 *
 * Provider central para el sistema de notificaciones usando Sonner
 */

"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { Toaster, toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  // Bell, // Not used
} from "lucide-react";

import type {
  NotificationContextValue,
  NotificationProviderProps,
  NotificationOptions,
  NotificationConfig,
  NotificationStyle,
  PromiseNotificationOptions,
  NotificationState,
} from "@/shared/types/notifications";

// 🎯 Constantes inline - simplificadas
const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  LOADING: "loading",
} as const;

const NOTIFICATION_DURATIONS = {
  SUCCESS: 4000,
  ERROR: 6000,
  WARNING: 5000,
  INFO: 4000,
  LOADING: 0, // Indefinido hasta que se resuelva
} as const;

const DEFAULT_NOTIFICATION_CONFIG = {
  position: "top-right" as const,
  duration: 4000,
  richColors: true,
  closeButton: true,
  dismissible: true,
};

// 🎯 Contexto de notificaciones
const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

// 🎨 Iconos por tipo de notificación
const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.SUCCESS]: <CheckCircle className="h-5 w-5" />,
  [NOTIFICATION_TYPES.ERROR]: <XCircle className="h-5 w-5" />,
  [NOTIFICATION_TYPES.WARNING]: <AlertTriangle className="h-5 w-5" />,
  [NOTIFICATION_TYPES.INFO]: <Info className="h-5 w-5" />,
  [NOTIFICATION_TYPES.LOADING]: <Loader2 className="h-5 w-5 animate-spin" />,
} as const;

/**
 * 🔔 NotificationProvider - Provider principal del sistema de notificaciones
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  config = {},
  theme = "system",
  visibleToasts = 5,
  expand = false,
  toastOptions = {},
}) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  // 🎯 Configuración fusionada
  const mergedConfig = { ...DEFAULT_NOTIFICATION_CONFIG, ...config };

  // 📝 Función principal para mostrar notificaciones
  const show = useCallback(
    (options: NotificationOptions): string => {
      const {
        type = NOTIFICATION_TYPES.INFO,
        title,
        message,
        description,
        action,
        cancel,
        icon,
        duration,
        onClick,
        onDismiss,
        id,
        ...restConfig
      } = options;

      // 🎨 Preparar configuración final
      const finalConfig = { ...mergedConfig, ...restConfig };
      const finalDuration =
        duration ??
        NOTIFICATION_DURATIONS[
          type.toUpperCase() as keyof typeof NOTIFICATION_DURATIONS
        ];
      const finalIcon = icon ?? NOTIFICATION_ICONS[type];

      // 📝 Contenido de la notificación
      const notificationContent = (
        <div className="flex flex-col gap-1">
          {title && <div className="font-semibold text-sm">{title}</div>}
          <div className="text-sm">{message}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      );

      // 🎬 Preparar acciones
      const actionProps: Record<string, unknown> = {};
      if (action) {
        actionProps.action = {
          label: action.label,
          onClick: action.onClick,
        };
      }
      if (cancel) {
        actionProps.cancel = {
          label: cancel.label,
          onClick: cancel.onClick,
        };
      }

      // 🚀 Mostrar notificación según el tipo
      let toastId: string | number;

      switch (type) {
        case NOTIFICATION_TYPES.SUCCESS:
          toastId = toast.success(notificationContent, {
            id,
            duration: finalDuration,
            icon: finalIcon,
            dismissible: finalConfig.dismissible,
            closeButton: finalConfig.closeButton,
            onDismiss,
            ...actionProps,
          });
          break;

        case NOTIFICATION_TYPES.ERROR:
          toastId = toast.error(notificationContent, {
            id,
            duration: finalDuration,
            icon: finalIcon,
            dismissible: finalConfig.dismissible,
            closeButton: finalConfig.closeButton,
            onDismiss,
            ...actionProps,
          });
          break;

        case NOTIFICATION_TYPES.WARNING:
          toastId = toast.warning(notificationContent, {
            id,
            duration: finalDuration,
            icon: finalIcon,
            dismissible: finalConfig.dismissible,
            closeButton: finalConfig.closeButton,
            onDismiss,
            ...actionProps,
          });
          break;

        case NOTIFICATION_TYPES.LOADING:
          toastId = toast.loading(notificationContent, {
            id,
            duration: finalDuration,
            icon: finalIcon,
            dismissible: finalConfig.dismissible,
            closeButton: finalConfig.closeButton,
            onDismiss,
            ...actionProps,
          });
          break;

        default:
          toastId = toast(notificationContent, {
            id,
            duration: finalDuration,
            icon: finalIcon,
            dismissible: finalConfig.dismissible,
            closeButton: finalConfig.closeButton,
            onDismiss,
            ...actionProps,
          });
          break;
      }

      // 📊 Actualizar estado interno
      const stringId = String(toastId);
      const newNotification: NotificationState = {
        id: stringId,
        type,
        message,
        createdAt: new Date(),
        visible: true,
        paused: false,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // 🔄 Auto-cleanup después de la duración
      if (finalDuration !== Infinity) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== stringId));
        }, finalDuration + 500); // Extra tiempo para animación
      }

      return stringId;
    },
    [mergedConfig]
  );

  // ✅ Notificación de éxito
  const success = useCallback(
    (
      message: string,
      config?: NotificationConfig & NotificationStyle
    ): string => {
      return show({
        type: NOTIFICATION_TYPES.SUCCESS,
        message,
        ...config,
      });
    },
    [show]
  );

  // ❌ Notificación de error
  const error = useCallback(
    (
      message: string,
      config?: NotificationConfig & NotificationStyle
    ): string => {
      return show({
        type: NOTIFICATION_TYPES.ERROR,
        message,
        ...config,
      });
    },
    [show]
  );

  // ⚠️ Notificación de advertencia
  const warning = useCallback(
    (
      message: string,
      config?: NotificationConfig & NotificationStyle
    ): string => {
      return show({
        type: NOTIFICATION_TYPES.WARNING,
        message,
        ...config,
      });
    },
    [show]
  );

  // ℹ️ Notificación de información
  const info = useCallback(
    (
      message: string,
      config?: NotificationConfig & NotificationStyle
    ): string => {
      return show({
        type: NOTIFICATION_TYPES.INFO,
        message,
        ...config,
      });
    },
    [show]
  );

  // 🔄 Notificación de loading
  const loading = useCallback(
    (
      message: string,
      config?: NotificationConfig & NotificationStyle
    ): string => {
      return show({
        type: NOTIFICATION_TYPES.LOADING,
        message,
        ...config,
      });
    },
    [show]
  );

  // 🎯 Notificación de promesa
  const promise = useCallback(
    <T,>(
      promiseToResolve: Promise<T>,
      options: PromiseNotificationOptions<T>
    ): Promise<T> => {
      // Mostrar el toast pero devolver la promesa original
      toast.promise(promiseToResolve, {
        loading: options.loading,
        success: options.success,
        error: options.error,
        ...options.config,
      });

      return promiseToResolve; // Devolver la promesa original
    },
    []
  );

  // 🚫 Cerrar notificación específica
  const dismiss = useCallback((id: string): void => {
    toast.dismiss(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // 🧹 Cerrar todas las notificaciones
  const dismissAll = useCallback((): void => {
    toast.dismiss();
    setNotifications([]);
  }, []);

  // 🔄 Actualizar notificación existente
  const update = useCallback(
    (id: string, options: Partial<NotificationOptions>): void => {
      // Sonner no tiene update directo, así que cerramos y creamos nueva
      dismiss(id);
      show({ id, ...options } as NotificationOptions);
    },
    [dismiss, show]
  );

  // 🎯 Valor del contexto
  const contextValue: NotificationContextValue = {
    show,
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    dismissAll,
    update,
    notifications,
  };

  // 🧹 Cleanup al desmontar
  useEffect(() => {
    return () => {
      dismissAll();
    };
  }, [dismissAll]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Toaster
        theme={theme}
        position={mergedConfig.position}
        richColors={mergedConfig.richColors}
        closeButton={mergedConfig.closeButton}
        visibleToasts={visibleToasts}
        expand={expand}
        toastOptions={{
          className: `
            font-sans text-sm
            border border-border/50
            backdrop-blur-sm
            shadow-lg
            ${toastOptions.className || ""}
          `,
          style: {
            borderRadius: "8px",
            ...toastOptions.style,
          },
        }}
      />
    </NotificationContext.Provider>
  );
};

/**
 * 🪝 Hook para usar el contexto de notificaciones
 */
export const useNotificationContext = (): NotificationContextValue => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }

  return context;
};

// 🎯 Export por defecto
export default NotificationProvider;
