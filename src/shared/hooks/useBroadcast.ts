/**
 * 📡 USE BROADCAST HOOK
 *
 * Hook súper simple para comunicación entre pestañas
 * Funcional, limpio y reutilizable para cualquier caso de uso
 */

"use client";

import { useCallback, useRef, useEffect } from "react";

/**
 * 📡 Hook principal de broadcast - SÚPER SIMPLE
 */
export function useBroadcast(channelName: string) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  // 🔧 Inicializar canal
  useEffect(() => {
    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel(channelName);
    }
    return () => channelRef.current?.close();
  }, [channelName]);

  // 📤 Enviar mensaje - UNA SOLA FUNCIÓN
  const send = useCallback((type: string, data?: any) => {
    if (!channelRef.current) return;

    try {
      channelRef.current.postMessage({
        type,
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.debug("Broadcast error:", error);
    }
  }, []);

  // 📥 Escuchar mensajes - UNA SOLA FUNCIÓN
  const listen = useCallback((callback: (type: string, data?: any) => void) => {
    if (!channelRef.current) return () => {};

    const handler = (event: MessageEvent) => {
      callback(event.data.type, event.data.data);
    };

    channelRef.current.addEventListener("message", handler);

    return () => {
      channelRef.current?.removeEventListener("message", handler);
    };
  }, []);

  return { send, listen };
}

/**
 * 🎯 Hook especializado para Feature Flags - SÚPER ESPECÍFICO
 */
export function useFeatureFlagsBroadcast() {
  const { send, listen } = useBroadcast("feature-flags-sync");

  const notifyFlagChange = useCallback(
    (flagKey: string) => {
      send("FLAG_CHANGED", { flagKey });
    },
    [send]
  );

  const onFlagChange = useCallback(
    (callback: (flagKey: string) => void) => {
      return listen((type, data) => {
        if (type === "FLAG_CHANGED" && data?.flagKey) {
          callback(data.flagKey);
        }
      });
    },
    [listen]
  );

  return { notifyFlagChange, onFlagChange };
}

/**
 * 🔐 Hook especializado para Auth - EJEMPLO DE USO
 */
export function useAuthBroadcast() {
  const { send, listen } = useBroadcast("auth-sync");

  const notifyLogin = useCallback(
    (userId: string) => {
      send("LOGIN", { userId });
    },
    [send]
  );

  const notifyLogout = useCallback(() => {
    send("LOGOUT");
  }, [send]);

  const onAuthChange = useCallback(
    (callback: (type: "LOGIN" | "LOGOUT", userId?: string) => void) => {
      return listen((type, data) => {
        if (type === "LOGIN" || type === "LOGOUT") {
          callback(type, data?.userId);
        }
      });
    },
    [listen]
  );

  return { notifyLogin, notifyLogout, onAuthChange };
}

/**
 * 📊 Hook especializado para Data Sync - EJEMPLO DE USO
 */
export function useDataBroadcast() {
  const { send, listen } = useBroadcast("data-sync");

  const notifyDataChange = useCallback(
    (entity: string, action: string, id?: string) => {
      send("DATA_CHANGED", { entity, action, id });
    },
    [send]
  );

  const onDataChange = useCallback(
    (callback: (entity: string, action: string, id?: string) => void) => {
      return listen((type, data) => {
        if (type === "DATA_CHANGED" && data?.entity && data?.action) {
          callback(data.entity, data.action, data.id);
        }
      });
    },
    [listen]
  );

  return { notifyDataChange, onDataChange };
}
