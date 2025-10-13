/**
 * 🛒 CART COMPONENTS - BARREL EXPORTS
 * ===================================
 *
 * Cart UI components following Feature-First v3.0.0 architecture.
 *
 * @version 1.0.0 - Cart Feature
 */

// 🎯 Main Components
export { default as CartItem } from "./CartItem";
export { default as CartSummary } from "./CartSummary";
export { default as CartEmpty } from "./CartEmpty";
export { default as CartBadge } from "./CartBadge";

// 🏷️ Badge Variants
export {
  CartBadgeSmall,
  CartBadgeLarge,
  CartBadgeAmount,
  CartCount,
} from "./CartBadge";

// 🎯 Debug Components
export { default as CartDebugPanel } from "./CartDebugPanel";

// 🏷️ Component Types
export type { CartItemProps } from "./CartItem";
export type { CartSummaryProps } from "./CartSummary";
export type { CartEmptyProps } from "./CartEmpty";
export type { CartBadgeProps } from "./CartBadge";

// TODO: Implement when needed
// export { default as CartPreview } from "./CartPreview";
// export type { CartPreviewProps } from "./CartPreview";

export default {};
