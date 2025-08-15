// 🪝 FILE UPLOAD HOOKS - ENTERPRISE GRADE
// ========================================
// React 19 + Next.js 15 Optimized Hooks

// 🚀 PRIMARY ENTERPRISE HOOK
export { useFileUpload, useSingleFileUpload } from "./useFileUpload";

// 🛠️ Additional Hooks
export { useFileNotifications } from "./useFileNotifications";

// Re-exports de tipos para conveniencia
export type {
  UseFileUploadReturn,
  UploadProgress,
  UploadResult,
} from "../types";

// 🎯 RECOMMENDED USAGE:
// import { useFileUpload } from "@/modules/file-upload/hooks";
// This provides: Optimistic UI + React 19 features + Enterprise performance
