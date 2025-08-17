// 🎯 FILE UPLOAD SERVER
// =====================
// Barrel export para toda la capa server de file-upload

// Actions
export * from "./actions";

// Services
export { fileUploadService, fileCategoryService } from "./services";

// Queries
export * from "./queries";

// Mappers (avoiding naming conflicts with utils)
export {
  mapPrismaToUploadFile,
  mapUploadToCardData,
  mapPrismaToCategoryDomain,
  mapStatsToFileStats,
  getFileType,
  isVideoFile,
  isAudioFile,
  // Rename conflicting exports
  getFileExtension as getFileExtensionMapper,
  formatFileSize as formatFileSizeMapper,
  isImageFile as isImageFileMapper,
} from "./mappers";

// Validators
export * from "./validators";
