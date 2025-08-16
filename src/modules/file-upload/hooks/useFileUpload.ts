// 🚀 FILE UPLOAD HOOK - ENTERPRISE GRADE
// ======================================
// React 19 + Next.js 15 Optimized Hook with Optimistic UI

"use client";

import { useActionState, useOptimistic, useCallback, useMemo } from "react";
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
  | { type: "COMPLETE_UPLOAD"; tempId: string; result: UploadCardData }
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

    case "COMPLETE_UPLOAD": {
      // Add to files and remove from progress
      return {
        ...state,
        files: [action.result, ...state.files],
        uploadProgress: state.uploadProgress.filter(
          (p) => p.fileId !== action.tempId
        ),
      };
    }

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
      return { ...state, files: action.files };

    case "SET_STATS":
      return { ...state, stats: action.stats };

    default:
      return state;
  }
}

// 🚀 Enterprise File Upload Hook
export const useFileUpload = (config?: UploadConfig): UseFileUploadReturn => {
  const { user } = useAuth();

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
      return await getFilesServerAction(formData);
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
      return await getFileStatsServerAction(formData);
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
      addOptimistic({ type: "START_UPLOAD", files, tempIds });

      try {
        const results = await Promise.all(
          files.map(async (file, index) => {
            const tempId = tempIds[index];

            try {
              // Update progress optimistically
              addOptimistic({ type: "UPDATE_PROGRESS", tempId, progress: 50 });

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
                // ✨ Optimistic UI: Complete upload
                addOptimistic({
                  type: "COMPLETE_UPLOAD",
                  tempId,
                  result: result.data as UploadCardData,
                });
                return { success: true, file: result.data as UploadCardData };
              } else {
                // ✨ Optimistic UI: Mark as failed
                addOptimistic({
                  type: "FAIL_UPLOAD",
                  tempId,
                  error: result.error || "Upload failed",
                });
                return { success: false, error: result.error };
              }
            } catch (error) {
              addOptimistic({
                type: "FAIL_UPLOAD",
                tempId,
                error: error instanceof Error ? error.message : "Upload error",
              });
              return {
                success: false,
                error: error instanceof Error ? error.message : "Upload error",
              };
            }
          })
        );

        return results;
      } catch (error) {
        // Mark all as failed
        tempIds.forEach((tempId) => {
          addOptimistic({
            type: "FAIL_UPLOAD",
            tempId,
            error:
              error instanceof Error ? error.message : "Batch upload error",
          });
        });
        throw error;
      }
    },
    [user, addOptimistic]
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
      if (!user) throw new Error("Usuario no autenticado");

      // ✨ Optimistic UI: Remove immediately
      addOptimistic({ type: "DELETE_FILE", fileId });

      try {
        const formData = new FormData();
        formData.append("id", fileId);

        const result = await deleteFileServerAction(formData);

        if (!result?.success) {
          // Revert optimistic deletion - refetch files
          await refreshFiles();
          throw new Error(result?.error || "Delete failed");
        }
      } catch (error) {
        // Revert optimistic deletion
        await refreshFiles();
        throw error;
      }
    },
    [user, addOptimistic]
  );

  // 🎯 Update File with Optimistic UI (React Compiler memoized)
  const updateFile = useCallback(
    async (
      fileId: string,
      updates: { filename?: string; isPublic?: boolean; tags?: string[] }
    ) => {
      if (!user) throw new Error("Usuario no autenticado");

      // ✨ Optimistic UI: Update immediately
      addOptimistic({ type: "UPDATE_FILE", fileId, updates });

      try {
        const formData = new FormData();
        formData.append("id", fileId);
        if (updates.filename) formData.append("filename", updates.filename);
        if (updates.isPublic !== undefined)
          formData.append("isPublic", String(updates.isPublic));
        if (updates.tags) formData.append("tags", updates.tags.join(","));

        const result = await updateFileServerAction(formData);

        if (!result?.success) {
          // Revert optimistic update
          await refreshFiles();
          throw new Error(result?.error || "Update failed");
        }
      } catch (error) {
        // Revert optimistic update
        await refreshFiles();
        throw error;
      }
    },
    [user, addOptimistic]
  );

  // 🔄 Refresh Files (React Compiler memoized)
  const refreshFiles = useCallback(async () => {
    if (!user) return;

    try {
      const formData = new FormData();
      const result = await getFilesServerAction(formData);

      if (result?.success && result.data) {
        addOptimistic({
          type: "SET_FILES",
          files: result.data as UploadCardData[],
        });
      }
    } catch (error) {
      console.error("Error refreshing files:", error);
    }
  }, [user, addOptimistic]);

  // 📊 Refresh Stats (React Compiler memoized)
  const refreshStats = useCallback(async () => {
    if (!user) return;

    try {
      const result = await getFileStatsServerAction();

      if (result?.success && result.data) {
        addOptimistic({
          type: "SET_STATS",
          stats: result.data as FileStatsData,
        });
      }
    } catch (error) {
      console.error("Error refreshing stats:", error);
    }
  }, [user, statsAction, addOptimistic]);

  // 🎯 Computed States (React Compiler memoized)
  const isLoading = useMemo(
    () =>
      uploadPending ||
      filesPending ||
      deletePending ||
      updatePending ||
      statsPending,
    [uploadPending, filesPending, deletePending, updatePending, statsPending]
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

  // 🚀 Return unified interface
  return {
    // Optimistic State
    files: optimisticState.files,
    stats: optimisticState.stats,
    uploadProgress: optimisticState.uploadProgress,

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
