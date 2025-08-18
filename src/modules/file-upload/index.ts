// 🏆 ENTERPRISE FILE UPLOAD MODULE - BARREL EXPORTS
// ==================================================
// Central export file for entire enterprise module

// 🎯 Core Hooks (Enterprise Enhanced)
export { useFileUpload } from "./hooks/useFileUpload";
// useFileNotifications eliminado - usar useSmartNotifications del sistema principal

// 📝 Types & Interfaces
export * from "./types";

// 🏗️ Enterprise Configuration System
export {
  type EnterpriseFileUploadConfig,
  FileUploadConfigManager,
  fileUploadConfig,
  adaptConfigForHook,
  configUtils,
} from "./config";

// 📊 Enterprise Constants
export {
  ENTERPRISE_CONFIG,
  FILE_UPLOAD_ACTIONS,
  FILE_UPLOAD_STATUS,
  DEFAULT_PROVIDERS,
  FILE_UPLOAD_CACHE_TAGS,
  FILE_UPLOAD_PATHS,
  LOG_LEVELS,
  LOG_PREFIXES,
} from "./constants";

// 📝 Lite Logging System (Simplificado)
export {
  createFileUploadLogger,
  fileUploadHookLogger,
  fileUploadServerActionLogger,
  fileUploadSecurityLogger,
  fileUploadLogger,
  serverActionLogger, // Alias para compatibilidad
  optimisticLogger, // Para compatibilidad
} from "./utils/logger";

// 🔄 State Management (Optimistic Updates)
export {
  optimisticReducer,
  createInitialOptimisticState,
  optimisticSelectors,
} from "./reducers";

// 🎯 Server Layer
export * from "./server";

// 🛠️ Providers & Legacy Support
export * from "./providers";
export * from "./schemas";

// 🔧 Utilities
export * from "./utils";

// 🎨 UI Components (Enterprise Ready)
export * from "./ui";

// 🎯 Main services for convenience
export { fileUploadService, fileCategoryService } from "./server/services";

// 📋 Información del módulo
export const MODULE_INFO = {
  name: "file-upload",
  version: "1.0.0",
  description:
    "Sistema completo de gestión de archivos con soporte para múltiples proveedores",
  features: [
    "Upload local y S3",
    "Drag & drop interface",
    "Progress tracking",
    "File categorization",
    "Image previews",
    "Bulk operations",
    "Search and filters",
    "TypeScript support",
  ],
  dependencies: ["@prisma/client", "react", "lucide-react"],
  optionalDependencies: [
    "@aws-sdk/client-s3", // Para S3
    "cloudinary", // Para Cloudinary
  ],
} as const;
