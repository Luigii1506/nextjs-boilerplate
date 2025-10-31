import { describe, expect, it, vi, beforeEach } from "vitest";
import * as service from "../service";
import * as queries from "../queries";
import { mapCartToSale, mapCartItemToSaleItem, mapSaleSummary } from "../../../server/mappers";

vi.mock("../queries", () => ({
  getActiveSaleBySession: vi.fn(),
  calculateSaleSummary: vi.fn(),
  addItemToSale: vi.fn(),
  updateSaleItemQuantity: vi.fn(),
  removeSaleItem: vi.fn(),
  clearSale: vi.fn(),
}));

vi.mock("../../../server/mappers", () => ({
  mapCartToSale: vi.fn(),
  mapCartItemToSaleItem: vi.fn(),
  mapSaleSummary: vi.fn(),
}));

const sessionId = "session-123";
const productId = "product-456";
const itemId = "item-789";

const mockPrismaCart = {
  id: "cart-1",
  sessionId,
  status: "ACTIVE",
  items: [
    {
      id: itemId,
      productId,
      productSku: "SKU-1",
      productName: "Test Product",
      quantity: 2,
      unitPrice: 1000,
      discount: 0,
      subtotal: 2000,
      tax: 320,
      total: 2320,
      product: {
        id: productId,
        name: "Test Product",
        sku: "SKU-1",
        stock: 10,
      },
    },
  ],
  adjustments: [],
};

