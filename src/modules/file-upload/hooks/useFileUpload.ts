// 🚀 FILE UPLOAD HOOK - ENTERPRISE GRADE
// ======================================
// React 19 + Next.js 15 Optimized Hook with Optimistic UI

"use client";

import {
  useActionState,
  useOptimistic,
  useCallback,
  useMemo,
  useEffect,
  useTransition,
  useRef,
} from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  uploadFileServerAction,
  getFilesServerAction,
  updateFileServerAction,
  deleteFileServerAction,
  getFileStatsServerAction,
  type FileActionResult,
} from "../server/actions";
import type {
  UploadCardData,
  FileStatsData,
  UseFileUploadReturn,
  UploadProgress,
  UploadConfig,
} from "../types";

// 🎯 Optimistic State Interface
interface OptimisticState {
  files: UploadCardData[];
  stats: FileStatsData | null;
  uploadProgress: UploadProgress[];
}

// 🎯 Optimistic Actions
type OptimisticAction =
  | { type: "START_UPLOAD"; files: File[]; tempIds: string[] }
  | { type: "CLEAR_COMPLETED_UPLOADS"; completedTempIds: string[] }
  | { type: "FAIL_UPLOAD"; tempId: string; error: string }
  | { type: "UPDATE_PROGRESS"; tempId: string; progress: number }
  | { type: "DELETE_FILE"; fileId: string }
  | { type: "UPDATE_FILE"; fileId: string; updates: Partial<UploadCardData> }
  | { type: "SET_FILES"; files: UploadCardData[] }
  | { type: "SET_STATS"; stats: FileStatsData };

// 🎯 Optimistic Reducer (React Compiler optimized)
function optimisticReducer(
  state: OptimisticState,
  action: OptimisticAction
): OptimisticState {
  switch (action.type) {
    case "START_UPLOAD":
      return {
        ...state,
        uploadProgress: [
          ...state.uploadProgress,
          ...action.tempIds.map((tempId, index) => ({
            fileId: tempId,
            progress: 0,
            status: "pending" as const,
            filename: action.files[index]?.name || "",
          })),
        ],
      };

    case "UPDATE_PROGRESS":
      return {
        ...state,
        uploadProgress: state.uploadProgress.map((progress) =>
          progress.fileId === action.tempId
            ? {
                ...progress,
                progress: action.progress,
                status: "uploading" as const,
              }
            : progress
        ),
      };

    // REMOVED: COMPLETE_UPLOAD case - using server refresh pattern like users module

    case "CLEAR_COMPLETED_UPLOADS":
      return {
        ...state,
        uploadProgress: state.uploadProgress.filter(
          (p) => !action.completedTempIds.includes(p.fileId)
        ),
      };

    case "FAIL_UPLOAD":
      return {
        ...state,
        uploadProgress: state.uploadProgress.map((progress) =>
          progress.fileId === action.tempId
            ? { ...progress, status: "error" as const, error: action.error }
            : progress
        ),
      };

    case "DELETE_FILE":
      return {
        ...state,
        files: state.files.filter((file) => file.id !== action.fileId),
      };

    case "UPDATE_FILE":
      return {
        ...state,
        files: state.files.map((file) =>
          file.id === action.fileId ? { ...file, ...action.updates } : file
        ),
      };

    case "SET_FILES":
      // ✅ Simple replacement - using server refresh pattern like users module
      return { ...state, files: action.files };

    case "SET_STATS":
      return { ...state, stats: action.stats };

    default:
      return state;
  }
}

