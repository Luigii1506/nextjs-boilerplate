/**
 * 🔐 POS Session Store (Zustand)
 * ==============================
 *
 * Global state management for POS sessions using Zustand.
 * Replaces the old usePOSSession hook with a centralized store.
 *
 * Benefits:
 * - Single source of truth
 * - No Provider nesting required
 * - Automatic synchronization across components
 * - Better performance (selective subscriptions)
 *
 * @module pos/stores/sessionStore
 * @version 2.0.0
 * Updated: 2025-10-28 - Stabilized session action selectors for React 19 snapshot compliance
 */

"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as actions from "../session/server/actions";
import type { POSSessionStatus } from "../types/models";

// ========================================
// TYPES
// ========================================

interface POSSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date | null;
  status: POSSessionStatus;
  initialCash: number;
  finalCash: number | null;
  notes: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface POSSessionSummary {
  transactionCount: number;
  totalSales: number;
  totalVoids: number;
  totalRefunds: number;
  netSales: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  mixedSales: number;
  totalItemsSold: number;
  averageTicket: number;
}

interface SessionState {
  // State
  currentSession: POSSession | null;
  sessionSummary: POSSessionSummary | null;
  isLoading: boolean;
  error: string | null;

  // Computed selectors (stable functions)
  hasActiveSession: () => boolean;
  isSessionOpen: () => boolean;
  isSessionClosed: () => boolean;
  isSessionSuspended: () => boolean;

  // Actions
  loadActiveSession: (userId: string) => Promise<void>;
  openSession: (
    userId: string,
    initialCash: number,
    notes?: string
  ) => Promise<void>;
  closeSession: (finalCash: number, notes?: string) => Promise<void>;
  suspendSession: (notes?: string) => Promise<void>;
  resumeSession: () => Promise<void>;
  clearSession: () => void;
  setError: (error: string | null) => void;
}

// ========================================
// STORE
// ========================================

