import { describe, expect, it, vi, beforeEach } from "vitest";
import { addItemUseCase } from "../addItem.use-case";
import { removeItemUseCase } from "../removeItem.use-case";
import { updateItemQuantityUseCase } from "../updateQuantity.use-case";
import { applyDiscountUseCase } from "../applyDiscount.use-case";
import { clearSaleUseCase } from "../clearSale.use-case";
import * as service from "../../service";
import * as queries from "../../queries";
import { createPOSError } from "@/features/pos/errors";

vi.mock("../../service", () => ({
  addItemWithValidation: vi.fn(),
  updateQuantityWithValidation: vi.fn(),
  removeItemWithCleanup: vi.fn(),
  getSaleWithSummary: vi.fn(),
  applyDiscountToSale: vi.fn(),
}));

vi.mock("../../queries", () => ({
  clearSale: vi.fn(),
}));

const sessionId = "00000000-0000-0000-0000-000000000001";
const productId = "00000000-0000-0000-0000-000000000002";
const itemId = "00000000-0000-0000-0000-000000000003";

const mockSale = {
  id: "sale-1",
  sessionId,
  items: [
    {
      id: itemId,
      productId,
      productSku: "SKU-1",
      productName: "Producto Test",
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
        name: "Producto Test",
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

const mockItem = mockSale.items[0];

describe("Sale Use Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addItemUseCase", () => {
    it("adds item successfully and returns sale with summary", async () => {
      vi.mocked(service.addItemWithValidation).mockResolvedValue({
        item: mockItem,
        summary: mockSummary,
      });

      vi.mocked(service.getSaleWithSummary).mockResolvedValue({
        sale: mockSale,
        summary: mockSummary,
      });

      const result = await addItemUseCase(sessionId, productId, 2);

      expect(result).toEqual({
        sale: mockSale,
        summary: mockSummary,
        item: mockItem,
      });

      expect(service.addItemWithValidation).toHaveBeenCalledWith(
        sessionId,
        productId,
        2
      );
      expect(service.getSaleWithSummary).toHaveBeenCalledWith(sessionId);
    });

    it("validates input with schema", async () => {
      vi.mocked(service.addItemWithValidation).mockResolvedValue({
        item: mockItem,
        summary: mockSummary,
      });

      vi.mocked(service.getSaleWithSummary).mockResolvedValue({
        sale: mockSale,
        summary: mockSummary,
      });

      await addItemUseCase(sessionId, productId, 1);

      expect(service.addItemWithValidation).toHaveBeenCalledWith(
        sessionId,
        productId,
        1
      );
    });

    it("throws error when sale not found after adding item", async () => {
      vi.mocked(service.addItemWithValidation).mockResolvedValue({
        item: mockItem,
        summary: mockSummary,
      });

      vi.mocked(service.getSaleWithSummary).mockResolvedValue({
        sale: null,
        summary: mockSummary,
      });

      await expect(
        addItemUseCase(sessionId, productId, 1)
      ).rejects.toMatchObject({
        code: "POS_SALE_NOT_FOUND",
      });
    });

    it("wraps infrastructure errors in domain error", async () => {
      vi.mocked(service.addItemWithValidation).mockRejectedValue(
        new Error("DB connection failed")
      );

      await expect(
        addItemUseCase(sessionId, productId, 1)
      ).rejects.toMatchObject({
        code: "POS_SALE_MUTATION_FAILED",
      });
    });

    it("propagates domain errors as-is", async () => {
      const domainError = createPOSError("PRODUCT_NOT_FOUND", {
        context: { productId },
      });

      vi.mocked(service.addItemWithValidation).mockRejectedValue(domainError);

      await expect(
        addItemUseCase(sessionId, productId, 1)
      ).rejects.toMatchObject({
        code: "POS_PRODUCT_NOT_FOUND",
      });
    });
  });

  describe("removeItemUseCase", () => {
    it("removes item successfully and returns updated sale", async () => {
      vi.mocked(service.removeItemWithCleanup).mockResolvedValue({
        summary: mockSummary,
        isEmpty: false,
      });

      vi.mocked(service.getSaleWithSummary).mockResolvedValue({
        sale: mockSale,
        summary: mockSummary,
      });

      const result = await removeItemUseCase(sessionId, itemId);

      expect(result).toEqual({
        sale: mockSale,
        summary: mockSummary,
        isEmpty: false,
      });

      expect(service.removeItemWithCleanup).toHaveBeenCalledWith(
        sessionId,
        itemId
      );
    });

    it("returns null sale when cart becomes empty", async () => {
      const emptySummary = {
        ...mockSummary,
        itemCount: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
      };

      vi.mocked(service.removeItemWithCleanup).mockResolvedValue({
        summary: emptySummary,
        isEmpty: true,
      });

      const result = await removeItemUseCase(sessionId, itemId);

      expect(result).toEqual({
        sale: null,
        summary: emptySummary,
        isEmpty: true,
      });

      expect(service.getSaleWithSummary).not.toHaveBeenCalled();
    });

    it("wraps infrastructure errors in domain error", async () => {
      vi.mocked(service.removeItemWithCleanup).mockRejectedValue(
        new Error("Network timeout")
      );

      await expect(removeItemUseCase(sessionId, itemId)).rejects.toMatchObject({
        code: "POS_SALE_MUTATION_FAILED",
      });
    });

    it("propagates domain errors as-is", async () => {
      const domainError = createPOSError("SALE_ITEM_NOT_FOUND", {
        context: { itemId },
      });

      vi.mocked(service.removeItemWithCleanup).mockRejectedValue(domainError);

      // Verify it throws
      await expect(removeItemUseCase(sessionId, itemId)).rejects.toThrow();
    });
  });

  describe("updateItemQuantityUseCase", () => {
    it("updates quantity successfully and returns updated sale", async () => {
      const updatedItem = { ...mockItem, quantity: 5, total: 5800 };

      vi.mocked(service.updateQuantityWithValidation).mockResolvedValue({
        item: updatedItem,
        summary: { ...mockSummary, total: 5800 },
      });

      vi.mocked(service.getSaleWithSummary).mockResolvedValue({
        sale: { ...mockSale, items: [updatedItem] },
        summary: { ...mockSummary, total: 5800 },
      });

      const result = await updateItemQuantityUseCase(sessionId, itemId, 5);

      expect(result.item?.quantity).toBe(5);
      expect(service.updateQuantityWithValidation).toHaveBeenCalledWith(
        sessionId,
        itemId,
        5
      );
    });

    it("validates input with schema", async () => {
      vi.mocked(service.updateQuantityWithValidation).mockResolvedValue({
        item: mockItem,
        summary: mockSummary,
      });

      vi.mocked(service.getSaleWithSummary).mockResolvedValue({
        sale: mockSale,
        summary: mockSummary,
      });

      await updateItemQuantityUseCase(sessionId, itemId, 3);

      expect(service.updateQuantityWithValidation).toHaveBeenCalledWith(
        sessionId,
        itemId,
        3
      );
    });

    it("throws error when sale not found after update", async () => {
      vi.mocked(service.updateQuantityWithValidation).mockResolvedValue({
        item: mockItem,
        summary: mockSummary,
      });

      vi.mocked(service.getSaleWithSummary).mockResolvedValue({
        sale: null,
        summary: mockSummary,
      });

      await expect(
        updateItemQuantityUseCase(sessionId, itemId, 1)
      ).rejects.toMatchObject({
        code: "POS_SALE_NOT_FOUND",
      });
    });

    it("wraps infrastructure errors in domain error", async () => {
      vi.mocked(service.updateQuantityWithValidation).mockRejectedValue(
        new Error("Deadlock detected")
      );

      await expect(
        updateItemQuantityUseCase(sessionId, itemId, 1)
      ).rejects.toMatchObject({
        code: "POS_SALE_MUTATION_FAILED",
      });
    });
  });

  describe("applyDiscountUseCase", () => {
    it("applies percentage discount successfully", async () => {
      const discountedSummary = {
        ...mockSummary,
        discount: 200,
        total: 2120,
      };

      vi.mocked(service.applyDiscountToSale).mockResolvedValue({
        summary: discountedSummary,
        message: "Discount applied successfully",
      });

      vi.mocked(service.getSaleWithSummary).mockResolvedValue({
        sale: mockSale,
        summary: discountedSummary,
      });

      const result = await applyDiscountUseCase(sessionId, "percentage", 10);

      expect(result).toEqual({
        sale: mockSale,
        summary: discountedSummary,
        message: "Discount applied successfully",
      });

      expect(service.applyDiscountToSale).toHaveBeenCalledWith(
        sessionId,
        "percentage",
        10
      );
    });

    it("applies fixed discount successfully", async () => {
      const discountedSummary = {
        ...mockSummary,
        discount: 100,
        total: 2220,
      };

      vi.mocked(service.applyDiscountToSale).mockResolvedValue({
        summary: discountedSummary,
        message: "Discount applied successfully",
      });

      vi.mocked(service.getSaleWithSummary).mockResolvedValue({
        sale: mockSale,
        summary: discountedSummary,
      });

      const result = await applyDiscountUseCase(sessionId, "fixed", 100);

      expect(result.summary.discount).toBe(100);
      expect(service.applyDiscountToSale).toHaveBeenCalledWith(
        sessionId,
        "fixed",
        100
      );
    });

    it("throws error when sale not found after applying discount", async () => {
      vi.mocked(service.applyDiscountToSale).mockResolvedValue({
        summary: mockSummary,
        message: "Discount applied",
      });

      vi.mocked(service.getSaleWithSummary).mockResolvedValue({
        sale: null,
        summary: mockSummary,
      });

      await expect(
        applyDiscountUseCase(sessionId, "percentage", 10)
      ).rejects.toMatchObject({
        code: "POS_SALE_NOT_FOUND",
      });
    });

    it("wraps infrastructure errors in domain error", async () => {
      vi.mocked(service.applyDiscountToSale).mockRejectedValue(
        new Error("Transaction rolled back")
      );

      await expect(
        applyDiscountUseCase(sessionId, "percentage", 10)
      ).rejects.toMatchObject({
        code: "POS_SALE_MUTATION_FAILED",
      });
    });

    it("propagates validation errors from service", async () => {
      const validationError = new Error("Percentage must be between 0 and 100");
      vi.mocked(service.applyDiscountToSale).mockRejectedValue(validationError);

      await expect(
        applyDiscountUseCase(sessionId, "percentage", 150)
      ).rejects.toMatchObject({
        code: "POS_SALE_MUTATION_FAILED",
      });
    });
  });

  describe("clearSaleUseCase", () => {
    it("clears sale successfully", async () => {
      vi.mocked(queries.clearSale).mockResolvedValue(undefined);

      await expect(clearSaleUseCase(sessionId)).resolves.toBeUndefined();

      expect(queries.clearSale).toHaveBeenCalledWith(sessionId);
    });

    it("validates input with schema", async () => {
      vi.mocked(queries.clearSale).mockResolvedValue(undefined);

      await clearSaleUseCase(sessionId);

      expect(queries.clearSale).toHaveBeenCalledWith(sessionId);
    });

    it("wraps infrastructure errors in domain error", async () => {
      vi.mocked(queries.clearSale).mockRejectedValue(
        new Error("Unable to delete cart")
      );

      await expect(clearSaleUseCase(sessionId)).rejects.toMatchObject({
        code: "POS_SALE_MUTATION_FAILED",
      });
    });

    it("propagates domain errors as-is", async () => {
      const domainError = createPOSError("SALE_NOT_FOUND", {
        context: { sessionId },
      });

      vi.mocked(queries.clearSale).mockRejectedValue(domainError);

      await expect(clearSaleUseCase(sessionId)).rejects.toMatchObject({
        code: "POS_SALE_NOT_FOUND",
      });
    });

    it("handles empty sessionId gracefully", async () => {
      await expect(clearSaleUseCase("")).rejects.toThrow();
    });
  });
});
