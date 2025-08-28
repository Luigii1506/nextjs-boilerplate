/**
 * 🪝 CART HOOKS - MAIN BARREL EXPORTS
 * ===================================
 *
 * Central export point for all Cart hooks.
 * Following Feature-First v3.0.0 architecture.
 *
 * @version 1.0.0 - Cart Feature
 */

// 🛒 Cart-specific hooks (State + Logic + Actions)
export {
  useCartState,
  useCartLogic,
  useCartActions,
  createOptimisticUpdate,
  useIsItemAnimating,
} from "./cart";

// 💾 Persistence hooks (TODO)
export * from "./persistence";

// 🔧 Shared hooks (TODO)
export * from "./shared";

// 🏷️ Hook types re-export
export type {
  UseCartStateProps,
  UseCartStateReturn,
  UseCartLogicProps,
  UseCartLogicReturn,
  UseCartActionsProps,
  UseCartActionsReturn,
  CartState,
  CartStateAction,
} from "../types/hooks";

export default {};
