// 🤝 SHARED INDEX
// ===============
// Exportaciones centralizadas de todo lo compartido entre módulos

// 🪝 Hooks Compartidos
export { useAuth, useAdminPage, useProtectedPage } from "./hooks/useAuth";
// Feature flags exports moved to @/core/feature-flags
export { usePermissions } from "./hooks/usePermissions";
export { useNotifications } from "./hooks/useNotifications";
export {
  useBroadcast,
  useFeatureFlagsBroadcast,
  useAuthBroadcast,
  useDataBroadcast,
} from "./hooks/useBroadcast";

// 📝 Tipos Compartidos
export * from "./types";

// 🛠️ Utilidades Compartidas
export * from "./utils";

// 🎯 Constantes
export * from "./constants";

// 🎨 UI Components
export * from "./ui";
export * from "./components";
