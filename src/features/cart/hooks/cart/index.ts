/**
 * 🪝 CART HOOKS - BARREL EXPORTS
 * ==============================
 *
 * Cart-specific hooks following Feature-First v3.0.0 architecture.
 * State + Logic + Actions pattern.
 *
 * @version 1.0.0 - Cart Feature
 */

// 🔄 State Hook - Estado + reducer + animations
export {
  useCartState,
  createOptimisticUpdate,
  useIsItemAnimating,
} from "./useCartState";

// 🧠 Logic Hook - Cálculos + validaciones + formateo
export { useCartLogic } from "./useCartLogic";

// ⚡ Actions Hook - Add/Remove/Update actions + mutations
export { useCartActions } from "./useCartActions";

// 🏷️ Re-export types for convenience
export type {
  UseCartStateProps,
  UseCartStateReturn,
  UseCartLogicProps,
  UseCartLogicReturn,
  UseCartActionsProps,
  UseCartActionsReturn,
  CartState,
  CartStateAction,
} from "../../types";

export default {};
