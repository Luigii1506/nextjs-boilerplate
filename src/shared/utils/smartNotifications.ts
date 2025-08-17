/**
 * 🧠 SMART NOTIFICATIONS - SISTEMA SIMPLE E INTELIGENTE
 * ====================================================
 *
 * ✅ UN SOLO HELPER para todo
 * ✅ Detecta automáticamente el tipo de error
 * ✅ Formateo inteligente multinivel
 * ✅ CERO configuración repetitiva
 * ✅ Súper simple de usar
 */

"use client";

import { useNotificationContext } from "@/shared/providers/NotificationProvider";
import { useCallback } from "react";

// 🎯 Detección inteligente de contexto por mensaje
const detectActionType = (message: string): string => {
  const msg = message.toLowerCase();

  if (msg.includes("creat") || msg.includes("añad") || msg.includes("agreg"))
    return "create";
  if (
    msg.includes("actualiz") ||
    msg.includes("modific") ||
    msg.includes("edit")
  )
    return "update";
  if (msg.includes("elimin") || msg.includes("borr") || msg.includes("delet"))
    return "delete";
  if (msg.includes("subien") || msg.includes("upload") || msg.includes("carg"))
    return "upload";
  if (msg.includes("descarg") || msg.includes("download")) return "download";
  if (msg.includes("bane") || msg.includes("block")) return "ban";
  if (msg.includes("desbane") || msg.includes("unblock")) return "unban";
  if (msg.includes("rol") || msg.includes("permis")) return "role";
  if (msg.includes("sesión") || msg.includes("login") || msg.includes("auth"))
    return "auth";

  return "general";
};

// 🔍 Detección inteligente de severidad por error
const detectErrorSeverity = (
  error: unknown
): "low" | "medium" | "high" | "critical" => {
  if (!error) return "medium";

  const errorStr = String(error).toLowerCase();

  if (
    errorStr.includes("permission") ||
    errorStr.includes("unauthorized") ||
    errorStr.includes("access denied")
  )
    return "medium";
  if (
    errorStr.includes("network") ||
    errorStr.includes("fetch") ||
    errorStr.includes("connection")
  )
    return "high";
  if (
    errorStr.includes("server error") ||
    errorStr.includes("internal") ||
    errorStr.includes("500")
  )
    return "critical";
  if (
    errorStr.includes("validation") ||
    errorStr.includes("required") ||
    errorStr.includes("invalid")
  )
    return "low";
  if (errorStr.includes("not found") || errorStr.includes("404")) return "low";

  return "medium";
};

// 🎨 Formateo inteligente de errores (combina mensaje base + específico)
const formatSmartError = (baseMessage: string, error: unknown): string => {
  if (!error) return baseMessage;

  const errorStr = error instanceof Error ? error.message : String(error);

  // 🛡️ Errores de permisos - formato amigable
  if (errorStr.includes("permission") || errorStr.includes("unauthorized")) {
    return `🚫 ${baseMessage}: Sin permisos suficientes`;
  }

  // 📋 Errores de validación - formato amigable
  if (errorStr.includes("validation") || errorStr.includes("required")) {
    return `📋 ${baseMessage}: ${errorStr}`;
  }

  // 🔐 Errores de autenticación
  if (errorStr.includes("auth") || errorStr.includes("login")) {
    return `🔐 ${baseMessage}: Problema de autenticación`;
  }

  // 🌐 Errores de red
  if (
    errorStr.includes("fetch") ||
    errorStr.includes("network") ||
    errorStr.includes("connection")
  ) {
    return `🌐 ${baseMessage}: Error de conexión`;
  }

  // 🔍 Error específico útil - combinarlo
  if (errorStr && errorStr !== "Error" && !baseMessage.includes(errorStr)) {
    return `${baseMessage}: ${errorStr}`;
  }

  return baseMessage;
};

// 🎯 Configuración inteligente basada en severidad
const getSmartConfig = (severity: "low" | "medium" | "high" | "critical") => {
  const configs = {
    low: {
      duration: 4000,
    },
    medium: {
      duration: 6000,
    },
    high: {
      duration: 8000,
      action: {
        label: "Reintentar",
        onClick: () => window.location.reload(),
      },
    },
    critical: {
      duration: 12000,
      action: {
        label: "Reportar",
        onClick: () => {
          console.error("Critical error reported:", new Date().toISOString());
          // Aquí podrías enviar a un servicio de logging
        },
      },
    },
  };

  return configs[severity];
};

// 🎯 Emojis automáticos por tipo de acción
const getActionEmoji = (actionType: string): string => {
  const emojis = {
    create: "✅",
    update: "🔄",
    delete: "🗑️",
    upload: "📤",
    download: "📥",
    ban: "🚫",
    unban: "✅",
    role: "👑",
    auth: "🔐",
    general: "📋",
  };

  return emojis[actionType as keyof typeof emojis] || "📋";
};

export const useSmartNotifications = () => {
  const notifications = useNotificationContext();

  // 🧠 EL ÚNICO MÉTODO QUE NECESITAS - Súper inteligente
  const withNotification = useCallback(
    async <T>(
      action: () => Promise<T>,
      messages: {
        loading: string;
        success?: string;
        error?: string;
      }
    ): Promise<T> => {
      // 🔍 Detectar automáticamente el tipo de acción
      const actionType = detectActionType(messages.loading);
      const emoji = getActionEmoji(actionType);

      // 🔄 Mostrar loading
      const loadingId = notifications.loading(messages.loading);

      try {
        const result = await action();

        // ✅ Éxito automático
        notifications.dismiss(loadingId);
        const successMsg =
          messages.success || `${emoji} Operación completada exitosamente`;
        notifications.success(successMsg);

        return result;
      } catch (error) {
        // ❌ Error inteligente multinivel
        notifications.dismiss(loadingId);

        const severity = detectErrorSeverity(error);
        const smartConfig = getSmartConfig(severity);
        const baseErrorMsg = messages.error || `❌ Error en la operación`;
        const formattedError = formatSmartError(baseErrorMsg, error);

        notifications.error(formattedError, smartConfig);

        throw error; // Re-lanzar para que el componente lo maneje si necesita
      }
    },
    [notifications]
  );

  // 🎯 Método aún más simple - solo loading message
  const notify = useCallback(
    async <T>(
      action: () => Promise<T>,
      loadingMessage: string,
      successMessage?: string
    ): Promise<T> => {
      return withNotification(action, {
        loading: loadingMessage,
        success: successMessage,
      });
    },
    [withNotification]
  );

  return {
    // 🧠 Método principal súper inteligente
    withNotification,

    // ⚡ Método ultra-simple
    notify,

    // 🔄 Acceso directo a notificaciones básicas si necesitas
    success: notifications.success,
    error: notifications.error,
    warning: notifications.warning,
    info: notifications.info,
    loading: notifications.loading,
  };
};

export default useSmartNotifications;
