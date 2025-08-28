/**
 * 💰 CART SUMMARY COMPONENT
 * =========================
 *
 * Cart totals summary with breakdown and checkout button.
 * Following Feature-First v3.0.0 patterns.
 *
 * @version 1.0.0 - Cart Feature
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  CreditCard,
  ShieldCheck,
  Truck,
  Tag,
  Info,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type {
  CartSummary as CartSummaryType,
  CartPriceBreakdown,
  CartValidationResult,
} from "../../../types";

// 🏷️ COMPONENT PROPS
// ===================

export interface CartSummaryProps {
  /** Cart summary data */
  summary: CartSummaryType | null;
  /** Detailed price breakdown */
  priceBreakdown: CartPriceBreakdown | null;
  /** Validation result */
  validation?: CartValidationResult;
  /** Custom checkout handler */
  onCheckout?: () => Promise<boolean>;
  /** Custom apply coupon handler */
  onApplyCoupon?: (code: string) => Promise<boolean>;
  /** Custom className for styling */
  className?: string;
  /** Show detailed breakdown by default */
  showDetails?: boolean;
  /** Show coupon input */
  showCouponInput?: boolean;
  /** Show security badges */
  showSecurityBadges?: boolean;
  /** Compact view mode */
  compact?: boolean;
  /** Loading states */
  isProcessingCheckout?: boolean;
  isApplyingCoupon?: boolean;
}

// 🎨 COMPONENT
// ============

/**
 * CartSummary - Display cart totals and checkout
 */
