import { describe, expect, it, beforeEach, vi } from "vitest";
import { useSessionStore } from "../session.store";
import type { POSSession } from "@/features/pos/types/models";
import {
  openSessionAction,
  closeSessionAction,
  suspendSessionAction,
  resumeSessionAction,
  getActiveSessionAction,
  getSessionWithSummaryAction,
} from "@/features/pos/session/server/actions";
import { createPOSError } from "@/features/pos/errors";

vi.mock("@/features/pos/session/server/actions", () => ({
  openSessionAction: vi.fn(),
  closeSessionAction: vi.fn(),
  suspendSessionAction: vi.fn(),
  resumeSessionAction: vi.fn(),
  getActiveSessionAction: vi.fn(),
  getSessionWithSummaryAction: vi.fn(),
}));

const session: POSSession = {
  id: "00000000-0000-0000-0000-000000000031",
  userId: "00000000-0000-0000-0000-000000000032",
  startTime: new Date("2025-01-01T10:00:00Z"),
  endTime: null,
  initialCash: 500,
  finalCash: null,
  expectedCash: null,
  cashDifference: null,
  status: "OPEN",
  notes: null,
  createdAt: new Date("2025-01-01T10:00:00Z"),
  updatedAt: new Date("2025-01-01T10:00:00Z"),
};

const initialState = useSessionStore.getState();

const resetStore = () => {
  useSessionStore.setState(initialState, true);
};

describe("useSessionStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it("loads active session successfully", async () => {
    vi.mocked(getActiveSessionAction).mockResolvedValue({ success: true, data: session });

    await useSessionStore.getState().loadActiveSession(session.userId);

    const state = useSessionStore.getState();
    expect(state.currentSession).toEqual(session);
    expect(state.isInitialized).toBe(true);
    expect(state.isError).toBe(false);
  });

  it("handles failure when loading session", async () => {
    vi.mocked(getActiveSessionAction).mockRejectedValue(new Error("DB down"));

    await useSessionStore.getState().loadActiveSession(session.userId);

    const state = useSessionStore.getState();
    expect(state.currentSession).toBeNull();
    expect(state.isError).toBe(true);
    expect(state.lastError).toBe("DB down");
  });

  it("opens session and updates state", async () => {
    vi.mocked(openSessionAction).mockResolvedValue({ success: true, data: session });

    await useSessionStore.getState().openSession(session.userId, session.initialCash, "Notas");

    const state = useSessionStore.getState();
    expect(state.currentSession).toEqual(session);
    expect(state.isInitialized).toBe(true);
    expect(state.isError).toBe(false);
  });

  it("surfaces error when open session fails", async () => {
    vi.mocked(openSessionAction).mockResolvedValue({
      success: false,
      error: createPOSError("SESSION_OPEN_FAILED", { hint: "Caja abierta" }).toJSON(),
    });

    await expect(
      useSessionStore.getState().openSession(session.userId, session.initialCash)
    ).rejects.toThrow("No fue posible abrir la sesión de caja.");

    const state = useSessionStore.getState();
    expect(state.isError).toBe(true);
    expect(state.lastError).toContain("No fue posible abrir la sesión de caja");
  });

  it("closes session and clears flags", async () => {
    vi.mocked(openSessionAction).mockResolvedValue({ success: true, data: session });
    await useSessionStore.getState().openSession(session.userId, session.initialCash);

    const closedSession = { ...session, status: "CLOSED", finalCash: 800, endTime: new Date() };

    vi.mocked(closeSessionAction).mockResolvedValue({ success: true, data: closedSession });

    await useSessionStore.getState().closeSession(800, "Cierre");

    const state = useSessionStore.getState();
    expect(state.currentSession).toEqual(closedSession);
    expect(state.isError).toBe(false);
  });

  it("rejects closing when backend fails", async () => {
    vi.mocked(openSessionAction).mockResolvedValue({ success: true, data: session });
    await useSessionStore.getState().openSession(session.userId, session.initialCash);

    vi.mocked(closeSessionAction).mockResolvedValue({
      success: false,
      error: createPOSError("SESSION_CLOSE_FAILED").toJSON(),
    });

    await expect(useSessionStore.getState().closeSession(0)).rejects.toThrow(
      "No fue posible cerrar la sesión de caja."
    );
    expect(useSessionStore.getState().isError).toBe(true);
  });

  it("fetches session summary and updates state", async () => {
    const summary = { transactionCount: 2, totalSales: 1000 };
    vi.mocked(openSessionAction).mockResolvedValue({ success: true, data: session });
    await useSessionStore.getState().openSession(session.userId, session.initialCash);

    vi.mocked(getSessionWithSummaryAction).mockResolvedValue({
      success: true,
      data: { session, summary } as any,
    });

    await useSessionStore.getState().fetchSessionSummary();

    const state = useSessionStore.getState();
    expect(state.sessionSummary).toEqual(summary);
    expect(state.isError).toBe(false);
  });
});
