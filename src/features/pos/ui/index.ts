/**
 * 🎨 POS UI - EXPORTS
 * ===================
 *
 * Barrel export para componentes UI del POS.
 *
 * @module pos/ui
 * @version 1.0.0
 */

// Main screen
export { default as POSScreen } from "./routes/pos.screen";

// Layout components
export {
  POSHeader,
  POSNavigation,
  POSTabContent,
  POSFooter,
} from "./components/layout";

// Feature tabs
export { BrowseTab } from "./features/browse";
export { SaleTab } from "./features/sale";
export { PaymentTab } from "./features/payment";
export { HistoryTab } from "./features/history";
