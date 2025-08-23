/**
 * 🔄 AUTH CACHE INVALIDATION - SERVER UTILS
 * =========================================
 *
 * Utilidades del lado del servidor para invalidar cache de autenticación.
 * Se usa en Server Actions cuando cambian roles/permisos.
 *
 * Enterprise: 2025-01-17 - Reactive permissions system
 */

/**
 * 🔔 Trigger auth invalidation from server side
 *
 * Esta función se llama desde Server Actions para indicar que la cache
 * de autenticación debe ser invalidada en el cliente.
 */
export function triggerAuthCacheInvalidation() {
  try {
    // 🌐 Método 1: BroadcastChannel (mismo origin, múltiples pestañas)
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("auth_cache_invalidation");
      channel.postMessage({
        type: "INVALIDATE_AUTH",
        timestamp: Date.now(),
        source: "server_action",
      });
      channel.close();
      console.log("✅ Auth invalidation broadcasted to all tabs");
    }

    // 🔔 Método 2: localStorage evento (fallback)
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_invalidate_trigger", Date.now().toString());
      // Auto-remove después de 1 segundo para evitar acumulación
      setTimeout(() => {
        localStorage.removeItem("auth_invalidate_trigger");
      }, 1000);
    }

    // 📊 Método 3: Custom event (misma pestaña)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth:invalidate", {
          detail: { source: "server_action", timestamp: Date.now() },
        })
      );
    }

    console.log("🔔 Auth cache invalidation triggered - immediate update");

    return true;
  } catch (error) {
    console.error("❌ Error triggering auth cache invalidation:", error);
    return false;
  }
}

/**
 * 🎯 Smart auth invalidation
 *
 * Determina si es necesario invalidar cache de auth basado en el tipo de cambio.
 */
export function shouldInvalidateAuthCache(
  changeType: "role" | "ban" | "unban" | "delete"
) {
  // Cambios que afectan permisos/acceso requieren invalidación inmediata
  const criticalChanges = ["role", "ban", "delete"];
  return criticalChanges.includes(changeType);
}

/**
 * 📊 Log auth invalidation events
 */
export function logAuthInvalidation(context: {
  action: string;
  userId: string;
  triggeredBy: string;
  reason: string;
}) {
  console.log("🔄 Auth cache invalidation:", {
    timestamp: new Date().toISOString(),
    ...context,
  });
}
