import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getActiveSaleAction,
  addToSaleAction,
  updateSaleQuantityAction,
  removeFromSaleAction,
  clearSaleAction,
  applyDiscountAction,
  validateSaleForCheckoutAction,
} from "../actions";
import {
  addItemUseCase,
  updateItemQuantityUseCase,
  removeItemUseCase,
  clearSaleUseCase,
  applyDiscountUseCase,
} from "../use-cases";
import * as service from "../service";
import { createPOSError } from "@/features/pos/errors";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("../use-cases", () => ({
  addItemUseCase: vi.fn(),
  updateItemQuantityUseCase: vi.fn(),
  removeItemUseCase: vi.fn(),
  clearSaleUseCase: vi.fn(),
  applyDiscountUseCase: vi.fn(),
}));

vi.mock("../service", () => ({
  getSaleWithSummary: vi.fn(),
  validateSaleForCheckout: vi.fn(),
}));

const sessionId = "session-123";
const productId = "product-456";
const itemId = "item-789";

const mockSale = {
  id: "sale-1",
  sessionId,
  items: [
    {
      id: itemId,
      productId,
      productSku: "SKU-1",
      productName: "Test Product",
      quantity: 2,
      unitPrice: 1000,
      discount: 0,
      tax: 320,
      subtotal: 2000,
      total: 2320,
      addedAt: new Date("2025-01-01T10:00:00Z"),
      updatedAt: new Date("2025-01-01T10:00:00Z"),
      metadata: {},
      product: {
        id: productId,
        name: "Test Product",
        sku: "SKU-1",
        description: "",
        price: 1000,
        image: null,
        stock: 10,
        categoryId: "cat-1",
        createdAt: new Date("2025-01-01T09:00:00Z"),
        updatedAt: new Date("2025-01-01T09:00:00Z"),
        status: "ACTIVE" as const,
        taxRate: 0.16,
      },
    },
  ],
  adjustments: [],
};

const mockSummary = {
  itemCount: 2,
  subtotal: 2000,
  discount: 0,
  fees: 0,
  tax: 320,
  taxRate: 0.16,
  total: 2320,
};