export function CartSummary({
  summary,
  priceBreakdown,
  validation,
  onCheckout,
  onApplyCoupon,
  className = "",
  showDetails = false,
  showCouponInput = true,
  showSecurityBadges = true,
  compact = false,
  isProcessingCheckout = false,
  isApplyingCoupon = false,
}: CartSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  // 🛡️ SAFE GUARDS - Prevent null reference errors
  if (!summary) {
    return (
      <div
        className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${className}`}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  console.log("💰 [CART SUMMARY] Rendering summary:", {
    itemCount: summary.itemCount,
    total: summary.total,
    hasValidation: !!validation,
    isExpanded,
  });

  // 🎯 CHECKOUT HANDLER
  // ===================

  const handleCheckout = useCallback(async () => {
    if (!onCheckout) return;

    console.log("💳 [CART SUMMARY] Processing checkout");

    try {
      const success = await onCheckout();
      if (!success) {
        console.error("❌ [CART SUMMARY] Checkout failed");
      }
    } catch (error) {
      console.error("❌ [CART SUMMARY] Checkout error:", error);
    }
  }, [onCheckout]);

  // 🏷️ COUPON HANDLER
  // ==================

  const handleApplyCoupon = useCallback(async () => {
    if (!onApplyCoupon || !couponCode.trim()) return;

    setCouponError("");
    console.log("🏷️ [CART SUMMARY] Applying coupon:", couponCode);

    try {
      const success = await onApplyCoupon(couponCode.trim());
      if (success) {
        setCouponCode("");
        console.log("✅ [CART SUMMARY] Coupon applied successfully");
      } else {
        setCouponError("Invalid coupon code");
      }
    } catch (error) {
      setCouponError("Failed to apply coupon");
      console.error("❌ [CART SUMMARY] Coupon error:", error);
    }
  }, [couponCode, onApplyCoupon]);

  // 🎨 RENDER HELPERS
  // =================

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const hasErrors = validation && !validation.isValid;
  const hasWarnings = validation && validation.warnings.length > 0;
  const canCheckout = summary.total > 0 && !hasErrors && !isProcessingCheckout;

  return (
    <div
      className={`
        ${compact ? "p-4" : "p-6"}
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-sm
        ${className}
      `}
    >
      {/* 💰 ORDER SUMMARY HEADER - Consistent with other components */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3
            className={`font-semibold text-gray-900 dark:text-gray-100 ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            Order Summary
          </h3>

          {!compact && (
            <button
              onClick={toggleExpanded}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Details
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Items info */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {summary.itemCount} item{summary.itemCount !== 1 ? "s" : ""}
          {summary.uniqueItems !== summary.itemCount && (
            <span> ({summary.uniqueItems} unique)</span>
          )}
        </div>

        {/* 🚨 VALIDATION MESSAGES */}
        {hasErrors && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Cart Issues Found
                </p>
                <ul className="mt-1 text-sm text-red-600 dark:text-red-400 space-y-1">
                  {validation!.errors.map((error, index) => (
                    <li key={index}>• {error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {hasWarnings && !hasErrors && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Notifications
                </p>
                <ul className="mt-1 text-sm text-amber-600 dark:text-amber-400 space-y-1">
                  {validation!.warnings.map((warning, index) => (
                    <li key={index}>• {warning.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 💰 PRICING BREAKDOWN */}
      <div className="mt-6 space-y-3">
        {/* Subtotal - always visible */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {priceBreakdown?.subtotal?.formatted ||
              `$${(summary.subtotal || 0).toFixed(2)}`}
          </span>
        </div>

        {/* Expandable details */}
        {isExpanded && (
          <div className="space-y-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            {/* Tax */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  ({priceBreakdown?.tax?.rate?.toFixed(2) || "8.8"}%)
                </span>
              </div>
              <span className="text-gray-900 dark:text-gray-100">
                {priceBreakdown?.tax?.formatted ||
                  `$${(summary.taxAmount || 0).toFixed(2)}`}
              </span>
            </div>

            {/* Shipping */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Truck className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Shipping
                </span>
                {priceBreakdown?.shipping?.method && (
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    ({priceBreakdown.shipping.method})
                  </span>
                )}
              </div>
              <span className="text-gray-900 dark:text-gray-100">
                {priceBreakdown?.shipping?.formatted ||
                  `$${(summary.shippingAmount || 0).toFixed(2)}`}
              </span>
            </div>

            {/* Discounts */}
            {(priceBreakdown?.discounts?.amount ||
              summary.discountAmount ||
              0) > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Discounts
                  </span>
                  {priceBreakdown?.discounts?.codes &&
                    priceBreakdown.discounts.codes.length > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        ({priceBreakdown.discounts.codes.join(", ")})
                      </span>
                    )}
                </div>
                <span className="text-green-600 dark:text-green-400">
                  -
                  {priceBreakdown?.discounts?.formatted ||
                    `$${(summary.discountAmount || 0).toFixed(2)}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <span
            className={`font-semibold text-gray-900 dark:text-gray-100 ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            Total
          </span>
          <span
            className={`font-bold text-gray-900 dark:text-gray-100 ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            {priceBreakdown?.total?.formatted ||
              `$${(summary.total || 0).toFixed(2)}`}
          </span>
        </div>

        {/* Free shipping message */}
        {priceBreakdown?.shipping?.amount === 0 &&
          (summary.subtotal || 0) > 0 && (
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Truck className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">
                🎉 You qualify for free shipping!
              </span>
            </div>
          )}
      </div>

      {/* 🏷️ COUPON INPUT */}
      {showCouponInput && !compact && (
        <div className="mt-6">
          <div className="flex gap-2">
            <div className="flex-grow">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                disabled={isApplyingCoupon}
                className="
                  w-full px-3 py-2 
                  border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleApplyCoupon();
                  }
                }}
              />
              {couponError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {couponError}
                </p>
              )}
            </div>

            <button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || isApplyingCoupon}
              className="
                px-4 py-2 
                bg-gray-100 dark:bg-gray-700
                text-gray-700 dark:text-gray-300
                border border-gray-300 dark:border-gray-600
                rounded-lg font-medium
                hover:bg-gray-200 dark:hover:bg-gray-600
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
                flex items-center gap-2
              "
            >
              {isApplyingCoupon ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Tag className="w-4 h-4" />
              )}
              Apply
            </button>
          </div>
        </div>
      )}

      {/* 💳 CHECKOUT BUTTON */}
      <div className="mt-6">
        <button
          onClick={handleCheckout}
          disabled={!canCheckout}
          className={`
            group relative w-full flex items-center justify-center gap-3 overflow-hidden
            ${compact ? "py-4 px-6 text-base" : "py-5 px-8 text-lg"}
            font-bold rounded-2xl
            transition-all duration-500
            ${
              canCheckout
                ? "bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/25 hover:scale-[1.02] hover:-translate-y-1"
                : "bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }
            ${isProcessingCheckout ? "animate-pulse" : ""}
          `}
        >
          {/* Button shine effect */}
          {canCheckout && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          )}

          <div className="relative flex items-center gap-3">
            {isProcessingCheckout ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard
                  className={`${compact ? "w-5 h-5" : "w-6 h-6"} ${
                    canCheckout ? "group-hover:rotate-12" : ""
                  } transition-transform duration-300`}
                />
                Proceed to Checkout
              </>
            )}
          </div>
        </button>

        {!canCheckout && !hasErrors && (
          <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
            Add items to your cart to continue
          </p>
        )}
      </div>

      {/* 🛡️ SECURITY BADGES */}
      {showSecurityBadges && !compact && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              <span>SSL Protected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartSummary;
