// 🛠️ FILE UPLOAD PROVIDERS
// ========================
// Export de todos los proveedores de upload

export { LocalUploadProvider } from "./local-upload";
export { S3UploadProvider } from "./s3-upload";
export type { UploadProvider as UploadProviderInterface } from "./local-upload";

// Re-exports de tipos para conveniencia
export type { UploadResult, S3Config, CloudinaryConfig } from "../types";
