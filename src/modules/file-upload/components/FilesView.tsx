// 🧪 FILES VIEW COMPONENT
// ======================
// Vista de gestión de archivos integrada en dashboard

"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Files,
  BarChart3,
  Images,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import {
  FileUploader,
  FileManager,
  FileStats,
  ImageGallery,
} from "@/modules/file-upload/components";
import { useFileManager, useFileStats } from "@/modules/file-upload/hooks";
import type { UploadFile } from "@/modules/file-upload/types";

interface FilesViewProps {
  onViewChange?: (view: string) => void;
}

export default function FilesView({ onViewChange }: FilesViewProps) {
  const [activeTab, setActiveTab] = useState<
    "upload" | "manager" | "stats" | "gallery" | "admin"
  >("upload");
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Hooks del módulo
  const { files, refreshFiles } = useFileManager();
  const { stats } = useFileStats();

  // 🔧 CONFIGURACIÓN DE UPLOAD CLIENT-SAFE
  const uploadConfig = {
    provider:
      (process.env.NEXT_PUBLIC_UPLOAD_PROVIDER as
        | "local"
        | "s3"
        | "cloudinary") || "s3",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/*", "application/pdf", "text/*"],
    multiple: true,
  };

  // Notificaciones automáticas
  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handlers para eventos
  const handleUploadComplete = (uploadedFiles: UploadFile[]) => {
    showNotification(
      "success",
      `¡${uploadedFiles.length} archivo(s) subido(s) exitosamente!`
    );
    refreshFiles(); // Actualizar la lista
    // Estadísticas se actualizarán automáticamente en el siguiente render
  };

  const handleUploadError = (error: string) => {
    showNotification("error", `Error: ${error}`);
  };

  const handleFileDelete = async (file: UploadFile) => {
    try {
      const response = await fetch(`/api/uploads/${file.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showNotification("success", `Archivo "${file.originalName}" eliminado`);
        refreshFiles();
        // Estadísticas se actualizarán automáticamente en el siguiente render
      } else {
        const errorData = await response.json();
        showNotification(
          "error",
          errorData.error || "Error eliminando archivo"
        );
      }
    } catch (error) {
      showNotification("error", "Error de conexión al eliminar archivo");
    }
  };

  const handleFileDownload = async (file: UploadFile) => {
    try {
      // Para archivos públicos, usar la URL directa
      if (file.isPublic) {
        window.open(file.url, "_blank");
        return;
      }

      // Para archivos privados en S3, generar URL firmada
      if (file.provider === "s3") {
        const response = await fetch("/api/uploads/s3/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId: file.id, expiresIn: 300 }), // 5 minutos
        });

        if (response.ok) {
          const { url } = await response.json();
          window.open(url, "_blank");
          showNotification(
            "info",
            "URL temporal generada - expira en 5 minutos"
          );
        } else {
          showNotification("error", "Error generando enlace de descarga");
        }
      } else {
        // Para archivos locales, usar la URL directa
        window.open(file.url, "_blank");
      }
    } catch (error) {
      showNotification("error", "Error al descargar archivo");
    }
  };

  // Filtrar solo imágenes para la galería
  const imageFiles = files.filter((file) => file.mimeType.startsWith("image/"));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          📁 Gestión de Archivos
        </h1>
        <p className="text-slate-600 mt-1">
          Sistema completo de gestión de archivos
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              📊 Estadísticas Rápidas
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">
              {stats.totalFiles} archivos
            </p>
            <p className="text-xs text-slate-500">
              {Math.round(((stats.totalSize || 0) / (1024 * 1024)) * 100) / 100}{" "}
              MB total
            </p>
          </div>
        </div>
      </div>

      {/* Notificación */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-3 ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200"
              : notification.type === "error"
              ? "bg-red-50 border border-red-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          {notification.type === "success" && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {notification.type === "error" && (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          {notification.type === "info" && (
            <Info className="w-5 h-5 text-blue-600" />
          )}
          <span
            className={`text-sm font-medium ${
              notification.type === "success"
                ? "text-green-800"
                : notification.type === "error"
                ? "text-red-800"
                : "text-blue-800"
            }`}
          >
            {notification.message}
          </span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              {
                id: "upload",
                label: "📤 Subir Archivos",
                icon: Upload,
                desc: "Arrastra y suelta tus archivos aquí",
              },
              {
                id: "manager",
                label: "🗂️ Mis Archivos",
                icon: Files,
                desc: "Administra tus archivos subidos",
              },
              {
                id: "stats",
                label: "📊 Estadísticas",
                icon: BarChart3,
                desc: "Ver métricas de uso",
              },
              {
                id: "gallery",
                label: "🖼️ Galería",
                icon: Images,
                desc: "Vista de imágenes",
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as "upload" | "manager" | "stats" | "gallery"
                    )
                  }
                  className={`
                    flex flex-col items-center space-y-1 py-3 px-4 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  <span className="text-xs opacity-75">{tab.desc}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  📤 Subir Archivos
                </h2>
                <p className="text-slate-600">
                  Arrastra archivos aquí o haz clic para seleccionar. Máximo
                  10MB por archivo.
                </p>
              </div>

              <FileUploader
                config={uploadConfig}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />

              {/* Resumen rápido de archivos recientes */}
              {files.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-4">
                    📁 Archivos Recientes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {files.slice(0, 6).map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <Files className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {Math.round(file.size / 1024)} KB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manager Tab */}
          {activeTab === "manager" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    🗂️ Mis Archivos
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Administra, descarga y elimina tus archivos subidos
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {files.length} archivos
                    </p>
                    <p className="text-xs text-slate-500">
                      {Math.round(
                        ((stats.totalSize || 0) / (1024 * 1024)) * 100
                      ) / 100}{" "}
                      MB total
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir más</span>
                  </button>
                </div>
              </div>

              <FileManager
                onFileSelect={(file) => {
                  showNotification(
                    "info",
                    `Archivo seleccionado: ${file.originalName}`
                  );
                }}
                viewMode="grid"
                selectable={true}
              />
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                📊 Estadísticas Detalladas
              </h2>
              <FileStats showDetails={true} />
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  🖼️ Galería de Imágenes
                </h2>
                <p className="text-slate-600">
                  {imageFiles.length} imagen(es) encontrada(s)
                </p>
              </div>

              {imageFiles.length > 0 ? (
                <ImageGallery
                  images={imageFiles}
                  onImageSelect={(image) => {
                    showNotification(
                      "info",
                      `Imagen seleccionada: ${image.originalName}`
                    );
                  }}
                  onImageDelete={handleFileDelete}
                  onImageDownload={handleFileDownload}
                  columns={4}
                />
              ) : (
                <div className="text-center py-12">
                  <Images className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No hay imágenes
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Sube algunas imágenes para ver la galería en acción
                  </p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Subir imágenes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
