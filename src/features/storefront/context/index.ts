/**
 * 🛒 STOREFRONT CONTEXT - BARREL EXPORTS
 * ======================================
 *
 * Exportaciones centralizadas para el context del storefront SPA
 *
 * @version 3.0.0 - TanStack Query Migration
 */

// 🎨 UI Context (Nuevo - Solo UI State)
export {
  StorefrontUIProvider,
  useStorefrontUI,
  STOREFRONT_TABS,
  type TabId,
} from "./StorefrontUIContext";

// 📝 Nota: El antiguo StorefrontContext.tsx con data management
// fue reemplazado por TanStack Query hooks.
// Ver: src/features/storefront/hooks/
