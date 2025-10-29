/**
 * 🛒 STOREFRONT CONTEXT - BARREL EXPORTS
 * ======================================
 *
 * Exportaciones centralizadas para el context del storefront SPA
 *
 * @version 3.0.0 - TanStack Query Migration
 */

// 🎨 UI Store (Zustand - Solo UI State)
export {
  useStorefrontUI,
  useStorefrontUIActions,
  STOREFRONT_TABS,
  type TabId,
} from "../state/ui.store";

// 📝 Nota: El antiguo StorefrontContext.tsx con data management
// fue reemplazado por TanStack Query hooks.
// Ver: src/features/storefront/hooks/
