/**
 * 🧠 CART LOGIC HOOK
 * ==================
 *
 * Hook para lógica de negocio del Cart: cálculos, validaciones, formateo.
 * Feature-First v3.0.0: Lógica + Validaciones + Formatters
 *
 * @version 1.0.0 - Cart Feature
 */

"use client";

import { useMemo, useCallback } from "react";
import type {
  UseCartLogicProps,
  UseCartLogicReturn,
  CartSummary,
  CartPriceBreakdown,
  CartValidationResult,
  CartItemWithProduct,
  CartWithItems,
} from "../../types";

// 🧮 CALCULATION CONSTANTS
// ========================

const DEFAULT_TAX_RATE = 0.0875; // 8.75% default tax rate
const DEFAULT_CURRENCY = "USD";
const DEFAULT_LOCALE = "en-US";
const MIN_SHIPPING_THRESHOLD = 75; // Free shipping over $75
const BASE_SHIPPING_COST = 9.99;

// 🪝 MAIN HOOK
// ============

/**
 * useCartLogic - Hook principal para lógica de negocio del cart
 */
export function useCartLogic(props: UseCartLogicProps): UseCartLogicReturn {
  const {
    cart,
    taxRate = DEFAULT_TAX_RATE,
    shippingCalculator,
    discountCalculator,
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
  } = props;

  console.log("🧠 [CART LOGIC] Processing cart logic:", {
    hasCart: !!cart,
    itemsCount: cart?.items.length || 0,
    taxRate,
    currency,
    locale,
  });

  // 🎨 FORMATTERS (MOVED TO TOP FOR INITIALIZATION)
  // ===============================================

  /**
   * Format price with currency and locale
   */
  const formatPrice = useCallback(
    (amount: number): string => {
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch (error) {
        console.warn("🎨 [CART LOGIC] Price formatting error:", error);
        return `$${amount.toFixed(2)}`;
      }
    },
    [currency, locale]
  );

  // 🧮 CALCULATIONS
  // ===============

  /**
   * Calculate cart summary with all totals
   */
  const summary: CartSummary = useMemo(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        itemCount: 0,
        uniqueItems: 0,
        subtotal: 0,
        taxAmount: 0,
        shippingAmount: 0,
        discountAmount: 0,
        total: 0,
        heaviestItem: undefined,
        mostExpensiveItem: undefined,
      };
    }

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueItems = cart.items.length;
    const subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);

    // Calculate tax
    const taxAmount = subtotal * taxRate;

    // Calculate shipping (free over threshold)
    const shippingAmount =
      subtotal >= MIN_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING_COST;

    // Discounts (future implementation)
    const discountAmount = 0;

    const total = subtotal + taxAmount + shippingAmount - discountAmount;

    // Find heaviest and most expensive items
    const heaviestItem = cart.items.reduce((heaviest, current) =>
      current.quantity > heaviest.quantity ? current : heaviest
    );

    const mostExpensiveItem = cart.items.reduce((expensive, current) =>
      current.total > expensive.total ? current : expensive
    );

    console.log("🧮 [CART LOGIC] Summary calculated:", {
      itemCount,
      uniqueItems,
      subtotal,
      taxAmount,
      shippingAmount,
      total,
    });

    return {
      itemCount,
      uniqueItems,
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
      total,
      heaviestItem,
      mostExpensiveItem,
    };
  }, [cart, taxRate]);

  /**
   * Generate detailed price breakdown for display
   */
  const priceBreakdown: CartPriceBreakdown = useMemo(() => {
    return {
      subtotal: {
        amount: summary.subtotal || 0,
        formatted: formatPrice(summary.subtotal || 0),
      },
      tax: {
        amount: summary.taxAmount || 0,
        rate: taxRate * 100, // Convert to percentage
        formatted: formatPrice(summary.taxAmount || 0),
      },
      shipping: {
        amount: summary.shippingAmount || 0,
        method:
          (summary.shippingAmount || 0) === 0
            ? "Free Shipping"
            : "Standard Shipping",
        formatted:
          (summary.shippingAmount || 0) === 0
            ? "Free"
            : formatPrice(summary.shippingAmount || 0),
      },
      discounts: {
        amount: summary.discountAmount || 0,
        codes: [], // TODO: Implement coupon codes
        formatted: formatPrice(summary.discountAmount || 0),
      },
      total: {
        amount: summary.total || 0,
        formatted: formatPrice(summary.total || 0),
      },
    };
  }, [summary, taxRate, formatPrice]);

  // 🎨 FORMATTERS
  // =============

  /**
   * Format quantity with unit
   */
  const formatQuantity = useCallback(
    (quantity: number, unit: string): string => {
      if (quantity === 1) {
        return `1 ${unit}`;
      }
      return `${quantity} ${unit}${unit.endsWith("s") ? "" : "s"}`;
    },
    []
  );

  // 🔍 ITEM FINDERS
  // ===============

  /**
   * Find item by product ID
   */
  const findItem = useCallback(
    (productId: string): CartItemWithProduct | undefined => {
      if (!cart?.items) return undefined;
      return cart.items.find((item) => item.productId === productId);
    },
    [cart?.items]
  );

  /**
   * Find item index by product ID
   */
  const findItemIndex = useCallback(
    (productId: string): number => {
      if (!cart?.items) return -1;
      return cart.items.findIndex((item) => item.productId === productId);
    },
    [cart?.items]
  );

  /**
   * Get item quantity by product ID
   */
  const getItemQuantity = useCallback(
    (productId: string): number => {
      const item = findItem(productId);
      return item?.quantity || 0;
    },
    [findItem]
  );

  // ✅ VALIDATIONS
  // ==============

  /**
   * Validate single cart item (MOVED TO TOP FOR INITIALIZATION)
   */
  const validateItem = useCallback(
    (cartItem: CartItemWithProduct): CartValidationResult => {
      const errors: CartValidationResult["errors"] = [];
      const warnings: CartValidationResult["warnings"] = [];
      const product = cartItem.product;

      // Product availability
      if (!product) {
        errors.push({
          type: "VALIDATION_ERROR",
          productId: cartItem.productId,
          cartItemId: cartItem.id,
          message: "Product not found",
          suggestedAction: "Remove from cart",
        });
        return { isValid: false, errors, warnings };
      }

      if (!product.isActive) {
        errors.push({
          type: "PRODUCT_UNAVAILABLE",
          productId: product.id,
          cartItemId: cartItem.id,
          message: `"${product.name}" is no longer available`,
          suggestedAction: "Remove from cart",
        });
      }

      // Stock validation
      if (cartItem.quantity > product.stock) {
        if (product.stock === 0) {
          errors.push({
            type: "OUT_OF_STOCK",
            productId: product.id,
            cartItemId: cartItem.id,
            message: `"${product.name}" is out of stock`,
            suggestedAction: "Remove from cart",
          });
        } else {
          errors.push({
            type: "INVALID_QUANTITY",
            productId: product.id,
            cartItemId: cartItem.id,
            message: `Only ${product.stock} units of "${product.name}" available`,
            currentValue: cartItem.quantity,
            maxValue: product.stock,
            suggestedAction: `Set quantity to ${product.stock}`,
          });
        }
      } else if (product.stock > 0 && product.stock <= 3) {
        warnings.push({
          type: "LOW_STOCK",
          productId: product.id,
          cartItemId: cartItem.id,
          message: `Only ${product.stock} units of "${product.name}" remaining`,
        });
      }

      // Price validation
      const currentPrice = product.price;
      const cartPrice = cartItem.unitPrice;
      const priceDifference = Math.abs(currentPrice - cartPrice) / cartPrice;

      if (priceDifference > 0.1) {
        // 10% difference
        warnings.push({
          type: "PRICE_CHANGED",
          productId: product.id,
          cartItemId: cartItem.id,
          message: `Price of "${product.name}" has changed from ${formatPrice(
            cartPrice
          )} to ${formatPrice(currentPrice)}`,
          oldValue: cartPrice,
          newValue: currentPrice,
        });
      }

      // Quantity validation
      if (cartItem.quantity <= 0) {
        errors.push({
          type: "INVALID_QUANTITY",
          productId: product.id,
          cartItemId: cartItem.id,
          message: "Item quantity must be greater than 0",
          suggestedAction: "Remove from cart",
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
    [formatPrice]
  );

  /**
   * Validate entire cart
   */
  const validateCart = useCallback(async (): Promise<CartValidationResult> => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
      };
    }

    const errors: CartValidationResult["errors"] = [];
    const warnings: CartValidationResult["warnings"] = [];

    // Validate each item
    for (const item of cart.items) {
      const itemValidation = validateItem(item);
      errors.push(...itemValidation.errors);
      warnings.push(...itemValidation.warnings);
    }

    // Cart-level validations
    if (summary.total < 0) {
      errors.push({
        type: "VALIDATION_ERROR",
        message: "Cart total cannot be negative",
      });
    }

    if (summary.itemCount > 100) {
      warnings.push({
        type: "INVALID_QUANTITY",
        message: "Large cart: Consider splitting into multiple orders",
      });
    }

    const isValid = errors.length === 0;

    console.log("✅ [CART LOGIC] Cart validation completed:", {
      isValid,
      errorsCount: errors.length,
      warningsCount: warnings.length,
    });

    return {
      isValid,
      errors,
      warnings,
    };
  }, [cart, summary, validateItem]);

  /**
   * Check if quantity is valid for a product
   */
  const isValidQuantity = useCallback(
    (quantity: number, maxStock: number): boolean => {
      return quantity > 0 && quantity <= maxStock;
    },
    []
  );

  // 🔄 COMPARISONS
  // ==============

  /**
   * Check if cart has changed from previous state
   */
  const hasChanged = useCallback(
    (previousCart: CartWithItems | null): boolean => {
      if (!cart && !previousCart) return false;
      if (!cart || !previousCart) return true;

      // Quick checks
      if (cart.items.length !== previousCart.items.length) return true;
      if (cart.total !== previousCart.total) return true;
      if (cart.updatedAt.getTime() !== previousCart.updatedAt.getTime())
        return true;

      // Deep item comparison
      for (let i = 0; i < cart.items.length; i++) {
        const currentItem = cart.items[i];
        const previousItem = previousCart.items[i];

        if (
          currentItem.id !== previousItem.id ||
          currentItem.quantity !== previousItem.quantity ||
          currentItem.total !== previousItem.total
        ) {
          return true;
        }
      }

      return false;
    },
    [cart]
  );

  /**
   * Get detailed changes between carts
   */
  const getItemChanges = useCallback(
    (previousCart: CartWithItems | null) => {
      const changes = {
        added: [] as CartItemWithProduct[],
        updated: [] as CartItemWithProduct[],
        removed: [] as CartItemWithProduct[],
      };

      if (!cart || !previousCart) {
        return changes;
      }

      const previousItemsMap = new Map(
        previousCart.items.map((item) => [item.productId, item])
      );
      const currentItemsMap = new Map(
        cart.items.map((item) => [item.productId, item])
      );

      // Find added and updated items
      cart.items.forEach((currentItem) => {
        const previousItem = previousItemsMap.get(currentItem.productId);
        if (!previousItem) {
          changes.added.push(currentItem);
        } else if (
          previousItem.quantity !== currentItem.quantity ||
          previousItem.total !== currentItem.total
        ) {
          changes.updated.push(currentItem);
        }
      });

      // Find removed items
      previousCart.items.forEach((previousItem) => {
        if (!currentItemsMap.has(previousItem.productId)) {
          changes.removed.push(previousItem);
        }
      });

      console.log("🔄 [CART LOGIC] Item changes calculated:", {
        added: changes.added.length,
        updated: changes.updated.length,
        removed: changes.removed.length,
      });

      return changes;
    },
    [cart]
  );

  // 📤 RETURN INTERFACE
  // ===================

  return {
    // Calculations
    summary,
    priceBreakdown,

    // Validations
    validateCart,
    validateItem,
    isValidQuantity,

    // Formatters
    formatPrice,
    formatQuantity,

    // Item finders
    findItem,
    findItemIndex,
    getItemQuantity,

    // Comparisons
    hasChanged,
    getItemChanges,
  };
}

export default useCartLogic;
