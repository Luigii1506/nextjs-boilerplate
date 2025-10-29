/**
 * 💰 Pricing Utilities
 * =====================
 *
 * Shared rounding and total calculation helpers used by both
 * storefront and POS features to keep calculations consistent.
 */

export function roundCurrency(value: number, decimals: number = 2): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export interface LineTotalsInput {
  unitPrice: number;
  quantity: number;
  discount?: number;
  taxRate?: number;
}

export interface LineTotalsResult {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function computeLineTotals({
  unitPrice,
  quantity,
  discount = 0,
  taxRate = 0,
}: LineTotalsInput): LineTotalsResult {
  const normalizedUnitPrice = roundCurrency(unitPrice);
  const normalizedDiscount = roundCurrency(discount);
  const subtotal = roundCurrency(normalizedUnitPrice * quantity);
  const discountedBase = Math.max(subtotal - normalizedDiscount, 0);
  const tax = roundCurrency(discountedBase * taxRate);
  const total = roundCurrency(discountedBase + tax);

  return {
    subtotal,
    discount: normalizedDiscount,
    tax,
    total,
  };
}

export interface CartTotalsInput {
  subtotal: number;
  discountAmount?: number;
  feesAmount?: number;
  taxAmount?: number;
}

export function computeCartTotal({
  subtotal,
  discountAmount = 0,
  feesAmount = 0,
  taxAmount = 0,
}: CartTotalsInput): number {
  const baseSubtotal = roundCurrency(subtotal);
  const discount = roundCurrency(discountAmount);
  const fees = roundCurrency(feesAmount);
  const tax = roundCurrency(taxAmount);

  return roundCurrency(baseSubtotal - discount + fees + tax);
}
