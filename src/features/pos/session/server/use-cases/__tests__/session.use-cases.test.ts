import { describe, expect, it, vi } from "vitest";
import { POSSessionStatus, type POSSession } from "@/features/pos/types/models";
import { openSessionUseCase } from "../openSession.use-case";
import { closeSessionUseCase } from "../closeSession.use-case";
import { suspendSessionUseCase } from "../suspendSession.use-case";
import { resumeSessionUseCase } from "../resumeSession.use-case";
import {
  auditSessionOpened,
  auditSessionClosed,
  auditSessionSuspended,
  auditSessionResumed,
} from "@/features/pos/audit/posAudit.service";
import {
  createSession,
  closeSession,
  calculateSessionSummary,
  suspendSession,
  resumeSession,
} from "@/features/pos/session/server/queries";
import { createPOSError } from "@/features/pos/errors";

vi.mock("@/features/pos/session/server/queries", () => ({
  createSession: vi.fn(),
  closeSession: vi.fn(),
  calculateSessionSummary: vi.fn(),
  suspendSession: vi.fn(),
  resumeSession: vi.fn(),
}));

vi.mock("@/features/pos/audit/posAudit.service", () => ({
  auditSessionOpened: vi.fn(),
  auditSessionClosed: vi.fn(),
  auditSessionSuspended: vi.fn(),
  auditSessionResumed: vi.fn(),
}));

const sessionId = "00000000-0000-0000-0000-000000000001";
const userId = "00000000-0000-0000-0000-000000000002";

const baseSession: POSSession = {
  id: sessionId,
  userId,
  startTime: new Date("2025-01-01T10:00:00Z"),
  endTime: null,
  initialCash: 1500,
  finalCash: null,
  expectedCash: null,
  cashDifference: null,
  status: POSSessionStatus.OPEN,
  notes: null,
  createdAt: new Date("2025-01-01T10:00:00Z"),
  updatedAt: new Date("2025-01-01T10:00:00Z"),
};

