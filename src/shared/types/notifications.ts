/**
 * 🔔 NOTIFICATION TYPES
 *
 * Tipos TypeScript para el sistema de notificaciones
 */

import type {
  NotificationType,
  NotificationPosition,
} from "@/shared/constants/notifications";

// 🎯 Configuración básica de notificación
export interface NotificationConfig {
  /** Duración en ms (undefined = automático según tipo) */
  duration?: number;
  /** Posición en pantalla */
  position?: NotificationPosition;
  /** Mostrar botón de cerrar */
  closeButton?: boolean;
  /** Permitir dismiss con click */
  dismissible?: boolean;
  /** Colores ricos (mejor contraste) */
  richColors?: boolean;
  /** Pausar cuando la página no está visible */
  pauseWhenPageIsHidden?: boolean;
  /** ID único para actualizar/cerrar después */
  id?: string;
  /** Función callback al hacer click */
  onClick?: () => void;
  /** Función callback al cerrar */
  onDismiss?: () => void;
  /** Acción principal */
  action?: NotificationAction;
}

// 🎨 Opciones de estilo
export interface NotificationStyle {
  /** Icono personalizado */
  icon?: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
  /** Clases para el contenedor */
  classNames?: {
    toast?: string;
    title?: string;
    description?: string;
    actionButton?: string;
    cancelButton?: string;
  };
}

// 🎬 Acciones en notificaciones
export interface NotificationAction {
  /** Texto del botón */
  label: string;
  /** Función a ejecutar */
  onClick: () => void | Promise<void>;
  /** Estilo del botón */
  style?: "default" | "destructive";
}

// 📦 Notificación completa
export interface NotificationOptions
  extends NotificationConfig,
    NotificationStyle {
  /** Tipo de notificación */
  type?: NotificationType;
  /** Título de la notificación */
  title?: string;
  /** Mensaje principal */
  message: string;
  /** Descripción adicional */
  description?: string;
  /** Acción principal */
  action?: NotificationAction;
  /** Acción de cancelar */
  cancel?: NotificationAction;
  /** Datos adicionales para debug */
  data?: Record<string, unknown>;
}

// 🔄 Notificación de promesa (loading -> success/error)
export interface PromiseNotificationOptions<T = unknown> {
  /** Mensaje mientras se ejecuta */
  loading: string;
  /** Mensaje de éxito */
  success: string | ((data: T) => string);
  /** Mensaje de error */
  error: string | ((error: unknown) => string);
  /** Configuración adicional */
  config?: NotificationConfig & NotificationStyle;
}

// 📊 Estado de notificación
export interface NotificationState {
  /** ID único */
  id: string;
  /** Tipo */
  type: NotificationType;
  /** Mensaje */
  message: string;
  /** Timestamp de creación */
  createdAt: Date;
  /** Si está visible */
  visible: boolean;
  /** Si está pausada */
  paused: boolean;
  /** Duración restante */
  remainingDuration?: number;
}

// 🎯 Contexto del provider
export interface NotificationContextValue {
  /** Mostrar notificación */
  show: (options: NotificationOptions) => string;
  /** Mostrar éxito */
  success: (
    message: string,
    config?: NotificationConfig & NotificationStyle
  ) => string;
  /** Mostrar error */
  error: (
    message: string,
    config?: NotificationConfig & NotificationStyle
  ) => string;
  /** Mostrar advertencia */
  warning: (
    message: string,
    config?: NotificationConfig & NotificationStyle
  ) => string;
  /** Mostrar información */
  info: (
    message: string,
    config?: NotificationConfig & NotificationStyle
  ) => string;
  /** Mostrar loading */
  loading: (
    message: string,
    config?: NotificationConfig & NotificationStyle
  ) => string;
  /** Notificación de promesa */
  promise: <T>(
    promise: Promise<T>,
    options: PromiseNotificationOptions<T>
  ) => Promise<T>;
  /** Cerrar notificación específica */
  dismiss: (id: string) => void;
  /** Cerrar todas las notificaciones */
  dismissAll: () => void;
  /** Actualizar notificación existente */
  update: (id: string, options: Partial<NotificationOptions>) => void;
  /** Lista de notificaciones activas */
  notifications: NotificationState[];
}

// 🏗️ Props del provider
export interface NotificationProviderProps {
  children: React.ReactNode;
  /** Configuración global */
  config?: NotificationConfig;
  /** Tema personalizado */
  theme?: "light" | "dark" | "system";
  /** Número máximo de notificaciones visibles */
  visibleToasts?: number;
  /** Expandir por defecto */
  expand?: boolean;
  /** Altura de cada toast */
  toastOptions?: {
    className?: string;
    style?: React.CSSProperties;
  };
}

// 🎯 Helpers para categorías específicas
export interface UserNotifications {
  /** Usuario creado exitosamente */
  userCreated: (userName?: string) => string;
  /** Error al crear usuario */
  userCreateError: (error?: string) => string;
  /** Usuario actualizado */
  userUpdated: (userName?: string) => string;
  /** Error al actualizar usuario */
  userUpdateError: (error?: string) => string;
  /** Usuario eliminado */
  userDeleted: (userName?: string) => string;
  /** Error al eliminar usuario */
  userDeleteError: (error?: string) => string;
}

export interface FileNotifications {
  /** Archivo subido exitosamente */
  fileUploaded: (fileName?: string) => string;
  /** Error al subir archivo */
  fileUploadError: (error?: string) => string;
  /** Archivo eliminado */
  fileDeleted: (fileName?: string) => string;
  /** Error al eliminar archivo */
  fileDeleteError: (error?: string) => string;
}

export interface AuthNotifications {
  /** Sesión iniciada */
  loginSuccess: (userName?: string) => string;
  /** Error al iniciar sesión */
  loginError: (error?: string) => string;
  /** Sesión cerrada */
  logoutSuccess: () => string;
  /** Acceso denegado */
  accessDenied: (resource?: string) => string;
}

// 🔄 Server Action Integration
export interface ServerActionNotificationOptions {
  /** Mensaje de loading */
  loadingMessage?: string;
  /** Mensaje de éxito */
  successMessage?: string;
  /** Mensaje de error personalizado */
  errorMessage?: string;
  /** Configuración adicional */
  config?: NotificationConfig & NotificationStyle;
  /** Mostrar notificaciones automáticamente */
  autoNotify?: boolean;
}
