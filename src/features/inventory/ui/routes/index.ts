/**
 * 📦 INVENTORY UI ROUTES - BARREL EXPORTS
 * ======================================
 *
 * Exportaciones centralizadas para todas las rutas/screens del módulo inventory
 * Single Page Application (SPA) pattern implementation
 *
 * Created: 2025-01-17 - Inventory Management Module
 * Updated: 2025-01-17 - Refactored to SPA Pattern
 */

// 🎯 Main SPA Screen (contains all functionality in tabs)
export { default as InventoryScreen } from "./inventory.screen";

// 📝 Note: With SPA pattern, we use internal tabs instead of separate routes:
// - Overview Tab: Dashboard and metrics
// - Products Tab: Product management
// - Categories Tab: Category organization
// - Suppliers Tab: Supplier management
// - Movements Tab: Stock movement history
// - Reports Tab: Analytics and reports
