"use client";
/**
 * 🎣 useSession Hook
 * ==================
 *
 * Hook para gestionar sesiones POS.
 * Provee métodos para abrir, cerrar, y consultar sesiones.
 *
 * @module pos/session/hooks/useSession
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import * as actions from "../server/actions";
import type { POSSessionStatus } from "../../types/models";
import { logger } from "@/shared/utils/logger";

export interface UsePOSSessionOptions {
  autoLoad?: boolean;
}

export interface UsePOSSessionReturn {
  // State
  currentSession: any | null;
  sessionSummary: any | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  openSession: (initialCash: number, notes?: string) => Promise<void>;
  closeSession: (finalCash: number, notes?: string) => Promise<void>;
  suspendSession: (notes?: string) => Promise<void>;
  resumeSession: () => Promise<void>;
  loadActiveSession: () => Promise<void>;
  loadSessionWithSummary: (sessionId: string) => Promise<void>;
  loadSessionHistory: (limit?: number, status?: POSSessionStatus) => Promise<void>;

  // Computed
  hasActiveSession: boolean;
  isSessionOpen: boolean;
  isSessionClosed: boolean;
  isSessionSuspended: boolean;
}

/**
 * Hook para gestionar sesiones POS
 */
export function usePOSSession(
  options: UsePOSSessionOptions = {}
): UsePOSSessionReturn {
  const { autoLoad = false } = options;
  const { user, isAuthenticated } = useAuth();

  // ========================================
  // STATE
  // ========================================

  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [sessionSummary, setSessionSummary] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // COMPUTED
  // ========================================

  const hasActiveSession = currentSession !== null;
  const isSessionOpen = currentSession?.status === "OPEN";
  const isSessionClosed = currentSession?.status === "CLOSED";
  const isSessionSuspended = currentSession?.status === "SUSPENDED";

  // ========================================
  // ACTIONS
  // ========================================

  /**
   * Cargar sesión activa
   */
  const loadActiveSession = useCallback(async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await actions.getActiveSessionAction(user?.id);

      if (result.success) {
        setCurrentSession(result.data);
      } else {
        setError(result.error || "Failed to load active session");
        setCurrentSession(null);
      }
    } catch (err) {
      logger.error("usePOSSession: load active session error", {
        error: err,
      });
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Cargar sesión con resumen
   */
  const loadSessionWithSummary = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await actions.getSessionWithSummaryAction(sessionId);

      if (result.success && result.data) {
        setCurrentSession(result.data.session);
        setSessionSummary(result.data.summary);
      } else {
        setError(result.error || "Failed to load session summary");
      }
    } catch (err) {
      logger.error("usePOSSession: load session with summary error", {
        error: err,
      });
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Abrir nueva sesión
   */
  const openSession = useCallback(
    async (initialCash: number, notes?: string) => {
      if (!user?.id) {
        setError("User not authenticated");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await actions.openSessionAction(
          user.id,
          initialCash,
          notes
        );

        if (result.success) {
          setCurrentSession(result.data);
        } else {
          setError(result.error || "Failed to open session");
          throw new Error(result.error || "Failed to open session");
        }
      } catch (err) {
        logger.error("usePOSSession: open session error", { error: err });
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  /**
   * Cerrar sesión
   */
  const closeSession = useCallback(
    async (finalCash: number, notes?: string) => {
      if (!currentSession?.id) {
        setError("No active session");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await actions.closeSessionAction(
          currentSession.id,
          finalCash,
          notes
        );

        if (result.success && result.data) {
          setCurrentSession(result.data.session);
          setSessionSummary(result.data.summary);
        } else {
          setError(result.error || "Failed to close session");
          throw new Error(result.error || "Failed to close session");
        }
      } catch (err) {
        logger.error("usePOSSession: close session error", { error: err });
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession?.id]
  );

  /**
   * Suspender sesión
   */
  const suspendSession = useCallback(
    async (notes?: string) => {
      if (!currentSession?.id) {
        setError("No active session");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await actions.suspendSessionAction(
          currentSession.id,
          notes
        );

        if (result.success) {
          setCurrentSession(result.data);
        } else {
          setError(result.error || "Failed to suspend session");
          throw new Error(result.error || "Failed to suspend session");
        }
      } catch (err) {
        logger.error("usePOSSession: suspend session error", { error: err });
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession?.id]
  );

  /**
   * Reanudar sesión
   */
  const resumeSession = useCallback(async () => {
    if (!currentSession?.id) {
      setError("No session to resume");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await actions.resumeSessionAction(currentSession.id);

      if (result.success) {
        setCurrentSession(result.data);
      } else {
        setError(result.error || "Failed to resume session");
        throw new Error(result.error || "Failed to resume session");
      }
    } catch (err) {
      logger.error("usePOSSession: resume session error", { error: err });
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession?.id]);

  /**
   * Cargar historial de sesiones
   */
  const loadSessionHistory = useCallback(
    async (limit: number = 10, status?: POSSessionStatus) => {
      if (!user?.id) {
        setError("User not authenticated");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await actions.getSessionHistoryAction(
          user?.id,
          limit,
          status
        );

        if (!result.success) {
          setError(result.error || "Failed to load session history");
        }

        // Return result for external use
        return result;
      } catch (err) {
        logger.error("usePOSSession: load session history error", {
          error: err,
        });
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  // ========================================
  // EFFECTS
  // ========================================

  // Auto-load active session on mount
  useEffect(() => {
    if (user?.id && !currentSession) {
      loadActiveSession();
    }
  }, [user?.id]); // Only run when user changes, not on every render

  // ========================================
  // RETURN
  // ========================================

  return {
    // State
    currentSession,
    sessionSummary,
    isLoading,
    error,

    // Actions
    openSession,
    closeSession,
    suspendSession,
    resumeSession,
    loadActiveSession,
    loadSessionWithSummary,
    loadSessionHistory,

    // Computed
    hasActiveSession,
    isSessionOpen,
    isSessionClosed,
    isSessionSuspended,
  };
}
