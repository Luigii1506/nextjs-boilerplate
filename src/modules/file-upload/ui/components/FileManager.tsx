"use client";
import React, { useState, useTransition, useCallback } from "react";
import {
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Share,
  Copy,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import type { UploadCardData, UploadProgress } from "../../types";
import { FileIcon, FileSize, FileDate } from "./shared";

interface FileManagerProps {
  // 🏆 ENTERPRISE STATE LIFTING: Required props from parent hook
  files: UploadCardData[]; // Now required as prop
  uploadProgress: UploadProgress[]; // Now required as prop
  uploadFiles: (
    files: File[],
    options?: {
      provider?: "local" | "s3" | "cloudinary";
      categoryId?: string;
      makePublic?: boolean;
    }
  ) => Promise<
    Array<{ success: boolean; file?: UploadCardData; error?: string }>
  >; // Now required as prop
  deleteFile: (fileId: string) => Promise<void>; // Now required as prop

  // Optional callback props
  onFileSelect?: (file: UploadCardData) => void;
  onFileDelete?: (file: UploadCardData) => void;
  onFileDownload?: (file: UploadCardData) => void;
  viewMode?: "grid" | "list";
  selectable?: boolean;
  categoryFilter?: string;
}

const FileManager: React.FC<FileManagerProps> = React.memo(
  ({
    files, // Now from props (Enterprise State Lifting)
    uploadProgress, // Now from props
    uploadFiles, // Now from props
    deleteFile, // Now from props
    onFileSelect,
    onFileDelete,
    onFileDownload,
    viewMode = "grid",
    selectable = false,
    categoryFilter,
  }) => {
    // 🏆 ENTERPRISE STATE LIFTING: All functions received from parent hook
    // No hook duplication - parent manages all state!

    // Use files directly from props
    const displayFiles = files;

    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [showMenu, setShowMenu] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [, startTransition] = useTransition();

    // 🏆 ENTERPRISE: All utilities moved to shared components

    // 🎯 ENTERPRISE: Optimized Actions with useCallback
    const handleFileDelete = useCallback(
      (fileId: string) => {
        startTransition(async () => {
          try {
            if (onFileDelete) {
              const file = displayFiles.find((f) => f.id === fileId);
              if (file) onFileDelete(file);
            } else {
              await deleteFile(fileId);
            }
          } catch (error) {
            console.error("Delete error:", error);
          }
        });
      },
      [onFileDelete, displayFiles, deleteFile, startTransition]
    );

    // 🎯 ENTERPRISE: Drag & Drop Handlers with useCallback
    const handleDragEnter = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
          startTransition(async () => {
            await uploadFiles(droppedFiles, {
              provider: "local",
              categoryId: categoryFilter || undefined,
            });
          });
        }
      },
      [uploadFiles, categoryFilter, startTransition]
    );

    const handleFileClick = useCallback(
      (file: UploadCardData) => {
        if (selectable) {
          const newSelected = new Set(selectedFiles);
          if (newSelected.has(file.id)) {
            newSelected.delete(file.id);
          } else {
            newSelected.add(file.id);
          }
          setSelectedFiles(newSelected);
        }
        onFileSelect?.(file);
      },
      [selectable, selectedFiles, onFileSelect]
    );

    const handleMenuAction = useCallback(
      (action: string, file: UploadCardData) => {
        setShowMenu(null);

        switch (action) {
          case "download":
            onFileDownload?.(file);
            break;
          case "delete":
            handleFileDelete(file.id);
            break;
          case "copy":
            navigator.clipboard.writeText(file.url);
            break;
          case "view":
            window.open(file.url, "_blank");
            break;
        }
      },
      [onFileDownload, handleFileDelete]
    );

    if (viewMode === "list") {
      return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-600">
              <div className="col-span-5">Nombre</div>
              <div className="col-span-2">Tamaño</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-2">Fecha</div>
              <div className="col-span-1"></div>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {displayFiles.map((file) => (
              <div
                key={file.id}
                className={`px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                  selectedFiles.has(file.id)
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
                onClick={() => handleFileClick(file)}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <FileIcon mimeType={file.mimeType} size={20} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {file.originalName}
                      </p>
                      {file.metadata &&
                        typeof file.metadata.width === "number" &&
                        typeof file.metadata.height === "number" && (
                          <p className="text-xs text-slate-500">
                            {file.metadata.width} × {file.metadata.height}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <FileSize bytes={file.size} />
                  </div>

                  <div className="col-span-2">
                    <span className="text-sm text-slate-600 capitalize">
                      {file.mimeType.split("/")[0]}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <FileDate dateString={file.createdAt} />
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(showMenu === file.id ? null : file.id);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} className="text-slate-400" />
                      </button>

                      {showMenu === file.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowMenu(null)}
                          />
                          <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-48 z-20">
                            <button
                              onClick={() => handleMenuAction("view", file)}
                              className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                            >
                              <Eye size={16} />
                              Ver archivo
                            </button>
                            <button
                              onClick={() => handleMenuAction("download", file)}
                              className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                            >
                              <Download size={16} />
                              Descargar
                            </button>
                            <button
                              onClick={() => handleMenuAction("copy", file)}
                              className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                            >
                              <Copy size={16} />
                              Copiar URL
                            </button>
                            <div className="border-t border-slate-100 my-2" />
                            <button
                              onClick={() => handleMenuAction("delete", file)}
                              className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${
          dragActive
            ? "border-2 border-dashed border-blue-500 bg-blue-50/50 rounded-lg p-4"
            : ""
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Upload Progress Indicators */}
        {uploadProgress?.map((progress) => (
          <div
            key={progress.fileId}
            className="bg-white rounded-2xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="animate-spin">
                <Loader2 size={20} className="text-blue-500" />
              </div>
              <span className="text-sm font-medium">{progress.filename}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            {progress.status === "error" && (
              <p className="text-red-500 text-xs mt-1">{progress.error}</p>
            )}
          </div>
        )) || null}

        {/* Files Grid */}
        {(displayFiles || files || []).map((file) => (
          <div
            key={file.id}
            className={`group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${
              selectedFiles.has(file.id)
                ? "ring-2 ring-blue-500 border-blue-500"
                : ""
            }`}
            onClick={() => handleFileClick(file)}
          >
            {/* Preview */}
            <div className="aspect-square bg-slate-50 flex items-center justify-center relative overflow-hidden">
              {file.mimeType.startsWith("image/") ? (
                <Image
                  src={file.url}
                  alt={file.originalName || "Vista previa del archivo"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  className="object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                  <FileIcon mimeType={file.mimeType} size={32} />
                </div>
              )}

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuAction("view", file);
                  }}
                  className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                >
                  <Eye size={16} className="text-slate-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuAction("download", file);
                  }}
                  className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                >
                  <Download size={16} className="text-slate-700" />
                </button>
              </div>

              {/* File Type Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-lg backdrop-blur-sm">
                  {file.mimeType.split("/")[1].toUpperCase()}
                </span>
              </div>

              {/* Menu Button */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(showMenu === file.id ? null : file.id);
                  }}
                  className="p-2 bg-black/70 hover:bg-black/80 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical size={16} className="text-white" />
                </button>

                {showMenu === file.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(null)}
                    />
                    <div className="absolute right-0 top-12 bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-48 z-20">
                      <button
                        onClick={() => handleMenuAction("view", file)}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                      >
                        <Eye size={16} />
                        Ver archivo
                      </button>
                      <button
                        onClick={() => handleMenuAction("download", file)}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                      >
                        <Download size={16} />
                        Descargar
                      </button>
                      <button
                        onClick={() => handleMenuAction("copy", file)}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                      >
                        <Copy size={16} />
                        Copiar URL
                      </button>
                      <button
                        onClick={() => handleMenuAction("share", file)}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                      >
                        <Share size={16} />
                        Compartir
                      </button>
                      <div className="border-t border-slate-100 my-2" />
                      <button
                        onClick={() => handleMenuAction("delete", file)}
                        className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* File Info */}
            <div className="p-4">
              <h3 className="font-medium text-slate-900 truncate mb-1">
                {file.originalName}
              </h3>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <FileSize
                  bytes={file.size}
                  className="text-sm text-slate-500"
                />
                <FileDate
                  dateString={file.createdAt}
                  showIcon={true}
                  iconSize={12}
                  className="text-sm text-slate-500"
                />
              </div>
              {file.metadata &&
              typeof file.metadata.width === "number" &&
              typeof file.metadata.height === "number" ? (
                <div className="mt-2 text-xs text-slate-500">
                  {file.metadata.width} × {file.metadata.height} px
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

FileManager.displayName = "FileManager";

export default FileManager;
