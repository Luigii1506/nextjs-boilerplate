import { describe, expect, it } from "vitest";
import {
  calculateTax,
  calculateSubtotalFromTotal,
  calculateIncludedTax,
  applyPercentageDiscount,
  calculatePercentageDiscount,
  applyFixedDiscount,
  calculateDiscountPercentage,
  validateDiscount,
  calculateChange,
  calculateChangeDenominations,
  roundToNearest,
  validateMixedPayment,
  calculateMixedPaymentDistribution,
  calculateItemTotal,
  calculateItemsSubtotal,
  distributeDiscountAcrossItems,
  calculateSaleSummary,
  recalculateWithDiscount,
  round2,
  roundToInteger,
  roundUp,
  roundDown,
} from "../payment.calculator";

describe("Payment Calculator", () => {
  describe("Tax Calculations", () => {
    it("calculates 16% tax correctly", () => {
      expect(calculateTax(1000)).toBe(160);
      expect(calculateTax(500)).toBe(80);
      expect(calculateTax(100)).toBe(16);
    });

    it("calculates tax with custom rate", () => {
      expect(calculateTax(1000, 0.08)).toBe(80);
      expect(calculateTax(1000, 0.21)).toBe(210);
    });

    it("rounds tax to 2 decimals", () => {
      expect(calculateTax(333.33, 0.16)).toBe(53.33);
    });

    it("calculates subtotal from total with tax", () => {
      expect(calculateSubtotalFromTotal(1160, 0.16)).toBe(1000);
      expect(calculateSubtotalFromTotal(580, 0.16)).toBe(500);
    });

    it("calculates included tax from total", () => {
      const total = 1160;
      const tax = calculateIncludedTax(total, 0.16);
      expect(tax).toBeCloseTo(160, 1);
    });
  });

  describe("Discount Calculations", () => {
    it("applies percentage discount correctly", () => {
      expect(applyPercentageDiscount(1000, 10)).toBe(900);
      expect(applyPercentageDiscount(500, 20)).toBe(400);
      expect(applyPercentageDiscount(100, 50)).toBe(50);
    });

    it("throws error for invalid percentage", () => {
      expect(() => applyPercentageDiscount(1000, -5)).toThrow(
        "Percentage must be between 0 and 100"
      );
      expect(() => applyPercentageDiscount(1000, 150)).toThrow(
        "Percentage must be between 0 and 100"
      );
    });

    it("calculates percentage discount amount", () => {
      expect(calculatePercentageDiscount(1000, 10)).toBe(100);
      expect(calculatePercentageDiscount(500, 20)).toBe(100);
      expect(calculatePercentageDiscount(1000, 15.5)).toBe(155);
    });

    it("applies fixed discount correctly", () => {
      expect(applyFixedDiscount(1000, 100)).toBe(900);
      expect(applyFixedDiscount(500, 50)).toBe(450);
    });

    it("throws error when discount exceeds amount", () => {
      expect(() => applyFixedDiscount(100, 150)).toThrow(
        "Discount cannot exceed amount"
      );
    });

    it("throws error for negative discount", () => {
      expect(() => applyFixedDiscount(1000, -50)).toThrow(
        "Discount must be positive"
      );
    });

    it("calculates discount percentage from amounts", () => {
      expect(calculateDiscountPercentage(1000, 100)).toBe(10);
      expect(calculateDiscountPercentage(500, 100)).toBe(20);
      expect(calculateDiscountPercentage(1000, 150)).toBe(15);
    });

    it("returns 0 for zero original amount", () => {
      expect(calculateDiscountPercentage(0, 100)).toBe(0);
    });

    it("validates percentage discount", () => {
      expect(validateDiscount(1000, "percentage", 10)).toEqual({ valid: true });
      expect(validateDiscount(1000, "percentage", 150)).toEqual({
        valid: false,
        error: "Percentage must be between 0 and 100",
      });
      expect(validateDiscount(1000, "percentage", -5)).toEqual({
        valid: false,
        error: "Percentage must be between 0 and 100",
      });
    });

    it("validates fixed discount", () => {
      expect(validateDiscount(1000, "fixed", 100)).toEqual({ valid: true });
      expect(validateDiscount(1000, "fixed", 1500)).toEqual({
        valid: false,
        error: "Discount cannot exceed amount",
      });
      expect(validateDiscount(1000, "fixed", -50)).toEqual({
        valid: false,
        error: "Discount must be positive",
      });
    });
  });

  describe("Change Calculations", () => {
    it("calculates change correctly", () => {
      expect(calculateChange(1200, 1000)).toBe(200);
      expect(calculateChange(1000, 1000)).toBe(0);
      expect(calculateChange(500, 1000)).toBe(0); // No negative change
    });

    it("returns 0 for insufficient payment", () => {
      expect(calculateChange(800, 1000)).toBe(0);
    });

    it("rounds change to 2 decimals", () => {
      expect(calculateChange(100.55, 50.22)).toBe(50.33);
    });

    it("calculates change denominations for bills", () => {
      const result = calculateChangeDenominations(350);
      expect(result.bills).toContainEqual({ value: 200, count: 1 });
      expect(result.bills).toContainEqual({ value: 100, count: 1 });
      expect(result.bills).toContainEqual({ value: 50, count: 1 });
    });

    it("calculates change denominations for coins", () => {
      const result = calculateChangeDenominations(7.5);
      expect(result.coins).toContainEqual({ value: 5, count: 1 });
      expect(result.coins).toContainEqual({ value: 2, count: 1 });
      expect(result.coins).toContainEqual({ value: 0.5, count: 1 });
    });

    it("calculates mixed bills and coins", () => {
      const result = calculateChangeDenominations(156.75);
      expect(result.bills).toContainEqual({ value: 100, count: 1 });
      expect(result.bills).toContainEqual({ value: 50, count: 1 });
      expect(result.coins).toContainEqual({ value: 5, count: 1 });
      expect(result.coins).toContainEqual({ value: 1, count: 1 });
    });

    it("rounds to nearest multiple", () => {
      expect(roundToNearest(12.3, 5)).toBe(10);
      expect(roundToNearest(13.8, 5)).toBe(15);
      expect(roundToNearest(12.5, 5)).toBe(15);
    });
  });

  describe("Mixed Payment Validation", () => {
    it("validates sufficient mixed payment", () => {
      const result = validateMixedPayment(1000, 500, 300, 200);
      expect(result.valid).toBe(true);
      expect(result.totalPaid).toBe(1000);
    });

    it("rejects insufficient payment", () => {
      const result = validateMixedPayment(1000, 400, 300, 200);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Total paid is less than amount due");
      expect(result.totalPaid).toBe(900);
    });

    it("rejects negative amounts", () => {
      const result = validateMixedPayment(1000, -100, 600, 500);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Payment amounts must be positive");
    });

    it("allows overpayment", () => {
      const result = validateMixedPayment(1000, 600, 300, 300);
      expect(result.valid).toBe(true);
      expect(result.totalPaid).toBe(1200);
    });
  });

  describe("Mixed Payment Distribution", () => {
    it("calculates distribution with exact percentages", () => {
      const result = calculateMixedPaymentDistribution(1000, 50, 30, 20);
      expect(result.cash).toBe(500);
      expect(result.card).toBe(300);
      expect(result.transfer).toBe(200);
    });

    it("throws error when percentages don't sum to 100", () => {
      expect(() => calculateMixedPaymentDistribution(1000, 50, 30, 10)).toThrow(
        "Percentages must sum to 100"
      );
    });

    it("handles decimal percentages", () => {
      const result = calculateMixedPaymentDistribution(1000, 33.33, 33.33, 33.34);
      expect(result.cash).toBe(333.3);
      expect(result.card).toBe(333.3);
      expect(result.transfer).toBe(333.4);
    });
  });

  describe("Item Calculations", () => {
    it("calculates item total without discount", () => {
      expect(calculateItemTotal(2, 100)).toBe(200);
      expect(calculateItemTotal(5, 50)).toBe(250);
    });

    it("calculates item total with discount", () => {
      expect(calculateItemTotal(2, 100, 20)).toBe(180);
      expect(calculateItemTotal(3, 100, 50)).toBe(250);
    });

    it("calculates subtotal of multiple items", () => {
      const items = [
        { quantity: 2, unitPrice: 100, discount: 0 },
        { quantity: 3, unitPrice: 50, discount: 10 },
        { quantity: 1, unitPrice: 200, discount: 20 },
      ];
      const subtotal = calculateItemsSubtotal(items);
      expect(subtotal).toBe(520); // 200 + 140 + 180
    });

    it("distributes discount across items proportionally", () => {
      const items = [
        { subtotal: 1000 },
        { subtotal: 500 },
        { subtotal: 500 },
      ];
      const discounts = distributeDiscountAcrossItems(items, 200);
      expect(discounts[0]).toBe(100); // 50% of discount
      expect(discounts[1]).toBe(50);  // 25% of discount
      expect(discounts[2]).toBe(50);  // 25% of discount
    });

    it("returns zeros for zero subtotal", () => {
      const items = [{ subtotal: 0 }];
      const discounts = distributeDiscountAcrossItems(items, 100);
      expect(discounts[0]).toBe(0);
    });
  });

  describe("Summary Calculations", () => {
    it("calculates complete sale summary", () => {
      const items = [
        { quantity: 2, unitPrice: 1000, discount: 0 },
        { quantity: 1, unitPrice: 500, discount: 0 },
      ];
      const summary = calculateSaleSummary(items, 0, 0.16);

      expect(summary.itemCount).toBe(3);
      expect(summary.subtotal).toBe(2500);
      expect(summary.discount).toBe(0);
      expect(summary.tax).toBe(400);
      expect(summary.total).toBe(2900);
    });

    it("applies global discount to summary", () => {
      const items = [
        { quantity: 2, unitPrice: 1000 },
      ];
      const summary = calculateSaleSummary(items, 200, 0.16);

      expect(summary.subtotal).toBe(2000);
      expect(summary.discount).toBe(200);
      expect(summary.tax).toBe(288); // Tax on 1800
      expect(summary.total).toBe(2088);
    });

    it("recalculates with new discount", () => {
      const result = recalculateWithDiscount(2000, 200, 0.16);

      expect(result.subtotal).toBe(2000);
      expect(result.discount).toBe(200);
      expect(result.tax).toBe(288); // 16% of 1800
      expect(result.total).toBe(2088);
    });

    it("handles zero discount", () => {
      const result = recalculateWithDiscount(1000, 0, 0.16);

      expect(result.subtotal).toBe(1000);
      expect(result.discount).toBe(0);
      expect(result.tax).toBe(160);
      expect(result.total).toBe(1160);
    });
  });

  describe("Rounding Helpers", () => {
    it("rounds to 2 decimals", () => {
      expect(round2(10.126)).toBe(10.13);
      expect(round2(10.124)).toBe(10.12);
      expect(round2(10.125)).toBe(10.13);
    });

    it("rounds to integer", () => {
      expect(roundToInteger(10.4)).toBe(10);
      expect(roundToInteger(10.5)).toBe(11);
      expect(roundToInteger(10.6)).toBe(11);
    });

    it("rounds up with decimals", () => {
      expect(roundUp(10.11, 2)).toBe(10.11);
      expect(roundUp(10.111, 2)).toBe(10.12);
      expect(roundUp(10.119, 2)).toBe(10.12);
    });

    it("rounds down with decimals", () => {
      expect(roundDown(10.19, 2)).toBe(10.19);
      expect(roundDown(10.199, 2)).toBe(10.19);
      expect(roundDown(10.191, 2)).toBe(10.19);
    });

    it("handles rounding with different decimal places", () => {
      expect(roundUp(10.1, 0)).toBe(11);
      expect(roundDown(10.9, 0)).toBe(10);
    });
  });

  describe("Edge Cases", () => {
    it("handles zero amounts", () => {
      expect(calculateTax(0)).toBe(0);
      expect(applyPercentageDiscount(0, 10)).toBe(0);
      expect(calculateChange(0, 0)).toBe(0);
    });

    it("handles very small amounts", () => {
      expect(calculateTax(0.01, 0.16)).toBe(0);
      expect(round2(0.001)).toBe(0);
    });

    it("handles very large amounts", () => {
      expect(calculateTax(1000000, 0.16)).toBe(160000);
      expect(applyPercentageDiscount(1000000, 10)).toBe(900000);
    });

    it("handles 100% discount", () => {
      expect(applyPercentageDiscount(1000, 100)).toBe(0);
    });

    it("handles 0% discount", () => {
      expect(applyPercentageDiscount(1000, 0)).toBe(1000);
    });
  });
});