export const useSessionStore = create<SessionState>()(
  devtools(
    (set, get) => ({
      // ========================================
      // INITIAL STATE
      // ========================================

      currentSession: null,
      sessionSummary: null,
      isLoading: false,
      error: null,

      // ========================================
      // ACTIONS
      // ========================================

      /**
       * Load active session for a user
       */
      loadActiveSession: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const result = await actions.getActiveSessionAction(userId);

          if (result.success && result.data) {
            set({
              currentSession: result.data,
              isLoading: false,
              error: null,
            });
          } else {
            // No active session found (not an error)
            set({
              currentSession: null,
              isLoading: false,
              error: null,
            });
          }
        } catch (err) {
          console.error("[SessionStore] Load active session error:", err);
          set({
            error:
              err instanceof Error ? err.message : "Failed to load session",
            isLoading: false,
          });
        }
      },

      /**
       * Open a new session
       */
      openSession: async (
        userId: string,
        initialCash: number,
        notes?: string
      ) => {
        set({ isLoading: true, error: null });

        try {
          const result = await actions.openSessionAction(
            userId,
            initialCash,
            notes
          );

          if (result.success && result.data) {
            set({
              currentSession: result.data,
              sessionSummary: null,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(result.error || "Failed to open session");
          }
        } catch (err) {
          console.error("[SessionStore] Open session error:", err);
          const errorMsg =
            err instanceof Error ? err.message : "Failed to open session";
          set({
            error: errorMsg,
            isLoading: false,
          });
          throw err;
        }
      },

      /**
       * Close the current session
       */
      closeSession: async (finalCash: number, notes?: string) => {
        const currentSession = get().currentSession;

        if (!currentSession?.id) {
          const error = "No active session to close";
          set({ error });
          throw new Error(error);
        }

        set({ isLoading: true, error: null });

        try {
          const result = await actions.closeSessionAction(
            currentSession.id,
            finalCash,
            notes
          );

          if (result.success && result.data) {
            set({
              currentSession: result.data.session,
              sessionSummary: result.data.summary,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(result.error || "Failed to close session");
          }
        } catch (err) {
          console.error("[SessionStore] Close session error:", err);
          const errorMsg =
            err instanceof Error ? err.message : "Failed to close session";
          set({
            error: errorMsg,
            isLoading: false,
          });
          throw err;
        }
      },

      /**
       * Suspend the current session
       */
      suspendSession: async (notes?: string) => {
        const currentSession = get().currentSession;

        if (!currentSession?.id) {
          const error = "No active session to suspend";
          set({ error });
          throw new Error(error);
        }

        set({ isLoading: true, error: null });

        try {
          const result = await actions.suspendSessionAction(
            currentSession.id,
            notes
          );

          if (result.success && result.data) {
            set({
              currentSession: result.data,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(result.error || "Failed to suspend session");
          }
        } catch (err) {
          console.error("[SessionStore] Suspend session error:", err);
          const errorMsg =
            err instanceof Error ? err.message : "Failed to suspend session";
          set({
            error: errorMsg,
            isLoading: false,
          });
          throw err;
        }
      },

      /**
       * Resume a suspended session
       */
      resumeSession: async () => {
        const currentSession = get().currentSession;

        if (!currentSession?.id) {
          const error = "No session to resume";
          set({ error });
          throw new Error(error);
        }

        set({ isLoading: true, error: null });

        try {
          const result = await actions.resumeSessionAction(currentSession.id);

          if (result.success && result.data) {
            set({
              currentSession: result.data,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(result.error || "Failed to resume session");
          }
        } catch (err) {
          console.error("[SessionStore] Resume session error:", err);
          const errorMsg =
            err instanceof Error ? err.message : "Failed to resume session";
          set({
            error: errorMsg,
            isLoading: false,
          });
          throw err;
        }
      },

      /**
       * Clear session state (logout, etc.)
       */
      clearSession: () => {
        set({
          currentSession: null,
          sessionSummary: null,
          error: null,
        });
      },

      /**
       * Set error manually
       */
      setError: (error: string | null) => {
        set({ error });
      },

      // ========================================
      // COMPUTED SELECTORS
      // ========================================

      /**
       * Check if there's an active session
       */
      hasActiveSession: () => {
        return !!get().currentSession;
      },

      /**
       * Check if session is OPEN
       */
      isSessionOpen: () => {
        return get().currentSession?.status === "OPEN";
      },

      /**
       * Check if session is CLOSED
       */
      isSessionClosed: () => {
        return get().currentSession?.status === "CLOSED";
      },

      /**
       * Check if session is SUSPENDED
       */
      isSessionSuspended: () => {
        return get().currentSession?.status === "SUSPENDED";
      },
    }),
    { name: "POS-Session" } // DevTools name
  )
);

// ========================================
// SELECTORS & ACTION HOOKS
// ========================================

/**
 * Selector hooks for convenience
 */
export const useIsSessionOpen = () =>
  useSessionStore((state) => state.isSessionOpen());
export const useHasActiveSession = () =>
  useSessionStore((state) => state.hasActiveSession());
export const useIsSessionClosed = () =>
  useSessionStore((state) => state.isSessionClosed());
export const useIsSessionSuspended = () =>
  useSessionStore((state) => state.isSessionSuspended());

export type { SessionState };

/**
 * Stable session actions hook
 * ---------------------------
 * React 19 calls the underlying getSnapshot twice during render.
 * Creating a new object in the selector breaks caching and triggers the
 * "getSnapshot should be cached" warning. We subscribe to each action
 * individually and memoize the aggregated object so React always sees
 * a stable reference between renders.
 */
export const useSessionActions = () => {
  const loadActiveSession = useSessionStore((state) => state.loadActiveSession);
  const openSession = useSessionStore((state) => state.openSession);
  const closeSession = useSessionStore((state) => state.closeSession);
  const suspendSession = useSessionStore((state) => state.suspendSession);
  const resumeSession = useSessionStore((state) => state.resumeSession);
  const clearSession = useSessionStore((state) => state.clearSession);
  const setError = useSessionStore((state) => state.setError);

  return useMemo(
    () => ({
      loadActiveSession,
      openSession,
      closeSession,
      suspendSession,
      resumeSession,
      clearSession,
      setError,
    }),
    [
      loadActiveSession,
      openSession,
      closeSession,
      suspendSession,
      resumeSession,
      clearSession,
      setError,
    ]
  );
};