describe("Sale Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getActiveSaleAction", () => {
    it("returns sale and summary successfully", async () => {
      vi.mocked(service.getSaleWithSummary).mockResolvedValue({
        sale: mockSale,
        summary: mockSummary,
      });

      const result = await getActiveSaleAction(sessionId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        sale: mockSale,
        summary: mockSummary,
      });
      expect(service.getSaleWithSummary).toHaveBeenCalledWith(sessionId);
    });

    it("returns null sale when cart doesn't exist", async () => {
      vi.mocked(service.getSaleWithSummary).mockResolvedValue({
        sale: null,
        summary: mockSummary,
      });

      const result = await getActiveSaleAction(sessionId);

      expect(result.success).toBe(true);
      expect(result.data?.sale).toBeNull();
      expect(result.data?.summary).toEqual(mockSummary);
    });

    it("handles errors and returns error result", async () => {
      vi.mocked(service.getSaleWithSummary).mockRejectedValue(
        new Error("Database error")
      );

      const result = await getActiveSaleAction(sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("wraps domain errors properly", async () => {
      const domainError = createPOSError("SALE_FETCH_FAILED", {
        context: { sessionId },
      });
      vi.mocked(service.getSaleWithSummary).mockRejectedValue(domainError);

      const result = await getActiveSaleAction(sessionId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("POS_SALE_FETCH_FAILED");
    });
  });

  describe("addToSaleAction", () => {
    it("adds item successfully and returns sale with message", async () => {
      vi.mocked(addItemUseCase).mockResolvedValue({
        sale: mockSale,
        summary: mockSummary,
        item: mockSale.items[0],
      });

      const result = await addToSaleAction(sessionId, productId, 2);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        sale: mockSale,
        summary: mockSummary,
        addedItem: mockSale.items[0],
      });
      expect(result.message).toContain("Test Product");
      expect(addItemUseCase).toHaveBeenCalledWith(sessionId, productId, 2);
    });

    it("uses default quantity of 1 when not provided", async () => {
      vi.mocked(addItemUseCase).mockResolvedValue({
        sale: mockSale,
        summary: mockSummary,
        item: mockSale.items[0],
      });

      await addToSaleAction(sessionId, productId);

      expect(addItemUseCase).toHaveBeenCalledWith(sessionId, productId, 1);
    });

    it("handles case when item has no product name", async () => {
      const itemWithoutName = { ...mockSale.items[0], product: { ...mockSale.items[0].product, name: "" } };
      vi.mocked(addItemUseCase).mockResolvedValue({
        sale: mockSale,
        summary: mockSummary,
        item: itemWithoutName,
      });

      const result = await addToSaleAction(sessionId, productId, 1);

      expect(result.success).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it("handles null item gracefully", async () => {
      vi.mocked(addItemUseCase).mockResolvedValue({
        sale: mockSale,
        summary: mockSummary,
        item: null,
      });

      const result = await addToSaleAction(sessionId, productId, 1);

      expect(result.success).toBe(true);
      expect(result.data?.addedItem).toBeNull();
    });

    it("maps domain errors to action result", async () => {
      const domainError = createPOSError("PRODUCT_OUT_OF_STOCK", {
        context: { productId },
      });
      vi.mocked(addItemUseCase).mockRejectedValue(domainError);

      const result = await addToSaleAction(sessionId, productId, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("updateSaleQuantityAction", () => {
    it("updates quantity successfully", async () => {
      const updatedItem = { ...mockSale.items[0], quantity: 5 };
      vi.mocked(updateItemQuantityUseCase).mockResolvedValue({
        sale: { ...mockSale, items: [updatedItem] },
        summary: mockSummary,
        item: updatedItem,
      });

      const result = await updateSaleQuantityAction(sessionId, itemId, 5);

      expect(result.success).toBe(true);
      expect(result.data?.updatedItem?.quantity).toBe(5);
      expect(updateItemQuantityUseCase).toHaveBeenCalledWith(sessionId, itemId, 5);
    });

    it("includes message when item has product name", async () => {
      vi.mocked(updateItemQuantityUseCase).mockResolvedValue({
        sale: mockSale,
        summary: mockSummary,
        item: mockSale.items[0],
      });

      const result = await updateSaleQuantityAction(sessionId, itemId, 3);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Quantity updated");
    });

    it("handles null item gracefully", async () => {
      vi.mocked(updateItemQuantityUseCase).mockResolvedValue({
        sale: mockSale,
        summary: mockSummary,
        item: null,
      });

      const result = await updateSaleQuantityAction(sessionId, itemId, 2);

      expect(result.success).toBe(true);
      expect(result.data?.updatedItem).toBeNull();
      expect(result.message).toBeUndefined();
    });

    it("maps errors properly", async () => {
      vi.mocked(updateItemQuantityUseCase).mockRejectedValue(
        new Error("Invalid quantity")
      );

      const result = await updateSaleQuantityAction(sessionId, itemId, -1);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("removeFromSaleAction", () => {
    it("removes item successfully", async () => {
      vi.mocked(removeItemUseCase).mockResolvedValue({
        sale: mockSale,
        summary: mockSummary,
        isEmpty: false,
      });

      const result = await removeFromSaleAction(sessionId, itemId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        sale: mockSale,
        summary: mockSummary,
        removedItemId: itemId,
      });
      expect(result.message).toBe("Item removed from sale");
      expect(removeItemUseCase).toHaveBeenCalledWith(sessionId, itemId);
    });

    it("returns appropriate message when sale becomes empty", async () => {
      const emptySummary = {
        ...mockSummary,
        itemCount: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
      };

      vi.mocked(removeItemUseCase).mockResolvedValue({
        sale: null,
        summary: emptySummary,
        isEmpty: true,
      });

      const result = await removeFromSaleAction(sessionId, itemId);

      expect(result.success).toBe(true);
      expect(result.data?.sale).toBeNull();
      expect(result.message).toBe("Item removed. Sale is now empty");
    });

    it("handles errors gracefully", async () => {
      const domainError = createPOSError("SALE_ITEM_NOT_FOUND", {
        context: { itemId },
      });
      vi.mocked(removeItemUseCase).mockRejectedValue(domainError);

      const result = await removeFromSaleAction(sessionId, itemId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("clearSaleAction", () => {
    it("clears sale successfully", async () => {
      vi.mocked(clearSaleUseCase).mockResolvedValue(undefined);

      const result = await clearSaleAction(sessionId);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Sale cleared successfully");
      expect(clearSaleUseCase).toHaveBeenCalledWith(sessionId);
    });

    it("handles errors properly", async () => {
      vi.mocked(clearSaleUseCase).mockRejectedValue(
        new Error("Failed to clear cart")
      );

      const result = await clearSaleAction(sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("wraps domain errors", async () => {
      const domainError = createPOSError("SALE_NOT_FOUND", {
        context: { sessionId },
      });
      vi.mocked(clearSaleUseCase).mockRejectedValue(domainError);

      const result = await clearSaleAction(sessionId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toContain("SALE");
    });
  });

  describe("applyDiscountAction", () => {
    it("applies percentage discount successfully", async () => {
      const discountedSummary = {
        ...mockSummary,
        discount: 200,
        total: 2120,
      };

      vi.mocked(applyDiscountUseCase).mockResolvedValue({
        sale: mockSale,
        summary: discountedSummary,
        message: "10% discount applied",
      });

      const result = await applyDiscountAction(sessionId, "percentage", 10);

      expect(result.success).toBe(true);
      expect(result.data?.summary.discount).toBe(200);
      expect(result.message).toBe("10% discount applied");
      expect(applyDiscountUseCase).toHaveBeenCalledWith(sessionId, "percentage", 10);
    });

    it("applies fixed discount successfully", async () => {
      const discountedSummary = {
        ...mockSummary,
        discount: 100,
        total: 2220,
      };

      vi.mocked(applyDiscountUseCase).mockResolvedValue({
        sale: mockSale,
        summary: discountedSummary,
        message: "$100 discount applied",
      });

      const result = await applyDiscountAction(sessionId, "fixed", 100);

      expect(result.success).toBe(true);
      expect(result.data?.summary.discount).toBe(100);
    });

    it("handles validation errors", async () => {
      vi.mocked(applyDiscountUseCase).mockRejectedValue(
        new Error("Percentage must be between 0 and 100")
      );

      const result = await applyDiscountAction(sessionId, "percentage", 150);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("wraps domain errors properly", async () => {
      const domainError = createPOSError("SALE_NOT_FOUND", {
        context: { sessionId },
      });
      vi.mocked(applyDiscountUseCase).mockRejectedValue(domainError);

      const result = await applyDiscountAction(sessionId, "percentage", 10);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("validateSaleForCheckoutAction", () => {
    it("returns success when sale is valid", async () => {
      const validation = {
        isValid: true,
        errors: [],
        summary: mockSummary,
      };

      vi.mocked(service.validateSaleForCheckout).mockResolvedValue(validation);

      const result = await validateSaleForCheckoutAction(sessionId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validation);
      expect(service.validateSaleForCheckout).toHaveBeenCalledWith(sessionId);
    });

    it("returns failure with errors when validation fails", async () => {
      const validation = {
        isValid: false,
        errors: ["Sale is empty", "No items in cart"],
        summary: mockSummary,
      };

      vi.mocked(service.validateSaleForCheckout).mockResolvedValue(validation);

      const result = await validateSaleForCheckoutAction(sessionId);

      expect(result.success).toBe(false);
      expect(result.data).toEqual(validation);
      expect(result.error?.code).toBe("POS_SALE_VALIDATION_FAILED");
      expect(result.error?.hint).toContain("Sale is empty");
    });

    it("includes all validation errors in hint", async () => {
      const validation = {
        isValid: false,
        errors: ["Insufficient stock for Product A", "Insufficient stock for Product B"],
        summary: mockSummary,
      };

      vi.mocked(service.validateSaleForCheckout).mockResolvedValue(validation);

      const result = await validateSaleForCheckoutAction(sessionId);

      expect(result.error?.hint).toContain("Insufficient stock for Product A");
      expect(result.error?.hint).toContain("Insufficient stock for Product B");
    });

    it("handles infrastructure errors", async () => {
      vi.mocked(service.validateSaleForCheckout).mockRejectedValue(
        new Error("Database connection failed")
      );

      const result = await validateSaleForCheckoutAction(sessionId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("POS_SALE_FETCH_FAILED");
    });

    it("propagates domain errors", async () => {
      const domainError = createPOSError("SALE_NOT_FOUND", {
        context: { sessionId },
      });
      vi.mocked(service.validateSaleForCheckout).mockRejectedValue(domainError);

      const result = await validateSaleForCheckoutAction(sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
