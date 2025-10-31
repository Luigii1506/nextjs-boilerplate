import { describe, expect, it, beforeEach, vi } from "vitest";
import { usePOSInvalidations } from "../usePOSInvalidations";
import * as queryKeysModule from "../queryKeys";
import { renderHookWithQueryClient } from "../../../../../tests/utils/renderHookWithQueryClient";

const { posKeys } = queryKeysModule;

describe("usePOSInvalidations", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("invalidates all queries", async () => {
    const { result, queryClient } = renderHookWithQueryClient(() => usePOSInvalidations());
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    await result.current.invalidateAll();

    expect(spy).toHaveBeenCalledWith({ queryKey: posKeys.all });
  });

  it("delegates sale invalidations to helper", async () => {
    const spy = vi.spyOn(queryKeysModule, "invalidateSaleQueries");
    const { result, queryClient } = renderHookWithQueryClient(() => usePOSInvalidations());

    await result.current.invalidateSale("session-201");

    expect(spy).toHaveBeenCalledWith(queryClient, "session-201");
  });

  it("invalidates sale summary directly", async () => {
    const { result, queryClient } = renderHookWithQueryClient(() => usePOSInvalidations());
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    await result.current.invalidateSaleSummary("session-300");

    expect(spy).toHaveBeenCalledWith({ queryKey: posKeys.saleWithSummary("session-300") });
  });

  it("invalidates transaction list with params", async () => {
    const params = { sessionId: "session-400", userId: "user-1", limit: 20 };
    const { result, queryClient } = renderHookWithQueryClient(() => usePOSInvalidations());
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    await result.current.invalidateTransactionList(params);

    expect(spy).toHaveBeenCalledWith({ queryKey: posKeys.transactionList(params) });
  });

  it("invalidates dashboard using helper", async () => {
    const spy = vi.spyOn(queryKeysModule, "invalidateDashboardQueries");
    const { result, queryClient } = renderHookWithQueryClient(() => usePOSInvalidations());

    await result.current.invalidateDashboard("user-dashboard");

    expect(spy).toHaveBeenCalledWith(queryClient, "user-dashboard");
  });

  it("invalidates session queries via helper", async () => {
    const spy = vi.spyOn(queryKeysModule, "invalidateSessionQueries");
    const { result, queryClient } = renderHookWithQueryClient(() => usePOSInvalidations());

    await result.current.invalidateSession("user-200");

    expect(spy).toHaveBeenCalledWith(queryClient, "user-200");
  });
});
