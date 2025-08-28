/**
 * 🏷️ CART BADGE COMPONENT
 * ========================
 *
 * Badge component showing cart item count with animations.
 * Following Feature-First v3.0.0 patterns.
 *
 * @version 1.0.0 - Cart Feature
 */

"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

// 🏷️ COMPONENT PROPS
// ===================

export interface CartBadgeProps {
  /** Number of items in cart */
  itemCount: number;
  /** Total amount formatted */
  formattedTotal?: string;
  /** Show cart icon */
  showIcon?: boolean;
  /** Show amount instead of count */
  showAmount?: boolean;
  /** Custom onClick handler */
  onClick?: () => void;
  /** Custom className for styling */
  className?: string;
  /** Badge size variant */
  size?: "sm" | "md" | "lg";
  /** Badge color variant */
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  /** Animation enabled */
  animate?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

// 🎨 STYLING VARIANTS
// ===================

const sizeVariants = {
  sm: {
    container: "text-sm",
    icon: "w-4 h-4",
    badge: "text-xs px-1.5 py-0.5 min-w-5 h-5",
    badgeOffset: "-top-1 -right-1",
  },
  md: {
    container: "text-base",
    icon: "w-5 h-5",
    badge: "text-xs px-2 py-1 min-w-6 h-6",
    badgeOffset: "-top-2 -right-2",
  },
  lg: {
    container: "text-lg",
    icon: "w-6 h-6",
    badge: "text-sm px-2.5 py-1 min-w-7 h-7",
    badgeOffset: "-top-2 -right-2",
  },
};

const variantStyles = {
  default: "bg-gray-600 text-white",
  primary: "bg-blue-600 text-white",
  success: "bg-green-600 text-white",
  warning: "bg-yellow-600 text-white",
  danger: "bg-red-600 text-white",
};

// 🎨 COMPONENT
// ============

/**
 * CartBadge - Shows cart count/total with badge
 */
export function CartBadge({
  itemCount,
  formattedTotal,
  showIcon = true,
  showAmount = false,
  onClick,
  className = "",
  size = "md",
  variant = "primary",
  animate = true,
  isLoading = false,
}: CartBadgeProps) {
  const [previousCount, setPreviousCount] = useState(itemCount);
  const [isAnimating, setIsAnimating] = useState(false);

  console.log("🏷️ [CART BADGE] Rendering:", {
    itemCount,
    showAmount,
    formattedTotal,
    isLoading,
  });

  // Animation on count change
  useEffect(() => {
    if (animate && itemCount !== previousCount) {
      setIsAnimating(true);
      setPreviousCount(itemCount);

      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [itemCount, previousCount, animate]);

  const sizeConfig = sizeVariants[size];
  const badgeStyle = variantStyles[variant];

  const displayValue =
    showAmount && formattedTotal ? formattedTotal : itemCount;
  const shouldShowBadge = itemCount > 0 || isLoading;

  const handleClick = () => {
    if (onClick) {
      console.log("🏷️ [CART BADGE] Badge clicked");
      onClick();
    }
  };

  return (
    <div
      className={`
        relative inline-flex items-center gap-2
        ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
        ${sizeConfig.container}
        ${className}
      `}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* 🛒 Cart Icon */}
      {showIcon && (
        <div className="relative">
          <ShoppingCart
            className={`
              ${sizeConfig.icon} 
              text-gray-600 dark:text-gray-400
              ${isLoading ? "animate-pulse" : ""}
            `}
          />

          {/* 🏷️ Badge */}
          {shouldShowBadge && (
            <div
              className={`
                absolute ${sizeConfig.badgeOffset}
                ${sizeConfig.badge}
                ${badgeStyle}
                rounded-full font-semibold 
                flex items-center justify-center
                ${animate ? "transition-all duration-200" : ""}
                ${isAnimating ? "scale-110" : "scale-100"}
                ${isLoading ? "animate-pulse" : ""}
              `}
            >
              {isLoading ? (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              ) : showAmount && formattedTotal ? (
                <span className="truncate max-w-16">{formattedTotal}</span>
              ) : (
                <span>{itemCount > 99 ? "99+" : itemCount}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 📄 Text Display (without icon) */}
      {!showIcon && shouldShowBadge && (
        <div
          className={`
            inline-flex items-center gap-1
            ${sizeConfig.badge}
            ${badgeStyle}
            rounded-full font-medium
            ${animate ? "transition-all duration-200" : ""}
            ${isAnimating ? "scale-110" : "scale-100"}
            ${isLoading ? "animate-pulse" : ""}
          `}
        >
          {isLoading ? (
            <>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3 h-3" />
              <span>
                {showAmount && formattedTotal
                  ? formattedTotal
                  : `${itemCount > 99 ? "99+" : itemCount} item${
                      itemCount !== 1 ? "s" : ""
                    }`}
              </span>
            </>
          )}
        </div>
      )}

      {/* 💨 Animation Effects */}
      {animate && isAnimating && itemCount > previousCount && (
        <div
          className={`
            absolute ${sizeConfig.badgeOffset}
            pointer-events-none
            animate-ping
            w-3 h-3 bg-green-400 rounded-full opacity-75
          `}
        />
      )}
    </div>
  );
}

// 🎯 PRESET VARIANTS
// ==================

/**
 * Small cart badge for navigation
 */
export function CartBadgeSmall(props: Omit<CartBadgeProps, "size">) {
  return <CartBadge {...props} size="sm" />;
}

/**
 * Large cart badge for main sections
 */
export function CartBadgeLarge(props: Omit<CartBadgeProps, "size">) {
  return <CartBadge {...props} size="lg" />;
}

/**
 * Cart badge showing total amount
 */
export function CartBadgeAmount(props: Omit<CartBadgeProps, "showAmount">) {
  return <CartBadge {...props} showAmount={true} />;
}

/**
 * Simple cart count without icon
 */
export function CartCount(props: Omit<CartBadgeProps, "showIcon">) {
  return <CartBadge {...props} showIcon={false} />;
}

export default CartBadge;


