// 🏆 ENTERPRISE REDUCERS - Estado optimista centralizado y predecible
// ====================================================================

import { FILE_UPLOAD_ACTIONS } from "../constants";
import type { UploadProgress } from "../types";
import { optimisticLogger } from "../utils/logger";

// 🎯 Optimistic State Types
export interface OptimisticState {
  uploadProgress: UploadProgress[];
  lastUpdated: string;
  totalActiveUploads: number;
}

export type OptimisticAction =
  | {
      type: typeof FILE_UPLOAD_ACTIONS.START_UPLOAD;
      files: File[];
      tempIds: string[];
    }
  | {
      type: typeof FILE_UPLOAD_ACTIONS.UPDATE_PROGRESS;
      tempId: string;
      progress: number;
    }
  | { type: typeof FILE_UPLOAD_ACTIONS.COMPLETE_UPLOAD; tempId: string }
  | {
      type: typeof FILE_UPLOAD_ACTIONS.FAIL_UPLOAD;
      tempId: string;
      error: string;
    }
  | { type: typeof FILE_UPLOAD_ACTIONS.CLEAR_COMPLETED };

// 🎯 Helper functions for state calculations
const calculateActiveUploads = (progress: UploadProgress[]): number => {
  return progress.filter(
    (p) => p.status === "pending" || p.status === "uploading"
  ).length;
};

const updateTimestamp = (): string => new Date().toISOString();

// 🎯 ENTERPRISE OPTIMISTIC REDUCER (React Compiler optimized, immutable)
export function optimisticReducer(
  state: OptimisticState,
  action: OptimisticAction
): OptimisticState {
  optimisticLogger.debug(`Optimistic action: ${action.type}`, {
    currentStateCount: state.uploadProgress.length,
    activeUploads: state.totalActiveUploads,
  });

  switch (action.type) {
    case FILE_UPLOAD_ACTIONS.START_UPLOAD: {
      const newProgress = action.tempIds.map((tempId, index) => ({
        fileId: tempId,
        progress: 0,
        status: "pending" as const,
        filename: action.files[index]?.name || `file-${index + 1}`,
      }));

      const nextState = {
        uploadProgress: [...state.uploadProgress, ...newProgress],
        lastUpdated: updateTimestamp(),
        totalActiveUploads: 0, // Will be recalculated
      };

      nextState.totalActiveUploads = calculateActiveUploads(
        nextState.uploadProgress
      );

      optimisticLogger.info(`Started ${newProgress.length} upload(s)`, {
        totalFiles: nextState.uploadProgress.length,
        activeUploads: nextState.totalActiveUploads,
      });

      return nextState;
    }

    case FILE_UPLOAD_ACTIONS.UPDATE_PROGRESS: {
      const nextState = {
        ...state,
        uploadProgress: state.uploadProgress.map((p) =>
          p.fileId === action.tempId
            ? { ...p, progress: action.progress, status: "uploading" as const }
            : p
        ),
        lastUpdated: updateTimestamp(),
      };

      nextState.totalActiveUploads = calculateActiveUploads(
        nextState.uploadProgress
      );

      optimisticLogger.debug(`Progress updated: ${action.progress}%`, {
        tempId: action.tempId,
        activeUploads: nextState.totalActiveUploads,
      });

      return nextState;
    }

    case FILE_UPLOAD_ACTIONS.COMPLETE_UPLOAD: {
      const nextState = {
        ...state,
        uploadProgress: state.uploadProgress.map((p) =>
          p.fileId === action.tempId
            ? { ...p, progress: 100, status: "completed" as const }
            : p
        ),
        lastUpdated: updateTimestamp(),
      };

      nextState.totalActiveUploads = calculateActiveUploads(
        nextState.uploadProgress
      );

      const completedFile = state.uploadProgress.find(
        (p) => p.fileId === action.tempId
      );
      optimisticLogger.info("Upload completed", {
        filename: completedFile?.filename,
        tempId: action.tempId,
        remainingActive: nextState.totalActiveUploads,
      });

      return nextState;
    }

    case FILE_UPLOAD_ACTIONS.FAIL_UPLOAD: {
      const nextState = {
        ...state,
        uploadProgress: state.uploadProgress.map((p) =>
          p.fileId === action.tempId
            ? { ...p, status: "error" as const, error: action.error }
            : p
        ),
        lastUpdated: updateTimestamp(),
      };

      nextState.totalActiveUploads = calculateActiveUploads(
        nextState.uploadProgress
      );

      const failedFile = state.uploadProgress.find(
        (p) => p.fileId === action.tempId
      );
      optimisticLogger.error("Upload failed", new Error(action.error), {
        filename: failedFile?.filename,
        tempId: action.tempId,
        remainingActive: nextState.totalActiveUploads,
      });

      return nextState;
    }

    case FILE_UPLOAD_ACTIONS.CLEAR_COMPLETED: {
      const completedCount = state.uploadProgress.filter(
        (p) => p.status === "completed"
      ).length;

      const nextState = {
        ...state,
        uploadProgress: state.uploadProgress.filter(
          (p) => p.status !== "completed"
        ),
        lastUpdated: updateTimestamp(),
      };

      nextState.totalActiveUploads = calculateActiveUploads(
        nextState.uploadProgress
      );

      optimisticLogger.info(`Cleared ${completedCount} completed upload(s)`, {
        remaining: nextState.uploadProgress.length,
        activeUploads: nextState.totalActiveUploads,
      });

      return nextState;
    }

    default: {
      optimisticLogger.warn("Unknown optimistic action", { action });
      return state;
    }
  }
}

// 🏗️ Factory function for creating initial optimistic state
export function createInitialOptimisticState(): OptimisticState {
  return {
    uploadProgress: [],
    lastUpdated: updateTimestamp(),
    totalActiveUploads: 0,
  };
}

// 🎯 Selector functions for derived state
export const optimisticSelectors = {
  getActiveUploads: (state: OptimisticState) =>
    state.uploadProgress.filter(
      (p) => p.status === "pending" || p.status === "uploading"
    ),

  getCompletedUploads: (state: OptimisticState) =>
    state.uploadProgress.filter((p) => p.status === "completed"),

  getFailedUploads: (state: OptimisticState) =>
    state.uploadProgress.filter((p) => p.status === "error"),

  getUploadingFiles: (state: OptimisticState) =>
    state.uploadProgress.filter((p) => p.status === "uploading"),

  hasActiveUploads: (state: OptimisticState) => state.totalActiveUploads > 0,

  getOverallProgress: (state: OptimisticState) => {
    if (state.uploadProgress.length === 0) return 0;

    const totalProgress = state.uploadProgress.reduce(
      (sum, p) => sum + p.progress,
      0
    );
    return Math.round(totalProgress / state.uploadProgress.length);
  },
};
