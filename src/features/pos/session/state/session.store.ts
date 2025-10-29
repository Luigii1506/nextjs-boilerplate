/**
 * 🔐 POS SESSION STORE (Zustand)
 * ==============================
 *
 * Centralizes cashier session state (open/close register) so that POS and
 * Storefront share the same architectural pattern.
 */

"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  closeSessionAction,
  getActiveSessionAction,
  getSessionWithSummaryAction,
  openSessionAction,
  resumeSessionAction,
  suspendSessionAction,
} from "../server/actions";
import type { POSSession, POSSessionSummary } from "../../types/models";
import { POSSessionStatus } from "../../types/models";

interface SessionFlags {
  hasActiveSession: boolean;
  isSessionOpen: boolean;
  isSessionClosed: boolean;
  isSessionSuspended: boolean;
}

interface SessionStoreState extends SessionFlags {
  currentSession: POSSession | null;
  sessionSummary: POSSessionSummary | null;
  isLoading: boolean;
  isInitialized: boolean;
  isError: boolean;
  lastError: string | null;
}

interface SessionStoreActions {
  loadActiveSession: (userId: string) => Promise<void>;
  openSession: (
    userId: string,
    initialCash: number,
    notes?: string
  ) => Promise<void>;
  closeSession: (finalCash: number, notes?: string) => Promise<void>;
  suspendSession: (notes?: string) => Promise<void>;
  resumeSession: () => Promise<void>;
  fetchSessionSummary: () => Promise<void>;
  clearSession: () => void;
  setError: (error: string | null) => void;
}

type SessionStore = SessionStoreState & SessionStoreActions;

const STORE_NAME = "POS-Session-Store";

const initialFlags: SessionFlags = {
  hasActiveSession: false,
  isSessionOpen: false,
  isSessionClosed: false,
  isSessionSuspended: false,
};

const computeFlags = (
  session: POSSession | null
): SessionFlags => {
  const status = session?.status;
  return {
    hasActiveSession: !!session,
    isSessionOpen: status === POSSessionStatus.OPEN,
    isSessionClosed: status === POSSessionStatus.CLOSED,
    isSessionSuspended: status === POSSessionStatus.SUSPENDED,
  };
};

const initialState = (): SessionStoreState => ({
  currentSession: null,
  sessionSummary: null,
  isLoading: false,
  isInitialized: false,
  isError: false,
  lastError: null,
  ...initialFlags,
});

