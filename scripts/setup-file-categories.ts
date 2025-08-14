#!/usr/bin/env tsx
// 📁 SETUP FILE CATEGORIES
// =========================
// Script para crear categorías por defecto del sistema de archivos

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  {
    name: "Documentos",
    description: "Archivos de documentos generales, PDFs, Word, etc.",
    icon: "📄",
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/rtf",
    ],
  },
  {
    name: "Imágenes",
    description: "Fotografías, ilustraciones, logos, etc.",
    icon: "🖼️",
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
  },
  {
    name: "Videos",
    description: "Archivos de video, clips, presentaciones audiovisuales",
    icon: "🎥",
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/webm",
      "video/x-msvideo",
    ],
  },
  {
    name: "Audio",
    description: "Archivos de audio, música, podcasts, grabaciones",
    icon: "🎵",
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/mp4",
      "audio/x-m4a",
    ],
  },
  {
    name: "Archivos Comprimidos",
    description: "Archivos ZIP, RAR y otros formatos comprimidos",
    icon: "🗜️",
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
      "application/gzip",
    ],
  },
  {
    name: "Hojas de Cálculo",
    description: "Excel, CSV y otros archivos de datos tabulares",
    icon: "📊",
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ],
  },
  {
    name: "Presentaciones",
    description: "PowerPoint y otros archivos de presentación",
    icon: "📽️",
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },
];

async function setupFileCategories() {
  console.log("🚀 Configurando categorías por defecto...\n");

  for (const categoryData of defaultCategories) {
    try {
      // Verificar si la categoría ya existe
      const existing = await prisma.fileCategory.findUnique({
        where: { name: categoryData.name },
      });

      if (existing) {
        console.log(`⏭️  Categoría "${categoryData.name}" ya existe`);
        continue;
      }

      // Crear nueva categoría
      const category = await prisma.fileCategory.create({
        data: categoryData,
      });

      console.log(
        `✅ Categoría "${category.name}" creada con ID: ${category.id}`
      );
      console.log(`   📝 ${category.description}`);
      console.log(
        `   📏 Tamaño máximo: ${Math.round(
          category.maxSize! / (1024 * 1024)
        )}MB`
      );
      console.log(
        `   🎯 Tipos permitidos: ${category.allowedTypes.length} tipos\n`
      );
    } catch (error) {
      console.error(
        `❌ Error creando categoría "${categoryData.name}":`,
        error
      );
    }
  }

  console.log("🎉 ¡Categorías configuradas correctamente!");

  // Mostrar resumen
  const totalCategories = await prisma.fileCategory.count();
  console.log(`📁 Total de categorías disponibles: ${totalCategories}`);
}

async function main() {
  try {
    await setupFileCategories();
  } catch (error) {
    console.error("💥 Error durante la configuración:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
