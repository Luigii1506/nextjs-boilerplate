import { describe, expect, it, beforeEach, vi } from "vitest";
import { useSaleStore } from "../sale.store";
import type { POSSaleSummary } from "@/features/pos/sale/types";
import {
  getActiveSaleAction,
  addToSaleAction,
  updateSaleQuantityAction,
  removeFromSaleAction,
  clearSaleAction,
} from "@/features/pos/sale/server/actions";
import { createPOSError } from "@/features/pos/errors";
import {
  createSalePayload,
  createSaleItem,
  createSaleSummary,
} from "../../../../../../tests/utils/posFactories";

vi.mock("@/features/pos/sale/server/actions", () => ({
  getActiveSaleAction: vi.fn(),
  addToSaleAction: vi.fn(),
  updateSaleQuantityAction: vi.fn(),
  removeFromSaleAction: vi.fn(),
  clearSaleAction: vi.fn(),
  applyDiscountAction: vi.fn(),
  validateSaleForCheckoutAction: vi.fn(),
}));

const saleState = useSaleStore.getState();
const resetSaleStore = () => {
  useSaleStore.setState(saleState, true);
};

describe("useSaleStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSaleStore();
  });

  it("sets session id and refreshes sale payload", async () => {
    const payload = createSalePayload({ sessionId: "session-101" });
    vi.mocked(getActiveSaleAction).mockResolvedValue({ success: true, data: payload });

    useSaleStore.getState().setSessionId("session-101");
    await useSaleStore.getState().refreshSale();

    const state = useSaleStore.getState();
    expect(state.sessionId).toBe("session-101");
    expect(state.items).toHaveLength(payload.sale.items.length);
    expect(state.summary.total).toBe(payload.summary.total);
    expect(state.isError).toBe(false);
  });

  it("handles error when refresh sale fails", async () => {
    vi.mocked(getActiveSaleAction).mockRejectedValue(new Error("Network error"));

    useSaleStore.getState().setSessionId("session-102");
    await useSaleStore.getState().refreshSale();

    const state = useSaleStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.isError).toBe(true);
    expect(state.lastError).toBe("Network error");
  });

  it("adds an item and updates totals", async () => {
    const payload = createSalePayload({ sessionId: "session-103" });
    vi.mocked(addToSaleAction).mockResolvedValue({
      success: true,
      data: { ...payload, addedItem: payload.sale.items[0] },
    });

    useSaleStore.getState().setSessionId("session-103");
    await useSaleStore.getState().addItem("product-1", 1);

    const state = useSaleStore.getState();
    expect(state.items).toHaveLength(payload.sale.items.length);
    expect(state.summary.total).toBe(payload.summary.total);
    expect(state.isError).toBe(false);
  });

  it("propagates error when add item fails", async () => {
    const error = createPOSError("SALE_MUTATION_FAILED", {
      message: "No stock",
    });
    vi.mocked(addToSaleAction).mockResolvedValue({
      success: false,
      error: error.toJSON(),
    });

    useSaleStore.getState().setSessionId("session-104");
    await expect(useSaleStore.getState().addItem("product-1", 1)).rejects.toThrow(
      "No stock"
    );
    expect(useSaleStore.getState().isError).toBe(true);
  });

  it("updates quantity and removes item when result payload returned", async () => {
    const item = createSaleItem({ quantity: 1 });
    const payload = createSalePayload({ items: [item], sessionId: "session-105" });

    vi.mocked(addToSaleAction).mockResolvedValue({
      success: true,
      data: { ...payload, addedItem: payload.sale.items[0] },
    });

    useSaleStore.getState().setSessionId("session-105");
    await useSaleStore.getState().addItem(item.productId, 1);

    const updatedPayload = createSalePayload({
      items: [{ ...item, quantity: 2, total: 2320 }],
      sessionId: "session-105",
      summary: createSaleSummary({ total: 2320, itemCount: 2 }),
    });

    vi.mocked(updateSaleQuantityAction).mockResolvedValue({
      success: true,
      data: { ...updatedPayload, updatedItem: updatedPayload.sale.items[0] },
    });

    await useSaleStore.getState().updateQuantity(updatedPayload.sale.items[0].id, 2);
    expect(useSaleStore.getState().summary.total).toBe(2320);

    vi.mocked(removeFromSaleAction).mockResolvedValue({
      success: true,
      data: {
        sale: null,
        summary: createSaleSummary({ itemCount: 0, total: 0, subtotal: 0, tax: 0 }),
        removedItemId: updatedPayload.sale.items[0].id,
      },
      message: "Item removed",
    });

    await useSaleStore.getState().removeItem(updatedPayload.sale.items[0].id);
    expect(useSaleStore.getState().items).toHaveLength(0);
  });

  it("clears sale state when clear action succeeds", async () => {
    vi.mocked(clearSaleAction).mockResolvedValue({ success: true, message: "Cleared" });

    useSaleStore.setState((state) => ({
      ...state,
      sessionId: "session-200",
      items: [createSaleItem()],
      summary: createSaleSummary({ total: 2000, itemCount: 2 }),
    }));

    await useSaleStore.getState().clearSale();

    const state = useSaleStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.summary.total).toBe(0);
  });
});