export const useSessionStore = create<SessionStore>()(
  devtools(
    (set, get) => ({
      ...initialState(),

      loadActiveSession: async (userId) => {
        if (!userId) {
          return;
        }

        set((state) => ({
          ...state,
          isLoading: true,
          isError: false,
          lastError: null,
        }));

        try {
          const result = await getActiveSessionAction(userId);

          if (result.success) {
            const session = result.data ?? null;
            set((state) => ({
              ...state,
              currentSession: session,
              sessionSummary: null,
              isLoading: false,
              isInitialized: true,
              isError: false,
              lastError: null,
              ...computeFlags(session),
            }));
          } else {
            set((state) => ({
              ...state,
              currentSession: null,
              sessionSummary: null,
              isLoading: false,
              isInitialized: true,
              isError: false,
              lastError: null,
              ...initialFlags,
            }));
          }
        } catch (error) {
          console.error("❌ [POS SESSION] Load active session failed:", error);
          const message =
            error instanceof Error ? error.message : "Failed to load session";
          set((state) => ({
            ...state,
            isLoading: false,
            isInitialized: true,
            isError: true,
            lastError: message,
            currentSession: null,
            sessionSummary: null,
            ...initialFlags,
          }));
        }
      },

      openSession: async (userId, initialCash, notes) => {
        set((state) => ({
          ...state,
          isLoading: true,
          isError: false,
          lastError: null,
        }));

        try {
          const result = await openSessionAction(userId, initialCash, notes);

          if (!result.success || !result.data) {
            const message = result.error ?? "Failed to open session";
            set((state) => ({
              ...state,
              isLoading: false,
              isError: true,
              lastError: message,
            }));
            throw new Error(message);
          }

          const session = result.data as POSSession;
          set((state) => ({
            ...state,
            currentSession: session,
            sessionSummary: null,
            isLoading: false,
            isInitialized: true,
            isError: false,
            lastError: null,
            ...computeFlags(session),
          }));
        } catch (error) {
          console.error("❌ [POS SESSION] Open session failed:", error);
          const message =
            error instanceof Error ? error.message : "Failed to open session";
          set((state) => ({
            ...state,
            isLoading: false,
            isError: true,
            lastError: message,
          }));
          throw error;
        }
      },

      closeSession: async (finalCash, notes) => {
        const session = get().currentSession;
        if (!session?.id) {
          const message = "No active session to close";
          set((state) => ({
            ...state,
            isError: true,
            lastError: message,
          }));
          throw new Error(message);
        }

        set((state) => ({
          ...state,
          isLoading: true,
          isError: false,
          lastError: null,
        }));

        try {
          const result = await closeSessionAction(session.id, finalCash, notes);

          if (!result.success || !result.data) {
            const message = result.error ?? "Failed to close session";
            set((state) => ({
              ...state,
              isLoading: false,
              isError: true,
              lastError: message,
            }));
            throw new Error(message);
          }

          const closedSession = result.data as POSSession;
          set((state) => ({
            ...state,
            currentSession: closedSession,
            sessionSummary: null,
            isLoading: false,
            isError: false,
            lastError: null,
            ...computeFlags(closedSession),
          }));
        } catch (error) {
          console.error("❌ [POS SESSION] Close session failed:", error);
          const message =
            error instanceof Error ? error.message : "Failed to close session";
          set((state) => ({
            ...state,
            isLoading: false,
            isError: true,
            lastError: message,
          }));
          throw error;
        }
      },

      suspendSession: async (notes) => {
        const session = get().currentSession;
        if (!session?.id) {
          const message = "No active session to suspend";
          set((state) => ({
            ...state,
            isError: true,
            lastError: message,
          }));
          throw new Error(message);
        }

        set((state) => ({
          ...state,
          isLoading: true,
          isError: false,
          lastError: null,
        }));

        try {
          const result = await suspendSessionAction(session.id, notes);
          if (!result.success || !result.data) {
            const message = result.error ?? "Failed to suspend session";
            set((state) => ({
              ...state,
              isLoading: false,
              isError: true,
              lastError: message,
            }));
            throw new Error(message);
          }

          const suspended = result.data as POSSession;
          set((state) => ({
            ...state,
            currentSession: suspended,
            isLoading: false,
            isError: false,
            lastError: null,
            ...computeFlags(suspended),
          }));
        } catch (error) {
          console.error("❌ [POS SESSION] Suspend session failed:", error);
          const message =
            error instanceof Error
              ? error.message
              : "Failed to suspend session";
          set((state) => ({
            ...state,
            isLoading: false,
            isError: true,
            lastError: message,
          }));
          throw error;
        }
      },

      resumeSession: async () => {
        const session = get().currentSession;
        if (!session?.id) {
          const message = "No suspended session to resume";
          set((state) => ({
            ...state,
            isError: true,
            lastError: message,
          }));
          throw new Error(message);
        }

        set((state) => ({
          ...state,
          isLoading: true,
          isError: false,
          lastError: null,
        }));

        try {
          const result = await resumeSessionAction(session.id);
          if (!result.success || !result.data) {
            const message = result.error ?? "Failed to resume session";
            set((state) => ({
              ...state,
              isLoading: false,
              isError: true,
              lastError: message,
            }));
            throw new Error(message);
          }

          const resumed = result.data as POSSession;
          set((state) => ({
            ...state,
            currentSession: resumed,
            isLoading: false,
            isError: false,
            lastError: null,
            ...computeFlags(resumed),
          }));
        } catch (error) {
          console.error("❌ [POS SESSION] Resume session failed:", error);
          const message =
            error instanceof Error
              ? error.message
              : "Failed to resume session";
          set((state) => ({
            ...state,
            isLoading: false,
            isError: true,
            lastError: message,
          }));
          throw error;
        }
      },

      fetchSessionSummary: async () => {
        const session = get().currentSession;
        if (!session?.id) {
          return;
        }

        set((state) => ({
          ...state,
          isLoading: true,
          isError: false,
          lastError: null,
        }));

        try {
          const result = await getSessionWithSummaryAction(session.id);
          if (!result.success || !result.data) {
            const message = result.error ?? "Failed to load session summary";
            set((state) => ({
              ...state,
              isLoading: false,
              isError: true,
              lastError: message,
            }));
            return;
          }

          set((state) => ({
            ...state,
            sessionSummary: result.data.summary ?? null,
            currentSession: result.data.session ?? state.currentSession,
            isLoading: false,
            isError: false,
            lastError: null,
            ...computeFlags(result.data.session ?? state.currentSession),
          }));
        } catch (error) {
          console.error("❌ [POS SESSION] Fetch summary failed:", error);
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch session summary";
          set((state) => ({
            ...state,
            isLoading: false,
            isError: true,
            lastError: message,
          }));
        }
      },

      clearSession: () =>
        set(() => ({
          ...initialState(),
        })),

      setError: (error) =>
        set((state) => ({
          ...state,
          isError: !!error,
          lastError: error,
        })),
    }),
    { name: STORE_NAME }
  )
);

