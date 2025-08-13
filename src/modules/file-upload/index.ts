// 📁 FILE UPLOAD MODULE
// =====================
// Módulo completo de gestión de archivos siguiendo arquitectura feature-first

// 📋 Schemas & Types
export * from "./schemas";
export * from "./types";

// 🎯 Server Layer
export * from "./server";

// 🛠️ Providers
export * from "./providers";

// 🪝 Hooks
export * from "./hooks";

// 🎨 UI Components
export * from "./ui";

// ⚙️ Configuration
export * from "./config";

// 🔧 Utils
export * from "./utils";

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
