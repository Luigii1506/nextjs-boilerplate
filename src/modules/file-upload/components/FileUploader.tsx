// 📤 FILE UPLOADER COMPONENT
// ===========================
// Componente principal con drag & drop para subir archivos

"use client";

import React, { useCallback, useState, useRef } from "react";
import { Upload, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useFileUpload } from "../hooks";
import { validateFiles, createImagePreview, humanFileSize } from "../utils";
import type {
  FileUploaderProps,
  FileWithPreview,
  UploadConfig,
  UploadProvider,
} from "../types";

export function FileUploader({
  config,
  onUploadComplete,
  onUploadProgress,
  onUploadError,
  className = "",
  children,
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [dragCounter, setDragCounter] = useState(0);

  const { uploadFiles, uploading, progress, error, clearError } =
    useFileUpload(config);

  // Configuración por defecto
  const defaultConfig: UploadConfig = {
    provider: "local",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/*", "application/pdf", "text/*"],
    multiple: true,
    ...config,
  };

  // Manejar archivos seleccionados
  const handleFiles = useCallback(
    async (files: File[]) => {
      clearError();

      // Validar archivos
      const { valid, invalid } = validateFiles(files, {
        maxFiles: defaultConfig.multiple ? 10 : 1,
        maxSize: defaultConfig.maxFileSize,
        allowedTypes: defaultConfig.allowedTypes,
      });

      if (invalid.length > 0) {
        const errorMessage = invalid
          .map((f) => `${f.file.name}: ${f.error}`)
          .join("\n");
        onUploadError?.(errorMessage);
        return;
      }

      // Crear previews para archivos válidos
      const filesWithPreviews = await Promise.all(
        valid.map(async (file, index) => {
          const fileWithPreview: FileWithPreview = file as FileWithPreview;
          fileWithPreview.id = `${file.name}-${index}`;

          // Crear preview para imágenes
          if (file.type.startsWith("image/")) {
            try {
              fileWithPreview.preview = await createImagePreview(file);
            } catch (error) {
              console.warn("Error creating preview:", error);
            }
          }

          return fileWithPreview;
        })
      );

      setSelectedFiles(filesWithPreviews);
    },
    [clearError, defaultConfig, onUploadError]
  );

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragOver(false);
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      setDragCounter(0);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  // File input handler
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  // Upload handler
  const handleUpload = useCallback(
    async (provider?: UploadProvider) => {
      if (selectedFiles.length === 0) return;

      try {
        const results = await uploadFiles(selectedFiles, {
          provider,
          makePublic: true,
        });

        const successfulUploads = results
          .filter((r) => r.success && r.file)
          .map((r) => r.file!);

        if (successfulUploads.length > 0) {
          onUploadComplete?.(successfulUploads);
          setSelectedFiles([]); // Limpiar archivos después del upload exitoso
        }

        // Reportar errores si los hay
        const failedUploads = results.filter((r) => !r.success);
        if (failedUploads.length > 0) {
          const errorMessage = failedUploads.map((r) => r.error).join("\n");
          onUploadError?.(errorMessage);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error subiendo archivos";
        onUploadError?.(errorMessage);
      }
    },
    [selectedFiles, uploadFiles, onUploadComplete, onUploadError]
  );

  // Remover archivo de la lista
  const removeFile = useCallback((fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  // Abrir selector de archivos
  const openFileSelector = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Progress tracking
  React.useEffect(() => {
    if (progress.length > 0) {
      onUploadProgress?.(progress);
    }
  }, [progress, onUploadProgress]);

  return (
    <div className={`file-uploader ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={defaultConfig.multiple}
        accept={defaultConfig.allowedTypes.join(",")}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Dropzone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileSelector}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${
            isDragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
          ${uploading ? "pointer-events-none opacity-50" : ""}
        `}
      >
        {children || (
          <div className="flex flex-col items-center space-y-4">
            <div
              className={`
              p-4 rounded-full transition-colors
              ${
                isDragOver
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "bg-gray-100 dark:bg-gray-800"
              }
            `}
            >
              <Upload
                className={`
                w-8 h-8 transition-colors
                ${
                  isDragOver
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }
              `}
              />
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {isDragOver
                  ? "Suelta los archivos aquí"
                  : "Arrastra archivos o haz clic"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Máximo {humanFileSize(defaultConfig.maxFileSize)} por archivo
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-700 dark:text-red-300">
            {error}
          </span>
          <button
            onClick={clearError}
            className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Archivos seleccionados ({selectedFiles.length})
            </h3>
            {!uploading && (
              <button
                onClick={() => handleUpload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Subir archivos</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {selectedFiles.map((file) => {
              const fileProgress = progress.find((p) =>
                p.fileId.startsWith(file.name)
              );

              return (
                <FilePreviewCard
                  key={file.id}
                  file={file}
                  progress={fileProgress}
                  onRemove={() => removeFile(file.id!)}
                  uploading={uploading}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para preview individual de archivo
interface FilePreviewCardProps {
  file: FileWithPreview;
  progress?: { progress: number; status: string; error?: string };
  onRemove: () => void;
  uploading: boolean;
}

function FilePreviewCard({
  file,
  progress,
  onRemove,
  uploading,
}: FilePreviewCardProps) {
  const getStatusIcon = () => {
    if (progress?.status === "completed") {
      return (
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      );
    }
    if (progress?.status === "error") {
      return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
    if (progress?.status === "uploading") {
      return (
        <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
      );
    }
    return null;
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* File preview/icon */}
      <div className="flex-shrink-0">
        {file.preview ? (
          <img
            src={file.preview}
            alt={file.name}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {humanFileSize(file.size)}
        </p>

        {/* Progress bar */}
        {progress && progress.status !== "pending" && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs">
              <span
                className={`
                ${
                  progress.status === "completed"
                    ? "text-green-600 dark:text-green-400"
                    : ""
                }
                ${
                  progress.status === "error"
                    ? "text-red-600 dark:text-red-400"
                    : ""
                }
                ${
                  progress.status === "uploading"
                    ? "text-blue-600 dark:text-blue-400"
                    : ""
                }
              `}
              >
                {progress.status === "completed" && "Completado"}
                {progress.status === "error" && (progress.error || "Error")}
                {progress.status === "uploading" && `${progress.progress}%`}
              </span>
            </div>
            {progress.status === "uploading" && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status and actions */}
      <div className="flex items-center space-x-2">
        {getStatusIcon()}

        {!uploading && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