// 🚀 Enterprise File Upload Hook
export const useFileUpload = (config?: UploadConfig): UseFileUploadReturn => {
  // 🔍 CRITICAL: Track hook instances
  const hookId = useMemo(
    () => `hook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    []
  );
  // 🏆 ENTERPRISE STATE LIFTING: Single hook instance
  console.log("🏆 Enterprise useFileUpload initialized:", {
    hookId,
    hasConfig: !!config,
    source: "ENTERPRISE_STATE_LIFTING",
  });

  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  // ⚡ REACT 19: useTransition for non-blocking operations (like users)
  const [isRefreshing, startRefresh] = useTransition();

  // 🎯 Track initialization to prevent false reversion detection
  const hasInitializedTracking = useRef(false);

  // 🎯 Track active deletion to prevent false reversion detection
  const isDeletingFile = useRef(false);

  // 🎯 Immediate refresh after each upload success (like users module)

  // 🎯 Optimistic State
  const [optimisticState, addOptimistic] = useOptimistic(
    { files: [], stats: null, uploadProgress: [] } as OptimisticState,
    optimisticReducer
  );

  // 🎯 Server Actions with useActionState (React 19)
  const [uploadState, uploadAction, uploadPending] = useActionState(
    async (
      prevState: FileActionResult | null,
      formData: FormData
    ): Promise<FileActionResult> => {
      return await uploadFileServerAction(formData);
    },
    null
  );

  const [filesState, filesAction, filesPending] = useActionState(
    async (
      prevState: FileActionResult | null,
      formData?: FormData
    ): Promise<FileActionResult> => {
      const callStack = new Error().stack;
      console.log("🔍 filesAction executing...", {
        timestamp: Date.now(),
        stack: callStack?.split("\n")[2]?.trim(),
        fullStack: callStack?.split("\n").slice(0, 5).join(" | "),
        caller: "FULL_TRACE",
      });
      const result = await getFilesServerAction(formData);
      console.log("🔍 filesAction result:", {
        success: result.success,
        dataLength: result.success
          ? (result.data as UploadCardData[])?.length
          : 0,
        error: result.error,
      });
      return result;
    },
    null
  );

  const [deleteState, deleteAction, deletePending] = useActionState(
    async (
      prevState: FileActionResult | null,
      formData: FormData
    ): Promise<FileActionResult> => {
      return await deleteFileServerAction(formData);
    },
    null
  );

  const [updateState, updateAction, updatePending] = useActionState(
    async (
      prevState: FileActionResult | null,
      formData: FormData
    ): Promise<FileActionResult> => {
      return await updateFileServerAction(formData);
    },
    null
  );

  const [statsState, statsAction, statsPending] = useActionState(
    async (
      prevState: FileActionResult | null,
      formData?: FormData
    ): Promise<FileActionResult> => {
      console.log("📊 statsAction executing...");
      const result = await getFileStatsServerAction(formData);
      console.log("📊 statsAction result:", {
        success: result.success,
        data: result.success ? result.data : null,
        error: result.error,
      });
      return result;
    },
    null
  );

  // 🎯 Upload Files with Optimistic UI (React Compiler memoized)
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

      // Generate temp IDs for optimistic state
      const tempIds = files.map(() => `temp-${Date.now()}-${Math.random()}`);

      // ✨ Optimistic UI: Start upload immediately
      startTransition(() => {
        addOptimistic({ type: "START_UPLOAD", files, tempIds });
      });

      try {
        const results = await Promise.all(
          files.map(async (file, index) => {
            const tempId = tempIds[index];

            try {
              // Update progress optimistically
              startTransition(() => {
                addOptimistic({
                  type: "UPDATE_PROGRESS",
                  tempId,
                  progress: 50,
                });
              });

              const formData = new FormData();
              formData.append("file", file);
              // Map cloudinary to s3 for now, since only local and s3 are implemented
              const provider =
                options?.provider === "cloudinary"
                  ? "s3"
                  : options?.provider || "local";
              formData.append("provider", provider);
              if (options?.categoryId)
                formData.append("categoryId", options.categoryId);
              if (options?.makePublic) formData.append("makePublic", "true");

              const result = await uploadFileServerAction(formData);

              if (result.success && result.data) {
                // ✅ SUCCESS: Server action completed - refresh IMMEDIATELY like users
                console.log(
                  "✅ Upload success, triggering immediate refresh like users module"
                );

                // IMMEDIATE refresh after each successful upload (EXACTLY like users)
                console.log(
                  "🔄 Upload successful, refreshing data like users module"
                );

                // DIRECT refresh like users module (NO nested setTimeout)
                startRefresh(() => {
                  console.log("🔄 Executing filesAction after upload success", {
                    trigger: "post-upload-refresh",
                    timestamp: Date.now(),
                    fileUploaded: file.name,
                  });
                  filesAction(); // ← Direct action call like users

                  console.log("🔄 Executing statsAction after upload success", {
                    trigger: "post-upload-refresh",
                    timestamp: Date.now(),
                    fileUploaded: file.name,
                  });
                  statsAction(); // ← Direct action call like users
                });

                return { success: true, file: result.data as UploadCardData };
              } else {
                // ✨ Optimistic UI: Mark as failed
                startTransition(() => {
                  addOptimistic({
                    type: "FAIL_UPLOAD",
                    tempId,
                    error: result.error || "Upload failed",
                  });
                });
                return { success: false, error: result.error };
              }
            } catch (error) {
              startTransition(() => {
                addOptimistic({
                  type: "FAIL_UPLOAD",
                  tempId,
                  error:
                    error instanceof Error ? error.message : "Upload error",
                });
              });
              return {
                success: false,
                error: error instanceof Error ? error.message : "Upload error",
              };
            }
          })
        );

        // ✅ Clean up completed uploads (refresh already happened immediately)
        const successfulUploads = results.filter((result) => result.success);

        if (successfulUploads.length > 0) {
          console.log(
            `✅ Cleaning up ${successfulUploads.length} completed uploads`
          );

          // Clear completed upload progress
          startTransition(() => {
            addOptimistic({
              type: "CLEAR_COMPLETED_UPLOADS",
              completedTempIds: tempIds.slice(0, successfulUploads.length),
            });
          });
        }

        return results;
      } catch (error) {
        // Mark all as failed
        startTransition(() => {
          tempIds.forEach((tempId) => {
            addOptimistic({
              type: "FAIL_UPLOAD",
              tempId,
              error:
                error instanceof Error ? error.message : "Batch upload error",
            });
          });
        });
        throw error;
      }
    },
    [
      user,
      addOptimistic,
      startTransition,
      startRefresh,
      filesAction,
      statsAction,
    ]
  );

  // 🎯 Upload Single File Helper
  const uploadFile = useCallback(
    async (
      file: File,
      options?: {
        provider?: "local" | "s3" | "cloudinary";
        categoryId?: string;
        makePublic?: boolean;
      }
    ) => {
      const results = await uploadFiles([file], options);
      return results[0];
    },
    [uploadFiles]
  );

  // 🎯 Delete File with Optimistic UI (React Compiler memoized)
  const deleteFile = useCallback(
    async (fileId: string) => {
      console.log("🗑️ DELETE: Starting file deletion", {
        fileId,
        timestamp: Date.now(),
      });

      if (!user) throw new Error("Usuario no autenticado");

      // 🎯 Mark deletion in progress to prevent false reversion detection
      isDeletingFile.current = true;

      // ✨ Optimistic UI: Remove immediately
      startTransition(() => {
        console.log("🗑️ DELETE: Adding optimistic removal", { fileId });
        addOptimistic({ type: "DELETE_FILE", fileId });
      });

      try {
        const formData = new FormData();
        formData.append("id", fileId);

        console.log("🗑️ DELETE: Calling server action", { fileId });
        const result = await deleteFileServerAction(formData);

        console.log("🗑️ DELETE: Server response", {
          fileId,
          success: result?.success,
          error: result?.error,
        });

        if (!result?.success) {
          // Server handles revert through state consistency
          throw new Error(result?.error || "Delete failed");
        }

        console.log("✅ DELETE: File deleted successfully", { fileId });

        // Refresh data like users module
        startRefresh(() => {
          console.log("🔄 DELETE: Refreshing files and stats after deletion", {
            fileId,
          });
          filesAction();
          statsAction();
        });

        // 🎯 Keep deletion flag for a brief moment to prevent false reversion detection
        setTimeout(() => {
          isDeletingFile.current = false;
          console.log("🎯 DELETE: Reversion detection re-enabled", { fileId });
        }, 1000);
      } catch (error) {
        // 🎯 Reset deletion flag on error
        isDeletingFile.current = false;
        // Optimistic UI will be reverted naturally on next refresh
        console.error("❌ DELETE: Delete error:", error);
        throw error;
      }
    },
    [
      user,
      addOptimistic,
      startTransition,
      startRefresh,
      filesAction,
      statsAction,
    ]
  );

  // 🎯 Update File with Optimistic UI (React Compiler memoized)
  const updateFile = useCallback(
    async (
      fileId: string,
      updates: { filename?: string; isPublic?: boolean; tags?: string[] }
    ) => {
      if (!user) throw new Error("Usuario no autenticado");

      // ✨ Optimistic UI: Update immediately
      startTransition(() => {
        addOptimistic({ type: "UPDATE_FILE", fileId, updates });
      });

      try {
        const formData = new FormData();
        formData.append("id", fileId);
        if (updates.filename) formData.append("filename", updates.filename);
        if (updates.isPublic !== undefined)
          formData.append("isPublic", String(updates.isPublic));
        if (updates.tags) formData.append("tags", updates.tags.join(","));

        const result = await updateFileServerAction(formData);

        if (!result?.success) {
          // Server handles revert through state consistency
          throw new Error(result?.error || "Update failed");
        }
      } catch (error) {
        // Optimistic UI will be reverted naturally on next refresh
        console.error("Update error:", error);
        throw error;
      }
    },
    [user, addOptimistic, startTransition]
  );

  // 🔄 Refresh Files (React Compiler memoized)
  const refreshFiles = useCallback(async () => {
    if (!user) return;

    try {
      const formData = new FormData();
      const result = await getFilesServerAction(formData);

      if (result?.success && result.data) {
        // Wrap optimistic update in startTransition
        startTransition(() => {
          addOptimistic({
            type: "SET_FILES",
            files: result.data as UploadCardData[],
          });
        });
      }
    } catch (error) {
      console.error("Error refreshing files:", error);
    }
  }, [user, addOptimistic, startTransition]);

  // 📊 Refresh Stats (React Compiler memoized)
  const refreshStats = useCallback(async () => {
    if (!user) return;

    try {
      const result = await getFileStatsServerAction();

      if (result?.success && result.data) {
        // Wrap optimistic update in startTransition
        startTransition(() => {
          addOptimistic({
            type: "SET_STATS",
            stats: result.data as FileStatsData,
          });
        });
      }
    } catch (error) {
      console.error("Error refreshing stats:", error);
    }
  }, [user, statsAction, addOptimistic, startTransition]);

  // 🚀 Auto-load files and stats on mount - USE REF to prevent re-executions
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Simplified logging
    console.log("🔄 useEffect check:", {
      filesState: !!filesState,
      statsState: !!statsState,
      user: !!user,
      hasInitialized: hasInitialized.current,
    });

    // Only run ONCE on mount when user is available
    if (!hasInitialized.current && user) {
      hasInitialized.current = true;

      console.log("🚀 FIRST TIME ONLY: triggering initial load", {
        trigger: "useEffect-initial-ONCE",
        timestamp: Date.now(),
      });

      startRefresh(() => {
        filesAction(); // ← Direct action call like users
        statsAction(); // ← Direct action call like users
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // ← ONLY depend on user, prevent infinite loops with filesState/statsState

  // 🎯 Immediate refresh happens inside uploadFiles after each success (like users)

  // 🎯 Computed States (React Compiler memoized)
  const isLoading = useMemo(
    () =>
      uploadPending ||
      filesPending ||
      deletePending ||
      updatePending ||
      statsPending ||
      isPending,
    [
      uploadPending,
      filesPending,
      deletePending,
      updatePending,
      statsPending,
      isPending,
    ]
  );

  const hasError = useMemo(
    () =>
      !uploadState?.success ||
      !filesState?.success ||
      !deleteState?.success ||
      !updateState?.success ||
      !statsState?.success,
    [uploadState, filesState, deleteState, updateState, statsState]
  );

  const errorMessage = useMemo(
    () =>
      uploadState?.error ||
      filesState?.error ||
      deleteState?.error ||
      updateState?.error ||
      statsState?.error ||
      null,
    [uploadState, filesState, deleteState, updateState, statsState]
  );

  // 🚀 Return unified interface (EXACTLY like users module)

  // 🏆 Enterprise: Monitor state changes efficiently
  const globalDebug = globalThis as Record<string, unknown>;
  if (
    filesState?.success &&
    (filesState.data as UploadCardData[])?.length !==
      (globalDebug.lastLoggedLength as number)
  ) {
    globalDebug.lastLoggedLength = (
      filesState.data as UploadCardData[]
    )?.length;
    console.log("🏆 Hook state updated:", {
      hookId: hookId.slice(-8), // Show only last 8 chars for brevity
      filesCount: (filesState.data as UploadCardData[])?.length,
      pending: filesPending,
    });
  }

  // 🔍 Debug: Only log when data changes significantly
  const currentLength = filesState?.success
    ? (filesState.data as UploadCardData[])?.length
    : 0;
  const lastLength = (globalThis as Record<string, unknown>)
    .lastFilesLength as number;

  if (currentLength !== lastLength) {
    (globalThis as Record<string, unknown>).lastFilesLength = currentLength;

    // Mark as initialized after first valid data
    if (!hasInitializedTracking.current && currentLength > 0) {
      hasInitializedTracking.current = true;
      console.log("🚀 Hook initialized with data:", {
        hookId: hookId.slice(-8),
        initialCount: currentLength,
      });
    }

    // Only check for reversion AFTER initialization to avoid false positives
    // Also ignore reversions during file deletions (legitimate decreases)
    const isReversion =
      hasInitializedTracking.current &&
      lastLength &&
      currentLength < lastLength &&
      !isDeletingFile.current;

    if (hasInitializedTracking.current || currentLength > 0) {
      console.log(isReversion ? "❌ FILES REVERTED:" : "🎯 FILES UPDATED:", {
        hookId,
        filesDataLength: currentLength,
        previousLength: lastLength,
        isReversion,
        initialized: hasInitializedTracking.current,
        deletionInProgress: isDeletingFile.current,
        timestamp: Date.now(),
      });
    }

    if (isReversion) {
      console.error(
        "🚨 DATA REVERSION DETECTED - Previous:",
        lastLength,
        "Current:",
        currentLength
      );
    }
  }

  return {
    // Direct state from useActionState (like users)
    files: filesState?.success ? (filesState.data as UploadCardData[]) : [],
    stats: statsState?.success ? (statsState.data as FileStatsData) : null,
    uploadProgress: optimisticState.uploadProgress, // Only UI feedback uses optimistic

    // Loading States
    isLoading,
    uploading: uploadPending, // Alias for backward compatibility
    isUploading: uploadPending,
    isDeleting: deletePending,
    isUpdating: updatePending,

    // Error States
    hasError,
    error: errorMessage,

    // Actions
    uploadFiles,
    uploadFile, // Single file helper
    deleteFile,
    updateFile,
    refreshFiles,
    refreshStats,

    // Legacy compatibility
    progress: optimisticState.uploadProgress, // Alias
    clearError: () => {}, // No-op for compatibility
    resetProgress: () => {}, // No-op for compatibility

    // Raw States (for advanced usage)
    uploadState,
    filesState,
    deleteState,
    updateState,
    statsState,
  };
};

// 🎯 Single File Upload Hook (convenience)
export const useSingleFileUpload = () => {
  const hook = useFileUpload();

  return {
    ...hook,
    uploadFile: hook.uploadFile,
    progress: hook.uploadProgress[0] || null,
  };
};

// 🎯 Default export
export default useFileUpload;