// ---------------------------------------------------------------------------
// SELECTOR HOOKS
// ---------------------------------------------------------------------------

export const useSessionState = () => {
  const currentSession = useSessionStore((state) => state.currentSession);
  const sessionSummary = useSessionStore((state) => state.sessionSummary);

  return useMemo(
    () => ({
      currentSession,
      sessionSummary,
    }),
    [currentSession, sessionSummary]
  );
};

export const useSessionStatus = () => {
  const isLoading = useSessionStore((state) => state.isLoading);
  const isInitialized = useSessionStore((state) => state.isInitialized);
  const isError = useSessionStore((state) => state.isError);
  const lastError = useSessionStore((state) => state.lastError);
  const hasActiveSession = useSessionStore(
    (state) => state.hasActiveSession
  );
  const isSessionOpen = useSessionStore((state) => state.isSessionOpen);
  const isSessionClosed = useSessionStore(
    (state) => state.isSessionClosed
  );
  const isSessionSuspended = useSessionStore(
    (state) => state.isSessionSuspended
  );

  return useMemo(
    () => ({
      isLoading,
      isInitialized,
      isError,
      lastError,
      hasActiveSession,
      isSessionOpen,
      isSessionClosed,
      isSessionSuspended,
    }),
    [
      hasActiveSession,
      isError,
      isInitialized,
      isLoading,
      isSessionClosed,
      isSessionOpen,
      isSessionSuspended,
      lastError,
    ]
  );
};

export const useSessionFlags = () => {
  const hasActiveSession = useSessionStore(
    (state) => state.hasActiveSession
  );
  const isSessionOpen = useSessionStore((state) => state.isSessionOpen);
  const isSessionClosed = useSessionStore(
    (state) => state.isSessionClosed
  );
  const isSessionSuspended = useSessionStore(
    (state) => state.isSessionSuspended
  );

  return useMemo(
    () => ({
      hasActiveSession,
      isSessionOpen,
      isSessionClosed,
      isSessionSuspended,
    }),
    [hasActiveSession, isSessionClosed, isSessionOpen, isSessionSuspended]
  );
};

export const useIsSessionOpen = () =>
  useSessionStore((state) => state.isSessionOpen);

export const useHasActiveSession = () =>
  useSessionStore((state) => state.hasActiveSession);

export const useIsSessionClosed = () =>
  useSessionStore((state) => state.isSessionClosed);

export const useIsSessionSuspended = () =>
  useSessionStore((state) => state.isSessionSuspended);

// ---------------------------------------------------------------------------
// ACTION HOOK
// ---------------------------------------------------------------------------

export const useSessionActions = () => {
  const loadActiveSession = useSessionStore(
    (state) => state.loadActiveSession
  );
  const openSession = useSessionStore((state) => state.openSession);
  const closeSession = useSessionStore((state) => state.closeSession);
  const suspendSession = useSessionStore(
    (state) => state.suspendSession
  );
  const resumeSession = useSessionStore((state) => state.resumeSession);
  const fetchSessionSummary = useSessionStore(
    (state) => state.fetchSessionSummary
  );
  const clearSession = useSessionStore((state) => state.clearSession);
  const setError = useSessionStore((state) => state.setError);

  return useMemo(
    () => ({
      loadActiveSession,
      openSession,
      closeSession,
      suspendSession,
      resumeSession,
      fetchSessionSummary,
      clearSession,
      setError,
    }),
    [
      clearSession,
      closeSession,
      fetchSessionSummary,
      loadActiveSession,
      openSession,
      resumeSession,
      setError,
      suspendSession,
    ]
  );
};

/**
 * Helper hook that exposes both state and actions,
 * similar to the legacy context's public API.
 */
export const useSessionStoreFacade = () => {
  const state = useSessionState();
  const status = useSessionStatus();
  const actions = useSessionActions();

  return useMemo(
    () => ({
      ...state,
      ...status,
      ...actions,
    }),
    [actions, state, status]
  );
};

type SessionState = SessionStoreState;
export type { SessionState };