describe("POS session use-cases", () => {
  const createSessionMock = vi.mocked(createSession);
  const auditSessionOpenedMock = vi.mocked(auditSessionOpened);
  const closeSessionMock = vi.mocked(closeSession);
  const calculateSessionSummaryMock = vi.mocked(calculateSessionSummary);
  const auditSessionClosedMock = vi.mocked(auditSessionClosed);

  it("opens a session and records audit metadata", async () => {
    createSessionMock.mockResolvedValue({ ...baseSession });

    const result = await openSessionUseCase(
      {
        userId,
        initialCash: baseSession.initialCash,
        notes: "Morning shift",
      },
      {
        userId: baseSession.userId,
        ipAddress: "127.0.0.1",
        userAgent: "vitest",
      }
    );

    expect(result).toEqual(baseSession);
    expect(createSessionMock).toHaveBeenCalledWith(
      userId,
      baseSession.initialCash,
      "Morning shift"
    );
    expect(auditSessionOpenedMock).toHaveBeenCalledWith(
      expect.objectContaining({
        session: baseSession,
        context: expect.objectContaining({
          userId,
          ipAddress: "127.0.0.1",
          userAgent: "vitest",
        }),
      })
    );
  });

  it("throws a domain error when validation fails", async () => {
    await expect(
      openSessionUseCase({
        userId,
        // @ts-expect-error intentional invalid input for test
        initialCash: -50,
      })
    ).rejects.toMatchObject({
      code: "POS_SESSION_VALIDATION_FAILED",
    });
    expect(createSessionMock).not.toHaveBeenCalled();
    expect(auditSessionOpenedMock).not.toHaveBeenCalled();
  });

  it("closes a session and captures aggregated totals", async () => {
    const closedSession: POSSession = {
      ...baseSession,
      endTime: new Date("2025-01-01T18:00:00Z"),
      finalCash: 3200,
      expectedCash: 3195,
      cashDifference: 5,
      status: POSSessionStatus.CLOSED,
    };

    const summary = {
      transactionCount: 10,
      totalSales: 42000,
      totalVoids: 1000,
      totalRefunds: 500,
      netSales: 40500,
      cashSales: 20000,
      cardSales: 15000,
      transferSales: 5000,
      mixedSales: 2000,
      totalItemsSold: 75,
      averageTicket: 4200,
    };

    calculateSessionSummaryMock.mockResolvedValue(summary);
    closeSessionMock.mockResolvedValue(closedSession);

    const { session, summary: resultSummary } = await closeSessionUseCase(
      {
        sessionId: closedSession.id,
        finalCash: closedSession.finalCash!,
        notes: "Closing shift",
      },
      {
        userId: closedSession.userId,
        ipAddress: "10.0.0.2",
        userAgent: "vitest",
      }
    );

    expect(session).toEqual(closedSession);
    expect(resultSummary).toEqual(summary);
    expect(calculateSessionSummaryMock).toHaveBeenCalledWith(closedSession.id);
    expect(closeSessionMock).toHaveBeenCalledWith(
      closedSession.id,
      closedSession.finalCash,
      "Closing shift"
    );
    expect(auditSessionClosedMock).toHaveBeenCalledWith(
      expect.objectContaining({
        session: closedSession,
        totals: expect.objectContaining({
          totalSales: summary.totalSales,
          netSales: summary.netSales,
        }),
        context: expect.objectContaining({
          userId: closedSession.userId,
          ipAddress: "10.0.0.2",
        }),
      })
    );
  });

  it("propagates infrastructure errors when closing the session", async () => {
    calculateSessionSummaryMock.mockResolvedValue({
      totalSales: 0,
      totalVoids: 0,
      totalRefunds: 0,
      netSales: 0,
      transactionCount: 0,
      cashSales: 0,
      cardSales: 0,
      transferSales: 0,
      mixedSales: 0,
      totalItemsSold: 0,
      averageTicket: 0,
    });
    closeSessionMock.mockRejectedValue(new Error("DB unavailable"));

    await expect(
      closeSessionUseCase({
        sessionId: baseSession.id,
        finalCash: 0,
      })
    ).rejects.toMatchObject({ code: "POS_SESSION_CLOSE_FAILED" });
    expect(auditSessionClosedMock).not.toHaveBeenCalled();
  });

  describe("suspendSessionUseCase", () => {
    const suspendSessionMock = vi.mocked(suspendSession);
    const auditSessionSuspendedMock = vi.mocked(auditSessionSuspended);

    it("suspends session and records audit metadata", async () => {
      const suspendedSession: POSSession = {
        ...baseSession,
        status: POSSessionStatus.SUSPENDED,
        notes: "Taking a break",
      };

      suspendSessionMock.mockResolvedValue(suspendedSession);

      const result = await suspendSessionUseCase(
        sessionId,
        "Taking a break",
        {
          userId,
          ipAddress: "192.168.1.1",
          userAgent: "vitest",
        }
      );

      expect(result).toEqual(suspendedSession);
      expect(suspendSessionMock).toHaveBeenCalledWith(sessionId, "Taking a break");
      expect(auditSessionSuspendedMock).toHaveBeenCalledWith(
        expect.objectContaining({
          session: suspendedSession,
          context: expect.objectContaining({
            userId,
            ipAddress: "192.168.1.1",
            userAgent: "vitest",
          }),
        })
      );
    });

    it("suspends session without notes", async () => {
      const suspendedSession: POSSession = {
        ...baseSession,
        status: POSSessionStatus.SUSPENDED,
      };

      suspendSessionMock.mockResolvedValue(suspendedSession);

      await suspendSessionUseCase(sessionId);

      expect(suspendSessionMock).toHaveBeenCalledWith(sessionId, undefined);
    });

    it("throws SESSION_NOT_FOUND when session doesn't exist", async () => {
      suspendSessionMock.mockRejectedValue(new Error("Session not found"));

      await expect(suspendSessionUseCase(sessionId)).rejects.toMatchObject({
        code: "POS_SESSION_NOT_FOUND",
      });
      expect(auditSessionSuspendedMock).not.toHaveBeenCalled();
    });

    it("throws SESSION_INVALID_STATUS when session is not open", async () => {
      suspendSessionMock.mockRejectedValue(
        new Error("Session is not open: CLOSED")
      );

      await expect(suspendSessionUseCase(sessionId)).rejects.toMatchObject({
        code: "POS_SESSION_INVALID_STATUS",
        hint: "La sesión debe estar abierta para poder suspenderla.",
      });
    });

    it("propagates domain errors as-is", async () => {
      const domainError = createPOSError("SESSION_ALREADY_SUSPENDED", {
        context: { sessionId },
      });
      suspendSessionMock.mockRejectedValue(domainError);

      // Verify it throws the domain error
      await expect(suspendSessionUseCase(sessionId)).rejects.toThrow();
    });

    it("wraps infrastructure errors in SESSION_SUSPEND_FAILED", async () => {
      suspendSessionMock.mockRejectedValue(new Error("Database timeout"));

      await expect(suspendSessionUseCase(sessionId)).rejects.toMatchObject({
        code: "POS_SESSION_SUSPEND_FAILED",
      });
    });

    it("passes audit context correctly", async () => {
      const suspendedSession: POSSession = {
        ...baseSession,
        status: POSSessionStatus.SUSPENDED,
      };

      suspendSessionMock.mockResolvedValue(suspendedSession);

      await suspendSessionUseCase(sessionId, "Break time", {
        userId,
        userRole: "cashier",
        ipAddress: "10.0.0.1",
        userAgent: "Mozilla/5.0",
      });

      expect(auditSessionSuspendedMock).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            userId,
            userRole: "cashier",
            ipAddress: "10.0.0.1",
            userAgent: "Mozilla/5.0",
          }),
        })
      );
    });
  });

  describe("resumeSessionUseCase", () => {
    const resumeSessionMock = vi.mocked(resumeSession);
    const auditSessionResumedMock = vi.mocked(auditSessionResumed);

    it("resumes session and records audit metadata", async () => {
      const resumedSession: POSSession = {
        ...baseSession,
        status: POSSessionStatus.OPEN,
        notes: "Resuming after break",
      };

      resumeSessionMock.mockResolvedValue(resumedSession);

      const result = await resumeSessionUseCase(
        sessionId,
        "Resuming after break",
        {
          userId,
          ipAddress: "192.168.1.1",
          userAgent: "vitest",
        }
      );

      expect(result).toEqual(resumedSession);
      expect(resumeSessionMock).toHaveBeenCalledWith(sessionId);
      expect(auditSessionResumedMock).toHaveBeenCalledWith(
        expect.objectContaining({
          session: resumedSession,
          context: expect.objectContaining({
            userId,
            ipAddress: "192.168.1.1",
            userAgent: "vitest",
          }),
        })
      );
    });

    it("resumes session without notes", async () => {
      const resumedSession: POSSession = {
        ...baseSession,
        status: POSSessionStatus.OPEN,
      };

      resumeSessionMock.mockResolvedValue(resumedSession);

      await resumeSessionUseCase(sessionId);

      expect(resumeSessionMock).toHaveBeenCalledWith(sessionId);
    });

    it("throws SESSION_NOT_FOUND when session doesn't exist", async () => {
      resumeSessionMock.mockRejectedValue(new Error("Session not found"));

      await expect(resumeSessionUseCase(sessionId)).rejects.toMatchObject({
        code: "POS_SESSION_NOT_FOUND",
      });
      expect(auditSessionResumedMock).not.toHaveBeenCalled();
    });

    it("throws SESSION_INVALID_STATUS when session is not suspended", async () => {
      resumeSessionMock.mockRejectedValue(
        new Error("Session is not suspended: OPEN")
      );

      await expect(resumeSessionUseCase(sessionId)).rejects.toMatchObject({
        code: "POS_SESSION_INVALID_STATUS",
        hint: "La sesión debe estar suspendida para poder reanudarla.",
      });
    });

    it("extracts current status from error message", async () => {
      resumeSessionMock.mockRejectedValue(
        new Error("Session is not suspended: CLOSED")
      );

      await expect(resumeSessionUseCase(sessionId)).rejects.toMatchObject({
        code: "POS_SESSION_INVALID_STATUS",
        context: expect.objectContaining({
          currentStatus: "CLOSED",
          expectedStatus: "SUSPENDED",
        }),
      });
    });

    it("propagates domain errors as-is", async () => {
      const domainError = createPOSError("SESSION_ALREADY_OPEN", {
        context: { sessionId },
      });
      resumeSessionMock.mockRejectedValue(domainError);

      // Verify it throws the domain error
      await expect(resumeSessionUseCase(sessionId)).rejects.toThrow();
    });

    it("wraps infrastructure errors in SESSION_RESUME_FAILED", async () => {
      resumeSessionMock.mockRejectedValue(new Error("Network failure"));

      await expect(resumeSessionUseCase(sessionId)).rejects.toMatchObject({
        code: "POS_SESSION_RESUME_FAILED",
      });
    });

    it("passes audit context correctly", async () => {
      const resumedSession: POSSession = {
        ...baseSession,
        status: POSSessionStatus.OPEN,
      };

      resumeSessionMock.mockResolvedValue(resumedSession);

      await resumeSessionUseCase(sessionId, "Back from break", {
        userId,
        userRole: "admin",
        ipAddress: "10.0.0.2",
        userAgent: "Chrome/90.0",
      });

      expect(auditSessionResumedMock).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            userId,
            userRole: "admin",
            ipAddress: "10.0.0.2",
            userAgent: "Chrome/90.0",
          }),
        })
      );
    });

    it("uses session userId when audit context userId not provided", async () => {
      const resumedSession: POSSession = {
        ...baseSession,
        status: POSSessionStatus.OPEN,
        userId: "user-from-session",
      };

      resumeSessionMock.mockResolvedValue(resumedSession);

      await resumeSessionUseCase(sessionId);

      expect(auditSessionResumedMock).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            userId: "user-from-session",
          }),
        })
      );
    });
  });
});
