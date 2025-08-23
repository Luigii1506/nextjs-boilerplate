// 🏆 FILE UPLOAD MODULE - TANSTACK QUERY OPTIMIZED
// ================================================
// Módulo completo migrado a TanStack Query
// Performance enterprise, zero legacy code
//
// Enterprise: 2025-01-17 - Complete TanStack Query migration

// 🎯 Core Hooks (TanStack Query Optimized)
export {
  useFileUploadQuery,
  // Specialized hooks consolidated into useFileUploadQuery
  // useFileStats, useFileCategories, useFileUploader, useFileManager, useFileSearch
  FILE_UPLOAD_QUERY_KEYS,
} from "./hooks";
// Zero legacy code - solo TanStack Query optimizado

// 📝 Types & Interfaces
export * from "./types";

// 🏗️ Configuration migrated to utils - no separate config module needed

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

// 🔄 State Management (TanStack Query handles this automatically)
// Legacy reducers eliminated - TanStack Query provides optimistic updates

// 🎯 Server Layer
export * from "./server";

// 🛠️ Providers & Legacy Support
export * from "./providers";
export * from "./schemas";

// 🔧 Utilities
export * from "./utils";

// 🎨 UI Components (TanStack Query Optimized)
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
