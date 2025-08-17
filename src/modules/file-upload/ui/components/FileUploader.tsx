"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  Upload,
  X,
  File,
  Image,
  Video,
  Music,
  FileText,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import type {
  UploadFile,
  UploadConfig,
  UploadProgress,
  UploadCardData,
} from "../../types";
// import { useFileUpload } from "../../hooks/useFileUpload"; // ← REMOVED: Using enterprise state lifting

interface FileUploaderProps {
  config: UploadConfig;
  onUploadComplete: (files: UploadFile[]) => void;
  onUploadError: (error: string) => void;
  selectedCategory?: string | null;

  // 🏆 ENTERPRISE STATE LIFTING: Receive functions from parent hook
  isUploading: boolean;
  uploadProgress: UploadProgress[];
  uploadError: string | null;
  uploadFiles: (
    files: File[],
    options?: {
      provider?: "local" | "s3" | "cloudinary";
      categoryId?: string;
      makePublic?: boolean;
    }
  ) => Promise<
    Array<{ success: boolean; file?: UploadCardData; error?: string }>
  >;
  clearError: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  config,
  onUploadComplete,
  onUploadError,
  selectedCategory,
  // 🏆 ENTERPRISE STATE LIFTING: Received from parent
  isUploading,
  uploadProgress,
  uploadError,
  uploadFiles,
  clearError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Archivos seleccionados

  // 🏆 ENTERPRISE STATE LIFTING: All functions received from parent hook
  // No hook duplication - parent manages all state!

  // 🏆 ENTERPRISE: Auto-cleanup handled by hook automatically

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/"))
      // eslint-disable-next-line jsx-a11y/alt-text
      return <Image size={20} className="text-blue-500" />;
    if (mimeType.startsWith("video/"))
      return <Video size={20} className="text-purple-500" />;
    if (mimeType.startsWith("audio/"))
      return <Music size={20} className="text-green-500" />;
    if (mimeType.includes("pdf") || mimeType.includes("document"))
      return <FileText size={20} className="text-red-500" />;
    return <File size={20} className="text-slate-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > config.maxFileSize) {
      return `El archivo es muy grande. Máximo ${formatFileSize(
        config.maxFileSize
      )}`;
    }

    const mimeType = file.type;
    const isValidType = config.allowedTypes.some((type) => {
      if (type.endsWith("/*")) {
        return mimeType.startsWith(type.slice(0, -1));
      }
      return mimeType === type;
    });

    if (!isValidType) {
      return `Tipo de archivo no permitido. Permitidos: ${config.allowedTypes.join(
        ", "
      )}`;
    }

    return null;
  };

  // Monitorear errores del hook
  useEffect(() => {
    if (uploadError) {
      onUploadError(uploadError);
    }
  }, [uploadError, onUploadError]);

  // Función para manejar archivos seleccionados (NO sube automáticamente)
  const handleFileSelection = useCallback(
    (files: FileList) => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          // Evitar duplicados
          if (
            !selectedFiles.some(
              (existing) =>
                existing.name === file.name && existing.size === file.size
            )
          ) {
            validFiles.push(file);
          }
        }
      });

      if (errors.length > 0) {
        onUploadError(errors.join("\n"));
        return;
      }

      // Agregar archivos a la selección
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onUploadError]
  );

  // Función para ejecutar la subida de archivos seleccionados
  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    // Limpiar errores previos
    clearError();

    try {
      // Usar el hook real para subir archivos
      const results = await uploadFiles(selectedFiles, {
        provider: config.provider,
        makePublic: false,
        categoryId: selectedCategory || undefined,
      });

      // Procesar resultados
      const successfulFiles: UploadFile[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.success && result.file) {
          successfulFiles.push(result.file as unknown as UploadFile);
        } else {
          errors.push(
            `${selectedFiles[index].name}: ${
              result.error || "Error desconocido"
            }`
          );
        }
      });

      // Notificar archivos subidos exitosamente
      if (successfulFiles.length > 0) {
        onUploadComplete(successfulFiles);
      }

      // Notificar errores si los hay
      if (errors.length > 0) {
        onUploadError(errors.join("\n"));
      }

      // Limpiar archivos seleccionados si todo fue exitoso
      if (errors.length === 0) {
        setSelectedFiles([]);
        // 🏆 ENTERPRISE: Auto-cleanup handled by hook
      }
    } catch (error) {
      onUploadError("Error general durante la subida");
      console.error("Upload error:", error);
    }
  };

  // Remover archivo de la selección
  const removeSelectedFile = (fileToRemove: File) => {
    setSelectedFiles((prev) => prev.filter((file) => file !== fileToRemove));
  };

  // Limpiar todos los archivos seleccionados
  const clearSelectedFiles = () => {
    setSelectedFiles([]);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      handleFileSelection(files);
    },
    [handleFileSelection]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelection(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-300 hover:border-slate-400"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Arrastra archivos aquí o haz clic para seleccionar
          </h3>
          <p className="text-slate-600 mb-4">
            Formatos soportados: {config.allowedTypes.join(", ")}
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Tamaño máximo: {formatFileSize(config.maxFileSize)}
          </p>

          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
              <Plus size={18} />
              Seleccionar archivos
            </span>
            <input
              id="file-upload"
              type="file"
              multiple={config.multiple}
              accept={config.allowedTypes.join(",")}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="bg-slate-50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-900">
              📁 Archivos Seleccionados ({selectedFiles.length})
            </h4>
            <button
              onClick={clearSelectedFiles}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Limpiar todo
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div>
                    <div className="font-medium text-slate-900">
                      {file.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeSelectedFile(file)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Remover archivo"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Total: {selectedFiles.length} archivo(s) -{" "}
              {formatFileSize(
                selectedFiles.reduce((sum, file) => sum + file.size, 0)
              )}
            </div>
            <button
              onClick={handleUploadFiles}
              disabled={isUploading || selectedFiles.length === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isUploading || selectedFiles.length === 0
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              <Upload size={18} />
              {isUploading
                ? "Subiendo..."
                : `Subir ${selectedFiles.length} archivo(s)`}
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">
            🚀 Progreso de Subida
          </h4>
          <div className="space-y-4">
            {uploadProgress.map((progressItem) => {
              // Buscar el archivo correspondiente
              const file = selectedFiles.find(
                (f, i) => `${f.name}-${i}` === progressItem.fileId
              );
              if (!file) return null;

              return (
                <div key={progressItem.fileId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <span className="font-medium text-slate-900">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {progressItem.status === "completed" && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {progressItem.status === "error" && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm text-slate-600">
                        {progressItem.status === "pending"
                          ? "0%"
                          : progressItem.status === "uploading"
                          ? `${Math.round(progressItem.progress)}%`
                          : progressItem.status === "completed"
                          ? "100%"
                          : "Error"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progressItem.status === "completed"
                            ? "bg-green-500"
                            : progressItem.status === "error"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                        style={{
                          width: `${
                            progressItem.status === "completed"
                              ? 100
                              : progressItem.status === "uploading"
                              ? progressItem.progress
                              : progressItem.status === "error"
                              ? 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {progressItem.error && (
                    <div className="text-sm text-red-600 mt-1">
                      {progressItem.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
