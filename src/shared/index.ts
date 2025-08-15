// 🤝 SHARED INDEX
// ===============
// Exportaciones centralizadas de todo lo compartido entre módulos

// 🪝 Hooks Compartidos
export { useAuth, useAdminPage, useProtectedPage } from "./hooks/useAuth";
export {
  useFeatureFlagsServer,
  useIsEnabled,
  FeatureFlagsServerProvider,
} from "./hooks/useFeatureFlagsServerActions";
export { usePermissions } from "./hooks/usePermissions";

// 📝 Tipos Compartidos
export * from "./types";

// 🛠️ Utilidades Compartidas
export * from "./utils";

// 🎯 Constantes
export * from "./constants";

// 🎨 UI Components
export * from "./ui";
