// 🛠️ SHARED UTILS INDEX
// =====================
// Utilidades compartidas entre módulos

export { cn } from "./cn";
export { formatDate, formatDateLong, getRelativeTime } from "./date";
export {
  setupAllEventListeners,
  setupSearchListener,
  setupNotificationsListener,
  setupProfileListener,
  setupAuditEventListener,
} from "./eventListeners";
export {
  roundCurrency,
  computeLineTotals,
  computeCartTotal,
} from "./pricing";