const mockSale = {
  id: "cart-1",
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

const mockPrismaSummary = {
  subtotal: 2000,
  discount: 0,
  tax: 320,
  total: 2320,
  itemCount: 2,
  totalSales: 2320,
  totalVoids: 0,
  totalRefunds: 0,
  netSales: 2320,
  cashSales: 0,
  cardSales: 0,
  transferSales: 0,
  mixedSales: 0,
  totalItemsSold: 2,
  averageTicket: 2320,
};

describe("Sale Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSaleWithSummary", () => {
    it("returns sale and summary when cart exists", async () => {
      vi.mocked(queries.getActiveSaleBySession).mockResolvedValue(mockPrismaCart as any);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapCartToSale).mockReturnValue(mockSale as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.getSaleWithSummary(sessionId);

      expect(result.sale).toEqual(mockSale);
      expect(result.summary).toEqual(mockSummary);
      expect(queries.getActiveSaleBySession).toHaveBeenCalledWith(sessionId);
      expect(queries.calculateSaleSummary).toHaveBeenCalledWith(sessionId);
    });

    it("returns null sale when no cart exists", async () => {
      vi.mocked(queries.getActiveSaleBySession).mockResolvedValue(null);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.getSaleWithSummary(sessionId);

      expect(result.sale).toBeNull();
      expect(result.summary).toEqual(mockSummary);
    });

    it("handles mapping errors gracefully", async () => {
      vi.mocked(queries.getActiveSaleBySession).mockResolvedValue(mockPrismaCart as any);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapCartToSale).mockImplementation(() => {
        throw new Error("Mapping failed");
      });
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.getSaleWithSummary(sessionId);

      expect(result.sale).toBeNull();
      expect(result.summary).toEqual(mockSummary);
    });

    it("handles summary mapping errors gracefully", async () => {
      vi.mocked(queries.getActiveSaleBySession).mockResolvedValue(null);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(null as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.getSaleWithSummary(sessionId);

      expect(result.sale).toBeNull();
      expect(result.summary).toEqual(mockSummary);
      expect(mapSaleSummary).toHaveBeenCalledWith(null);
    });
  });

  describe("addItemWithValidation", () => {
    it("adds item successfully with valid quantity", async () => {
      const addedItem = mockPrismaCart.items[0];
      vi.mocked(queries.addItemToSale).mockResolvedValue(addedItem as any);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapCartItemToSaleItem).mockReturnValue(mockSale.items[0] as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.addItemWithValidation(sessionId, productId, 2);

      expect(result.item).toEqual(mockSale.items[0]);
      expect(result.summary).toEqual(mockSummary);
      expect(queries.addItemToSale).toHaveBeenCalledWith(sessionId, productId, 2);
    });

    it("throws error for zero quantity", async () => {
      await expect(
        service.addItemWithValidation(sessionId, productId, 0)
      ).rejects.toThrow("Quantity must be greater than 0");

      expect(queries.addItemToSale).not.toHaveBeenCalled();
    });

    it("throws error for negative quantity", async () => {
      await expect(
        service.addItemWithValidation(sessionId, productId, -1)
      ).rejects.toThrow("Quantity must be greater than 0");

      expect(queries.addItemToSale).not.toHaveBeenCalled();
    });

    it("throws error for quantity exceeding maximum", async () => {
      await expect(
        service.addItemWithValidation(sessionId, productId, 1001)
      ).rejects.toThrow("Quantity exceeds maximum allowed (1000)");

      expect(queries.addItemToSale).not.toHaveBeenCalled();
    });

    it("handles null item from query", async () => {
      vi.mocked(queries.addItemToSale).mockResolvedValue(null);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.addItemWithValidation(sessionId, productId, 1);

      expect(result.item).toBeNull();
      expect(result.summary).toEqual(mockSummary);
    });

    it("recalculates summary after adding item", async () => {
      vi.mocked(queries.addItemToSale).mockResolvedValue(mockPrismaCart.items[0] as any);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapCartItemToSaleItem).mockReturnValue(mockSale.items[0] as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      await service.addItemWithValidation(sessionId, productId, 1);

      expect(queries.calculateSaleSummary).toHaveBeenCalledWith(sessionId);
    });
  });

  describe("updateQuantityWithValidation", () => {
    it("updates quantity successfully", async () => {
      const updatedItem = { ...mockPrismaCart.items[0], quantity: 5 };
      vi.mocked(queries.updateSaleItemQuantity).mockResolvedValue(updatedItem as any);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapCartItemToSaleItem).mockReturnValue({ ...mockSale.items[0], quantity: 5 } as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.updateQuantityWithValidation(sessionId, itemId, 5);

      expect(result.item?.quantity).toBe(5);
      expect(queries.updateSaleItemQuantity).toHaveBeenCalledWith(sessionId, itemId, 5);
    });

    it("throws error for zero quantity", async () => {
      await expect(
        service.updateQuantityWithValidation(sessionId, itemId, 0)
      ).rejects.toThrow("Quantity must be greater than 0");
    });

    it("throws error for negative quantity", async () => {
      await expect(
        service.updateQuantityWithValidation(sessionId, itemId, -2)
      ).rejects.toThrow("Quantity must be greater than 0");
    });

    it("throws error for quantity exceeding maximum", async () => {
      await expect(
        service.updateQuantityWithValidation(sessionId, itemId, 2000)
      ).rejects.toThrow("Quantity exceeds maximum allowed (1000)");
    });

    it("recalculates summary after update", async () => {
      vi.mocked(queries.updateSaleItemQuantity).mockResolvedValue(mockPrismaCart.items[0] as any);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapCartItemToSaleItem).mockReturnValue(mockSale.items[0] as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      await service.updateQuantityWithValidation(sessionId, itemId, 3);

      expect(queries.calculateSaleSummary).toHaveBeenCalledWith(sessionId);
    });
  });

  describe("removeItemWithCleanup", () => {
    it("removes item and returns summary", async () => {
      vi.mocked(queries.removeSaleItem).mockResolvedValue(undefined);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.removeItemWithCleanup(sessionId, itemId);

      expect(result.summary).toEqual(mockSummary);
      expect(result.isEmpty).toBe(false);
      expect(queries.removeSaleItem).toHaveBeenCalledWith(sessionId, itemId);
    });

    it("clears sale when last item is removed", async () => {
      const emptySummary = {
        ...mockSummary,
        itemCount: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
      };

      vi.mocked(queries.removeSaleItem).mockResolvedValue(undefined);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue({
        ...mockPrismaSummary,
        itemCount: 0,
      } as any);
      vi.mocked(mapSaleSummary).mockReturnValue(emptySummary);
      vi.mocked(queries.clearSale).mockResolvedValue(undefined);

      const result = await service.removeItemWithCleanup(sessionId, itemId);

      expect(result.isEmpty).toBe(true);
      expect(queries.clearSale).toHaveBeenCalledWith(sessionId);
    });

    it("recalculates summary after removal", async () => {
      vi.mocked(queries.removeSaleItem).mockResolvedValue(undefined);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      await service.removeItemWithCleanup(sessionId, itemId);

      expect(queries.calculateSaleSummary).toHaveBeenCalledWith(sessionId);
    });
  });

  describe("applyDiscountToSale", () => {
    it("validates percentage discount within range", async () => {
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.applyDiscountToSale(sessionId, "percentage", 10);

      expect(result.summary).toEqual(mockSummary);
      expect(result.message).toBe("Discount applied successfully");
    });

    it("throws error for percentage below 0", async () => {
      await expect(
        service.applyDiscountToSale(sessionId, "percentage", -5)
      ).rejects.toThrow("Percentage must be between 0 and 100");
    });

    it("throws error for percentage above 100", async () => {
      await expect(
        service.applyDiscountToSale(sessionId, "percentage", 150)
      ).rejects.toThrow("Percentage must be between 0 and 100");
    });

    it("validates fixed discount is non-negative", async () => {
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.applyDiscountToSale(sessionId, "fixed", 100);

      expect(result.summary).toEqual(mockSummary);
    });

    it("throws error for negative fixed discount", async () => {
      await expect(
        service.applyDiscountToSale(sessionId, "fixed", -50)
      ).rejects.toThrow("Fixed discount cannot be negative");
    });
  });

  describe("validateSaleForCheckout", () => {
    it("validates sale successfully with items and stock", async () => {
      vi.mocked(queries.getActiveSaleBySession).mockResolvedValue(mockPrismaCart as any);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapCartToSale).mockReturnValue(mockSale as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.validateSaleForCheckout(sessionId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.summary).toEqual(mockSummary);
    });

    it("fails validation when sale is empty", async () => {
      vi.mocked(queries.getActiveSaleBySession).mockResolvedValue(null);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue({
        ...mockPrismaSummary,
        itemCount: 0,
      } as any);
      vi.mocked(mapSaleSummary).mockReturnValue({
        ...mockSummary,
        itemCount: 0,
      });

      const result = await service.validateSaleForCheckout(sessionId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Sale is empty");
    });

    it("fails validation when insufficient stock", async () => {
      const lowStockSale = {
        ...mockSale,
        items: [
          {
            ...mockSale.items[0],
            quantity: 20,
            product: { ...mockSale.items[0].product, stock: 5 },
          },
        ],
      };

      vi.mocked(queries.getActiveSaleBySession).mockResolvedValue(mockPrismaCart as any);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapCartToSale).mockReturnValue(lowStockSale as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.validateSaleForCheckout(sessionId);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("Insufficient stock");
    });

    it("includes product name in stock error message", async () => {
      const lowStockSale = {
        ...mockSale,
        items: [
          {
            ...mockSale.items[0],
            quantity: 15,
            product: { ...mockSale.items[0].product, stock: 10, name: "Premium Widget" },
          },
        ],
      };

      vi.mocked(queries.getActiveSaleBySession).mockResolvedValue(mockPrismaCart as any);
      vi.mocked(queries.calculateSaleSummary).mockResolvedValue(mockPrismaSummary as any);
      vi.mocked(mapCartToSale).mockReturnValue(lowStockSale as any);
      vi.mocked(mapSaleSummary).mockReturnValue(mockSummary);

      const result = await service.validateSaleForCheckout(sessionId);

      expect(result.errors[0]).toContain("Premium Widget");
      expect(result.errors[0]).toContain("Available: 10");
    });
  });

  describe("Helper Functions", () => {
    it("formats price correctly", () => {
      const formatted = service.formatPrice(1000);
      expect(formatted).toContain("1,000");
      expect(formatted).toContain("$"); // Currency symbol
    });

    it("calculates item count from items", () => {
      const items = [
        { quantity: 2 },
        { quantity: 3 },
        { quantity: 1 },
      ];
      expect(service.calculateItemCount(items)).toBe(6);
    });

    it("returns 0 for empty items array", () => {
      expect(service.calculateItemCount([])).toBe(0);
    });
  });
});
