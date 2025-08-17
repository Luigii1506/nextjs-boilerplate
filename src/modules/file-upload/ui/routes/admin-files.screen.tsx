"use client";
import React, { useState, useMemo } from "react";
import {
  Upload,
  Grid,
  List,
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Image,
  File,
  Video,
  Music,
} from "lucide-react";
import type {
  UploadFile,
  UploadConfig,
  UploadCardData,
  FileStatsData,
} from "../../types";
import { useFileUpload } from "../../hooks"; // ← RESTORED: For enterprise state lifting
import { formatFileSize } from "../../utils";
import { useSmartNotifications } from "@/shared/utils/smartNotifications";
import FileUploader from "../components/FileUploader";
import FileManager from "../components/FileManager";
import FileStats from "../components/FileStats";
import ImageGallery from "../components/ImageGallery";

// ✅ Using enterprise FileStatsData type

// FilesView component props (none currently needed)
type FilesViewProps = Record<string, never>;

const FilesView: React.FC<FilesViewProps> = () => {
  // 🏆 ENTERPRISE: Component implementing state lifting pattern

  // 🎯 FIRST: Define all local states
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadProvider, setUploadProvider] = useState<"local" | "s3">("local");
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<
    "upload" | "manager" | "stats" | "gallery"
  >("manager");

  // 🎯 SECOND: Define categories and config
  const categories = [
    { id: "images", name: "Imágenes", icon: "🖼️", allowedTypes: ["image/*"] },
    {
      id: "documents",
      name: "Documentos",
      icon: "📄",
      allowedTypes: ["application/pdf"],
    },
    { id: "videos", name: "Videos", icon: "🎥", allowedTypes: ["video/*"] },
    { id: "audio", name: "Audio", icon: "🎵", allowedTypes: ["audio/*"] },
  ];

  // Upload configuration - usar el provider seleccionado
  const uploadConfig: UploadConfig = {
    provider: uploadProvider,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/*",
      "application/pdf",
      "text/*",
      "video/*",
      "audio/*",
    ],
    multiple: true,
  };

  // 🏆 THIRD: ENTERPRISE STATE LIFTING - Single source of truth for ALL components
  const fileUploadHook = useFileUpload(uploadConfig); // ← ONE hook to rule them all
  const { files, deleteFile } = fileUploadHook;

  // 🎯 ENTERPRISE: Files state is managed by lifted hook
  // Notification state handled by enterprise hook

  // 🏆 ENTERPRISE: Stats calculation - complete FileStatsData implementation
  const calculatedStats: FileStatsData = useMemo(() => {
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    const imageCount = files.filter(
      (f) => f.mimeType?.startsWith("image/") || false
    ).length;
    const documentCount = files.filter(
      (f) =>
        f.mimeType?.includes("pdf") || f.mimeType?.includes("document") || false
    ).length;
    const videoCount = files.filter(
      (f) => f.mimeType?.startsWith("video/") || false
    ).length;
    const audioCount = files.filter(
      (f) => f.mimeType?.startsWith("audio/") || false
    ).length;
    const otherCount =
      totalFiles - (imageCount + documentCount + videoCount + audioCount);

    const storageLimit = 100 * 1024 * 1024 * 1024; // 100GB
    const storageUsed = totalSize;
    const storagePercentage = Math.round((storageUsed / storageLimit) * 100);
    const averageFileSize =
      totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0;
    const recentFiles = files.filter((f) => {
      const fileDate = new Date(f.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return fileDate > sevenDaysAgo;
    }).length;

    return {
      // 📊 Basic Stats
      totalFiles,
      totalSize,
      totalSizeFormatted: formatFileSize(totalSize),
      recentFiles,
      averageFileSize,

      // 💾 Storage Stats
      storageUsed,
      storageLimit,
      storagePercentage,

      // 📂 File Type Counts
      imageCount,
      documentCount,
      videoCount,
      audioCount,
      otherCount,

      // 🔗 Detailed Breakdowns (simplified for now)
      byProvider: [
        {
          provider: "local" as const,
          count: totalFiles,
          size: totalSize,
          sizeFormatted: formatFileSize(totalSize),
        },
      ],
      byMimeType: [
        { mimeType: "image/*", count: imageCount, fileType: "image", size: 0 },
        {
          mimeType: "application/pdf",
          count: documentCount,
          fileType: "document",
          size: 0,
        },
        { mimeType: "video/*", count: videoCount, fileType: "video", size: 0 },
        { mimeType: "audio/*", count: audioCount, fileType: "audio", size: 0 },
      ].filter((item) => item.count > 0),

      // 📈 Performance Data (simplified)
      filesByType: {
        images: imageCount,
        documents: documentCount,
        videos: videoCount,
        audio: audioCount,
        other: otherCount,
      },

      // 📊 Legacy compatibility
      recentUploads: recentFiles, // Alias for recentFiles
    };
  }, [files]);

  // Filter files - incluir filtro por provider (TODO: implement proper filtering when data flow is fixed)
  const filteredFiles = files.filter((file) => {
    const matchesSearch = (file.originalName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" ||
      (filterType === "images" &&
        (file.mimeType?.startsWith("image/") || false)) ||
      (filterType === "documents" &&
        (file.mimeType?.includes("pdf") ||
          false ||
          file.mimeType?.includes("document") ||
          false)) ||
      (filterType === "videos" &&
        (file.mimeType?.startsWith("video/") || false)) ||
      (filterType === "audio" &&
        (file.mimeType?.startsWith("audio/") || false));

    const matchesProvider =
      !selectedProvider ||
      selectedProvider === "all" ||
      (file as UploadCardData & { provider?: string }).provider ===
        selectedProvider;

    return matchesSearch && matchesType && matchesProvider;
  });

  // Get only images for gallery
  const imageFiles = files.filter(
    (file) => file.mimeType?.startsWith("image/") || false
  );

  // 🧠 SISTEMA SIMPLE E INTELIGENTE - UNA SOLA LÍNEA
  const { notify } = useSmartNotifications();

  // 🧠 SÚPER SIMPLE: Completar upload - INTELIGENCIA AUTOMÁTICA
  const handleUploadComplete = async (uploadedFiles: UploadFile[]) => {
    // ✨ UNA SOLA LÍNEA - detecta TODO automáticamente
    await notify(
      async () => {
        // 🎯 OPTIMISTIC UI: No need for manual refresh - optimistic state handles it!
        // Removed optimizedRefreshFiles() to prevent overwriting optimistic updates

        // Mostrar categorías detectadas
        if (uploadedFiles.length > 0) {
          const categoriesDetected = uploadedFiles
            .map((file) => file.category?.name)
            .filter(Boolean)
            .join(", ");
          if (categoriesDetected) {
            console.log(`Categorías asignadas: ${categoriesDetected}`);
          }
        }
      },
      "Procesando archivos...",
      `${uploadedFiles.length} archivo(s) subido(s) exitosamente`
    );
  };

  // 🧠 SÚPER SIMPLE: Error en upload - INTELIGENCIA AUTOMÁTICA
  const handleUploadError = async (error: string) => {
    // ✨ UNA SOLA LÍNEA - detecta TODO automáticamente
    await notify(
      async () => {
        // 🧠 INTELIGENTE: "📤 Error subiendo archivo: [razón específica]" (automático)
        throw new Error(error);
      },
      "Procesando error...",
      undefined
    );
  };

  // 🧠 SÚPER SIMPLE: Eliminar archivo - INTELIGENCIA AUTOMÁTICA
  const handleFileDelete = async (file: UploadCardData) => {
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar "${file.originalName}"?`
      )
    )
      return;

    // ✨ UNA SOLA LÍNEA - detecta TODO automáticamente
    await notify(
      async () => {
        // 🏆 ENTERPRISE: Use real deleteFile from hook
        await deleteFile(file.id);
      },
      `Eliminando "${file.originalName}"...`,
      `Archivo "${file.originalName}" eliminado exitosamente`
    );
  };

  // 🧠 SÚPER SIMPLE: Descargar archivo - INTELIGENCIA AUTOMÁTICA
  const handleFileDownload = async (file: UploadCardData) => {
    // ✨ Acción inmediata sin notificación de carga para downloads
    try {
      // In a real app, this would handle S3 signed URLs for private files
      window.open(file.url, "_blank");
      console.log(`📥 Descargando "${file.originalName}"`);
    } catch (error) {
      // 🧠 INTELIGENTE: Solo notificar si hay error
      await notify(
        async () => {
          throw error;
        },
        "Procesando descarga...",
        undefined
      );
    }
  };

  const tabs = [
    { id: "upload", label: "Subir Archivos", icon: Upload },
    { id: "manager", label: "Mis Archivos", icon: File },
    { id: "stats", label: "Estadísticas", icon: MoreHorizontal },
    { id: "gallery", label: "Galería", icon: Image },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            📁 Gestión de Archivos
          </h1>
          <p className="text-slate-600 mt-1">
            Sistema completo de gestión de archivos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Download size={18} />
            Exportar
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Subir Archivos
          </button>
        </div>
      </div>

      {/* Notificaciones ahora manejadas por Sonner automáticamente */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <File className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {calculatedStats.totalFiles}
              </div>
              <div className="text-sm text-slate-500">Total Archivos</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {calculatedStats.imageCount}
              </div>
              <div className="text-sm text-slate-500">Imágenes</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {calculatedStats.videoCount}
              </div>
              <div className="text-sm text-slate-500">Videos</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {calculatedStats.audioCount}
              </div>
              <div className="text-sm text-slate-500">Audio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Provider Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            💿 Almacenamiento Local
          </h3>
          <div className="space-y-3">
            {(() => {
              const localFiles = files.filter((f) => f.provider === "local");
              const localSize = localFiles.reduce(
                (sum, file) => sum + file.size,
                0
              );
              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Archivos:</span>
                    <span className="font-semibold">{localFiles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tamaño:</span>
                    <span className="font-semibold">
                      {(localSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            ☁️ Amazon S3
          </h3>
          <div className="space-y-3">
            {(() => {
              const s3Files = files.filter((f) => f.provider === "s3");
              const s3Size = s3Files.reduce((sum, file) => sum + file.size, 0);
              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Archivos:</span>
                    <span className="font-semibold">{s3Files.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tamaño:</span>
                    <span className="font-semibold">
                      {(s3Size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="border-b border-slate-200">
          <nav className="flex px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as "upload" | "manager" | "stats" | "gallery"
                    )
                  }
                  className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "upload" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  📤 Subir Archivos
                </h2>
                <p className="text-slate-600">
                  Arrastra archivos aquí o haz clic para seleccionar. Máximo
                  10MB por archivo.
                </p>
              </div>

              {/* Selector de Provider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  🗄️ Destino de Almacenamiento
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="local"
                      checked={uploadProvider === "local"}
                      onChange={(e) =>
                        setUploadProvider(e.target.value as "local" | "s3")
                      }
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      💿 Local (Servidor)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="s3"
                      checked={uploadProvider === "s3"}
                      onChange={(e) =>
                        setUploadProvider(e.target.value as "local" | "s3")
                      }
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      ☁️ Amazon S3 (Nube)
                    </span>
                  </label>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {uploadProvider === "local"
                    ? "Los archivos se guardarán en el servidor local"
                    : "Los archivos se subirán a Amazon S3 en la nube"}
                </p>
              </div>

              {/* Selector de Categoría */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  📁 Categoría del Archivo
                </label>
                <select
                  value={selectedUploadCategory || ""}
                  onChange={(e) =>
                    setSelectedUploadCategory(e.target.value || null)
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">🤖 Auto-detectar por tipo de archivo</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Si no seleccionas una categoría, se detectará automáticamente
                  según el tipo de archivo
                </p>
              </div>

              <FileUploader
                config={uploadConfig}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                selectedCategory={selectedUploadCategory}
                // 🏆 ENTERPRISE STATE LIFTING: Pass hook functions as props
                isUploading={fileUploadHook.isUploading}
                uploadProgress={fileUploadHook.uploadProgress}
                uploadError={fileUploadHook.error}
                uploadFiles={fileUploadHook.uploadFiles}
                clearError={fileUploadHook.clearError}
              />
            </div>
          )}

          {activeTab === "manager" && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Buscar archivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los archivos</option>
                    <option value="images">Imágenes</option>
                    <option value="documents">Documentos</option>
                    <option value="videos">Videos</option>
                    <option value="audio">Audio</option>
                  </select>

                  <select
                    value={selectedProvider || "all"}
                    onChange={(e) =>
                      setSelectedProvider(
                        e.target.value === "all" ? null : e.target.value
                      )
                    }
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">🗄️ Todos los almacenes</option>
                    <option value="local">💿 Local</option>
                    <option value="s3">☁️ Amazon S3</option>
                  </select>

                  <select
                    value={selectedCategory || "all"}
                    onChange={(e) =>
                      setSelectedCategory(
                        e.target.value === "all" ? null : e.target.value
                      )
                    }
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">📁 Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "grid"
                          ? "bg-white shadow-sm"
                          : "hover:bg-slate-200"
                      }`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "list"
                          ? "bg-white shadow-sm"
                          : "hover:bg-slate-200"
                      }`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Mostrando{" "}
                  <span className="font-medium">{filteredFiles.length}</span> de{" "}
                  <span className="font-medium">{files.length}</span> archivos
                </p>
              </div>

              <FileManager
                files={filteredFiles}
                uploadProgress={fileUploadHook.uploadProgress}
                uploadFiles={fileUploadHook.uploadFiles}
                deleteFile={fileUploadHook.deleteFile}
                onFileSelect={(file) =>
                  console.log(`Archivo seleccionado: ${file.originalName}`)
                }
                onFileDelete={handleFileDelete}
                onFileDownload={handleFileDownload}
                viewMode={viewMode}
                selectable={true}
              />
            </div>
          )}

          {activeTab === "stats" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                📊 Estadísticas Detalladas
              </h2>
              <FileStats stats={calculatedStats} showDetails={true} />
            </div>
          )}

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
                  onImageSelect={(image) =>
                    console.log(`Imagen seleccionada: ${image.originalName}`)
                  }
                  onImageDelete={handleFileDelete}
                  onImageDownload={handleFileDownload}
                  columns={4}
                />
              ) : (
                <div className="text-center py-12">
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No hay imágenes
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Sube algunas imágenes para verlas en la galería
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
};

export default FilesView;
