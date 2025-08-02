// 🎨 FILE UPLOAD COMPONENTS
// ========================
// Export de todos los componentes UI del módulo

import type { UploadFile } from "../types";

export { FileUploader } from "./FileUploader";
export { FileManager } from "./FileManager";
export { FileStats } from "./FileStats";
export { ImageGallery } from "./ImageGallery";

// Re-exports de tipos de props para conveniencia
export type { FileUploaderProps, UploadFile } from "../types";

// Tipos adicionales para componentes
export interface FileComponentsProps {
  className?: string;
  onFileSelect?: (file: UploadFile) => void;
  onFileUpload?: () => void;
  onFileDelete?: (file: UploadFile) => void;
  onFileDownload?: (file: UploadFile) => void;
}
