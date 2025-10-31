import { describe, expect, it, vi, beforeEach } from "vitest";
import { openSessionAction, closeSessionAction } from "../actions";
import { openSessionUseCase, closeSessionUseCase } from "../use-cases";
import { revalidatePath } from "next/cache";
import { createPOSError } from "@/features/pos/errors";
import type { POSSessionStatus, POSSession } from "@/features/pos/types/models";

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (key: string) => {
      const map: Record<string, string> = {
        "x-forwarded-for": "127.0.0.1",
        "user-agent": "vitest",
      };
      return map[key.toLowerCase()] ?? null;
    },
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("../use-cases", () => ({
  openSessionUseCase: vi.fn(),
  closeSessionUseCase: vi.fn(),
  suspendSessionUseCase: vi.fn(),
  resumeSessionUseCase: vi.fn(),
}));

const sessionBase: POSSession = {
  id: "00000000-0000-0000-0000-000000000021",
  userId: "00000000-0000-0000-0000-000000000022",
  startTime: new Date("2025-01-01T10:00:00Z"),
  endTime: null,
  initialCash: 1000,
  finalCash: null,
  expectedCash: null,
  cashDifference: null,
  status: "OPEN" as POSSessionStatus,
  notes: null,
  createdAt: new Date("2025-01-01T10:00:00Z"),
  updatedAt: new Date("2025-01-01T10:00:00Z"),
};

describe("POS session server actions", () => {
  const openSessionUseCaseMock = vi.mocked(openSessionUseCase);
  const closeSessionUseCaseMock = vi.mocked(closeSessionUseCase);
  const revalidatePathMock = vi.mocked(revalidatePath);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success when open session use-case resolves", async () => {
    openSessionUseCaseMock.mockResolvedValue(sessionBase);

    const result = await openSessionAction(sessionBase.userId, sessionBase.initialCash, "Notas");

    expect(result.success).toBe(true);
    expect(result.data).toEqual(sessionBase);
    expect(openSessionUseCaseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: sessionBase.userId,
        initialCash: sessionBase.initialCash,
        notes: "Notas",
      }),
      expect.objectContaining({
        ipAddress: "127.0.0.1",
        userAgent: "vitest",
      })
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/pos");
  });

  it("maps domain errors when open session use-case fails", async () => {
    const domainError = createPOSError("SESSION_OPEN_FAILED", {
      hint: "Caja ya abierta",
    });
    openSessionUseCaseMock.mockRejectedValue(domainError);

    const result = await openSessionAction(sessionBase.userId, sessionBase.initialCash);

    expect(result.success).toBe(false);
    expect(result.error).toMatchObject({ code: domainError.code, hint: "Caja ya abierta" });
  });

  it("closes session and returns session + summary payload", async () => {
    const closedSession = {
      ...sessionBase,
      status: "CLOSED" as POSSessionStatus,
      finalCash: 1100,
      endTime: new Date("2025-01-01T20:00:00Z"),
    };

    const summary = {
      totalSales: 4000,
      totalVoids: 0,
      totalRefunds: 0,
      netSales: 4000,
      transactionCount: 10,
      cashSales: 2000,
      cardSales: 2000,
      transferSales: 0,
      mixedSales: 0,
      totalItemsSold: 25,
      averageTicket: 400,
    };

    closeSessionUseCaseMock.mockResolvedValue({ session: closedSession, summary });

    const result = await closeSessionAction(closedSession.id, 1100, "Cierre");

    expect(result.success).toBe(true);
    expect(result.data?.session).toEqual(closedSession);
    expect(result.data?.summary).toEqual(summary);
    expect(revalidatePathMock).toHaveBeenCalledWith("/pos");
    expect(closeSessionUseCaseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: closedSession.id,
        finalCash: 1100,
        notes: "Cierre",
      }),
      expect.objectContaining({ ipAddress: "127.0.0.1" })
    );
  });

  it("handles infrastructure error when close session fails", async () => {
    closeSessionUseCaseMock.mockRejectedValue(
      createPOSError("SESSION_CLOSE_FAILED", { hint: "DB down" })
    );

    const result = await closeSessionAction(sessionBase.id, 0);

    expect(result.success).toBe(false);
    expect(result.error).toMatchObject({ code: "POS_SESSION_CLOSE_FAILED", hint: "DB down" });
  });
});
