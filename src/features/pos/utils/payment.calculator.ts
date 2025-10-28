/**
 * 💰 Payment Calculator
 * =====================
 *
 * Utilidades para cálculos de pagos, descuentos y cambio.
 *
 * @module pos/utils/payment.calculator
 * @version 1.0.0
 */

// ========================================
// TAX CALCULATIONS
// ========================================

/**
 * Calcular IVA (16% en México)
 */
export function calculateTax(subtotal: number, taxRate: number = 0.16): number {
  return Math.round(subtotal * taxRate * 100) / 100;
}

/**
 * Calcular subtotal desde total con IVA incluido
 */
export function calculateSubtotalFromTotal(
  total: number,
  taxRate: number = 0.16
): number {
  return Math.round((total / (1 + taxRate)) * 100) / 100;
}

/**
 * Calcular IVA incluido en un total
 */
export function calculateIncludedTax(
  total: number,
  taxRate: number = 0.16
): number {
  const subtotal = calculateSubtotalFromTotal(total, taxRate);
  return total - subtotal;
}

// ========================================
// DISCOUNT CALCULATIONS
// ========================================

/**
 * Aplicar descuento porcentual
 */
export function applyPercentageDiscount(
  amount: number,
  percentage: number
): number {
  if (percentage < 0 || percentage > 100) {
    throw new Error("Percentage must be between 0 and 100");
  }

  const discount = Math.round(amount * (percentage / 100) * 100) / 100;
  return Math.round((amount - discount) * 100) / 100;
}

/**
 * Calcular monto de descuento porcentual
 */
export function calculatePercentageDiscount(
  amount: number,
  percentage: number
): number {
  if (percentage < 0 || percentage > 100) {
    throw new Error("Percentage must be between 0 and 100");
  }

  return Math.round(amount * (percentage / 100) * 100) / 100;
}

/**
 * Aplicar descuento fijo
 */
export function applyFixedDiscount(amount: number, discount: number): number {
  if (discount < 0) {
    throw new Error("Discount must be positive");
  }

  if (discount > amount) {
    throw new Error("Discount cannot exceed amount");
  }

  return Math.round((amount - discount) * 100) / 100;
}

/**
 * Calcular porcentaje de descuento desde monto
 */
export function calculateDiscountPercentage(
  originalAmount: number,
  discountAmount: number
): number {
  if (originalAmount === 0) return 0;
  return Math.round((discountAmount / originalAmount) * 100 * 100) / 100;
}

/**
 * Validar que el descuento es válido
 */
export function validateDiscount(
  amount: number,
  discountType: "percentage" | "fixed",
  discountValue: number
): { valid: boolean; error?: string } {
  if (discountType === "percentage") {
    if (discountValue < 0 || discountValue > 100) {
      return { valid: false, error: "Percentage must be between 0 and 100" };
    }
  } else {
    if (discountValue < 0) {
      return { valid: false, error: "Discount must be positive" };
    }
    if (discountValue > amount) {
      return { valid: false, error: "Discount cannot exceed amount" };
    }
  }

  return { valid: true };
}

// ========================================
// CHANGE CALCULATIONS
// ========================================

/**
 * Calcular cambio
 */
export function calculateChange(amountPaid: number, total: number): number {
  const change = amountPaid - total;
  return Math.max(0, Math.round(change * 100) / 100);
}

/**
 * Calcular denominaciones para cambio (billetes y monedas en MXN)
 */
export function calculateChangeDenominations(change: number): {
  bills: { value: number; count: number }[];
  coins: { value: number; count: number }[];
} {
  const bills = [1000, 500, 200, 100, 50, 20];
  const coins = [10, 5, 2, 1, 0.5, 0.2, 0.1];

  let remaining = Math.round(change * 100) / 100;
  const billResult: { value: number; count: number }[] = [];
  const coinResult: { value: number; count: number }[] = [];

  // Calcular billetes
  for (const bill of bills) {
    if (remaining >= bill) {
      const count = Math.floor(remaining / bill);
      billResult.push({ value: bill, count });
      remaining = Math.round((remaining - bill * count) * 100) / 100;
    }
  }

  // Calcular monedas
  for (const coin of coins) {
    if (remaining >= coin - 0.001) {
      // Margen de error por decimales
      const count = Math.floor(remaining / coin);
      coinResult.push({ value: coin, count });
      remaining = Math.round((remaining - coin * count) * 100) / 100;
    }
  }

  return { bills: billResult, coins: coinResult };
}

