// 🏆 ENTERPRISE FILE UPLOAD HOOK - TEMPLATE ESTÁNDAR
// =====================================================
// Template empresarial que seguirán TODOS los módulos

"use client";

import {
  useActionState,
  useOptimistic,
  useCallback,
  useMemo,
  useRef,
  useTransition,
  useEffect,
} from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  uploadFileServerAction,
  getFilesServerAction,
  deleteFileServerAction,
  getFileStatsServerAction,
  type FileActionResult,
} from "../server/actions";
import type {
  UploadCardData,
  FileStatsData,
  UseFileUploadReturn,
  UploadConfig,
} from "../types";

// 🏗️ ENTERPRISE IMPORTS - Modular, maintainable, reusable
import { FILE_UPLOAD_ACTIONS } from "../constants";
import { fileUploadLogger } from "../utils/logger";
import { fileUploadConfig, adaptConfigForHook } from "../config";
import {
  optimisticReducer,
  createInitialOptimisticState,
  optimisticSelectors,
  type OptimisticAction,
} from "../reducers";

// 🚀 ENTERPRISE FILE UPLOAD HOOK
export const useFileUpload = (
  userConfig?: UploadConfig
): UseFileUploadReturn => {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const hasInitialized = useRef(false);

  // 🏗️ ENTERPRISE: Configuration management with user overrides
  const enterpriseConfig = useMemo(
    () => adaptConfigForHook(userConfig),
    [userConfig]
  );

  // 🎯 ENTERPRISE: Structured logging with performance tracking
  fileUploadLogger.timeStart("Hook Initialization");
  fileUploadLogger.debug("useFileUpload hook initialized", {
    hasUserConfig: !!userConfig,
    userConfigOptions: userConfig ? Object.keys(userConfig) : [],
    enterpriseFeatures: fileUploadConfig.getConfigSummary(),
  });
  fileUploadLogger.timeEnd("Hook Initialization");

  // 🎯 PRIMARY DATA STATE (Server Actions as Source of Truth)
  const [filesState, filesAction, filesPending] = useActionState(
    async (): Promise<FileActionResult> => {
      fileUploadLogger.debug("Fetching files from server");
      return await getFilesServerAction();
    },
    null
  );

  const [statsState, statsAction, statsPending] = useActionState(
    async (): Promise<FileActionResult> => {
      fileUploadLogger.debug("Fetching stats from server");
      return await getFileStatsServerAction();
    },
    null
  );

  // 🎯 OPTIMISTIC STATE (UI feedback only) - Enterprise managed
  const [optimisticState, addOptimistic] = useOptimistic(
    createInitialOptimisticState(),
    optimisticReducer
  );

  // 🚀 ENTERPRISE UPLOAD FUNCTION
  const uploadFiles = useCallback(
    async (
      files: File[],
      options?: {
        provider?: "local" | "s3" | "cloudinary";
        categoryId?: string;
        makePublic?: boolean;
      }
    ) => {
      if (!user) throw new Error("Usuario no autenticado");

      fileUploadLogger.info("Starting file upload", {
        count: files.length,
        provider: options?.provider || "local",
        maxFileSize: enterpriseConfig.ui.maxFileSize,
        batchLimit: enterpriseConfig.ui.maxFilesPerBatch,
      });

      // 🎯 ENTERPRISE: Validate against configuration limits
      if (files.length > enterpriseConfig.ui.maxFilesPerBatch) {
        throw new Error(
          `Too many files. Maximum: ${enterpriseConfig.ui.maxFilesPerBatch}`
        );
      }

      const tempIds = files.map(() => `temp-${Date.now()}-${Math.random()}`);

      // ✨ OPTIMISTIC UI: Start progress (configurable)
      if (enterpriseConfig.features.optimisticUI) {
        startTransition(() => {
          addOptimistic({
            type: FILE_UPLOAD_ACTIONS.START_UPLOAD,
            files,
            tempIds,
          } as OptimisticAction);
        });
      }

      try {
        const results = await Promise.all(
          files.map(async (file, index) => {
            const tempId = tempIds[index];

            try {
              // Progress feedback (configurable)
              if (enterpriseConfig.features.progressTracking) {
                setTimeout(() => {
                  startTransition(() => {
                    addOptimistic({
                      type: FILE_UPLOAD_ACTIONS.UPDATE_PROGRESS,
                      tempId,
                      progress: 50,
                    } as OptimisticAction);
                  });
                }, enterpriseConfig.timing.uploadProgressDelay);
              }

              // Create FormData
              const formData = new FormData();
              formData.append("file", file);
              formData.append("provider", options?.provider || "local");
              if (options?.categoryId)
                formData.append("categoryId", options.categoryId);
              if (options?.makePublic) formData.append("makePublic", "true");

              // Upload
              const result = await uploadFileServerAction(formData);

              if (result.success) {
                // Mark as completed
                startTransition(() => {
                  addOptimistic({
                    type: FILE_UPLOAD_ACTIONS.COMPLETE_UPLOAD,
                    tempId,
                  } as OptimisticAction);
                });

                fileUploadLogger.info("File uploaded successfully", {
                  filename: file.name,
                  tempId,
                  size: file.size,
                });
                return { success: true, file: result.data as UploadCardData };
              } else {
                throw new Error(result.error || "Upload failed");
              }
            } catch (error) {
              // Mark as failed
              startTransition(() => {
                addOptimistic({
                  type: FILE_UPLOAD_ACTIONS.FAIL_UPLOAD,
                  tempId,
                  error:
                    error instanceof Error ? error.message : "Upload error",
                } as OptimisticAction);
              });

              fileUploadLogger.error("Upload failed", error, {
                filename: file.name,
                tempId,
              });
              return {
                success: false,
                error: error instanceof Error ? error.message : "Upload error",
              };
            }
          })
        );

        // 🔄 AUTO-REFRESH (Server as Source of Truth) - Configurable
        const successCount = results.filter((r) => r.success).length;
        if (successCount > 0 && enterpriseConfig.features.autoRefresh) {
          fileUploadLogger.info("Auto-refreshing after successful uploads", {
            successCount,
            totalCount: results.length,
            refreshEnabled: enterpriseConfig.features.autoRefresh,
          });

          // Refresh both files and stats
          startTransition(() => {
            filesAction();
            statsAction();
          });

          // Clear completed uploads after configurable delay
          setTimeout(() => {
            startTransition(() => {
              addOptimistic({
                type: FILE_UPLOAD_ACTIONS.CLEAR_COMPLETED,
              } as OptimisticAction);
            });
          }, enterpriseConfig.timing.clearCompletedDelay);
        }

        return results;
      } catch (error) {
        fileUploadLogger.error("Batch upload failed", error);
        throw error;
      }
    },
    [
      user,
      addOptimistic,
      startTransition,
      filesAction,
      statsAction,
      enterpriseConfig.features.autoRefresh,
      enterpriseConfig.features.optimisticUI,
      enterpriseConfig.features.progressTracking,
      enterpriseConfig.timing.clearCompletedDelay,
      enterpriseConfig.timing.uploadProgressDelay,
      enterpriseConfig.ui.maxFileSize,
      enterpriseConfig.ui.maxFilesPerBatch,
    ]
  );

  // 🗑️ ENTERPRISE DELETE FUNCTION (Enhanced with performance tracking)
  const deleteFile = useCallback(
    async (fileId: string) => {
      if (!user) throw new Error("Usuario no autenticado");

      fileUploadLogger.timeStart(`Delete File ${fileId}`);
      fileUploadLogger.info("Deleting file", {
        fileId,
        userId: user.id,
        autoRefresh: enterpriseConfig.features.autoRefresh,
      });

      try {
        const formData = new FormData();
        formData.append("id", fileId);

        const result = await deleteFileServerAction(formData);

        if (!result?.success) {
          throw new Error(result?.error || "Delete failed");
        }

        fileUploadLogger.info("File deleted successfully", { fileId });
        fileUploadLogger.timeEnd(`Delete File ${fileId}`);

        // 🔄 AUTO-REFRESH (Server as Source of Truth) - Configurable
        if (enterpriseConfig.features.autoRefresh) {
          startTransition(() => {
            filesAction();
            statsAction();
          });
        }
      } catch (error) {
        fileUploadLogger.error("Delete failed", error, {
          fileId,
          userId: user.id,
        });
        fileUploadLogger.timeEnd(`Delete File ${fileId}`);
        throw error;
      }
    },
    [user, filesAction, statsAction, enterpriseConfig.features.autoRefresh]
  );

  // 🚀 AUTO-INITIALIZATION (React-compliant with useEffect) - Enterprise enhanced
  useEffect(() => {
    if (!hasInitialized.current && user) {
      hasInitialized.current = true;

      fileUploadLogger.group("Module Initialization");
      fileUploadLogger.info("Initializing file upload module", {
        userId: user.id,
        userEmail: user.email,
        configSummary: fileUploadConfig.getConfigSummary(),
      });

      // Load initial data after render
      startTransition(() => {
        filesAction();
        statsAction();
      });

      fileUploadLogger.groupEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user - actions are stable

  // 🎯 COMPUTED STATES (Enterprise patterns)
  const isLoading = useMemo(
    () => filesPending || statsPending || isPending,
    [filesPending, statsPending, isPending]
  );

  const error = useMemo(
    () => filesState?.error || statsState?.error || null,
    [filesState?.error, statsState?.error]
  );

  const files = useMemo(
    () => (filesState?.success ? (filesState.data as UploadCardData[]) : []),
    [filesState]
  );

  const stats = useMemo(
    () => (statsState?.success ? (statsState.data as FileStatsData) : null),
    [statsState]
  );

  // 🔄 Refresh Actions (Memoized outside return)
  const refresh = useCallback(() => {
    fileUploadLogger.debug("Manual refresh requested");
    if (enterpriseConfig.features.autoRefresh) {
      startTransition(() => {
        filesAction();
        statsAction();
      });
    } else {
      fileUploadLogger.warn("Auto-refresh is disabled in configuration");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterpriseConfig.features.autoRefresh]);

  const refreshFiles = useCallback(() => {
    startTransition(() => filesAction());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshStats = useCallback(() => {
    startTransition(() => statsAction());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔧 Utilities (Memoized outside return)
  const clearError = useCallback(() => {
    fileUploadLogger.debug("Error clearing requested");
  }, []);

  const clearCompleted = useCallback(() => {
    startTransition(() => {
      addOptimistic({
        type: FILE_UPLOAD_ACTIONS.CLEAR_COMPLETED,
      } as OptimisticAction);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFile = useCallback(
    (file: File, options?: Parameters<typeof uploadFiles>[1]) =>
      uploadFiles([file], options).then((results) => results[0]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // 🏆 ENTERPRISE RETURN INTERFACE (Enhanced with selectors and performance metrics)
  return useMemo(
    () => ({
      // 📊 Core Data
      files,
      stats,
      uploadProgress: optimisticState.uploadProgress,

      // 🔄 Loading States (Enhanced with granular state)
      isLoading,
      isUploading: optimisticSelectors.hasActiveUploads(optimisticState),
      isPending,

      // 🎯 Upload Progress Analytics
      activeUploads: optimisticSelectors.getActiveUploads(optimisticState),
      completedUploads:
        optimisticSelectors.getCompletedUploads(optimisticState),
      failedUploads: optimisticSelectors.getFailedUploads(optimisticState),
      overallProgress: optimisticSelectors.getOverallProgress(optimisticState),
      totalActiveUploads: optimisticState.totalActiveUploads,

      // ❌ Error States
      error,
      hasError: !!error,

      // 🎯 Actions (Performance optimized)
      uploadFiles,
      uploadFile,
      deleteFile,

      // 🔄 Refresh Actions
      refresh,
      refreshFiles,
      refreshStats,

      // 🔧 Utilities
      clearError,
      clearCompleted,

      // 🏗️ Configuration & Debugging
      config: enterpriseConfig,
      configSummary: fileUploadConfig.getConfigSummary(),

      // 📊 Performance Metrics (Development only)
      ...(process.env.NODE_ENV === "development" && {
        debug: {
          hasInitialized: hasInitialized.current,
          optimisticState,
          enterpriseConfig,
          selectors: optimisticSelectors,
        },
      }),
    }),
    [
      files,
      stats,
      optimisticState,
      isLoading,
      isPending,
      error,
      uploadFiles,
      uploadFile,
      deleteFile,
      refresh,
      refreshFiles,
      refreshStats,
      clearError,
      clearCompleted,
      enterpriseConfig,
    ]
  );
};

export default useFileUpload;