/**
 * Redondear al múltiplo más cercano (útil para países sin centavos)
 */
export function roundToNearest(amount: number, multiple: number): number {
  return Math.round(amount / multiple) * multiple;
}

// ========================================
// SPLIT PAYMENT CALCULATIONS
// ========================================

/**
 * Validar pago mixto
 */
export function validateMixedPayment(
  total: number,
  cashAmount: number,
  cardAmount: number,
  transferAmount: number
): { valid: boolean; error?: string; totalPaid: number } {
  const totalPaid = cashAmount + cardAmount + transferAmount;

  if (totalPaid < total) {
    return {
      valid: false,
      error: "Total paid is less than amount due",
      totalPaid,
    };
  }

  if (cashAmount < 0 || cardAmount < 0 || transferAmount < 0) {
    return {
      valid: false,
      error: "Payment amounts must be positive",
      totalPaid,
    };
  }

  return { valid: true, totalPaid };
}

/**
 * Calcular distribución de pago mixto
 */
export function calculateMixedPaymentDistribution(
  total: number,
  cashPercentage: number,
  cardPercentage: number,
  transferPercentage: number
): { cash: number; card: number; transfer: number } {
  const totalPercentage = cashPercentage + cardPercentage + transferPercentage;

  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error("Percentages must sum to 100");
  }

  return {
    cash: Math.round(total * (cashPercentage / 100) * 100) / 100,
    card: Math.round(total * (cardPercentage / 100) * 100) / 100,
    transfer: Math.round(total * (transferPercentage / 100) * 100) / 100,
  };
}

// ========================================
// ITEM CALCULATIONS
// ========================================

/**
 * Calcular total de un item
 */
export function calculateItemTotal(
  quantity: number,
  unitPrice: number,
  discount: number = 0
): number {
  const subtotal = quantity * unitPrice;
  return Math.round((subtotal - discount) * 100) / 100;
}

/**
 * Calcular subtotal de items
 */
export function calculateItemsSubtotal(
  items: { quantity: number; unitPrice: number; discount?: number }[]
): number {
  return items.reduce((sum, item) => {
    const itemTotal = calculateItemTotal(
      item.quantity,
      item.unitPrice,
      item.discount || 0
    );
    return sum + itemTotal;
  }, 0);
}

/**
 * Aplicar descuento proporcional a items
 */
export function distributeDiscountAcrossItems(
  items: { subtotal: number }[],
  totalDiscount: number
): number[] {
  const totalSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  if (totalSubtotal === 0) return items.map(() => 0);

  return items.map((item) => {
    const proportion = item.subtotal / totalSubtotal;
    return Math.round(totalDiscount * proportion * 100) / 100;
  });
}

// ========================================
// SUMMARY CALCULATIONS
// ========================================

/**
 * Calcular resumen completo de venta
 */
export function calculateSaleSummary(
  items: { quantity: number; unitPrice: number; discount?: number }[],
  globalDiscount: number = 0,
  taxRate: number = 0.16
): {
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  total: number;
} {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = calculateItemsSubtotal(items);

  const discount = globalDiscount;

  const subtotalAfterDiscount = subtotal - discount;

  const tax = calculateTax(subtotalAfterDiscount, taxRate);

  const total = Math.round((subtotalAfterDiscount + tax) * 100) / 100;

  return {
    itemCount,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    taxRate,
    total,
  };
}

/**
 * Recalcular total con nuevo descuento
 */
export function recalculateWithDiscount(
  subtotal: number,
  newDiscount: number,
  taxRate: number = 0.16
): { subtotal: number; discount: number; tax: number; total: number } {
  const subtotalAfterDiscount = subtotal - newDiscount;
  const tax = calculateTax(subtotalAfterDiscount, taxRate);
  const total = Math.round((subtotalAfterDiscount + tax) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(newDiscount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total,
  };
}

// ========================================
// ROUNDING HELPERS
// ========================================

/**
 * Redondear a 2 decimales
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Redondear al entero más cercano
 */
export function roundToInteger(value: number): number {
  return Math.round(value);
}

/**
 * Redondear hacia arriba (siempre favoreciendo al negocio)
 */
export function roundUp(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.ceil(value * multiplier) / multiplier;
}

/**
 * Redondear hacia abajo (siempre favoreciendo al cliente)
 */
export function roundDown(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.floor(value * multiplier) / multiplier;
}
